import { Resident, User, Flat } from '@prisma/client';

export interface ResidentResponse {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  flatId: string;
  flatNumber?: string;
  floor?: number | null;
  residentType: string;
  isActive: boolean;
  moveInDate: Date;
  moveOutDate: Date | null;
  numCars: number;
  numBikes: number;
  userId?: string;
  username?: string;
  role?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type ResidentWithRelations = Resident & {
  flat?: Flat;
  user?: User | null;
};

export function transformResident(resident: ResidentWithRelations): ResidentResponse {
  return {
    id: resident.id,
    name: resident.name,
    email: resident.email ?? null,
    phone: resident.phone,
    whatsapp: resident.whatsapp ?? null,
    flatId: resident.flatId,
    flatNumber: resident.flat?.flatNumber,
    floor: resident.flat?.floor,
    residentType: resident.residentType,
    isActive: resident.isActive,
    moveInDate: resident.moveInDate,
    moveOutDate: resident.moveOutDate,
    numCars: resident.numCars,
    numBikes: resident.numBikes,
    userId: resident.user?.id,
    username: resident.user?.username,
    role: resident.user?.role,
    createdAt: resident.createdAt,
    updatedAt: resident.updatedAt,
  };
}

export function transformResidents(residents: ResidentWithRelations[]): ResidentResponse[] {
  return residents.map(transformResident);
}