import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Storage Service — abstracts local disk vs AWS S3 file storage.
 *
 * Controlled by STORAGE_DRIVER env var:
 *   STORAGE_DRIVER=local  (default) — saves to UPLOAD_DIR, served via GET /api/v1/uploads/:filename
 *   STORAGE_DRIVER=s3               — streams to AWS S3; returns public S3 URL
 *
 * Zero code changes needed in feature code when switching drivers.
 */

const STORAGE_DRIVER = process.env.STORAGE_DRIVER ?? 'local';
const UPLOAD_DIR     = process.env.UPLOAD_DIR     ?? '/uploads';
const APP_BASE_URL   = process.env.APP_BASE_URL    ?? 'http://localhost:3000';

// ─── Path traversal guard ──────────────────────────────────────────────────────
const SAFE_FILENAME_RE = /^[a-zA-Z0-9_\-]+\.[a-z]{2,4}$/;

function safeFilename(ext: string): string {
  // UUID-based name guarantees no path traversal
  const id = randomUUID().replace(/-/g, '');
  const clean = ext.replace(/[^a-z0-9]/g, '').slice(0, 4);
  return `${id}.${clean || 'bin'}`;
}

// ─── Local driver ──────────────────────────────────────────────────────────────

async function uploadLocal(buffer: Buffer, ext: string): Promise<string> {
  const filename = safeFilename(ext);
  const dir = UPLOAD_DIR;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, buffer);

  // Return relative URL — served by upload.routes.ts
  return `${APP_BASE_URL}/api/v1/uploads/${filename}`;
}

async function deleteLocal(url: string): Promise<void> {
  try {
    const filename = url.split('/').pop();
    if (!filename || !SAFE_FILENAME_RE.test(filename)) return;
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch {
    // Swallow — file may already be gone
  }
}

// ─── S3 driver (stub — activated when STORAGE_DRIVER=s3) ──────────────────────

async function uploadS3(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  // Dynamic import so the package is only loaded when needed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const client = new S3Client({
    region: process.env.AWS_REGION ?? 'ap-south-1',
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID     ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
  });

  const bucket = process.env.AWS_S3_BUCKET ?? 'society-uploads';
  const key    = `uploads/${filename}`;

  await client.send(new PutObjectCommand({
    Bucket:      bucket,
    Key:         key,
    Body:        buffer,
    ContentType: mimeType,
  }));

  return `https://${bucket}.s3.${process.env.AWS_REGION ?? 'ap-south-1'}.amazonaws.com/${key}`;
}

async function deleteS3(url: string): Promise<void> {
  try {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    const client = new S3Client({
      region: process.env.AWS_REGION ?? 'ap-south-1',
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID     ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });

    const bucket = process.env.AWS_S3_BUCKET ?? 'society-uploads';
    const key    = url.split(`${bucket}.s3`)[1]?.split('.amazonaws.com/')[1];
    if (!key) return;

    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch {
    // Swallow
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer and return the public URL.
 * @param buffer   - file contents
 * @param ext      - file extension without dot, e.g. "jpg"
 * @param mimeType - MIME type, e.g. "image/jpeg"
 */
export async function uploadFile(buffer: Buffer, ext: string, mimeType: string): Promise<string> {
  if (STORAGE_DRIVER === 's3') {
    const filename = safeFilename(ext);
    return uploadS3(buffer, filename, mimeType);
  }
  return uploadLocal(buffer, ext);
}

/**
 * Delete a previously uploaded file by its public URL.
 */
export async function deleteFile(url: string): Promise<void> {
  if (STORAGE_DRIVER === 's3') {
    return deleteS3(url);
  }
  return deleteLocal(url);
}

export { SAFE_FILENAME_RE };