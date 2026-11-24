import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createContractSchema,
  updateContractSchema,
  createServiceLogSchema,
} from '../dtos/vendor.dto';
import * as vendorController from '../controllers/vendor.controller';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('admin'));

// Contracts CRUD
router.get('/', vendorController.listContracts);
router.post('/', validate(createContractSchema), vendorController.createContract);
router.get('/:id', vendorController.getContract);
router.patch('/:id', validate(updateContractSchema), vendorController.updateContract);
router.delete('/:id', vendorController.deleteContract);

// Service Logs (nested under contracts)
router.post('/:id/logs', validate(createServiceLogSchema), vendorController.addServiceLog);
router.delete('/:id/logs/:lid', vendorController.deleteServiceLog);

export default router;