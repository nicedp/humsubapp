import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformInvoice, transformInvoices } from '../transformers/invoice.transformer';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceFilterDto } from '../dtos/invoice.dto';

// ── Invoice number generator: INV-YYYY-NNN ─────────────────────────────────
// Uses count-based approach: counts all invoices for this society+year,
// then increments. Wrapped in a retry loop in createInvoice() to handle
// rare race conditions (unique constraint violation → retry with next seq).
async function generateInvoiceNumber(year: number, societyId: number = 1, offset: number = 0): Promise<string> {
  const prefix = `INV-${year}-`;
  const count = await prisma.invoice.count({
    where: { societyId, invoiceNumber: { startsWith: prefix } },
  });
  const seq = count + 1 + offset;
  return `${prefix}${String(seq).padStart(3, '0')}`;
}

function calcAmounts(items: Array<{ quantity: number; unitPrice: number }>, taxRate: number) {
  const subtotal = items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
  return { subtotal: Math.round(subtotal * 100) / 100, taxAmount, totalAmount };
}

export async function getInvoices(filter: InvoiceFilterDto, societyId: number = 1) {
  const where: Record<string, unknown> = { societyId };
  if (filter.status) where.status = filter.status;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { items: true },
      skip: filter.skip,
      take: filter.limit,
      orderBy: { invoiceDate: 'desc' },
    }),
    prisma.invoice.count({ where }),
  ]);

  return { data: transformInvoices(invoices as any), total };
}

export async function getInvoiceById(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!invoice) throw createError('Invoice not found', 404);
  return transformInvoice(invoice as any);
}

export async function createInvoice(dto: CreateInvoiceDto, createdBy: string, societyId: number = 1) {
  const now = new Date();
  const year = dto.invoiceDate ? new Date(dto.invoiceDate).getFullYear() : now.getFullYear();

  const items = dto.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: Math.round(item.quantity * item.unitPrice * 100) / 100,
  }));

  const { subtotal, taxAmount, totalAmount } = calcAmounts(dto.items, dto.taxRate ?? 0);

  // Retry loop: if a unique constraint violation occurs (race condition),
  // increment offset and try with the next sequence number (max 5 retries).
  const MAX_RETRIES = 5;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const invoiceNumber = await generateInvoiceNumber(year, societyId, attempt);
    try {
      const invoice = await prisma.invoice.create({
        data: {
          societyId,
          invoiceNumber,
          status: (dto.status as any) ?? 'draft',
          fromName: dto.fromName,
          fromAddress: dto.fromAddress,
          fromPhone: dto.fromPhone,
          fromEmail: dto.fromEmail || null,
          toName: dto.toName,
          toAddress: dto.toAddress,
          toPhone: dto.toPhone,
          toEmail: dto.toEmail || null,
          invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : now,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          subtotal,
          taxRate: dto.taxRate ?? 0,
          taxAmount,
          totalAmount,
          notes: dto.notes,
          createdBy,
          items: { create: items },
        },
        include: { items: true },
      });
      return transformInvoice(invoice as any);
    } catch (err: any) {
      // P2002 = Prisma unique constraint violation
      if (err?.code === 'P2002' && attempt < MAX_RETRIES - 1) {
        continue; // retry with next offset
      }
      throw err;
    }
  }

  throw createError('Failed to generate a unique invoice number after multiple attempts', 500);
}

export async function updateInvoice(id: string, dto: UpdateInvoiceDto) {
  const existing = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!existing) throw createError('Invoice not found', 404);

  // Recalculate amounts if items or taxRate changed
  const itemsToUse = dto.items ?? (existing.items as any[]).map((i: any) => ({
    quantity: i.quantity,
    unitPrice: i.unitPrice,
  }));
  const taxRateToUse = dto.taxRate ?? existing.taxRate;
  const { subtotal, taxAmount, totalAmount } = calcAmounts(itemsToUse, taxRateToUse);

  // Update the invoice — delete + recreate items if provided
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...(dto.status !== undefined && { status: dto.status as any }),
      ...(dto.fromName !== undefined && { fromName: dto.fromName }),
      ...(dto.fromAddress !== undefined && { fromAddress: dto.fromAddress }),
      ...(dto.fromPhone !== undefined && { fromPhone: dto.fromPhone }),
      ...(dto.fromEmail !== undefined && { fromEmail: dto.fromEmail || null }),
      ...(dto.toName !== undefined && { toName: dto.toName }),
      ...(dto.toAddress !== undefined && { toAddress: dto.toAddress }),
      ...(dto.toPhone !== undefined && { toPhone: dto.toPhone }),
      ...(dto.toEmail !== undefined && { toEmail: dto.toEmail || null }),
      ...(dto.invoiceDate !== undefined && { invoiceDate: new Date(dto.invoiceDate) }),
      ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      subtotal,
      taxRate: taxRateToUse,
      taxAmount,
      totalAmount,
      ...(dto.items !== undefined && {
        items: {
          deleteMany: {},
          create: dto.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: Math.round(item.quantity * item.unitPrice * 100) / 100,
          })),
        },
      }),
    },
    include: { items: true },
  });

  return transformInvoice(invoice as any);
}

export async function deleteInvoice(id: string) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw createError('Invoice not found', 404);
  await prisma.invoice.delete({ where: { id } });
  return { deleted: true };
}