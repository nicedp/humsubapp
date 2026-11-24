import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { SAFE_FILENAME_RE } from '../services/storage.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// OWASP A01: All upload-served files require authentication
router.use(authMiddleware);

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? '/uploads';

// MIME type map for common image/document types
const MIME_TYPES: Record<string, string> = {
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  gif:  'image/gif',
  webp: 'image/webp',
  pdf:  'application/pdf',
  svg:  'image/svg+xml',
};

/**
 * GET /api/v1/uploads/:filename
 * Serves uploaded files from local disk.
 * Only active when STORAGE_DRIVER=local (S3 files are served directly from S3).
 * Validates filename with strict regex to prevent path traversal attacks.
 */
router.get('/:filename', (req: Request, res: Response) => {
  // Only serve when local storage driver is active
  if ((process.env.STORAGE_DRIVER ?? 'local') !== 'local') {
    return res.status(404).json({ message: 'File not found' });
  }

  const { filename } = req.params;

  // Path traversal guard — only allow safe filenames
  if (!SAFE_FILENAME_RE.test(filename)) {
    return res.status(400).json({ message: 'Invalid filename' });
  }

  const filepath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = MIME_TYPES[ext] ?? 'application/octet-stream';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  return res.sendFile(filepath);
});

export default router;