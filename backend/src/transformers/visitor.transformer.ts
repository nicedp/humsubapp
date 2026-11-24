import { Visitor, Flat } from '@prisma/client';

export interface VisitorResponse {
  id:            string;
  flatId:        string;
  flatNumber?:   string;
  visitorName:   string;
  phone:         string | null;
  vehicleNumber: string | null;
  visitorType:   string;
  purpose:       string | null;
  entryTime:     Date;
  exitTime:      Date | null;
  loggedBy:      string | null;
  createdAt:     Date;
  updatedAt:     Date;
}

type VisitorWithRelations = Visitor & {
  flat?: Flat;
};

export function transformVisitor(visitor: VisitorWithRelations): VisitorResponse {
  return {
    id:            visitor.id,
    flatId:        visitor.flatId,
    flatNumber:    visitor.flat?.flatNumber,
    visitorName:   visitor.visitorName,
    phone:         visitor.phone ?? null,
    vehicleNumber: visitor.vehicleNumber ?? null,
    visitorType:   visitor.visitorType,
    purpose:       visitor.purpose ?? null,
    entryTime:     visitor.entryTime,
    exitTime:      visitor.exitTime ?? null,
    loggedBy:      visitor.loggedBy ?? null,
    createdAt:     visitor.createdAt,
    updatedAt:     visitor.updatedAt,
  };
}

export function transformVisitors(visitors: VisitorWithRelations[]): VisitorResponse[] {
  return visitors.map(transformVisitor);
}