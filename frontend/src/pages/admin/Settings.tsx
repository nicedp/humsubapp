
import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { settingsApi } from '../../api/settings'
import { SocietySettings } from '../../types/index'
import { SocietyCardModal, PORTAL_DOMAIN, buildPortalUrl } from '../../components/admin/SocietyCard'

// ─── Tab definitions ──────────────────────────────────────────────────────────
type TabId = 'general' | 'configurations' | 'finance' | 'display' | 'bank' | 'security'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'general',        label: 'General',          icon: '🏢' },
  { id: 'configurations', label: 'Configurations',   icon: '⚙️' },
  { id: 'finance',        label: 'Finance',          icon: '💰' },
  { id: 'display',        label: 'Display Settings', icon: '🎨' },
  { id: 'bank',           label: 'Bank Details',     icon: '🏦' },
  { id: 'security',       label: 'Security',         icon: '🔒' },
]

// ─── Reusable field components ────────────────────────────────────────────────
function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1">
      <label className="block text-sm font-medium text-gray-700">{children}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

function Input({
  value, onChange, placeholder, type = 'text', step, min, max, className = '', mono = false,
}: {
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  step?: string
  min?: number
  max?: number
  className?: string
  mono?: boolean
}) {
  return (
    <input
      type={type}
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${mono ? 'font-mono' : ''} ${className}`}
    />
  )
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function SaveBar({ isPending, onSave }: { isPending: boolean; onSave: () => void }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        type="button"
        onClick={onSave}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition shadow-sm"
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Saving…
          </>
        ) : (
          <>✓ Save Changes</>
        )}
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminSettings() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabId>('general')
  const [form, setForm] = useState<Partial<SocietySettings>>({})
  const [showIdentityCard, setShowIdentityCard] = useState(false)
  const qrInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  })

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const mutation = useMutation({
    mutationFn: (payload: Partial<SocietySettings>) => settingsApi.update(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved successfully')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving settings'
      toast.error(msg)
    },
  })

  const generateAccMutation = useMutation({
    mutationFn: settingsApi.generateAccountNumber,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast.success(`Account number generated: ${res.accountNumber}`)
    },
    onError: () => toast.error('Failed to generate account number'),
  })

  const set = (key: keyof SocietySettings, val: string | number | boolean | null) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  // ── Per-tab save (sends only that tab's fields) ──────────────────────────
  const saveGeneral = () => {
    const payload: Partial<SocietySettings> = {
      societyName: form.societyName,
      address:     form.address,
      phone:       form.phone,
      whatsapp:    form.whatsapp,
      email:       form.email,
      websiteUrl:  form.websiteUrl,
      mapLat:      form.mapLat,
      mapLng:      form.mapLng,
    }
    // Only send societyUrl if it is not yet saved (add-once, never overwrite from this form)
    if (!data?.societyUrl && form.societyUrl) {
      payload.societyUrl = form.societyUrl
    }
    mutation.mutate(payload)
  }

  const saveConfig = () => mutation.mutate({
    ratePerSqft:      form.ratePerSqft,
    fixedCharge:      form.fixedCharge,
    lateFeeGraceDays: form.lateFeeGraceDays,
    lateFeePerDay:    form.lateFeePerDay,
    billVacantFlats:  form.billVacantFlats,
  })

  const saveFinance = () => mutation.mutate({
    openingBalance:          form.openingBalance,
    openingBalanceYearMonth: form.openingBalanceYearMonth,
  })

  const saveDisplay = () => mutation.mutate({
    paginationLimit: form.paginationLimit,
    theme:           form.theme,
  })

  const saveSecurity = () => mutation.mutate({
    require2fa: form.require2fa,
  })

  const saveBank = () => mutation.mutate({
    bankName:          form.bankName,
    bankAccountNumber: form.bankAccountNumber,
    bankIfsc:          form.bankIfsc,
    bankBranch:        form.bankBranch,
    upiId:             form.upiId,
    upiQrCode:         form.upiQrCode,
  })

  // ── QR code upload ───────────────────────────────────────────────────────
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 512 * 1024) {
      toast.error('QR image must be under 512 KB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => set('upiQrCode', reader.result as string)
    reader.readAsDataURL(file)
  }

  // ── Live preview calculations ────────────────────────────────────────────
  const rate      = Number(form.ratePerSqft ?? 1)
  const fixed     = Number(form.fixedCharge ?? 700)
  const graceDays = Number(form.lateFeeGraceDays ?? 0)
  const feePerDay = Number(form.lateFeePerDay ?? 10)
  const [previewSqFt, setPreviewSqFt] = useState(1000)
  const previewAmount  = previewSqFt * rate + fixed
  const previewLateFee = Math.max(0, 5 - graceDays) * feePerDay
  const QUICK_SQFT = [800, 1000, 1200, 1500, 2000]

  // ── Map link ─────────────────────────────────────────────────────────────
  const mapLink = form.mapLat && form.mapLng
    ? `https://www.google.com/maps?q=${form.mapLat},${form.mapLng}`
    : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">Loading settings…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Society Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all society configuration, billing rules, and contact details</p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 -mb-px" aria-label="Settings tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── GENERAL TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          <SectionCard title="Portal Identity" subtitle="Login credentials your members use to identify this society">
            {/* ── Account Number ── */}
            <div>
              <FieldLabel hint="Share this number with members — they need it to log in">Account Number</FieldLabel>
              {data?.accountNumber ? (
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={data.accountNumber}
                    className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm font-mono text-gray-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    title="Copy account number"
                    onClick={() => { navigator.clipboard.writeText(data.accountNumber ?? ''); toast.success('Copied!') }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    📋
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 italic">Not yet generated</span>
                  <button
                    type="button"
                    onClick={() => generateAccMutation.mutate()}
                    disabled={generateAccMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition shadow-sm"
                  >
                    {generateAccMutation.isPending ? '⏳ Generating…' : '🔢 Generate Account Number'}
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {data?.accountNumber
                  ? 'Auto-assigned · Cannot be changed once set'
                  : 'Generate once — this becomes permanent and cannot be changed later'}
              </p>
            </div>

            {/* ── Society URL ── */}
            <div>
              <FieldLabel hint="Used as the portal URL slug, e.g. green-valley-apts (lowercase, hyphens only)">Society URL / Slug</FieldLabel>
              {data?.societyUrl ? (
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={data.societyUrl}
                    className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm font-mono text-gray-700 focus:outline-none"
                  />
                  <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-xs font-medium">🔒 Locked</span>
                </div>
              ) : (
                <Input
                  value={form.societyUrl ?? ''}
                  onChange={(v) => set('societyUrl', v.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. green-valley-apts"
                  mono
                />
              )}
              {/* Portal URL live preview — subdomain format */}
              {(data?.societyUrl || form.societyUrl) && (() => {
                const slug = data?.societyUrl ?? form.societyUrl
                const portalUrl = buildPortalUrl(slug)
                return portalUrl ? (
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <span className="text-xs text-blue-500 flex-shrink-0">🔗</span>
                    <span className="text-xs font-mono text-blue-700 break-all flex-1">{portalUrl}</span>
                    <button
                      type="button"
                      title="Copy portal URL"
                      onClick={() => { navigator.clipboard.writeText(portalUrl); toast.success('Portal URL copied!') }}
                      className="flex-shrink-0 text-xs px-2 py-0.5 rounded border border-blue-200 text-blue-400 hover:text-blue-600 hover:border-blue-400 transition bg-white"
                    >
                      📋
                    </button>
                  </div>
                ) : null
              })()}
              <p className="text-xs text-gray-400 mt-1">
                {data?.societyUrl
                  ? 'Set once — cannot be changed to prevent broken member links'
                  : `2–75 characters · lowercase letters, numbers, and hyphens only · your portal will be at https://your-slug.${PORTAL_DOMAIN}`}
              </p>
            </div>
          </SectionCard>

          {/* Identity Card CTA — shown when account number or societyUrl is set */}
          {(data?.accountNumber || data?.societyUrl) && (
            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-indigo-900">Society Identity Card</p>
                <p className="text-xs text-indigo-600 mt-0.5">
                  View and print your society's login credentials card to share with members
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIdentityCard(true)}
                className="flex-shrink-0 ml-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
              >
                🪪 View Card
              </button>
            </div>
          )}

          {/* Identity Card Modal */}
          {showIdentityCard && (
            <SocietyCardModal
              settings={form}
              onClose={() => setShowIdentityCard(false)}
            />
          )}

          <SectionCard title="Society Identity" subtitle="Basic identification details for your society">
            <div>
              <FieldLabel>Society Name</FieldLabel>
              <Input
                value={form.societyName ?? ''}
                onChange={(v) => set('societyName', v)}
                placeholder="e.g. Green Valley Apartments"
              />
            </div>
            <div>
              <FieldLabel>Address</FieldLabel>
              <textarea
                value={form.address ?? ''}
                onChange={(e) => set('address', e.target.value)}
                rows={3}
                placeholder="Full address of the society"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>
          </SectionCard>

          <SectionCard title="Contact Information" subtitle="Phone, WhatsApp, and email for residents and official correspondence">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <Input
                  value={form.phone ?? ''}
                  onChange={(v) => set('phone', v)}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <div>
                <FieldLabel>WhatsApp Number</FieldLabel>
                <Input
                  value={form.whatsapp ?? ''}
                  onChange={(v) => set('whatsapp', v)}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <div>
                <FieldLabel>Email Address</FieldLabel>
                <Input
                  value={form.email ?? ''}
                  onChange={(v) => set('email', v)}
                  placeholder="e.g. secretary@greensociety.in"
                  type="email"
                />
              </div>
              <div>
                <FieldLabel>Website URL</FieldLabel>
                <Input
                  value={form.websiteUrl ?? ''}
                  onChange={(v) => set('websiteUrl', v)}
                  placeholder="e.g. https://greensociety.in"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Map Location" subtitle="GPS coordinates to pin your society on a map">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel hint="Decimal degrees, e.g. 19.0760">Latitude</FieldLabel>
                <Input
                  value={form.mapLat ?? ''}
                  onChange={(v) => set('mapLat', v)}
                  placeholder="e.g. 19.0760"
                  mono
                />
              </div>
              <div>
                <FieldLabel hint="Decimal degrees, e.g. 72.8777">Longitude</FieldLabel>
                <Input
                  value={form.mapLng ?? ''}
                  onChange={(v) => set('mapLng', v)}
                  placeholder="e.g. 72.8777"
                  mono
                />
              </div>
            </div>
            {mapLink && (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
              >
                🗺️ View on Google Maps ↗
              </a>
            )}
            {!mapLink && (form.mapLat || form.mapLng) && (
              <p className="text-xs text-amber-600 mt-1">Enter both latitude and longitude to generate a map link</p>
            )}
          </SectionCard>

          <SaveBar isPending={mutation.isPending} onSave={saveGeneral} />
        </div>
      )}

      {/* ── CONFIGURATIONS TAB ──────────────────────────────────────────── */}
      {activeTab === 'configurations' && (
        <div className="space-y-5">
          <SectionCard
            title="Maintenance Billing Formula"
            subtitle="How monthly maintenance is calculated for each flat"
          >
            <p className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
              Monthly Bill = (flat_sq_ft × rate_per_sqft) + fixed_charge
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Rate per Sq Ft (₹)</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.ratePerSqft ?? ''}
                  onChange={(v) => set('ratePerSqft', parseFloat(v) || 0)}
                />
              </div>
              <div>
                <FieldLabel>Fixed Charge (₹)</FieldLabel>
                <Input
                  type="number"
                  step="1"
                  min={0}
                  value={form.fixedCharge ?? ''}
                  onChange={(v) => set('fixedCharge', parseInt(v) || 0)}
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs font-semibold text-blue-700">Live Bill Calculator</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUICK_SQFT.map((sq) => (
                    <button
                      key={sq}
                      type="button"
                      onClick={() => setPreviewSqFt(sq)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                        previewSqFt === sq
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {sq.toLocaleString()}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={100}
                    max={9999}
                    value={previewSqFt}
                    onChange={(e) => setPreviewSqFt(Math.max(100, parseInt(e.target.value) || 1000))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="sq ft"
                  />
                  <span className="text-xs text-gray-400">sq ft</span>
                </div>
              </div>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm">
                <span className="text-gray-600">({previewSqFt.toLocaleString()} × ₹{rate.toFixed(2)})</span>
                <span className="text-gray-400">+</span>
                <span className="text-gray-600">₹{fixed.toLocaleString()}</span>
                <span className="text-gray-400">=</span>
                <span className="font-bold text-blue-700 text-lg">₹{previewAmount.toLocaleString()}</span>
                <span className="text-xs text-blue-500">/month</span>
              </div>
              <p className="text-xs text-blue-500">
                Adjust the sq ft above or type a custom value to preview any flat's maintenance bill
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="Late Fee Policy"
            subtitle="Penalty charged to residents who pay after the due date"
          >
            <p className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
              Late Fee = max(0, days_overdue − grace_days) × late_fee_per_day
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel hint="Days after due date before late fee starts">Grace Days</FieldLabel>
                <Input
                  type="number"
                  step="1"
                  min={0}
                  value={form.lateFeeGraceDays ?? ''}
                  onChange={(v) => set('lateFeeGraceDays', parseInt(v) || 0)}
                />
              </div>
              <div>
                <FieldLabel>Late Fee per Day (₹)</FieldLabel>
                <Input
                  type="number"
                  step="1"
                  min={0}
                  value={form.lateFeePerDay ?? ''}
                  onChange={(v) => set('lateFeePerDay', parseInt(v) || 0)}
                />
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-orange-700 mb-2">Live Preview — bill 5 days overdue</p>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm">
                <span className="text-gray-600">max(0, 5 − {graceDays})</span>
                <span className="text-gray-400">×</span>
                <span className="text-gray-600">₹{feePerDay}/day</span>
                <span className="text-gray-400">=</span>
                <span className="font-bold text-orange-700 text-lg">₹{previewLateFee.toLocaleString()}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Billing Behaviour"
            subtitle="Control which flats are included in bulk bill generation"
          >
            <Toggle
              checked={!!form.billVacantFlats}
              onChange={(v) => set('billVacantFlats', v)}
              label="Bill Vacant Flats"
              description="When enabled, maintenance bills can be raised for vacant (unoccupied) flats — both via bulk generation and single bill creation."
            />
          </SectionCard>

          <SaveBar isPending={mutation.isPending} onSave={saveConfig} />
        </div>
      )}

      {/* ── FINANCE TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'finance' && (
        <div className="space-y-5">
          <SectionCard
            title="Opening Balance"
            subtitle="Set the society account balance at the start of your tracking period. The Finance Ledger will use this as the opening balance for the first tracked month and chain forward."
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel hint="Society bank account balance at the start of your tracking period (₹)">Opening Balance (₹)</FieldLabel>
                <Input
                  type="number"
                  step="1"
                  min={0}
                  value={form.openingBalance ?? 0}
                  onChange={(v) => set('openingBalance', parseFloat(v) || 0)}
                  placeholder="e.g. 250000"
                />
              </div>
              <div>
                <FieldLabel hint="Which month's opening balance is the value above? Format: YYYY-MM (e.g. 2025-01). Leave blank to apply from the first tracked month.">As of Month (YYYY-MM)</FieldLabel>
                <Input
                  value={form.openingBalanceYearMonth ?? ''}
                  onChange={(v) => set('openingBalanceYearMonth', v)}
                  placeholder="e.g. 2025-01"
                  mono
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 space-y-1">
              <p className="text-xs font-semibold text-blue-700">How it works</p>
              <p className="text-xs text-blue-700">
                <span className="font-mono bg-blue-100 px-1 rounded">Opening Balance</span> for each month = previous month's Closing Balance.
              </p>
              <p className="text-xs text-blue-700">
                <span className="font-mono bg-blue-100 px-1 rounded">Closing Balance</span> = Opening Balance + Maintenance Collected + Other Income − Expenses.
              </p>
              <p className="text-xs text-blue-700">
                The seed balance above anchors the chain for the month you specify (or from the very first tracked month if left blank).
              </p>
            </div>
          </SectionCard>

          <SaveBar isPending={mutation.isPending} onSave={saveFinance} />
        </div>
      )}

      {/* ── DISPLAY SETTINGS TAB ────────────────────────────────────────── */}
      {activeTab === 'display' && (
        <div className="space-y-5">
          <SectionCard
            title="Pagination"
            subtitle="Number of rows displayed per page across all tables"
          >
            <div className="max-w-xs">
              <FieldLabel hint="Minimum 5, maximum 100">Rows per Page</FieldLabel>
              <Input
                type="number"
                min={5}
                max={100}
                step="5"
                value={form.paginationLimit ?? 20}
                onChange={(v) => set('paginationLimit', Math.min(100, Math.max(5, parseInt(v) || 20)))}
              />
            </div>
            <div className="flex gap-2 flex-wrap mt-1">
              {[10, 15, 20, 25, 50].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('paginationLimit', n)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    form.paginationLimit === n
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Theme"
            subtitle="Choose the default appearance of the admin portal"
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => set('theme', 'light')}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 text-sm font-medium transition ${
                  form.theme === 'light' || !form.theme
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">☀️</span>
                <div className="text-left">
                  <p className="font-semibold">Light Mode</p>
                  <p className="text-xs opacity-70">Clean white interface</p>
                </div>
                {(form.theme === 'light' || !form.theme) && (
                  <span className="ml-2 text-blue-500">✓</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => set('theme', 'dark')}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 text-sm font-medium transition ${
                  form.theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">🌙</span>
                <div className="text-left">
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-xs opacity-70">Easy on the eyes</p>
                </div>
                {form.theme === 'dark' && (
                  <span className="ml-2 text-blue-500">✓</span>
                )}
              </button>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mt-1">
              <span className="text-amber-500 text-sm mt-0.5">ℹ️</span>
              <p className="text-xs text-amber-700">
                Theme preference is saved and will be applied on the next release. Dark mode CSS is currently in development.
              </p>
            </div>
          </SectionCard>

          <SaveBar isPending={mutation.isPending} onSave={saveDisplay} />
        </div>
      )}

      {/* ── BANK DETAILS TAB ────────────────────────────────────────────── */}
      {activeTab === 'bank' && (
        <div className="space-y-5">
          <SectionCard
            title="Bank Account Details"
            subtitle="These details are shown to residents on their Bills page so they know where to transfer payments"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Bank Name</FieldLabel>
                <Input
                  value={form.bankName ?? ''}
                  onChange={(v) => set('bankName', v)}
                  placeholder="e.g. State Bank of India"
                />
              </div>
              <div>
                <FieldLabel>Account Number</FieldLabel>
                <Input
                  value={form.bankAccountNumber ?? ''}
                  onChange={(v) => set('bankAccountNumber', v)}
                  placeholder="e.g. 1234567890"
                  mono
                />
              </div>
              <div>
                <FieldLabel>IFSC Code</FieldLabel>
                <Input
                  value={form.bankIfsc ?? ''}
                  onChange={(v) => set('bankIfsc', v.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  mono
                />
              </div>
              <div>
                <FieldLabel hint="Bank branch name or city">Branch / City</FieldLabel>
                <Input
                  value={form.bankBranch ?? ''}
                  onChange={(v) => set('bankBranch', v)}
                  placeholder="e.g. MG Road, Bengaluru"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="UPI Payment"
            subtitle="UPI ID and QR code for instant payment by residents"
          >
            <div>
              <FieldLabel>UPI ID</FieldLabel>
              <Input
                value={form.upiId ?? ''}
                onChange={(v) => set('upiId', v)}
                placeholder="e.g. society@upi"
                mono
              />
            </div>

            {/* QR Code upload */}
            <div>
              <FieldLabel hint="Upload a QR image for residents to scan (max 512 KB)">UPI QR Code</FieldLabel>
              <div className="flex items-start gap-4">
                {/* Thumbnail preview */}
                <div
                  className={`flex-shrink-0 w-24 h-24 rounded-lg border-2 overflow-hidden flex items-center justify-center ${
                    form.upiQrCode ? 'border-gray-200' : 'border-dashed border-gray-300 bg-gray-50'
                  }`}
                >
                  {form.upiQrCode ? (
                    <img src={form.upiQrCode} alt="UPI QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl opacity-30">📷</span>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => qrInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition w-fit"
                  >
                    📤 {form.upiQrCode ? 'Replace QR Image' : 'Upload QR Image'}
                  </button>
                  {form.upiQrCode && (
                    <button
                      type="button"
                      onClick={() => set('upiQrCode', null)}
                      className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition w-fit"
                    >
                      🗑 Remove QR Code
                    </button>
                  )}
                  <p className="text-xs text-gray-400">PNG, JPG, or WebP · Max 512 KB</p>
                </div>

                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleQrUpload}
                />
              </div>
            </div>
          </SectionCard>

          {/* Resident payment preview card */}
          {(form.bankAccountNumber || form.upiId || form.upiQrCode) && (
            <SectionCard
              title="Resident Preview"
              subtitle="How payment details appear on the resident Bills page"
            >
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Payment Methods</p>

                {form.bankAccountNumber && (
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5">🏦</span>
                    <div>
                      <p className="font-medium">{form.bankName || 'Bank Transfer'}</p>
                      <p className="text-xs text-gray-500">
                        A/C: <span className="font-mono">{form.bankAccountNumber}</span>
                        {form.bankIfsc ? ` · IFSC: ${form.bankIfsc}` : ''}
                        {form.bankBranch ? ` · ${form.bankBranch}` : ''}
                      </p>
                    </div>
                  </div>
                )}

                {(form.upiId || form.upiQrCode) && (
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="mt-0.5">📲</span>
                    <div className="flex items-start gap-4">
                      <div>
                        <p className="font-medium">UPI Payment</p>

                        {form.upiId && (
                          <p className="text-xs text-gray-500 font-mono">{form.upiId}</p>
                        )}
                      </div>
                      {form.upiQrCode && (
                        <img
                          src={form.upiQrCode}
                          alt="UPI QR"
                          className="w-16 h-16 object-contain rounded border border-gray-200"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          <SaveBar isPending={mutation.isPending} onSave={saveBank} />
        </div>
      )}

      {/* ── SECURITY TAB ────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="space-y-5">
          <SectionCard
            title="Two-Factor Authentication (2FA)"
            subtitle="Control 2FA enforcement for all society users"
          >
            <Toggle
              checked={!!form.require2fa}
              onChange={(v) => set('require2fa', v)}
              label="Require 2FA for All Users"
              description="When enabled, every user (admin, residents, security) must set up and verify TOTP on every login. Users who haven't set up 2FA will be blocked at login until they do."
            />
            {form.require2fa && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mt-1">
                <span className="text-amber-500 text-sm mt-0.5">⚠️</span>
                <p className="text-xs text-amber-700">
                  <strong>Important:</strong> Once enabled, users without 2FA set up will be unable to log in until they configure it. Ensure all users are informed before enabling this setting.
                </p>
              </div>
            )}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <span className="text-blue-500 text-sm mt-0.5">ℹ️</span>
              <p className="text-xs text-blue-700">
                Individual users can set up 2FA on their own via <strong>Security Settings</strong> in their profile. This setting enforces it society-wide.
              </p>
            </div>
          </SectionCard>

          <SaveBar isPending={mutation.isPending} onSave={saveSecurity} />
        </div>
      )}
    </div>
  )
}
