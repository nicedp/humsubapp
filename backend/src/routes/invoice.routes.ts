import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createInvoiceSchema, updateInvoiceSchema } from '../dtos/invoice.dto';
import * as invoiceController from '../controllers/invoice.controller';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('admin'));

router.get('/', invoiceController.list);
// OWASP A03: Validate request body before reaching controller
router.post('/', validate(createInvoiceSchema), invoiceController.create);
router.get('/:id', invoiceController.getById);
router.put('/:id', validate(updateInvoiceSchema), invoiceController.update);
router.delete('/:id', invoiceController.remove);

export default router;