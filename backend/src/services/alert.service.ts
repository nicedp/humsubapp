import prisma from '../config/db';

export interface AlertItem {
  id: string;
  label: string;
  detail: string;
  daysUntil?: number;
  daysOverdue?: number;
  link: string;
}

export interface AlertSummary {
  overdueAssets: AlertItem[];
  assetsDueSoon: AlertItem[];
  amcOverdue: AlertItem[];
  amcDueSoon: AlertItem[];
  amcExpiringSoon: AlertItem[];
  overdueBillsCount: number;
  overdueBillsAmount: number;
  openComplaintsCount: number;
  unreadResidentMessages: number;
  totalAlerts: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysFrom(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / MS_PER_DAY);
}

export async function getAlertSummary(societyId: number, adminUserId: string): Promise<AlertSummary> {
  const now = new Date();
  const fourteenDaysAhead = new Date(now.getTime() + 14 * MS_PER_DAY);
  const thirtyDaysAhead = new Date(now.getTime() + 30 * MS_PER_DAY);

  const [
    assetsDue,
    amcContractsDue,
    amcExpiring,
    overdueBillsAgg,
    openComplaintsCount,
    unreadResidentMessages,
  ] = await Promise.all([
    // Assets with nextServiceDue <= 14 days from now (includes overdue)
    prisma.asset.findMany({
      where: {
        societyId,
        nextServiceDue: { lte: fourteenDaysAhead },
      },
      orderBy: { nextServiceDue: 'asc' },
    }),

    // AMC contracts with nextServiceDue <= 14 days (includes overdue), active only
    (prisma as any).amcContract.findMany({
      where: {
        societyId,
        status: 'active',
        nextServiceDue: { lte: fourteenDaysAhead },
      },
      include: { vendor: true },
      orderBy: { nextServiceDue: 'asc' },
    }),

    // AMC contracts expiring within 30 days (endDate approaching)
    (prisma as any).amcContract.findMany({
      where: {
        societyId,
        status: 'active',
        endDate: { lte: thirtyDaysAhead, gte: now },
      },
      include: { vendor: true },
      orderBy: { endDate: 'asc' },
    }),

    // Overdue bills aggregate — bills scoped via flat.societyId
    prisma.maintenanceBill.aggregate({
      where: {
        status: 'overdue',
        flat: { societyId },
      },
      _count: { id: true },
      _sum: { amount: true },
    }),

    // Open complaints (open / in_progress) — scoped via flat.societyId
    prisma.complaint.count({
      where: {
        status: { in: ['open', 'in_progress'] },
        flat: { societyId },
      },
    }),

    // Unread notifications in the requesting admin's inbox
    prisma.notification.count({
      where: {
        userId: adminUserId,
        isRead: false,
      },
    }),
  ]);

  // Separate assets into overdue vs due soon
  const overdueAssets: AlertItem[] = [];
  const assetsDueSoon: AlertItem[] = [];

  for (const a of assetsDue) {
    if (!a.nextServiceDue) continue;
    const days = daysFrom(a.nextServiceDue);
    if (days < 0) {
      overdueAssets.push({
        id: a.id,
        label: a.name,
        detail: `${a.type.replace(/_/g, ' ')}${a.location ? ` · ${a.location}` : ''}`,
        daysOverdue: Math.abs(days),
        link: '/admin/assets',
      });
    } else {
      assetsDueSoon.push({
        id: a.id,
        label: a.name,
        detail: `${a.type.replace(/_/g, ' ')}${a.location ? ` · ${a.location}` : ''}`,
        daysUntil: days,
        link: '/admin/assets',
      });
    }
  }

  // Separate AMC contracts into overdue vs due soon
  const amcOverdue: AlertItem[] = [];
  const amcDueSoon: AlertItem[] = [];

  for (const c of amcContractsDue) {
    if (!c.nextServiceDue) continue;
    const days = daysFrom(c.nextServiceDue);
    const vendorName = (c as any).vendor?.name ?? 'Unknown Vendor';
    if (days < 0) {
      amcOverdue.push({
        id: c.id,
        label: c.serviceType,
        detail: `Vendor: ${vendorName}${c.contractNumber ? ` · ${c.contractNumber}` : ''}`,
        daysOverdue: Math.abs(days),
        link: '/admin/vendors',
      });
    } else {
      amcDueSoon.push({
        id: c.id,
        label: c.serviceType,
        detail: `Vendor: ${vendorName}${c.contractNumber ? ` · ${c.contractNumber}` : ''}`,
        daysUntil: days,
        link: '/admin/vendors',
      });
    }
  }

  // AMC expiring soon
  const amcExpiringSoon: AlertItem[] = (amcExpiring as any[]).map((c) => {
    const days = daysFrom(c.endDate);
    const vendorName = (c as any).vendor?.name ?? 'Unknown Vendor';
    return {
      id: c.id,
      label: c.serviceType,
      detail: `Vendor: ${vendorName}${c.contractNumber ? ` · ${c.contractNumber}` : ''}`,
      daysUntil: Math.max(0, days),
      link: '/admin/vendors',
    };
  });

  const overdueBillsCount = overdueBillsAgg._count.id ?? 0;
  const overdueBillsAmount = overdueBillsAgg._sum.amount ?? 0;

  const totalAlerts =
    overdueAssets.length +
    assetsDueSoon.length +
    amcOverdue.length +
    amcDueSoon.length +
    amcExpiringSoon.length +
    overdueBillsCount +
    openComplaintsCount +
    unreadResidentMessages;

  return {
    overdueAssets,
    assetsDueSoon,
    amcOverdue,
    amcDueSoon,
    amcExpiringSoon,
    overdueBillsCount,
    overdueBillsAmount,
    openComplaintsCount,
    unreadResidentMessages,
    totalAlerts,
  };
}