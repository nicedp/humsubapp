import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import {
  transformVendor,
  transformVendors,
  transformContract,
  transformContracts,
  transformServiceLog,
} from '../transformers/vendor.transformer';
import {
  CreateVendorDto,
  UpdateVendorDto,
  CreateContractDto,
  UpdateContractDto,
  CreateServiceLogDto,
} from '../dtos/vendor.dto';

const CONTRACT_INCLUDE = {
  vendor: true,
  asset: true,
  serviceLogs: { orderBy: { serviceDate: 'desc' as const } },
};

// ─── Vendors CRUD ─────────────────────────────────────────────────────────────

export async function getVendors(skip = 0, limit = 50, societyId: number = 1) {
  const where = { societyId };
  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.vendor.count({ where }),
  ]);
  return { data: transformVendors(vendors), total };
}

export async function getVendorById(id: string) {
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) throw createError('Vendor not found', 404);
  return transformVendor(vendor);
}

export async function createVendor(dto: CreateVendorDto, societyId: number = 1) {
  const vendor = await prisma.vendor.create({
    data: {
      societyId,
      name: dto.name,
      contactPerson: dto.contactPerson,
      phone: dto.phone,
      email: dto.email,
      serviceType: dto.serviceType,
      notes: dto.notes,
      isActive: dto.isActive ?? true,
    },
  });
  return transformVendor(vendor);
}

export async function updateVendor(id: string, dto: UpdateVendorDto) {
  const existing = await prisma.vendor.findUnique({ where: { id } });
  if (!existing) throw createError('Vendor not found', 404);

  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.contactPerson !== undefined && { contactPerson: dto.contactPerson }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.serviceType !== undefined && { serviceType: dto.serviceType }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    },
  });
  return transformVendor(vendor);
}

export async function deleteVendor(id: string) {
  const existing = await prisma.vendor.findUnique({ where: { id } });
  if (!existing) throw createError('Vendor not found', 404);
  await prisma.vendor.delete({ where: { id } });
  return { deleted: true };
}

// ─── AMC Contracts CRUD ───────────────────────────────────────────────────────

export async function getContracts(
  skip = 0,
  limit = 50,
  filters: { status?: string; dueStatus?: string } = {},
  societyId: number = 1,
) {
  const where: any = { societyId };
  if (filters.status) where.status = filters.status;

  // dueStatus is a computed field (not stored in DB) — filter in-memory
  if (filters.dueStatus) {
    const all = await prisma.amcContract.findMany({
      where,
      orderBy: { nextServiceDue: 'asc' },
      include: CONTRACT_INCLUDE,
    });
    const transformed = transformContracts(all);
    const filtered = transformed.filter((c: any) => c.dueStatus === filters.dueStatus);
    return { data: filtered.slice(skip, skip + limit), total: filtered.length };
  }

  const [contracts, total] = await Promise.all([
    prisma.amcContract.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nextServiceDue: 'asc' },
      include: CONTRACT_INCLUDE,
    }),
    prisma.amcContract.count({ where }),
  ]);
  return { data: transformContracts(contracts), total };
}

export async function getContractById(id: string) {
  const contract = await prisma.amcContract.findUnique({
    where: { id },
    include: CONTRACT_INCLUDE,
  });
  if (!contract) throw createError('Contract not found', 404);
  return transformContract(contract);
}

export async function createContract(dto: CreateContractDto, societyId: number = 1) {
  // Validate vendor exists
  const vendor = await prisma.vendor.findUnique({ where: { id: dto.vendorId } });
  if (!vendor) throw createError('Vendor not found', 404);

  const contract = await prisma.amcContract.create({
    data: {
      societyId,
      vendorId: dto.vendorId,
      assetId: dto.assetId,
      contractNumber: dto.contractNumber,
      serviceType: dto.serviceType,
      annualCost: dto.annualCost,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      serviceFrequencyDays: dto.serviceFrequencyDays ?? 90,
      nextServiceDue: dto.nextServiceDue ? new Date(dto.nextServiceDue) : null,
      status: (dto.status as any) ?? 'active',
      notes: dto.notes,
    },
    include: CONTRACT_INCLUDE,
  });
  return transformContract(contract);
}

export async function updateContract(id: string, dto: UpdateContractDto) {
  const existing = await prisma.amcContract.findUnique({ where: { id } });
  if (!existing) throw createError('Contract not found', 404);

  const contract = await prisma.amcContract.update({
    where: { id },
    data: {
      ...(dto.vendorId !== undefined && { vendorId: dto.vendorId }),
      ...(dto.assetId !== undefined && { assetId: dto.assetId }),
      ...(dto.contractNumber !== undefined && { contractNumber: dto.contractNumber }),
      ...(dto.serviceType !== undefined && { serviceType: dto.serviceType }),
      ...(dto.annualCost !== undefined && { annualCost: dto.annualCost }),
      ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
      ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      ...(dto.serviceFrequencyDays !== undefined && { serviceFrequencyDays: dto.serviceFrequencyDays }),
      ...(dto.nextServiceDue !== undefined && { nextServiceDue: new Date(dto.nextServiceDue) }),
      ...(dto.status !== undefined && { status: dto.status as any }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    },
    include: CONTRACT_INCLUDE,
  });
  return transformContract(contract);
}

export async function deleteContract(id: string) {
  const existing = await prisma.amcContract.findUnique({ where: { id } });
  if (!existing) throw createError('Contract not found', 404);
  await prisma.amcContract.delete({ where: { id } });
  return { deleted: true };
}

// ─── Service Logs ─────────────────────────────────────────────────────────────

export async function addServiceLog(contractId: string, dto: CreateServiceLogDto, recordedBy: string) {
  const contract = await prisma.amcContract.findUnique({ where: { id: contractId } });
  if (!contract) throw createError('Contract not found', 404);

  const serviceDate = new Date(dto.serviceDate);

  // Calculate nextServiceDue: use admin override if provided, else auto-calculate
  const nextDue = dto.nextServiceDue
    ? new Date(dto.nextServiceDue)
    : new Date(serviceDate.getTime() + contract.serviceFrequencyDays * 24 * 60 * 60 * 1000);

  // Create the log
  const log = await prisma.amcServiceLog.create({
    data: {
      contractId,
      serviceDate,
      technicianName: dto.technicianName,
      workDone: dto.workDone,
      serviceCost: dto.serviceCost,
      nextServiceDue: nextDue,
      remarks: dto.remarks,
      recordedBy,
    },
  });

  // Auto-update contract's lastServiceDate and nextServiceDue
  await prisma.amcContract.update({
    where: { id: contractId },
    data: {
      lastServiceDate: serviceDate,
      nextServiceDue: nextDue,
    },
  });

  return transformServiceLog(log);
}

export async function deleteServiceLog(contractId: string, logId: string) {
  const log = await prisma.amcServiceLog.findUnique({ where: { id: logId } });
  if (!log || log.contractId !== contractId) throw createError('Service log not found', 404);
  await prisma.amcServiceLog.delete({ where: { id: logId } });
  return { deleted: true };
}