import { z } from 'zod';

const VISITOR_TYPES = [
  'guest', 'delivery', 'milkman', 'service',
  'plumber', 'electrician', 'dth', 'broadband', 'solar', 'gas',
  'cab', 'courier', 'other',
] as const;

export const logVisitorEntrySchema = z.object({
  flatId:       z.string().uuid('Valid flat ID is required'),
  visitorName:  z.string().min(1, 'Visitor name is required'),
  phone:        z.string().optional(),
  vehicleNumber: z.string().optional(),
  visitorType:  z.enum(VISITOR_TYPES, { errorMap: () => ({ message: 'Invalid visitor type' }) }),
  purpose:      z.string().optional(), // optional notes / additional info
});

export const logVisitorExitSchema = z.object({
  exitTime: z.coerce.date().optional(),
});

export const getVisitorsQuerySchema = z.object({
  flatId:      z.string().uuid().optional(),
  search:      z.string().optional(),
  visitorType: z.enum(VISITOR_TYPES).optional(),
  dateFrom:    z.coerce.date().optional(),
  dateTo:      z.coerce.date().optional(),
  hasExit:     z.enum(['true', 'false']).optional(),
  skip:        z.coerce.number().int().min(0).default(0),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
});

export type LogVisitorEntryDto  = z.infer<typeof logVisitorEntrySchema>;
export type LogVisitorExitDto   = z.infer<typeof logVisitorExitSchema>;
export type GetVisitorsQueryDto = z.infer<typeof getVisitorsQuerySchema>;
export type VisitorTypeValue    = typeof VISITOR_TYPES[number];