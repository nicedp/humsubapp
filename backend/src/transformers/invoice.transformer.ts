import { Invoice, InvoiceItem } from '@prisma/client';

type InvoiceWithItems = Invoice & { items: InvoiceItem[] };

export function transformInvoiceItem(item: InvoiceItem) {
  return {
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: item.amount,
  };
}

export function transformInvoice(inv: InvoiceWithItems) {
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    status: inv.status,
    fromName: inv.fromName,
    fromAddress: inv.fromAddress ?? null,
    fromPhone: inv.fromPhone ?? null,
    fromEmail: inv.fromEmail ?? null,
    toName: inv.toName,
    toAddress: inv.toAddress ?? null,
    toPhone: inv.toPhone ?? null,
    toEmail: inv.toEmail ?? null,
    invoiceDate: inv.invoiceDate.toISOString(),
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    subtotal: inv.subtotal,
    taxRate: inv.taxRate,
    taxAmount: inv.taxAmount,
    totalAmount: inv.totalAmount,
    notes: inv.notes ?? null,
    createdBy: inv.createdBy ?? null,
    items: inv.items.map(transformInvoiceItem),
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  };
}

export function transformInvoices(invoices: InvoiceWithItems[]) {
  return invoices.map(transformInvoice);
}