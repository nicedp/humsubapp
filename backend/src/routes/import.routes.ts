import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import * as importController from '../controllers/import.controller';

const router = Router();

// Store file in memory — we parse the buffer directly, no disk I/O
// OWASP A04: Only allow text/csv MIME type — removed originalname bypass which could allow
// malicious files renamed as .csv to pass through
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'application/csv'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed. Received: ' + file.mimetype));
    }
  },
});

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/import/residents:
 *   post:
 *     summary: Import residents from CSV (admin only)
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import result with per-row status
 *       400:
 *         description: Invalid file or CSV format error
 *       403:
 *         description: Forbidden
 */
router.post(
  '/residents',
  requireRoles('admin'),
  upload.single('file'),
  importController.importResidentsHandler,
);

export default router;