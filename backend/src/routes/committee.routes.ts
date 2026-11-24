import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import * as committeeController from '../controllers/committee.controller';
import {
  createCommitteeSchema,
  updateCommitteeSchema,
  addMemberSchema,
  updateMemberSchema,
  addAchievementSchema,
} from '../dtos/committee.dto';

const router = Router();

router.use(authMiddleware);

// ─── Committees ───────────────────────────────────────────────────────────────

/** GET /api/v1/committees — all authenticated roles */
router.get('/', committeeController.listCommitteesHandler);

/** GET /api/v1/committees/:id — all authenticated roles */
router.get('/:id', committeeController.getCommitteeHandler);

/** POST /api/v1/committees — admin only */
router.post(
  '/',
  requireRoles('admin'),
  validate(createCommitteeSchema),
  committeeController.createCommitteeHandler
);

/** PATCH /api/v1/committees/:id — admin only */
router.patch(
  '/:id',
  requireRoles('admin'),
  validate(updateCommitteeSchema),
  committeeController.updateCommitteeHandler
);

/** DELETE /api/v1/committees/:id — admin only */
router.delete('/:id', requireRoles('admin'), committeeController.deleteCommitteeHandler);

/** POST /api/v1/committees/:id/activate — admin only */
router.post('/:id/activate', requireRoles('admin'), committeeController.activateCommitteeHandler);

// ─── Members ──────────────────────────────────────────────────────────────────

/** POST /api/v1/committees/:id/members — admin only */
router.post(
  '/:id/members',
  requireRoles('admin'),
  validate(addMemberSchema),
  committeeController.addMemberHandler
);

/** PATCH /api/v1/committees/:id/members/:memberId — admin only */
router.patch(
  '/:id/members/:memberId',
  requireRoles('admin'),
  validate(updateMemberSchema),
  committeeController.updateMemberHandler
);

/** DELETE /api/v1/committees/:id/members/:memberId — admin only */
router.delete(
  '/:id/members/:memberId',
  requireRoles('admin'),
  committeeController.removeMemberHandler
);

// ─── Achievements ─────────────────────────────────────────────────────────────

/** POST /api/v1/committees/:id/achievements — admin only */
router.post(
  '/:id/achievements',
  requireRoles('admin'),
  validate(addAchievementSchema),
  committeeController.addAchievementHandler
);

/** DELETE /api/v1/committees/:id/achievements/:achievementId — admin only */
router.delete(
  '/:id/achievements/:achievementId',
  requireRoles('admin'),
  committeeController.deleteAchievementHandler
);

export default router;