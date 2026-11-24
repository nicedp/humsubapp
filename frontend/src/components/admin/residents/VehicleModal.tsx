import React from 'react'
import { Resident, Vehicle, VehicleType } from '../../../types'

export type VehicleForm = {
  vehicleType: VehicleType
  vehicleNumber: string
  make: string
  model: string
  color: string
}

const VEHICLE_TYPE_COLORS: Record<string, string> = {
  car: 'bg-blue-100 text-blue-700',
  bike: 'bg-green-100 text-green-700',
  scooter: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-600',
}

interface Props {
  resident: Resident
  vehicles: Vehicle[]
  vehiclesLoading: boolean
  editVehicle: Vehicle | null
  vehicleForm: VehicleForm
  vehicleError: string
  showAddVehicle: boolean
  addPending: boolean
  updatePending: boolean
  onVehicleFormChange: (f: VehicleForm) => void
  onSubmit: (e: React.FormEvent) => void
  onEditVehicle: (v: Vehicle) => void
  onDeleteVehicle: (id: string, number: string) => void
  onShowAdd: () => void
  onCancelForm: () => void
  onClose: () => void
}

export default function VehicleModal({
  resident, vehicles, vehiclesLoading, editVehicle, vehicleForm, vehicleError,
  showAddVehicle, addPending, updatePending,
  onVehicleFormChange, onSubmit, onEditVehicle, onDeleteVehicle, onShowAdd, onCancelForm, onClose,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Vehicles — {resident.name}</h2>
            <p className="text-sm text-gray-500">{resident.flatNumber ?? resident.flatId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Vehicle list */}
        {vehiclesLoading ? (
          <div className="py-6 text-center text-gray-400 text-sm">Loading vehicles...</div>
        ) : vehicles.length === 0 && !showAddVehicle ? (
          <div className="py-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🚗</div>
            <p className="text-sm">No vehicles registered yet.</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {vehicles.map(v => (
              <div key={v.id} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${v.isActive ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${VEHICLE_TYPE_COLORS[v.vehicleType] ?? 'bg-gray-100 text-gray-600'}`}>
                    {v.vehicleType}
                  </span>
                  <span className="font-mono font-semibold text-gray-800 tracking-wide">{v.vehicleNumber}</span>
                  {(v.make || v.model) && (
                    <span className="text-sm text-gray-500">{[v.make, v.model].filter(Boolean).join(' ')}</span>
                  )}
                  {v.color && <span className="text-xs text-gray-400">{v.color}</span>}
                  {!v.isActive && <span className="text-xs text-gray-400 italic">Inactive</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onEditVehicle(v)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button
                    onClick={() => onDeleteVehicle(v.id, v.vehicleNumber)}
                    className="text-red-500 hover:underline text-xs"
                  >Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit inline form */}
        {showAddVehicle ? (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{editVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
            {vehicleError && <div className="bg-red-50 text-red-700 text-xs px-3 py-2 rounded mb-3">{vehicleError}</div>}
            <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select required value={vehicleForm.vehicleType}
                  onChange={e => onVehicleFormChange({ ...vehicleForm, vehicleType: e.target.value as VehicleType })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle Number *</label>
                <input required value={vehicleForm.vehicleNumber}
                  onChange={e => onVehicleFormChange({ ...vehicleForm, vehicleNumber: e.target.value.toUpperCase() })}
                  placeholder="MH01AB1234"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Make</label>
                <input value={vehicleForm.make}
                  onChange={e => onVehicleFormChange({ ...vehicleForm, make: e.target.value })}
                  placeholder="e.g. Honda"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
                <input value={vehicleForm.model}
                  onChange={e => onVehicleFormChange({ ...vehicleForm, model: e.target.value })}
                  placeholder="e.g. City"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                <input value={vehicleForm.color}
                  onChange={e => onVehicleFormChange({ ...vehicleForm, color: e.target.value })}
                  placeholder="e.g. White"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2 flex gap-2 justify-end pt-1">
                <button type="button" onClick={onCancelForm}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-white">Cancel</button>
                <button type="submit" disabled={addPending || updatePending}
                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-blue-400">
                  {addPending || updatePending ? 'Saving...' : editVehicle ? 'Update' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={onShowAdd}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + Add Vehicle
          </button>
        )}
      </div>
    </div>
  )
}