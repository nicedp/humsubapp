import { Request, Response, NextFunction } from 'express';
import * as noteService from '../services/note.service';

export async function listNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const data = await noteService.getNotes(userId, req.user!.societyId);
    res.json(data);
  } catch (err) { next(err); }
}

export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const data = await noteService.createNote(req.body, userId, req.user!.societyId);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const data = await noteService.updateNote(req.params.id, req.body, userId);
    res.json(data);
  } catch (err) { next(err); }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const data = await noteService.deleteNote(req.params.id, userId);
    res.json(data);
  } catch (err) { next(err); }
}