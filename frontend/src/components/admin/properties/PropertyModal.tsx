import { Flat, Block, PropertyType } from '../../../types'
import { PROPERTY_TYPE_LABELS, FLOOR_REQUIRED_TYPES } from '../../../constants/labels'

const PROPERTY_TYPES: PropertyType[] = ['flat', 'single', 'duplex', 'triplex', 'bungalow', 'penthouse']

export interface PropertyForm {
  flatNumber: string
  blockId: string
  floor: string
  type: PropertyType
  sqFt: string
  status: 'occupied' | 'vacant'
}

interface Props {
  editProp: Flat | null
  form: PropertyForm
  blocks: Block[]
  error: string
  saving: boolean
  onChange: (f: PropertyForm) => void
  onSave: () => void
  onClose: () => void
}

export default function PropertyModal({ editProp, form, blocks, error, saving, onChange, onSave, onClose }: Props) {
  const needsFloor = FLOOR_REQUIRED_TYPES.has(form.type)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">{editProp ? 'Edit Property' : 'Add Property'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Property Number *</label>
            <input
              type="text"
              placeholder="e.g. A-101, RH-01"
              value={form.flatNumber}
              onChange={e => onChange({ ...form, flatNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Block</label>
            <select
              value={form.blockId}
              onChange={e => onChange({ ...form, blockId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">No block</option>
              {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
            <select
              value={form.type}
              onChange={e => onChange({ ...form, type: e.target.value as PropertyType })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {PROPERTY_TYPES.map(t => (
                <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {needsFloor && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Floor *</label>
              <input
                type="number"
                min={0}
                max={50}
                placeholder="e.g. 1"
                value={form.floor}
                onChange={e => onChange({ ...form, floor: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Area (sq ft) *</label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 1200"
              value={form.sqFt}
              onChange={e => onChange({ ...form, sqFt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => onChange({ ...form, status: e.target.value as 'occupied' | 'vacant' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >Cancel</button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}