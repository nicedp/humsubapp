import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { flatsApi } from '../../api/flats'
import { blocksApi } from '../../api/blocks'
import { residentsApi } from '../../api/residents'
import { Flat, Block, PropertyType } from '../../types'
import Pagination from '../../components/Pagination'
import { PROPERTY_TYPE_LABELS, FLOOR_REQUIRED_TYPES } from '../../constants/labels'
import BlocksPanel from '../../components/admin/properties/BlocksPanel'
import PropertyModal, { PropertyForm } from '../../components/admin/properties/PropertyModal'
import BlockModal, { BlockForm } from '../../components/admin/properties/BlockModal'
import ResidentModal, { ResidentForm } from '../../components/admin/residents/ResidentModal'

type BlockType = 'flats' | 'rowhouses' | 'mixed'
const PROPERTY_TYPES: PropertyType[] = ['flat', 'single', 'duplex', 'triplex', 'bungalow', 'penthouse']

const emptyPropForm: PropertyForm = { flatNumber: '', blockId: '', floor: '', type: 'flat', sqFt: '', status: 'vacant' }
const emptyBlockForm: BlockForm = { name: '', description: '', blockType: 'flats', totalFloors: '' }

export default function Properties() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // ── Blocks ──────────────────────────────────────────────────────
  const [blocks, setBlocks] = useState<Block[]>([])
  const [blocksOpen, setBlocksOpen] = useState(true)
  const [blockModal, setBlockModal] = useState(false)
  const [editBlock, setEditBlock] = useState<Block | null>(null)
  const [blockForm, setBlockForm] = useState<BlockForm>({ ...emptyBlockForm })
  const [blockSaving, setBlockSaving] = useState(false)

  // ── Properties ──────────────────────────────────────────────────
  const [properties, setProperties] = useState<Flat[]>([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const limit = 20
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterBlock, setFilterBlock] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Inline block-assign ─────────────────────────────────────────
  const [inlineEditId, setInlineEditId] = useState<string | null>(null)
  const [inlineBlockId, setInlineBlockId] = useState('')
  const [inlineSaving, setInlineSaving] = useState(false)

  // ── Property modal ──────────────────────────────────────────────
  const [modal, setModal] = useState(false)
  const [editProp, setEditProp] = useState<Flat | null>(null)
  const [propForm, setPropForm] = useState<PropertyForm>({ ...emptyPropForm })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ── Add Resident modal (quick-add owner for a flat) ─────────────
  const [residentModal, setResidentModal] = useState(false)
  const [residentForm, setResidentForm] = useState<ResidentForm>({
    name: '', email: '', phone: '', flatId: '', residentType: 'owner',
    username: '', password: '', moveInDate: '',
  })
  const [residentSaving, setResidentSaving] = useState(false)
  const [residentError, setResidentError] = useState('')

  // ── Loaders ─────────────────────────────────────────────────────
  const loadBlocks = useCallback(async () => {
    try { setBlocks(await blocksApi.list()) } catch { /* silent */ }
  }, [])

  const loadProperties = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { skip, limit }
      if (search) params.search = search
      if (filterStatus) params.status = filterStatus
      if (filterType) params.type = filterType
      if (filterBlock) params.blockId = filterBlock
      const res = await flatsApi.list(params as any)
      setProperties(res.data); setTotal(res.total)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [skip, limit, search, filterStatus, filterType, filterBlock])

  // ── Seed filterBlock from URL on first mount ─────────────────────
  useEffect(() => {
    const blockId = searchParams.get('blockId')
    if (blockId) setFilterBlock(blockId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadBlocks() }, [loadBlocks])
  useEffect(() => { loadProperties() }, [loadProperties])

  // ── Block CRUD ───────────────────────────────────────────────────
  function openAddBlock() { setEditBlock(null); setBlockForm({ ...emptyBlockForm }); setBlockModal(true) }
  function openEditBlock(b: Block) {
    setEditBlock(b)
    setBlockForm({ name: b.name, description: b.description ?? '', blockType: b.blockType as BlockType, totalFloors: b.totalFloors != null ? String(b.totalFloors) : '' })
    setBlockModal(true)
  }
  async function saveBlock() {
    if (!blockForm.name.trim()) return
    setBlockSaving(true)
    try {
      const payload = { name: blockForm.name.trim(), description: blockForm.description.trim() || null, blockType: blockForm.blockType, totalFloors: blockForm.totalFloors ? Number(blockForm.totalFloors) : null }
      editBlock ? await blocksApi.update(editBlock.id, payload) : await blocksApi.create(payload)
      setBlockModal(false); loadBlocks(); loadProperties()
    } catch (e: any) { alert(e?.response?.data?.message ?? 'Failed to save block') }
    finally { setBlockSaving(false) }
  }
  async function deleteBlock(id: string) {
    if (!window.confirm('Delete this block? All properties must be removed first.')) return
    try { await blocksApi.delete(id); loadBlocks() }
    catch (e: any) { alert(e?.response?.data?.message ?? 'Cannot delete block') }
  }

  // ── Property CRUD ─────────────────────────────────────────────────
  function openAdd() { setEditProp(null); setPropForm({ ...emptyPropForm }); setError(''); setModal(true) }
  function openEdit(p: Flat) {
    setEditProp(p)
    setPropForm({ flatNumber: p.flatNumber, blockId: p.blockId ?? '', floor: p.floor != null ? String(p.floor) : '', type: p.type, sqFt: String(p.sqFt), status: p.status })
    setError(''); setModal(true)
  }
  async function saveProp() {
    setError('')
    if (!propForm.flatNumber.trim()) { setError('Property number is required'); return }
    if (!propForm.sqFt || isNaN(Number(propForm.sqFt))) { setError('Area (sq ft) is required'); return }
    if (FLOOR_REQUIRED_TYPES.has(propForm.type) && !propForm.floor) { setError('Floor is required for this property type'); return }
    setSaving(true)
    try {
      const payload = { flatNumber: propForm.flatNumber.trim(), blockId: propForm.blockId || null, floor: propForm.floor ? Number(propForm.floor) : null, type: propForm.type, sqFt: Number(propForm.sqFt), status: propForm.status }
      editProp ? await flatsApi.update(editProp.id, payload) : await flatsApi.create(payload)
      setModal(false); loadProperties(); loadBlocks()
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to save property') }
    finally { setSaving(false) }
  }
  async function deleteProp(id: string) {
    if (!window.confirm('Delete this property?')) return
    try { await flatsApi.delete(id); loadProperties(); loadBlocks() }
    catch (e: any) { alert(e?.response?.data?.message ?? 'Cannot delete property') }
  }

  // ── Inline block assign ───────────────────────────────────────────
  function startInlineEdit(p: Flat) { setInlineEditId(p.id); setInlineBlockId(p.blockId ?? '') }
  function cancelInlineEdit() { setInlineEditId(null); setInlineBlockId('') }
  async function saveInlineBlock(flatId: string) {
    setInlineSaving(true)
    try { await flatsApi.update(flatId, { blockId: inlineBlockId || null }); setInlineEditId(null); setInlineBlockId(''); loadProperties(); loadBlocks() }
    catch (e: any) { alert(e?.response?.data?.message ?? 'Failed to update block') }
    finally { setInlineSaving(false) }
  }

  // ── Open resident modal pre-filled for a specific flat ──────────
  function openAddOwner(flat: Flat) {
    setResidentForm({
      name: '', email: '', phone: '', flatId: flat.id,
      residentType: 'owner', username: '', password: '', moveInDate: '',
    })
    setResidentError('')
    setResidentModal(true)
  }

  async function saveResident(e: React.FormEvent) {
    e.preventDefault()
    setResidentError('')
    setResidentSaving(true)
    try {
      const payload: any = { ...residentForm }
      if (!payload.email?.trim()) delete payload.email
      if (!payload.username?.trim()) delete payload.username
      if (!payload.password?.trim()) delete payload.password
      if (!payload.moveInDate?.trim()) delete payload.moveInDate
      await residentsApi.create(payload)
      setResidentModal(false)
      loadProperties() // refresh to show new owner name
    } catch (e: any) {
      setResidentError(e?.response?.data?.message ?? 'Failed to add resident')
    } finally {
      setResidentSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏘️ Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage blocks and individual properties</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/bulk-setup')}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition border border-gray-300"
          >
            🏗️ Bulk Setup
          </button>
          <button
            onClick={() => navigate(`/admin/property-resident-setup${filterBlock ? `?blockId=${filterBlock}` : ''}`)}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
          >
            👥 Add Residents
          </button>
          <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
            + Add Property
          </button>
        </div>
      </div>

      {/* Blocks panel */}
      <BlocksPanel
        blocks={blocks} open={blocksOpen} activeBlockId={filterBlock}
        onToggle={() => setBlocksOpen(v => !v)}
        onAddBlock={openAddBlock} onEditBlock={openEditBlock} onDeleteBlock={deleteBlock}
        onFilterBlock={id => { setFilterBlock(id); setSkip(0) }}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search property number…" value={search}
          onChange={e => { setSearch(e.target.value); setSkip(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select value={filterBlock} onChange={e => { setFilterBlock(e.target.value); setSkip(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="">All Blocks</option>
          {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setSkip(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="">All Types</option>
          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setSkip(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="">All Status</option>
          <option value="occupied">Occupied</option>
          <option value="vacant">Vacant</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Property #</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Block</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Floor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Area (sq ft)</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">Loading…</td></tr>
            ) : properties.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="p-12 text-center">
                  <p className="text-5xl mb-3">🏘️</p>
                  <p className="font-semibold text-gray-700">No properties found</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first property to get started</p>
                </div>
              </td></tr>
            ) : properties.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800">{p.flatNumber}</td>
                <td className="px-4 py-3 text-gray-600">
                  {inlineEditId === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <select value={inlineBlockId} onChange={e => setInlineBlockId(e.target.value)} autoFocus
                        className="border border-blue-400 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <option value="">No block</option>
                        {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <button onClick={() => saveInlineBlock(p.id)} disabled={inlineSaving} title="Save"
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                        {inlineSaving ? '…' : '✓'}
                      </button>
                      <button onClick={cancelInlineEdit} title="Cancel"
                        className="text-xs px-2 py-1 text-gray-500 border border-gray-300 rounded hover:bg-gray-50">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => startInlineEdit(p)} title="Click to change block"
                      className="group flex items-center gap-1 text-left hover:text-blue-600 transition">
                      <span>{p.blockName ?? '—'}</span>
                      <span className="text-gray-300 group-hover:text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                    {PROPERTY_TYPE_LABELS[p.type] ?? p.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.floor != null ? p.floor : <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-gray-600">{p.sqFt.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {p.ownerName ? (
                    <button
                      onClick={() => navigate(`/admin/residents?search=${encodeURIComponent(p.ownerName!)}`)}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      {p.ownerName}
                    </button>
                  ) : (
                    <button
                      onClick={() => openAddOwner(p)}
                      className="text-xs text-amber-600 hover:text-amber-800 hover:underline font-medium"
                    >
                      + Add Owner
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${p.status === 'occupied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.status === 'occupied' ? '🟢 Occupied' : '🟡 Vacant'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => deleteProp(p.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > limit && <Pagination skip={skip} limit={limit} total={total} onPageChange={setSkip} />}

      {/* Modals */}
      {modal && (
        <PropertyModal
          editProp={editProp} form={propForm} blocks={blocks} error={error} saving={saving}
          onChange={setPropForm} onSave={saveProp} onClose={() => setModal(false)}
        />
      )}
      {blockModal && (
        <BlockModal
          editBlock={editBlock} form={blockForm} saving={blockSaving}
          onChange={setBlockForm} onSave={saveBlock} onClose={() => setBlockModal(false)}
        />
      )}
      {residentModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Add Owner</h2>
              <button onClick={() => setResidentModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={saveResident} className="p-5 space-y-4">
              {residentError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{residentError}</div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                <input type="text" required value={residentForm.name}
                  onChange={e => setResidentForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Enter Full Name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                  <input type="tel" required value={residentForm.phone}
                    onChange={e => setResidentForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Enter Mobile Number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" value={residentForm.email}
                    onChange={e => setResidentForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="optional"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select value={residentForm.residentType}
                    onChange={e => setResidentForm(f => ({ ...f, residentType: e.target.value as 'owner' | 'tenant' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="owner">Owner</option>
                    <option value="tenant">Tenant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Move-in Date</label>
                  <input type="date" value={residentForm.moveInDate}
                    onChange={e => setResidentForm(f => ({ ...f, moveInDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setResidentModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={residentSaving}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {residentSaving ? 'Saving…' : 'Add Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}