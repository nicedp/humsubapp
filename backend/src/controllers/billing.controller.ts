import { Request, Response, NextFunction } from 'express';
import * as billingService from '../services/billing.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';
import { billFilterSchema, billingSummaryQuerySchema } from '../dtos/billing.dto';

export async function generateBillsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await billingService.generateMonthlyBills(req.body, req.user!.societyId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getBillsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = getPagination(req);
    const filter = billFilterSchema.parse(req.query);
    const { data, total } = await billingService.getBills(filter, pagination, req.user!.societyId);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getBillByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const bill = await billingService.getBillById(req.params.id, req.user!.societyId);
    res.json(bill);
  } catch (err) {
    next(err);
  }
}

export async function getMyBillsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const residentId = req.user!.residentId;
    if (!residentId) {
      res.status(403).json({ message: 'Only residents can access their bills' });
      return;
    }
    const pagination = getPagination(req);
    const { data, total } = await billingService.getMyBills(residentId, pagination, req.user!.societyId);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function recordPaymentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const recordedBy = req.user!.userId;
    const bill = await billingService.recordPayment(req.params.id, req.body, recordedBy, req.user!.societyId);
    res.json(bill);
  } catch (err) {
    next(err);
  }
}

export async function updateOverdueBillsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await billingService.updateOverdueBills();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createSingleBillHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const bill = await billingService.createSingleBill(req.body, req.user!.societyId);
    res.status(201).json(bill);
  } catch (err) {
    next(err);
  }
}

export async function createBulkSingleBillsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await billingService.createBulkSingleBills(req.body, req.user!.societyId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateBillHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const bill = await billingService.updateBill(req.params.id, req.body, req.user!.societyId);
    res.json(bill);
  } catch (err) {
    next(err);
  }
}

export async function deleteBillHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await billingService.deleteBill(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getBillingSummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { month, year } = billingSummaryQuerySchema.parse(req.query);
    const summary = await billingService.getBillingSummary(month, year, req.user!.societyId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

export async function getFloorStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { month, year } = billingSummaryQuerySchema.parse(req.query);
    const data = await billingService.getFloorStatus(month, year, req.user!.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getDefaultersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await billingService.getDefaulters(req.user!.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getMonthlyTrendHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
    const data = await billingService.getMonthlyTrend(Math.min(Math.max(months, 1), 24), req.user!.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function quickPayHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const recordedBy = req.user!.userId;
    const result = await billingService.quickPay(req.body, recordedBy, req.user!.societyId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getFlatBillingHistoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await billingService.getFlatBillingHistory(req.params.flatId, req.user!.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}