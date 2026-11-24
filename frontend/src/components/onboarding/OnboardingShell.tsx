import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  onboardingApi,
  ValidateTokenResponse,
  OnboardingProgress,
  Step1Payload,
  Step2Payload,
  Step3Payload,
} from '../../api/onboarding'
import { useAuth } from '../../context/AuthContext'
import OnboardingLayout from './OnboardingLayout'
import StepIndicator, { STEPS } from './StepIndicator'
import Step1SocietyProfile from './Step1SocietyProfile'
import Step2AdminAccount from './Step2AdminAccount'
import Step3BillingConfig from './Step3BillingConfig'
import Step4BlockStructure from './Step4BlockStructure'
import Step5PropertySetup from './Step5PropertySetup'
import Step6ResidentImport from './Step6ResidentImport'
import Step7ReviewActivate from './Step7ReviewActivate'

type LoadState = 'loading' | 'invalid' | 'ready'

export default function OnboardingShell() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { login: authLogin } = useAuth()

  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // On mount: validate token and load existing progress
  useEffect(() => {
    if (!token) {
      setLoadState('invalid')
      setLoadError('No setup token provided.')
      return
    }

    // Always validate via the setup token first.
    // Any existing JWT in storage belongs to a different (already activated) society —
    // using it here would load the wrong society's progress into the wizard.
    // We clear stale auth and re-authenticate via Step 2 within the wizard itself.
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    validateViaToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function validateViaToken() {
    onboardingApi
      .validateToken(token!)
      .then((res: ValidateTokenResponse) => {
        setProgress({ society: res.society, session: res.session })
        const step = res.session?.currentStep ?? 1
        setCurrentStep(step <= 2 ? step : 1)
        setLoadState('ready')
      })
      .catch((err: any) => {
        const msg = err?.response?.data?.message || 'Invalid or expired setup link.'
        setLoadError(msg)
        setLoadState('invalid')
      })
  }

  // ── Step handlers ───────────────────────────────────────────────────────────

  const handleStep1 = useCallback(
    async (payload: Step1Payload) => {
      setSaving(true)
      setSaveError('')
      try {
        await onboardingApi.saveStep1(token!, payload)
        const updated = await onboardingApi.validateToken(token!)
        setProgress({ society: updated.society, session: updated.session })
        setCurrentStep(2)
      } catch (err: any) {
        setSaveError(err?.response?.data?.message || 'Failed to save. Please try again.')
      } finally {
        setSaving(false)
      }
    },
    [token]
  )

  const handleStep2 = useCallback(
    async (payload: Step2Payload) => {
      setSaving(true)
      setSaveError('')
      try {
        const res = await onboardingApi.saveStep2(token!, payload)
        // Use AuthContext login() so React state + localStorage keys ('token'/'user') are
        // consistent with AuthContext, axios interceptor, and ProtectedRoute checks.
        // rememberMe=true stores in localStorage (persists across tabs/reload in the wizard).
        authLogin(res.token, res.user, true)
        const prog = await onboardingApi.getProgress()
        setProgress(prog)
        setCurrentStep(3)
      } catch (err: any) {
        setSaveError(err?.response?.data?.message || 'Failed to create account. Please try again.')
      } finally {
        setSaving(false)
      }
    },
    [token, authLogin]
  )

  const handleStep3 = useCallback(async (payload: Step3Payload) => {
    setSaving(true)
    setSaveError('')
    try {
      await onboardingApi.saveStep3(payload)
      const prog = await onboardingApi.getProgress()
      setProgress(prog)
      setCurrentStep(4)
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to save billing config.')
    } finally {
      setSaving(false)
    }
  }, [])

  // Step4 just advances (blocks managed inline)
  const handleStep4Next = useCallback(async () => {
    try {
      const prog = await onboardingApi.getProgress()
      setProgress(prog)
    } catch {
      // ignore — advance anyway
    }
    setCurrentStep(5)
  }, [])

  const handleStep5Next = useCallback(() => setCurrentStep(6), [])
  const handleStep5Skip = useCallback(() => setCurrentStep(6), [])

  const handleStep6Next = useCallback(async () => {
    try {
      const prog = await onboardingApi.getProgress()
      setProgress(prog)
    } catch {
      // ignore
    }
    setCurrentStep(7)
  }, [])
  const handleStep6Skip = useCallback(() => setCurrentStep(7), [])

  const handleActivated = useCallback(() => {
    queryClient.clear()
    navigate('/admin/dashboard', { replace: true })
  }, [navigate, queryClient])

  // ── Back navigation ─────────────────────────────────────────────────────────
  // Steps 1–2 are token-gated; going back from step 3 brings user to step 2 would
  // require re-entering credentials — instead cap back navigation at step 3.
  const canGoBack = currentStep >= 4 && currentStep <= 7
  const handlePrev = useCallback(() => {
    if (canGoBack) setCurrentStep((s: number) => s - 1)
  }, [canGoBack])

  // ── Render ──────────────────────────────────────────────────────────────────

  const stepIndicatorEl = loadState === 'ready' ? (
    <StepIndicator steps={STEPS} currentStep={currentStep} />
  ) : undefined

  if (loadState === 'loading') {
    return (
      <OnboardingLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500">Verifying your setup link...</p>
        </div>
      </OnboardingLayout>
    )
  }

  if (loadState === 'invalid') {
    return (
      <OnboardingLayout>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Setup Link</h2>
          <p className="text-sm text-gray-500 mb-6">{loadError}</p>
          <a
            href="/register"
            className="inline-block py-2.5 px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Register a new society
          </a>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout stepIndicator={stepIndicatorEl}>
      {/* Back button — shown for steps 4-7 */}
      {canGoBack && !saving && (
        <button
          onClick={handlePrev}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Previous step
        </button>
      )}

      {/* Global save error */}
      {saveError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {saveError}
        </div>
      )}

      <div className={saving ? 'opacity-60 pointer-events-none' : ''}>
        {currentStep === 1 && (
          <Step1SocietyProfile
            initialData={progress?.society ? {
              name: progress.society.name,
              address: progress.society.address ?? undefined,
              city: progress.society.city ?? undefined,
              state: progress.society.state ?? undefined,
              pincode: progress.society.pincode ?? undefined,
              registrationNumber: progress.society.registrationNumber ?? undefined,
              contactEmail: progress.society.contactEmail ?? undefined,
              contactPhone: progress.society.contactPhone ?? undefined,
            } : {}}
            onNext={handleStep1}
            loading={saving}
            error={saveError}
          />
        )}

        {currentStep === 2 && (
          <Step2AdminAccount
            onNext={handleStep2}
            loading={saving}
            error={saveError}
          />
        )}

        {currentStep === 3 && (
          <Step3BillingConfig
            initialData={progress?.session?.step3Data ?? undefined}
            onNext={handleStep3}
            loading={saving}
            error={saveError}
          />
        )}

        {currentStep === 4 && (
          <Step4BlockStructure
            onNext={handleStep4Next}
            loading={saving}
          />
        )}

        {currentStep === 5 && (
          <Step5PropertySetup
            onNext={handleStep5Next}
            onSkip={handleStep5Skip}
          />
        )}

        {currentStep === 6 && (
          <Step6ResidentImport
            onNext={handleStep6Next}
            onSkip={handleStep6Skip}
          />
        )}

        {currentStep === 7 && progress && (
          <Step7ReviewActivate
            progress={progress}
            onActivated={handleActivated}
          />
        )}
      </div>
    </OnboardingLayout>
  )
}