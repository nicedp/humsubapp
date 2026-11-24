import { Block } from '../../../types'
import { BLOCK_TYPE_LABELS, BLOCK_TYPE_COLORS } from '../../../constants/labels'

interface Props {
  blocks: Block[]
  open: boolean
  activeBlockId: string
  onToggle: () => void
  onAddBlock: () => void
  onEditBlock: (b: Block) => void
  onDeleteBlock: (id: string) => void
  onFilterBlock: (id: string) => void
}

export default function BlocksPanel({ blocks, open, activeBlockId, onToggle, onAddBlock, onEditBlock, onDeleteBlock, onFilterBlock }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition text-sm font-semibold text-gray-700"
      >
        <span>
          🏗️ Blocks ({blocks.length})
          {activeBlockId && (
            <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {blocks.find(b => b.id === activeBlockId)?.name ?? ''} filtered
            </span>
          )}
        </span>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-4">
          <div className="flex flex-wrap gap-3">
            {blocks.map(b => {
              const isActive = activeBlockId === b.id
              return (
                <div
                  key={b.id}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 shadow-sm transition ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div>
                    <button
                      onClick={() => onFilterBlock(isActive ? '' : b.id)}
                      title={isActive ? 'Clear filter' : `Filter by ${b.name}`}
                      className={`text-sm font-semibold text-left transition ${
                        isActive ? 'text-blue-700' : 'text-gray-800 hover:text-blue-600'
                      }`}
                    >
                      {b.name}
                      {isActive && <span className="ml-1 text-xs">✕</span>}
                    </button>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${BLOCK_TYPE_COLORS[b.blockType]}`}>
                        {BLOCK_TYPE_LABELS[b.blockType]}
                      </span>
                      {b.totalFloors && (
                        <span className="text-xs text-gray-500">{b.totalFloors}F</span>
                      )}
                      <span className="text-xs text-gray-400">{b.flatCount ?? 0} units</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => onEditBlock(b)}
                      className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                    >✏️</button>
                    <button
                      onClick={() => onDeleteBlock(b.id)}
                      className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                    >🗑️</button>
                  </div>
                </div>
              )
            })}
            <button
              onClick={onAddBlock}
              className="flex items-center gap-1 border border-dashed border-blue-300 text-blue-600 text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition"
            >
              + Add Block
            </button>
          </div>
        </div>
      )}
    </div>
  )
}