import React, { useState, useCallback } from 'react'
import { SocietySettings } from '../../types/index'

/** The hosted portal domain — must match RegisterPage.tsx PORTAL_DOMAIN */
export const PORTAL_DOMAIN = 'societyportal.app'

/** Derives the full subdomain-style portal URL: https://{slug}.societyportal.app */
export function buildPortalUrl(societyUrl: string | null | undefined): string | null {
  if (!societyUrl) return null
  return `https://${societyUrl}.${PORTAL_DOMAIN}`
}

interface Props {
  settings: Partial<SocietySettings>
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy"
      className="ml-2 flex-shrink-0 text-xs px-2 py-0.5 rounded border border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-300 transition"
    >
      {copied ? <span className="text-green-600 font-semibold">✓</span> : '📋'}
    </button>
  )
}

/** The visual card — used both in modal and in print view */
function CardBody({ settings }: { settings: Partial<SocietySettings> }) {
  const portalUrl = buildPortalUrl(settings.societyUrl)
  const loginUrl = `https://${PORTAL_DOMAIN}/login`

  return (
    <div
      className="rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-md overflow-hidden"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
          🏘️
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-bold text-lg leading-tight truncate">
            {settings.societyName ?? 'Society Portal'}
          </h3>
          <p className="text-blue-200 text-xs mt-0.5">Society Management Portal</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Account Number */}
        {settings.accountNumber && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-blue-200 px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Account Number</p>
              <p className="text-xl font-mono font-bold text-gray-900 mt-0.5 tracking-widest">
                {settings.accountNumber}
              </p>
            </div>
            <CopyButton text={settings.accountNumber} />
          </div>
        )}

        {/* Portal URL */}
        {portalUrl && (
          <div className="flex items-start justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Portal URL</p>
              <p className="text-sm font-mono text-blue-700 mt-0.5 break-all">{portalUrl}</p>
            </div>
            <CopyButton text={portalUrl} />
          </div>
        )}

        {/* Login URL */}
        <div className="flex items-start justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Login Page</p>
            <p className="text-sm font-mono text-blue-700 mt-0.5 break-all">{loginUrl}</p>
          </div>
          <CopyButton text={loginUrl} />
        </div>

        {/* Address */}
        {settings.address && (
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <span className="flex-shrink-0 mt-0.5">📍</span>
            <span className="leading-relaxed">{settings.address}</span>
          </div>
        )}

        {/* Contact */}
        {(settings.phone || settings.email) && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
            {settings.phone && (
              <span className="flex items-center gap-1.5">
                <span>📞</span>
                <span>{settings.phone}</span>
              </span>
            )}
            {settings.email && (
              <span className="flex items-center gap-1.5">
                <span>✉️</span>
                <span>{settings.email}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-100 px-5 py-2.5 flex items-center justify-between">
        <p className="text-xs text-gray-400">Share with residents to help them log in</p>
        {settings.societyUrl && (
          <span className="text-xs font-mono text-gray-400">{settings.societyUrl}.{PORTAL_DOMAIN}</span>
        )}
      </div>
    </div>
  )
}

/**
 * SocietyCard modal — opened via a CTA button in the parent.
 * Includes an isolated print button that only prints the card (not the whole page).
 */
export function SocietyCardModal({
  settings,
  onClose,
}: {
  settings: Partial<SocietySettings>
  onClose: () => void
}) {
  const handlePrint = useCallback(() => {
    // Create a hidden iframe, inject card HTML + isolated CSS, print it
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '-9999px'
    iframe.style.left = '-9999px'
    iframe.style.width = '800px'
    iframe.style.height = '600px'
    document.body.appendChild(iframe)

    const portalUrl = buildPortalUrl(settings.societyUrl)
    const loginUrl = `https://${PORTAL_DOMAIN}/login`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Society Identity Card — ${settings.societyName ?? 'Society'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #fff; padding: 32px; }
    .card { border: 2px solid #bfdbfe; border-radius: 16px; overflow: hidden; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 20px; display: flex; align-items: center; gap: 12px; }
    .header-icon { width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .header-name { color: #fff; font-size: 18px; font-weight: 700; }
    .header-sub { color: #bfdbfe; font-size: 11px; margin-top: 2px; }
    .body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .row { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 16px; }
    .row.accent { border-color: #bfdbfe; }
    .row-label { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .row-value { font-family: 'Courier New', monospace; font-size: 16px; font-weight: 700; color: #111827; margin-top: 4px; letter-spacing: 0.1em; }
    .row-url { font-family: 'Courier New', monospace; font-size: 13px; color: #1d4ed8; margin-top: 4px; }
    .contact { font-size: 13px; color: #374151; }
    .address { font-size: 13px; color: #374151; }
    .footer { background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 10px 20px; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    @media print {
      body { padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="header-icon">🏘️</div>
      <div>
        <div class="header-name">${settings.societyName ?? 'Society Portal'}</div>
        <div class="header-sub">Society Management Portal</div>
      </div>
    </div>
    <div class="body">
      ${settings.accountNumber ? `
      <div class="row accent">
        <div class="row-label">Account Number</div>
        <div class="row-value">${settings.accountNumber}</div>
      </div>` : ''}
      ${portalUrl ? `
      <div class="row">
        <div class="row-label">Portal URL</div>
        <div class="row-url">${portalUrl}</div>
      </div>` : ''}
      <div class="row">
        <div class="row-label">Login Page</div>
        <div class="row-url">${loginUrl}</div>
      </div>
      ${settings.address ? `
      <div class="address">📍 ${settings.address}</div>` : ''}
      ${(settings.phone || settings.email) ? `
      <div class="contact">
        ${settings.phone ? `📞 ${settings.phone}` : ''}
        ${settings.phone && settings.email ? ' &nbsp;·&nbsp; ' : ''}
        ${settings.email ? `✉️ ${settings.email}` : ''}
      </div>` : ''}
    </div>
    <div class="footer">
      <span>Share with residents to help them log in</span>
      ${settings.societyUrl ? `<span>${settings.societyUrl}.${PORTAL_DOMAIN}</span>` : ''}
    </div>
  </div>
</body>
</html>`

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(html)
      doc.close()
      iframe.contentWindow?.focus()
      setTimeout(() => {
        iframe.contentWindow?.print()
        setTimeout(() => document.body.removeChild(iframe), 1000)
      }, 300)
    }
  }, [settings])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-base">🪪 Society Identity Card</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              🖨️ Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="p-5">
          <CardBody settings={settings} />
        </div>

        {/* Modal footer */}
        <div className="px-5 pb-5">
          <p className="text-xs text-gray-400 text-center">
            Share this card with your members so they can log in to the portal
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Default export — the card itself (for Step7 and other non-modal uses).
 * Does NOT include a print button; use SocietyCardModal for interactive use.
 */
export default function SocietyCard({ settings }: Props) {
  const hasDetails = !!(
    settings.societyName ||
    settings.accountNumber ||
    settings.societyUrl ||
    settings.address ||
    settings.phone ||
    settings.email
  )
  if (!hasDetails) return null
  return <CardBody settings={settings} />
}