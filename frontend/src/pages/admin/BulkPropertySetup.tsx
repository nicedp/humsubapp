import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { blocksApi } from '../../api/blocks'
import { flatsApi, BulkFlatPayload, BulkCreatedFlat } from '../../api/flats'
import { Block } from '../../types'
import FloorTemplateEditor from '../../components/admin/bulkSetup/FloorTemplateEditor'
import FloorRangeConfig, { FloorRangeForm } from '../../components/admin/bulkSetup/FloorRangeConfig'
import BulkPreviewGrid from '../../components/admin/bulkSetup/BulkPreviewGrid'
import BulkResidentEntry from '../../components/admin/bulkSetup/BulkResidentEntry'
import {
  UnitTemplate,
  BulkSetupConfig,
  defaultUnits,
  generateFlats,
} from '../../components/admin/bulkSetup/bulkSetupHelpers'

const STEPS = ['Block & Floors', 'Floor Template', 'Preview', 'Add Residents'] as const
type Step = 0 | 1 | 2 | 3 | 4   // 4 = success screen

export default function BulkPropertySetup() {
  const navigate = useNavigate()

  // ── State ──────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(0)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ created: number; skipped: string[] } | null>(null)
  const [error, setError] = useState('')

  // Created flats from bulk create — passed to resident entry step
  const [createdFlats, setCreatedFlats] = useState<BulkCreatedFlat[]>([])

  // Existing flat numbers for conflict detection (loaded when block is chosen)
  const [existingNumbers, setExistingNumbers] = useState<Set<string>>(new Set())
  const [existingLoading, setExistingLoading] = useState(false)

  const [rangeForm, setRangeForm] = useState<FloorRangeForm>({
    blockId: '',
    customPrefix: '',
    noPrefix: false,
    floorCount: 4,
    startFloor: 1,
    unitStartNumber: 1,
  })
  const [units, setUnits] = useState<UnitTemplate[]>(defaultUnits())

  // Preview flat overrides: allows admin to rename individual flat numbers in step 2
  const [flatNumberOverrides, setFlatNumberOverrides] = useState<Map<string, string>>(new Map())

  // ── Load blocks on mount ──────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    blocksApi.list()
      .then(setBlocks)
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false))
  }, [])

  // ── Inline block creation (from FloorRangeConfig mini-form) ──
  async function handleCreateBlock(payload: { name: string; blockType: 'flats' | 'rowhouses' | 'mixed' }) {
    const newBlock = await blocksApi.create(payload)
    setBlocks(prev => [...prev, newBlock])
    setRangeForm(prev => ({ ...prev, blockId: newBlock.id, customPrefix: '' }))
  }

  // ── Load existing flat numbers when block changes ─────────────
  const loadExisting = useCallback(async (blockId: string) => {
    if (!blockId) { setExistingNumbers(new Set()); return }
    setExistingLoading(true)
    try {
      const res = await flatsApi.list({ blockId, limit: 500 })
      setExistingNumbers(new Set(res.data.map(f => f.flatNumber)))
    } catch { /* silent */ }
    finally { setExistingLoading(false) }
  }, [])

  useEffect(() => { loadExisting(rangeForm.blockId) }, [rangeForm.blockId, loadExisting])

  // Clear overrides when config changes so stale renames don't persist
  useEffect(() => {
    setFlatNumberOverrides(new Map())
  }, [rangeForm.blockId, rangeForm.customPrefix, rangeForm.noPrefix, rangeForm.startFloor, rangeForm.floorCount, rangeForm.unitStartNumber, units])

  // ── Derive fromFloor / toFloor from floorCount + startFloor ───
  const fromFloor = rangeForm.startFloor
  const toFloor   = rangeForm.startFloor + rangeForm.floorCount - 1

  // ── Resolved prefix ───────────────────────────────────────────
  const selectedBlock = blocks.find(b => b.id === rangeForm.blockId)
  const resolvedPrefix = rangeForm.customPrefix.trim() || selectedBlock?.name || 'A'

  // ── Derive generated flats (memoised) + apply overrides ───────
  const config: BulkSetupConfig = useMemo(() => ({
    blockId: rangeForm.blockId,
    blockName: selectedBlock?.name ?? '',
    customPrefix: rangeForm.customPrefix,
    noPrefix: rangeForm.noPrefix,
    fromFloor,
    toFloor,
    unitStartNumber: rangeForm.unitStartNumber,
    units,
  }), [rangeForm.blockId, rangeForm.customPrefix, rangeForm.noPrefix, fromFloor, toFloor, rangeForm.unitStartNumber, units, selectedBlock?.name])

  const baseGeneratedFlats: BulkFlatPayload[] = useMemo(() => generateFlats(config), [config])

  // Apply any inline renames from preview step
  const generatedFlats: BulkFlatPayload[] = useMemo(() => {
    if (flatNumberOverrides.size === 0) return baseGeneratedFlats
    return baseGeneratedFlats.map(f => {
      const renamed = flatNumberOverrides.get(f.flatNumber)
      return renamed ? { ...f, flatNumber: renamed } : f
    })
  }, [baseGeneratedFlats, flatNumberOverrides])

  const newCount = generatedFlats.filter(f => !existingNumbers.has(f.flatNumber)).length

  // ── Handle inline flat number rename in preview ────────────────
  function handleFlatNumberChange(oldNumber: string, newNumber: string) {
    setFlatNumberOverrides(prev => {
      const next = new Map(prev)
      // Find the original (pre-override) key for this flat
      const originalKey = [...prev.entries()].find(([, v]) => v === oldNumber)?.[0] ?? oldNumber
      next.set(originalKey, newNumber)
      return next
    })
  }

  // ── Validation per step ───────────────────────────────────────
  function canProceed(): boolean {
    if (step === 0) return !!rangeForm.blockId && rangeForm.floorCount >= 1
    if (step === 1) return units.length > 0 && units.some(u => u.suffix.trim() && parseFloat(u.sqFt) > 0)
    if (step === 2) return generatedFlats.length > 0 && newCount > 0
    return false
  }

  // ── Submit (create properties) ────────────────────────────────
  async function handleSubmit() {
    const toCreate = generatedFlats.filter(f => !existingNumbers.has(f.flatNumber))
    if (toCreate.length === 0) return
    setSubmitting(true)
    setError('')
    try {
      const res = await flatsApi.bulkCreate(toCreate)
      setResult({ created: res.created, skipped: res.skipped })
      setCreatedFlats(res.flats ?? [])
      setStep(3)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create properties')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Skip residents → go to success ───────────────────────────
  function handleSkipResidents() { setStep(4) }

  // ── After bulk resident save → go to success ─────────────────
  function handleResidentsDone() { setStep(4) }

  // ── Reset wizard ─────────────────────────────────────────────
  function resetWizard() {
    setStep(0)
    setRangeForm({ blockId: '', customPrefix: '', noPrefix: false, floorCount: 4, startFloor: 1, unitStartNumber: 1 })
    setUnits(defaultUnits())
    setResult(null)
    setCreatedFlats([])
    setError('')
    setFlatNumberOverrides(new Map())
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/properties')}
          className="text-gray-400 hover:text-gray-600 transition text-xl leading-none"
          title="Back to Properties"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏗️ Bulk Property Setup</h1>
          <p className="text-sm text-gray-500 mt-0.5">Define a floor template and replicate it across multiple floors</p>
        </div>
      </div>

      {/* Step indicator */}
      {step < 4 && (
        <div className="flex items-center gap-0">
          {STEPS.map((label, idx) => (
            <div key={label} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                idx === step
                  ? 'bg-blue-600 text-white'
                  : idx < step
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx < step ? 'bg-green-500 text-white' : idx === step ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-500'
                }`}>
                  {idx < step ? '✓' : idx + 1}
                </span>
                {label}
              </div>
              {idx < STEPS.length - 1 && <div className="w-6 h-px bg-gray-300 mx-1" />}
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading blocks…</p>
        ) : step === 0 ? (
          <FloorRangeConfig
            form={rangeForm}
            blocks={blocks}
            units={units}
            onChange={setRangeForm}
            onCreateBlock={handleCreateBlock}
          />
        ) : step === 1 ? (
          <FloorTemplateEditor
            units={units}
            onChange={setUnits}
            prefix={resolvedPrefix}
            noPrefix={rangeForm.noPrefix}
            startFloor={rangeForm.startFloor}
            unitStartNumber={rangeForm.unitStartNumber}
          />
        ) : step === 2 ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Review all {generatedFlats.length} units to be generated.
                {existingLoading && <span className="ml-2 text-blue-500">Checking for conflicts…</span>}
              </p>
            </div>
            <BulkPreviewGrid
              flats={generatedFlats}
              existingFlatNumbers={existingNumbers}
              onFlatNumberChange={handleFlatNumberChange}
            />
          </div>
        ) : step === 3 ? (
          /* Step 3 — Add Residents (skippable) */
          <BulkResidentEntry
            flats={createdFlats}
            onDone={handleResidentsDone}
            onSkip={handleSkipResidents}
          />
        ) : (
          /* Step 4 — Success */
          <div className="text-center py-8 space-y-4">
            <p className="text-5xl">🎉</p>
            <h2 className="text-xl font-bold text-gray-800">
              {result?.created ?? 0} Properties Created!
            </h2>
            {result && result.skipped.length > 0 && (
              <p className="text-sm text-amber-600">
                ⚠️ {result.skipped.length} skipped (already existed):{' '}
                <span className="font-mono text-xs">
                  {result.skipped.slice(0, 5).join(', ')}{result.skipped.length > 5 ? ` +${result.skipped.length - 5} more` : ''}
                </span>
              </p>
            )}
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  // Navigate to properties filtered by the block we just set up
                  const blockParam = rangeForm.blockId ? `?blockId=${rangeForm.blockId}` : ''
                  navigate(`/admin/properties${blockParam}`)
                }}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                View in Properties →
              </button>
              <button
                onClick={resetWizard}
                className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Setup Another Block
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Navigation buttons — only for steps 0-2 */}
      {step < 3 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1) as Step)}
            disabled={step === 0}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            {step === 2 && newCount > 0 && (
              <span className="text-xs text-gray-500">
                Will create <strong className="text-blue-600">{newCount}</strong> new {newCount === 1 ? 'property' : 'properties'}
              </span>
            )}
            {step < 2 ? (
              <button
                onClick={() => setStep(s => (s + 1) as Step)}
                disabled={!canProceed()}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {submitting ? 'Creating…' : `✅ Create ${newCount} Properties`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}