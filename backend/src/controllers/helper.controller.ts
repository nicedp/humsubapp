import { Request, Response, NextFunction } from 'express';
import * as helperService from '../services/helper.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';
import { createError } from '../middleware/error.middleware';
import { createHelperSchema, updateHelperSchema, getHelpersQuerySchema, bulkCreateHelpersSchema } from '../dtos/helper.dto';

export async function getHelpersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = getHelpersQuerySchema.safeParse(req.query);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);
    const { data, total } = await helperService.getHelpers(parsed.data, req.user!.societyId);
    res.json(paginatedResponse(data, total, { skip: parsed.data.skip, limit: parsed.data.limit }));
  } catch (err) {
    next(err);
  }
}

export async function getHelperByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const helper = await helperService.getHelperById(req.params.id);
    res.json(helper);
  } catch (err) {
    next(err);
  }
}

export async function createHelperHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createHelperSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);
    const addedBy = req.user!.userId;
    const helper  = await helperService.createHelper(parsed.data, addedBy, req.user!.societyId);
    res.status(201).json(helper);
  } catch (err) {
    next(err);
  }
}

export async function updateHelperHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateHelperSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);
    const helper = await helperService.updateHelper(req.params.id, parsed.data);
    res.json(helper);
  } catch (err) {
    next(err);
  }
}

export async function deleteHelperHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await helperService.deleteHelper(req.params.id);
    res.json({ message: 'Helper deleted' });
  } catch (err) {
    next(err);
  }
}

export async function bulkCreateHelpersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = bulkCreateHelpersSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);
    const addedBy = req.user!.userId;
    const result = await helperService.bulkCreateHelpers(parsed.data, addedBy, req.user!.societyId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function uploadHelperPhotoHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // multer stores the file in req.file
    const file = (req as any).file as { buffer: Buffer; mimetype: string } | undefined;
    if (!file) throw createError('No file uploaded', 400);

    // Enforce ≤2MB
    if (file.buffer.length > 2 * 1024 * 1024) {
      throw createError('File size must be ≤ 2 MB', 400);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw createError('Only JPEG, PNG, WebP and GIF images are allowed', 400);
    }

    const helper = await helperService.uploadHelperPhoto(req.params.id, file.buffer, file.mimetype);
    res.json(helper);
  } catch (err) {
    next(err);
  }
}