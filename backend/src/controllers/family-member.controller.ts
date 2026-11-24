import { Request, Response, NextFunction } from 'express'
import * as svc from '../services/family-member.service'
import { createFamilyMemberSchema, updateFamilyMemberSchema } from '../dtos/family-member.dto'
import { transformFamilyMember, transformFamilyMembers } from '../transformers/family-member.transformer'
import { getSocietyId } from '../helpers/society.helper'

export async function listFamilyMembersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await svc.listFamilyMembers(req.params.residentId, getSocietyId(req))
    res.json(transformFamilyMembers(members))
  } catch (err) {
    next(err)
  }
}

export async function createFamilyMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createFamilyMemberSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })
    const member = await svc.createFamilyMember(req.params.residentId, parsed.data, getSocietyId(req))
    return res.status(201).json(transformFamilyMember(member))
  } catch (err) {
    return next(err)
  }
}

export async function updateFamilyMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateFamilyMemberSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })
    const member = await svc.updateFamilyMember(
      req.params.residentId,
      req.params.memberId,
      parsed.data,
      getSocietyId(req)
    )
    return res.json(transformFamilyMember(member))
  } catch (err) {
    return next(err)
  }
}

export async function deleteFamilyMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteFamilyMember(req.params.residentId, req.params.memberId, getSocietyId(req))
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}