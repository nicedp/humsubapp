import { Request, Response, NextFunction } from 'express';
import * as invoiceService from '../services/invoice.service';
import { createInvoiceSchema, updateInvoiceSchema, invoiceFilterSchema } from '../dtos/invoice.dto';
import { paginatedResponse } from '../helpers/pagination.helper';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const filter = invoiceFilterSchema.parse(req.query);
    const { data, total } = await invoiceService.getInvoices(filter, req.user!.societyId);
    res.json(paginatedResponse(data, total, { skip: filter.skip, limit: filter.limit }));
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    res.json(invoice);
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createInvoiceSchema.parse(req.body);
    const invoice = await invoiceService.createInvoice(dto, req.user!.userId, req.user!.societyId);
    res.status(201).json(invoice);
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateInvoiceSchema.parse(req.body);
    const invoice = await invoiceService.updateInvoice(req.params.id, dto);
    res.json(invoice);
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await invoiceService.deleteInvoice(req.params.id);
    res.json(result);
  } catch (err) { next(err) }
}