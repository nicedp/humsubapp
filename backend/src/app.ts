import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import swaggerUi from 'swagger-ui-express';

import { errorMiddleware } from './middleware/error.middleware';
import { swaggerSpec } from './config/swagger';
import { globalApiRateLimiter } from './middleware/rate-limit.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import flatRoutes from './routes/flat.routes';
import residentRoutes from './routes/resident.routes';
import billingRoutes from './routes/billing.routes';
import settingsRoutes from './routes/settings.routes';
import visitorRoutes from './routes/visitor.routes';
import assetRoutes from './routes/asset.routes';
import parkingRoutes from './routes/parking.routes';
import noticeRoutes from './routes/notice.routes';
import complaintRoutes from './routes/complaint.routes';
import staffRoutes from './routes/staff.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import directoryRoutes from './routes/directory.routes';
import importRoutes from './routes/import.routes';
import expenseRoutes from './routes/expense.routes';
import financeRoutes from './routes/finance.routes';
import incomeRoutes from './routes/income.routes';
import invoiceRoutes from './routes/invoice.routes';
import eventRoutes from './routes/event.routes';
import vendorRoutes from './routes/vendor.routes';
import contractRoutes from './routes/contract.routes';
import noteRoutes from './routes/note.routes';
import blockRoutes from './routes/block.routes';
import helperRoutes from './routes/helper.routes';
import uploadRoutes from './routes/upload.routes';
import committeeRoutes from './routes/committee.routes';
import onboardingRoutes from './routes/onboarding.routes';
import aclRoutes from './routes/acl.routes';
import alertRoutes from './routes/alert.routes';

const app: Application = express();

// ─── Global Middleware ─────────────────────────────────────────────────────
app.use(helmet());

// MED-2: CORS restricted to configured origins
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS ?? process.env.CORS_ORIGIN ?? 'http://localhost:5173';
const allowedOrigins = allowedOriginsEnv.split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, Postman, mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
// OWASP A03: Limit request body size to prevent memory exhaustion attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// OWASP A07: Global rate limiter — backstop for all API routes
app.use('/api', globalApiRateLimiter);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Swagger UI (dev/test only — OWASP A05) ────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Society Management Portal API',
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  // ─── Swagger JSON spec ───────────────────────────────────────────────────
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/flats', flatRoutes);
app.use('/api/v1/residents', residentRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/visitors', visitorRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/parking', parkingRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/directory', directoryRoutes);
app.use('/api/v1/import', importRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/income', incomeRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/vendors/contracts', contractRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/blocks', blockRoutes);
app.use('/api/v1/helpers', helperRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/committees', committeeRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/acl', aclRoutes);
app.use('/api/v1/alerts', alertRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});


// ─── Global Error Handler ─────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;