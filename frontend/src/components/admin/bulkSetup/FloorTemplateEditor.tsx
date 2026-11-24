import { UnitTemplate, BULK_PROPERTY_TYPES, BULK_PROPERTY_TYPE_LABELS, buildFlatNumber, computeEffectiveSuffix } from './bulkSetupHelpers'
import { PropertyType } from '../../../types'

interface Props {
  units: UnitTemplate[]
  onChange: (units: UnitTemplate[]) => void
  // For accurate preview column
  prefix: string      // resolved prefix (customPrefix || blockName || 'A')
  noPrefix: boolean
  startFloor: number
  unitStartNumber: number
}

export default function FloorTemplateEditor({ units, onChange, prefix, noPrefix, startFloor, unitStartNumber }: Props) {
  function updateUnit(id: string, patch: Partial<UnitTemplate>) {
    onChange(units.map(u => u.id === id ? { ...u, ...patch } : u))
  }

  function addUnit() {
    const nextNum = units.length + 1
    const suffix = String(nextNum).padStart(2, '0')
    onChange([
      ...units,
      { id: crypto.randomUUID(), suffix, type: 'flat', sqFt: '1000' },
    ])
  }

  function removeUnit(id: string) {
    if (units.length <= 1) return
    onChange(units.filter(u => u.id !== id))
  }

  // Build a preview flat number for a given unit at its index
  function previewNumber(unit: UnitTemplate, validIdx: number): string {
    if (!unit.suffix.trim()) return '—'
    const effectiveSuffix = computeEffectiveSuffix(unit.suffix, validIdx, unitStartNumber)
    return buildFlatNumber(prefix, startFloor, effectiveSuffix, noPrefix)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Floor Template</h3>
          <p className="text-xs text-gray-400 mt-0.5">Define the units that repeat on every floor</p>
        </div>
        <button
          onClick={addUnit}
          className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-medium"
        >
          + Add Unit
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-20">Unit #</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Type</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-28">Sq Ft</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-32">Preview (Floor {startFloor})</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {units.map((unit, idx) => {
              // compute validIdx = how many valid units before this one
              const validIdx = units.slice(0, idx).filter(u => u.suffix.trim() && parseFloat(u.sqFt) > 0).length
              return (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={unit.suffix}
                      onChange={e => updateUnit(unit.id, { suffix: e.target.value })}
                      maxLength={4}
                      placeholder="01"
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 text-center font-mono"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={unit.type}
                      onChange={e => updateUnit(unit.id, { type: e.target.value as PropertyType })}
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {BULK_PROPERTY_TYPES.map(t => (
                        <option key={t} value={t}>{BULK_PROPERTY_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      max={99999}
                      value={unit.sqFt}
                      onChange={e => updateUnit(unit.id, { sqFt: e.target.value })}
                      placeholder="1000"
                      className="w-24 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                      {previewNumber(unit, validIdx)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => removeUnit(unit.id)}
                      disabled={units.length <= 1}
                      title="Remove unit"
                      className="text-gray-300 hover:text-red-500 disabled:opacity-30 transition text-base leading-none"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        💡 Unit # is the suffix appended after the floor number. Preview shows floor {startFloor} with your current prefix and unit start number settings.
      </p>
    </div>
  )
}