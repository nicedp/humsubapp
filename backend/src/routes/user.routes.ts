import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../dtos/user.dto';
import * as userController from '../controllers/user.controller';

const router = Router();

router.use(authMiddleware, requireRoles('admin'));

router.get('/', userController.getAllUsersHandler);
router.get('/:id', userController.getUserByIdHandler);
router.post('/', validate(createUserSchema), userController.createUserHandler);
router.patch('/:id', validate(updateUserSchema), userController.updateUserHandler);
router.delete('/:id', userController.deleteUserHandler);

export default router;