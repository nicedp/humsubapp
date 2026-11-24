import { useState } from 'react'
import { Block } from '../../../types'
import { buildFlatNumber, countGenerated, UnitTemplate } from './bulkSetupHelpers'
import { BLOCK_TYPE_OPTIONS } from '../../../constants/labels'

export interface FloorRangeForm {
  blockId: string
  customPrefix: string
  noPrefix: boolean    // when true, skip the block prefix entirely → "101" instead of "A-101"
  floorCount: number   // how many floors to generate (e.g. 8)
  startFloor: number   // first floor number (default 1)
  unitStartNumber: number  // starting unit number per floor (default 1 → "01")
}

interface Props {
  form: FloorRangeForm
  blocks: Block[]
  onChange: (f: FloorRangeForm) => void
  units: UnitTemplate[]  // needed to show live count in summary
  onCreateBlock: (payload: { name: string; blockType: 'flats' | 'rowhouses' | 'mixed' }) => Promise<void>
}

export default function FloorRangeConfig({ form, blocks, onChange, units, onCreateBlock }: Props) {
  // ── Inline Add Block mini-form state ──────────────────────────
  const [showAddForm, setShowAddForm] = useState(false)
  const [miniName, setMiniName] = useState('')
  const [miniBlockType, setMiniBlockType] = useState<'flats' | 'rowhouses' | 'mixed'>('flats')
  const [miniSaving, setMiniSaving] = useState(false)
  const [miniError, setMiniError] = useState('')

  const selectedBlock = blocks.find(b => b.id === form.blockId)
  const prefix = form.customPrefix.trim() || selectedBlock?.name || 'A'
  const toFloor = form.startFloor + form.floorCount - 1

  // Live preview of first flat number
  const exampleSuffix = String(form.unitStartNumber).padStart(2, '0')
  const exampleFrom = form.noPrefix
    ? `${form.startFloor}${exampleSuffix}`
    : buildFlatNumber(prefix, form.startFloor, exampleSuffix, false)
  const exampleTo = form.noPrefix
    ? `${toFloor}${exampleSuffix}`
    : buildFlatNumber(prefix, toFloor, exampleSuffix, false)

  // Live unit count (even before block selected)
  const validUnits = units.filter(u => u.suffix.trim() && parseFloat(u.sqFt) > 0).length
  const totalPreviewCount = form.floorCount > 0 ? form.floorCount * validUnits : 0

  // ── Handle inline block creation ──────────────────────────────
  async function handleSaveBlock() {
    const name = miniName.trim()
    if (!name) { setMiniError('Block name is required'); return }
    setMiniSaving(true)
    setMiniError('')
    try {
      await onCreateBlock({ name, blockType: miniBlockType })
      setMiniName('')
      setMiniBlockType('flats')
      setShowAddForm(false)
    } catch (e: any) {
      setMiniError(e?.response?.data?.message ?? 'Failed to create block')
    } finally {
      setMiniSaving(false)
    }
  }

  function handleCancelAddBlock() {
    setShowAddForm(false)
    setMiniName('')
    setMiniBlockType('flats')
    setMiniError('')
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700">Block & Floors</h3>
        <p className="text-xs text-gray-400 mt-0.5">Choose a block, set the number of floors, and configure the unit numbering</p>
      </div>

      {/* ── Block selector ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-600">Block *</label>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => { setShowAddForm(true); setMiniError('') }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
            >
              <span className="text-base leading-none">+</span> Add Block
            </button>
          )}
        </div>

        <select
          value={form.blockId}
          onChange={e => onChange({ ...form, blockId: e.target.value, customPrefix: '' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select a block…</option>
          {blocks.map(b => (
            <option key={b.id} value={b.id}>{b.name} ({b.blockType})</option>
          ))}
        </select>

        {/* No blocks warning */}
        {blocks.length === 0 && !showAddForm && (
          <p className="text-xs text-amber-600 mt-1.5">
            ⚠️ No blocks found. Click <strong>+ Add Block</strong> above to create one.
          </p>
        )}

        {/* Help text — what is a block */}
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-500 flex gap-2">
          <span className="text-base leading-none mt-0.5">💡</span>
          <div>
            <span className="font-medium text-gray-600">What is a Block?</span>{' '}
            A block is a building or wing in your society — e.g. <span className="font-mono text-gray-600">Block A</span>,{' '}
            <span className="font-mono text-gray-600">Tower 1</span>, or{' '}
            <span className="font-mono text-gray-600">North Wing</span>.
            All properties are grouped under a block.
            You can also manage blocks from the{' '}
            <span className="font-medium text-gray-600">Properties page</span>.
          </div>
        </div>

        {/* ── Inline Add Block mini-form ─────────────────────────── */}
        {showAddForm && (
          <div className="mt-3 border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-blue-700">New Block</p>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Block Name *</label>
              <input
                type="text"
                value={miniName}
                onChange={e => { setMiniName(e.target.value); setMiniError('') }}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveBlock() }}
                placeholder="e.g. Block A, Tower 1, North Wing"
                maxLength={50}
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Block Type *</label>
              <div className="grid grid-cols-3 gap-2">
                {BLOCK_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMiniBlockType(opt.value)}
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      miniBlockType === opt.value
                        ? 'border-blue-500 bg-white ring-2 ring-blue-300'
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-700">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {miniError && (
              <p className="text-xs text-red-600">✕ {miniError}</p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveBlock}
                disabled={miniSaving || !miniName.trim()}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
              >
                {miniSaving
                  ? <><span className="animate-spin">⋯</span> Creating…</>
                  : '✓ Create Block'
                }
              </button>
              <button
                type="button"
                onClick={handleCancelAddBlock}
                disabled={miniSaving}
                className="px-4 py-1.5 text-gray-600 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Floor count + start floor ─────────────────────────────── */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Number of Floors *
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.floorCount}
            onChange={e => {
              const v = Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
              onChange({ ...form, floorCount: v })
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <p className="text-xs text-gray-400 mt-1">Total floors to generate (e.g. 8)</p>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Starting Floor
            <span className="text-gray-400 font-normal ml-1">(default 1)</span>
          </label>
          <input
            type="number"
            min={-10}
            max={200}
            value={form.startFloor}
            onChange={e => {
              const v = Math.max(-10, Math.min(200, parseInt(e.target.value) ?? 1))
              onChange({ ...form, startFloor: v })
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <p className="text-xs text-gray-400 mt-1">Use 0 for Ground, -1 for Basement</p>
        </div>
      </div>

      {/* ── Unit start number ─────────────────────────────────────── */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Unit Start Number
            <span className="text-gray-400 font-normal ml-1">(default 1)</span>
          </label>
          <input
            type="number"
            min={1}
            max={999}
            value={form.unitStartNumber}
            onChange={e => {
              const v = Math.max(1, Math.min(999, parseInt(e.target.value) || 1))
              onChange({ ...form, unitStartNumber: v })
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <p className="text-xs text-gray-400 mt-1">
            First unit number per floor — e.g. 5 → units 05, 06, 07… on each floor
          </p>
        </div>
        <div className="flex-1 flex items-center pt-5">
          {/* spacer to align with above row */}
        </div>
      </div>

      {/* ── Custom prefix + no-prefix toggle ──────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-600">
            Flat Number Prefix
            <span className="text-gray-400 font-normal ml-1">(defaults to block name)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.noPrefix}
              onChange={e => onChange({ ...form, noPrefix: e.target.checked })}
              className="rounded border-gray-400 text-blue-600 focus:ring-blue-300"
            />
            <span className="text-xs text-gray-600 font-medium">No prefix</span>
          </label>
        </div>

        {!form.noPrefix && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={form.customPrefix}
              onChange={e => onChange({ ...form, customPrefix: e.target.value })}
              placeholder={selectedBlock?.name || 'e.g. A, Tower-1'}
              maxLength={10}
              className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
            />
            <span className="text-xs text-gray-500">
              → e.g. <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                {prefix}-{form.startFloor}{exampleSuffix}
              </span>
            </span>
          </div>
        )}
        {form.noPrefix && (
          <p className="text-xs text-gray-400 mt-1">
            Flat numbers will be just floor+unit — e.g.{' '}
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
              {form.startFloor}{exampleSuffix}
            </span>
          </p>
        )}
      </div>

      {/* ── Summary — always shown once floorCount > 0 ───────────── */}
      {form.floorCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700 space-y-0.5">
          <p>📐 <strong>{form.floorCount} floor{form.floorCount !== 1 ? 's' : ''}</strong> (Floor {form.startFloor} → {toFloor})</p>
          {totalPreviewCount > 0 && (
            <p>🏢 <strong>{totalPreviewCount}</strong> total unit{totalPreviewCount !== 1 ? 's' : ''} ({validUnits} per floor)</p>
          )}
          <p>
            🏷️ Flat numbers:{' '}
            <span className="font-mono">{exampleFrom}</span>
            {form.floorCount > 1 && <> … <span className="font-mono">{exampleTo}</span></>}
          </p>
        </div>
      )}
    </div>
  )
}