import { Request, Response, NextFunction } from 'express';
import * as assetService from '../services/asset.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';

export async function getAllAssetsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const pagination = getPagination(req);
    const { data, total } = await assetService.getAllAssets(societyId, type, status, search, pagination);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getAssetByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.getAssetById(req.user!.societyId, req.params.id);
    res.json(asset);
  } catch (err) {
    next(err);
  }
}

export async function createAssetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.createAsset(req.user!.societyId, req.body);
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
}

export async function updateAssetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const asset = await assetService.updateAsset(req.user!.societyId, req.params.id, req.body);
    res.json(asset);
  } catch (err) {
    next(err);
  }
}

export async function deleteAssetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await assetService.deleteAsset(req.user!.societyId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}