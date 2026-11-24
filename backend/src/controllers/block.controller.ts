import { Request, Response, NextFunction } from 'express';
import * as blockService from '../services/block.service';
import { transformBlock, transformBlocks } from '../transformers/block.transformer';

export async function listBlocks(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const blocks = await blockService.getAllBlocks(societyId);
    res.json(transformBlocks(blocks));
  } catch (err) {
    next(err);
  }
}

export async function getBlock(req: Request, res: Response, next: NextFunction) {
  try {
    const block = await blockService.getBlockById(req.params.id, req.user!.societyId);
    res.json(transformBlock(block));
  } catch (err) {
    next(err);
  }
}

export async function createBlock(req: Request, res: Response, next: NextFunction) {
  try {
    const block = await blockService.createBlock(req.user!.societyId, req.body);
    res.status(201).json(transformBlock(block));
  } catch (err) {
    next(err);
  }
}

export async function updateBlock(req: Request, res: Response, next: NextFunction) {
  try {
    const block = await blockService.updateBlock(req.params.id, req.user!.societyId, req.body);
    res.json(transformBlock(block));
  } catch (err) {
    next(err);
  }
}

export async function deleteBlock(req: Request, res: Response, next: NextFunction) {
  try {
    await blockService.deleteBlock(req.params.id, req.user!.societyId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}