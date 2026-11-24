import { Staff } from '@prisma/client';

export interface StaffResponse {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  shift: string | null;
  isActive: boolean;
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function transformStaff(staff: Staff): StaffResponse {
  return {
    id: staff.id,
    name: staff.name,
    role: staff.role,
    phone: staff.phone ?? null,
    shift: staff.shift ?? null,
    isActive: staff.isActive,
    joinDate: staff.joinDate,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  };
}

export function transformStaffList(staffList: Staff[]): StaffResponse[] {
  return staffList.map(transformStaff);
}