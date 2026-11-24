import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createNoteSchema, updateNoteSchema } from '../dtos/note.dto';
import * as noteController from '../controllers/note.controller';

const router = Router();

// All authenticated roles can use notes
router.use(authMiddleware);

router.get('/', noteController.listNotes);
router.post('/', validate(createNoteSchema), noteController.createNote);
router.patch('/:id', validate(updateNoteSchema), noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

export default router;