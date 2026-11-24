import { z } from 'zod';

const invoiceItemSchema = z.object({
  id: z.string().optional(), // provided when updating existing item
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
});

export const createInvoiceSchema = z.object({
  // From party
  fromName: z.string().min(1).max(200),
  fromAddress: z.string().max(500).optional(),
  fromPhone: z.string().max(20).optional(),
  fromEmail: z.string().email().optional().or(z.literal('')),
  // To party
  toName: z.string().min(1).max(200),
  toAddress: z.string().max(500).optional(),
  toPhone: z.string().max(20).optional(),
  toEmail: z.string().email().optional().or(z.literal('')),
  // Dates
  invoiceDate: z.string().optional(),
  dueDate: z.string().optional(),
  // Items
  items: z.array(invoiceItemSchema).min(1),
  // Tax
  taxRate: z.number().min(0).max(100).default(0),
  // Notes
  notes: z.string().max(2000).optional(),
  // Status
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']).optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const invoiceFilterSchema = z.object({
  status: z.string().optional(),
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateInvoiceDto = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceSchema>;
export type InvoiceFilterDto = z.infer<typeof invoiceFilterSchema>;
export type InvoiceItemDto = z.infer<typeof invoiceItemSchema>;