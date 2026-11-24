import { Resident, Flat } from '@prisma/client';

/**
 * Directory entry — strictly limited fields for resident visibility.
 * NEVER expose phone, email, residentType, moveInDate, moveOutDate or any PII.
 * Business rule: residents can only see name, flatNumber, floor, flatType.
 */
export interface DirectoryEntryResponse {
  name: string;
  flatNumber: string;
  floor: number | null;
  flatType: string;
}

type ResidentWithFlat = Resident & {
  flat: Flat;
};

export function transformDirectoryEntry(resident: ResidentWithFlat): DirectoryEntryResponse {
  return {
    name: resident.name,
    flatNumber: resident.flat.flatNumber,
    floor: resident.flat.floor,
    flatType: resident.flat.type,
  };
}

export function transformDirectory(residents: ResidentWithFlat[]): DirectoryEntryResponse[] {
  return residents.map(transformDirectoryEntry);
}