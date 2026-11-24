import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createVendorSchema,
  updateVendorSchema,
  createContractSchema,
  updateContractSchema,
  createServiceLogSchema,
} from '../dtos/vendor.dto';
import * as vendorController from '../controllers/vendor.controller';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('admin'));

// Vendors CRUD
router.get('/', vendorController.listVendors);
router.post('/', validate(createVendorSchema), vendorController.createVendor);
router.get('/:id', vendorController.getVendor);
router.patch('/:id', validate(updateVendorSchema), vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

export default router;