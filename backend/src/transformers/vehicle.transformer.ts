import { Vehicle, Resident } from '@prisma/client';

export interface VehicleResponse {
  id: string;
  residentId: string;
  residentName?: string;
  flatId: string;
  vehicleType: string;
  vehicleNumber: string;
  make: string | null;
  model: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type VehicleWithRelations = Vehicle & {
  resident?: Resident | null;
};

export function transformVehicle(vehicle: VehicleWithRelations): VehicleResponse {
  return {
    id: vehicle.id,
    residentId: vehicle.residentId,
    residentName: vehicle.resident?.name,
    flatId: vehicle.flatId,
    vehicleType: vehicle.vehicleType,
    vehicleNumber: vehicle.vehicleNumber,
    make: vehicle.make,
    model: vehicle.model,
    color: vehicle.color,
    isActive: vehicle.isActive,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,
  };
}

export function transformVehicles(vehicles: VehicleWithRelations[]): VehicleResponse[] {
  return vehicles.map(transformVehicle);
}