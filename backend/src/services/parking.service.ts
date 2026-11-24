import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformParkingSlot, transformParkingSlots } from '../transformers/parking.transformer';
import { CreateParkingSlotDto, UpdateParkingSlotDto } from '../dtos/parking.dto';
import { PaginationParams } from '../helpers/pagination.helper';

export async function getAllParkingSlots(
  societyId: number,
  pagination: PaginationParams,
  filters: { isOccupied?: boolean; search?: string } = {}
) {
  const where: Record<string, unknown> = { societyId };

  if (filters.isOccupied !== undefined) {
    where['isOccupied'] = filters.isOccupied;
  }

  if (filters.search) {
    where['OR'] = [
      { slotNumber: { contains: filters.search, mode: 'insensitive' } },
      { vehicleNumber: { contains: filters.search, mode: 'insensitive' } },
      { flat: { flatNumber: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const [slots, total] = await Promise.all([
    prisma.parkingSlot.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      skip: pagination.skip,
      take: pagination.limit,
      include: { flat: true },
      orderBy: { slotNumber: 'asc' },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma.parkingSlot.count({ where: where as any }),
  ]);
  return { data: transformParkingSlots(slots), total };
}

export async function getParkingSlotById(societyId: number, id: string) {
  const slot = await prisma.parkingSlot.findFirst({
    where: { id, societyId },
    include: { flat: true },
  });
  if (!slot) throw createError('Parking slot not found', 404);
  return transformParkingSlot(slot);
}

export async function createParkingSlot(societyId: number, dto: CreateParkingSlotDto) {
  const existing = await prisma.parkingSlot.findUnique({
    where: { societyId_slotNumber: { societyId, slotNumber: dto.slotNumber } },
  });
  if (existing) throw createError(`Slot number ${dto.slotNumber} already exists`, 409);

  if (dto.flatId) {
    const flat = await prisma.flat.findFirst({ where: { id: dto.flatId, societyId } });
    if (!flat) throw createError('Flat not found', 404);
  }

  const slot = await prisma.parkingSlot.create({
    data: {
      societyId,
      slotNumber: dto.slotNumber,
      flatId: dto.flatId,
      vehicleNumber: dto.vehicleNumber,
      vehicleType: dto.vehicleType,
      isOccupied: !!(dto.flatId || dto.vehicleNumber),
    },
    include: { flat: true },
  });
  return transformParkingSlot(slot);
}

export async function updateParkingSlot(societyId: number, id: string, dto: UpdateParkingSlotDto) {
  const slot = await prisma.parkingSlot.findFirst({ where: { id, societyId } });
  if (!slot) throw createError('Parking slot not found', 404);

  if (dto.flatId) {
    const flat = await prisma.flat.findFirst({ where: { id: dto.flatId, societyId } });
    if (!flat) throw createError('Flat not found', 404);
  }

  const updated = await prisma.parkingSlot.update({
    where: { id },
    data: {
      ...(dto.flatId !== undefined && { flatId: dto.flatId }),
      ...(dto.vehicleNumber !== undefined && { vehicleNumber: dto.vehicleNumber }),
      ...(dto.vehicleType !== undefined && { vehicleType: dto.vehicleType }),
      ...(dto.isOccupied !== undefined && { isOccupied: dto.isOccupied }),
    },
    include: { flat: true },
  });
  return transformParkingSlot(updated);
}

export async function deleteParkingSlot(societyId: number, id: string) {
  const slot = await prisma.parkingSlot.findFirst({ where: { id, societyId } });
  if (!slot) throw createError('Parking slot not found', 404);
  await prisma.parkingSlot.delete({ where: { id } });
}