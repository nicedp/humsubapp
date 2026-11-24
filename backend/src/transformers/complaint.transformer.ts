import { Complaint, Flat } from '@prisma/client';

export interface ComplaintResponse {
  id: string;
  flatId: string;
  flatNumber?: string;
  raisedBy: string | null;
  category: string;
  description: string;
  status: string;
  adminRemark: string | null;
  raisedOn: Date;
  resolvedOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type ComplaintWithRelations = Complaint & {
  flat?: Flat;
};

export function transformComplaint(complaint: ComplaintWithRelations): ComplaintResponse {
  return {
    id: complaint.id,
    flatId: complaint.flatId,
    flatNumber: complaint.flat?.flatNumber,
    raisedBy: complaint.raisedBy ?? null,
    category: complaint.category,
    description: complaint.description,
    status: complaint.status,
    adminRemark: complaint.adminRemark ?? null,
    raisedOn: complaint.raisedOn,
    resolvedOn: complaint.resolvedOn ?? null,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
}

export function transformComplaints(complaints: ComplaintWithRelations[]): ComplaintResponse[] {
  return complaints.map(transformComplaint);
}