import { Asset } from '@prisma/client';

export interface AssetResponse {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string | null;
  lastServiceDate: Date | null;
  nextServiceDue: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function transformAsset(asset: Asset): AssetResponse {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    status: asset.status,
    location: asset.location ?? null,
    lastServiceDate: asset.lastServiceDate ?? null,
    nextServiceDue: asset.nextServiceDue ?? null,
    notes: asset.notes ?? null,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

export function transformAssets(assets: Asset[]): AssetResponse[] {
  return assets.map(transformAsset);
}