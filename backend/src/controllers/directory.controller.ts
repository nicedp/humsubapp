import { Request, Response, NextFunction } from 'express';
import * as directoryService from '../services/directory.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';

export async function getDirectoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = getPagination(req);
    const { data, total } = await directoryService.getDirectory(pagination);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}