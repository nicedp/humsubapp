import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createEventSchema,
  updateEventSchema,
  createContributionSchema,
  bulkContributionSchema,
  importContributionSchema,
  createEventExpenseSchema,
  addTeamMemberSchema,
} from '../dtos/event.dto';
import * as eventController from '../controllers/event.controller';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('admin'));

// Events CRUD
router.get('/', eventController.listEvents);
router.post('/', validate(createEventSchema), eventController.createEvent);
router.get('/:id', eventController.getEvent);
router.patch('/:id', validate(updateEventSchema), eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

// Contributions — bulk/import BEFORE /:cid param route
router.post('/:id/contributions/bulk', validate(bulkContributionSchema), eventController.bulkAddContributions);
router.post('/:id/contributions/import', validate(importContributionSchema), eventController.importContributions);
router.post('/:id/contributions', validate(createContributionSchema), eventController.addContribution);
router.delete('/:id/contributions/:cid', eventController.deleteContribution);

// Event Expenses
router.post('/:id/expenses', validate(createEventExpenseSchema), eventController.addEventExpense);
router.delete('/:id/expenses/:eid', eventController.deleteEventExpense);

// Team Members
router.post('/:id/team', validate(addTeamMemberSchema), eventController.addTeamMember);
router.delete('/:id/team/:mid', eventController.deleteTeamMember);

export default router;