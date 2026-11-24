// Note: Prisma type imports show VS Code errors due to no local node_modules.
// Docker build is authoritative.

function daysUntilDue(nextServiceDue: Date | null): number | null {
  if (!nextServiceDue) return null;
  const now = new Date();
  const due = new Date(nextServiceDue);
  return Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function dueSoonStatus(daysLeft: number | null): 'overdue' | 'due_soon' | 'ok' | 'unknown' {
  if (daysLeft === null) return 'unknown';
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 30) return 'due_soon';
  return 'ok';
}

export function transformVendor(v: any) {
  return {
    id: v.id,
    societyId: v.societyId,
    name: v.name,
    contactPerson: v.contactPerson ?? null,
    phone: v.phone ?? null,
    email: v.email ?? null,
    serviceType: v.serviceType,
    notes: v.notes ?? null,
    isActive: v.isActive,
    createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : v.createdAt,
    updatedAt: v.updatedAt instanceof Date ? v.updatedAt.toISOString() : v.updatedAt,
  };
}

export function transformVendors(vendors: any[]) {
  return vendors.map(transformVendor);
}

export function transformServiceLog(log: any) {
  return {
    id: log.id,
    contractId: log.contractId,
    serviceDate: log.serviceDate instanceof Date ? log.serviceDate.toISOString() : log.serviceDate,
    technicianName: log.technicianName ?? null,
    workDone: log.workDone,
    serviceCost: log.serviceCost != null ? Number(log.serviceCost) : null,
    nextServiceDue: log.nextServiceDue
      ? (log.nextServiceDue instanceof Date ? log.nextServiceDue.toISOString() : log.nextServiceDue)
      : null,
    remarks: log.remarks ?? null,
    recordedBy: log.recordedBy ?? null,
    createdAt: log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt,
  };
}

export function transformContract(contract: any) {
  const nextDue = contract.nextServiceDue ? new Date(contract.nextServiceDue) : null;
  const daysLeft = daysUntilDue(nextDue);
  const dueStatus = dueSoonStatus(daysLeft);

  return {
    id: contract.id,
    societyId: contract.societyId,
    vendorId: contract.vendorId,
    vendorName: contract.vendor?.name ?? null,
    vendorPhone: contract.vendor?.phone ?? null,
    assetId: contract.assetId ?? null,
    assetName: contract.asset?.name ?? null,
    contractNumber: contract.contractNumber ?? null,
    serviceType: contract.serviceType,
    annualCost: Number(contract.annualCost),
    startDate: contract.startDate instanceof Date ? contract.startDate.toISOString() : contract.startDate,
    endDate: contract.endDate instanceof Date ? contract.endDate.toISOString() : contract.endDate,
    serviceFrequencyDays: contract.serviceFrequencyDays,
    lastServiceDate: contract.lastServiceDate
      ? (contract.lastServiceDate instanceof Date ? contract.lastServiceDate.toISOString() : contract.lastServiceDate)
      : null,
    nextServiceDue: nextDue ? nextDue.toISOString() : null,
    daysUntilDue: daysLeft,
    dueStatus,
    status: contract.status,
    notes: contract.notes ?? null,
    createdAt: contract.createdAt instanceof Date ? contract.createdAt.toISOString() : contract.createdAt,
    updatedAt: contract.updatedAt instanceof Date ? contract.updatedAt.toISOString() : contract.updatedAt,
    // sub-resource (only in detail fetch)
    serviceLogs: contract.serviceLogs !== undefined
      ? contract.serviceLogs.map(transformServiceLog)
      : undefined,
  };
}

export function transformContracts(contracts: any[]) {
  return contracts.map(transformContract);
}