import { ParkingSlot, Flat } from '@prisma/client';

export interface ParkingSlotResponse {
  id: string;
  slotNumber: string;
  flatId: string | null;
  flatNumber?: string;
  isOccupied: boolean;
  vehicleNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type ParkingSlotWithRelations = ParkingSlot & {
  flat?: Flat | null;
};

export function transformParkingSlot(slot: ParkingSlotWithRelations): ParkingSlotResponse {
  return {
    id: slot.id,
    slotNumber: slot.slotNumber,
    flatId: slot.flatId,
    flatNumber: slot.flat?.flatNumber,
    isOccupied: slot.isOccupied,
    vehicleNumber: slot.vehicleNumber,
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
  };
}

export function transformParkingSlots(slots: ParkingSlotWithRelations[]): ParkingSlotResponse[] {
  return slots.map(transformParkingSlot);
}