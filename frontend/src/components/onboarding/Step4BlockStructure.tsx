import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { blocksApi } from '../../api/blocks'
import { BLOCK_TYPE_OPTIONS } from '../../constants/labels'

interface Props {
  onNext: () => void
  loading: boolean
}

interface BlockForm {
  name: string
  blockType: 'flats' | 'rowhouses' | 'mixed'
  description: string
}

const EMPTY_FORM: BlockForm = { name: '', blockType: 'flats', description: '' }

export default function Step4BlockStructure({ onNext, loading }: Props) {
  const [form, setForm] = useState<BlockForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const { data: blocksData, refetch } = useQuery({
    queryKey: ['blocks', 'onboarding'],
    queryFn: () => blocksApi.list(),
  })

  const blocks: any[] = Array.isArray(blocksData) ? blocksData : []

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; blockType: 'flats' | 'rowhouses' | 'mixed'; description?: string }) =>
      blocksApi.create(payload),
    onSuccess: () => {
      setForm(EMPTY_FORM)
      setFormError('')
      refetch()
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message ?? 'Failed to create block')
    },
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('Block name is required'); return }
    await createMutation.mutateAsync({
      name: form.name.trim(),
      blockType: form.blockType,
      description: form.description.trim() || undefined,
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">🏗️ Step 4 — Block Structure</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add at least one block (e.g. Block A, Wing B). You can add more later from Properties.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Block Form */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Add a Block</h3>
          {formError && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
              {formError}
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Block Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p: BlockForm) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Block A, Wing B, Tower 1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Block Type</label>
              <div className="grid grid-cols-3 gap-2">
                {BLOCK_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((p: BlockForm) => ({ ...p, blockType: opt.value as BlockForm['blockType'] }))}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      form.blockType === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">
                      {opt.value === 'flats' ? '🏢' : opt.value === 'rowhouses' ? '🏘️' : '🏗️'}
                    </div>
                    <div className="text-xs font-medium">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((p: BlockForm) => ({ ...p, description: e.target.value }))}
                placeholder="e.g. Main residential block"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending || !form.name.trim()}
              className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              {createMutation.isPending ? 'Adding...' : '+ Add Block'}
            </button>
          </form>
        </div>

        {/* Blocks List */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Added Blocks <span className="text-gray-400 font-normal">({blocks.length})</span>
          </h3>
          {blocks.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
              <div className="text-4xl mb-2">🏗️</div>
              <p className="text-sm text-gray-500">No blocks added yet.</p>
              <p className="text-xs text-gray-400 mt-1">Add at least one block to continue.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blocks.map((block: any) => (
                <div key={block.id}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-lg">
                    {block.blockType === 'flats' ? '🏢' : block.blockType === 'rowhouses' ? '🏘️' : '🏗️'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{block.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{block.blockType}</p>
                  </div>
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {blocks.length === 0
            ? 'Add at least one block to proceed'
            : `${blocks.length} block${blocks.length > 1 ? 's' : ''} ready`}
        </p>
        <button
          onClick={onNext}
          disabled={loading || blocks.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-8 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}