import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import * as helperController from '../controllers/helper.controller';

const router = Router();

// multer: memory storage, 2MB file size limit, image MIME type validation
// OWASP A04: Enforce allowed image MIME types — prevents non-image file uploads
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, png, webp, gif). Received: ' + file.mimetype));
    }
  },
});

router.use(authMiddleware);

/**
 * GET /api/v1/helpers
 * List helpers — all authenticated roles
 * Query: category, search, isActive, skip, limit
 */
router.get('/', helperController.getHelpersHandler);

/**
 * GET /api/v1/helpers/:id
 * Get helper by ID — all authenticated roles
 */
router.get('/:id', helperController.getHelperByIdHandler);

/**
 * POST /api/v1/helpers/bulk
 * Bulk create helpers — admin only (max 100)
 */
router.post('/bulk', requireRoles('admin'), helperController.bulkCreateHelpersHandler);

/**
 * POST /api/v1/helpers
 * Create helper — admin only
 */
router.post('/', requireRoles('admin'), helperController.createHelperHandler);

/**
 * PATCH /api/v1/helpers/:id
 * Update helper — admin only
 */
router.patch('/:id', requireRoles('admin'), helperController.updateHelperHandler);

/**
 * DELETE /api/v1/helpers/:id
 * Delete helper — admin only
 */
router.delete('/:id', requireRoles('admin'), helperController.deleteHelperHandler);

/**
 * POST /api/v1/helpers/:id/photo
 * Upload / replace helper photo — admin only
 * Accepts: image/jpeg, image/png, image/webp, image/gif — max 2MB
 */
router.post(
  '/:id/photo',
  requireRoles('admin'),
  upload.single('photo'),
  helperController.uploadHelperPhotoHandler,
);

export default router;