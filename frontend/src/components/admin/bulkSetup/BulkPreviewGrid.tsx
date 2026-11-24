import { useState } from 'react'
import { BulkFlatPayload } from '../../../api/flats'
import { BULK_PROPERTY_TYPE_LABELS } from './bulkSetupHelpers'
import { floorLabel } from '../../../constants/labels'

interface Props {
  flats: BulkFlatPayload[]
  existingFlatNumbers: Set<string>
  /** Called when admin edits a flat number inline */
  onFlatNumberChange: (oldNumber: string, newNumber: string) => void
}

export default function BulkPreviewGrid({ flats, existingFlatNumbers, onFlatNumberChange }: Props) {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  if (flats.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-4xl mb-2">🏗️</p>
        <p className="font-semibold text-gray-700">No units to preview</p>
        <p className="text-xs text-gray-400 mt-1">Configure the template and floor range above, then preview will appear here</p>
      </div>
    )
  }

  // Group by floor. Row-house types have floor=null → group under their own key "rowhouse"
  // We use the actual floor number as the key; null → 'nofloor'
  const byFloor = new Map<string, BulkFlatPayload[]>()
  for (const flat of flats) {
    const key = flat.floor != null ? String(flat.floor) : 'nofloor'
    if (!byFloor.has(key)) byFloor.set(key, [])
    byFloor.get(key)!.push(flat)
  }

  // Sort floors descending (highest first, like a building elevation)
  // 'nofloor' goes at the bottom
  const sortedFloors = [...byFloor.keys()].sort((a, b) => {
    if (a === 'nofloor') return 1
    if (b === 'nofloor') return -1
    return parseInt(b) - parseInt(a)
  })

  const newCount = flats.filter(f => !existingFlatNumbers.has(f.flatNumber)).length
  const skipCount = flats.filter(f => existingFlatNumbers.has(f.flatNumber)).length

  function startEdit(flatNumber: string) {
    setEditingKey(flatNumber)
    setEditValue(flatNumber)
  }

  function commitEdit(oldNumber: string) {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== oldNumber) {
      onFlatNumberChange(oldNumber, trimmed)
    }
    setEditingKey(null)
    setEditValue('')
  }

  function floorDisplayLabel(key: string): string {
    if (key === 'nofloor') return 'Row Houses / No Floor'
    const n = parseInt(key)
    return floorLabel(n)
  }

  return (
    <div className="space-y-4">
      {/* Summary badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
          ✅ {newCount} new
        </span>
        {skipCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            ⚠️ {skipCount} already exist (will skip)
          </span>
        )}
        <span className="text-xs text-gray-400">{flats.length} total units across {sortedFloors.length} group(s)</span>
        <span className="text-xs text-gray-400 italic">Click any flat number tile to rename it</span>
      </div>

      {/* Floor rows */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {sortedFloors.map(floorKey => {
          const units = byFloor.get(floorKey)!
          return (
            <div key={floorKey} className="flex items-start gap-3">
              {/* Floor label */}
              <div className="w-28 flex-shrink-0 text-right pt-1.5">
                <span className="text-xs font-semibold text-gray-500">
                  {floorDisplayLabel(floorKey)}
                </span>
              </div>
              {/* Unit tiles */}
              <div className="flex flex-wrap gap-1.5">
                {units.map(flat => {
                  const isExisting = existingFlatNumbers.has(flat.flatNumber)
                  const isEditing = editingKey === flat.flatNumber

                  return isEditing ? (
                    <div
                      key={flat.flatNumber}
                      className="flex items-center w-24 h-16 rounded-lg border-2 border-blue-400 bg-white px-1"
                    >
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => commitEdit(flat.flatNumber)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitEdit(flat.flatNumber)
                          if (e.key === 'Escape') { setEditingKey(null); setEditValue('') }
                        }}
                        autoFocus
                        className="w-full text-xs font-bold text-center text-blue-700 bg-transparent outline-none"
                      />
                    </div>
                  ) : (
                    <div
                      key={flat.flatNumber}
                      title={`${flat.flatNumber} • ${BULK_PROPERTY_TYPE_LABELS[flat.type] ?? flat.type} • ${flat.sqFt} sq ft${isExisting ? ' — ALREADY EXISTS' : ''}\nClick to rename`}
                      onClick={() => !isExisting && startEdit(flat.flatNumber)}
                      className={`flex flex-col items-center justify-center w-24 h-16 rounded-lg border text-center transition-all ${
                        isExisting
                          ? 'bg-amber-50 border-amber-300 text-amber-700 opacity-80 cursor-default'
                          : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400 cursor-pointer'
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight">{flat.flatNumber}</span>
                      <span className="text-[10px] leading-tight opacity-70 mt-0.5">
                        {BULK_PROPERTY_TYPE_LABELS[flat.type]?.split(' ')[0] ?? flat.type}
                      </span>
                      <span className="text-[10px] leading-tight opacity-60">{flat.sqFt} ft²</span>
                      {isExisting && (
                        <span className="text-[9px] font-semibold text-amber-600 mt-0.5">exists</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
          New (click to rename)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          Already exists (will skip)
        </div>
      </div>
    </div>
  )
}