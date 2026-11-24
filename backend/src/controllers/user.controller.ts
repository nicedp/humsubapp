import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';

export async function getAllUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = getPagination(req);
    const { search, role, isActive } = req.query as Record<string, string | undefined>;

    const filters: { search?: string; role?: string; isActive?: boolean } = {};
    if (search) filters.search = search;
    if (role) filters.role = role;
    if (isActive === 'true') filters.isActive = true;
    else if (isActive === 'false') filters.isActive = false;

    const { data, total } = await userService.getAllUsers(req.user!.societyId, pagination, filters);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getUserByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.user!.societyId, req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function createUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.createUser(req.user!.societyId, req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUser(req.user!.societyId, req.params.id, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.deleteUser(req.user!.societyId, req.params.id, req.user!.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}