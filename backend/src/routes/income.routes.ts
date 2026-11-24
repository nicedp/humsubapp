import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createIncomeSchema, updateIncomeSchema } from '../dtos/income.dto';
import * as incomeController from '../controllers/income.controller';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('admin'));

router.get('/', incomeController.list);
// OWASP A03: Validate request body before reaching controller
router.post('/', validate(createIncomeSchema), incomeController.create);
router.get('/:id', incomeController.getById);
router.put('/:id', validate(updateIncomeSchema), incomeController.update);
router.delete('/:id', incomeController.remove);

export default router;