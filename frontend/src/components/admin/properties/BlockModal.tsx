import { Block } from '../../../types'
import { BLOCK_TYPE_LABELS } from '../../../constants/labels'

type BlockType = 'flats' | 'rowhouses' | 'mixed'
const BLOCK_TYPES: BlockType[] = ['flats', 'rowhouses', 'mixed']

export interface BlockForm {
  name: string
  description: string
  blockType: BlockType
  totalFloors: string
}

interface Props {
  editBlock: Block | null
  form: BlockForm
  saving: boolean
  onChange: (f: BlockForm) => void
  onSave: () => void
  onClose: () => void
}

export default function BlockModal({ editBlock, form, saving, onChange, onSave, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">{editBlock ? 'Edit Block' : 'Add Block'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Block Name *</label>
            <input
              type="text"
              placeholder="e.g. Block A"
              value={form.name}
              onChange={e => onChange({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input
              type="text"
              placeholder="Optional"
              value={form.description}
              onChange={e => onChange({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Block Type</label>
            <select
              value={form.blockType}
              onChange={e => onChange({ ...form, blockType: e.target.value as BlockType })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {BLOCK_TYPES.map(t => (
                <option key={t} value={t}>{BLOCK_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Total Floors</label>
            <input
              type="number"
              min={1}
              max={50}
              placeholder="Optional"
              value={form.totalFloors}
              onChange={e => onChange({ ...form, totalFloors: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
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