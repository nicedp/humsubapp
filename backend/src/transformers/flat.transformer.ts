import { Flat } from '@prisma/client';

interface OwnerSlim {
  id: string;
  name: string;
  residentType: string;
  isActive: boolean;
}

type FlatWithBlock = Flat & {
  block?: { name: string } | null;
  residents?: OwnerSlim[];
};

export interface FlatResponse {
  id: string;
  societyId: number;
  blockId: string | null;
  blockName: string | null;
  flatNumber: string;
  floor: number | null;
  type: string;
  sqFt: number;
  status: string;
  ownerId: string | null;
  ownerName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function transformFlat(flat: FlatWithBlock): FlatResponse {
  // Pick the first active owner if residents are included in the query
  const activeOwner = flat.residents?.find(
    (r) => r.residentType === 'owner' && r.isActive
  ) ?? null;

  return {
    id: flat.id,
    societyId: flat.societyId,
    blockId: flat.blockId ?? null,
    blockName: flat.block?.name ?? null,
    flatNumber: flat.flatNumber,
    floor: flat.floor ?? null,
    type: flat.type,
    sqFt: flat.sqFt,
    status: flat.status,
    ownerId: activeOwner?.id ?? null,
    ownerName: activeOwner?.name ?? null,
    createdAt: flat.createdAt,
    updatedAt: flat.updatedAt,
  };
}

export function transformFlats(flats: FlatWithBlock[]): FlatResponse[] {
  return flats.map(transformFlat);
}