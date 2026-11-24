import { MaintenanceBill, Flat, Payment, Resident } from '@prisma/client';
import { calculateLateFee } from '../helpers/billing.helper';

export interface BillResponse {
  id: string;
  flatId: string;
  flatNumber?: string;
  floor?: number | null;
  residentName?: string | null;
  residentPhone?: string | null;
  month: number;
  year: number;
  amount: number;
  dueDate: Date;
  status: string;
  lateFee: number;
  totalDue: number;
  payment?: {
    id: string;
    amountPaid: number;
    paidOn: Date;
    paymentMode: string;
    notes: string | null;
    recordedBy: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

type BillWithRelations = MaintenanceBill & {
  flat?: Flat & { residents?: Pick<Resident, 'name' | 'phone'>[] };
  payment?: Payment | null;
};

interface LateFeeSettings {
  lateFeeGraceDays: number;
  lateFeePerDay: number;
}

export function transformBill(
  bill: BillWithRelations,
  settings: LateFeeSettings
): BillResponse {
  const lateFee = bill.status === 'paid' ? 0 : calculateLateFee(bill.dueDate, settings);
  const totalDue = Number(bill.amount) + lateFee;
  const activeResident = bill.flat?.residents?.[0] ?? null;

  return {
    id: bill.id,
    flatId: bill.flatId,
    flatNumber: bill.flat?.flatNumber,
    floor: bill.flat?.floor,
    residentName: activeResident?.name ?? null,
    residentPhone: activeResident?.phone ?? null,
    month: bill.month,
    year: bill.year,
    amount: Number(bill.amount),
    dueDate: bill.dueDate,
    status: bill.status,
    lateFee,
    totalDue,
    payment: bill.payment
      ? {
          id: bill.payment.id,
          amountPaid: Number(bill.payment.amountPaid),
          paidOn: bill.payment.paidOn,
          paymentMode: bill.payment.paymentMode,
          notes: bill.payment.notes ?? null,
          recordedBy: bill.payment.recordedBy ?? null,
        }
      : null,
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
  };
}

export function transformBills(
  bills: BillWithRelations[],
  settings: LateFeeSettings
): BillResponse[] {
  return bills.map((b) => transformBill(b, settings));
}