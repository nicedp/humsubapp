import { Request, Response, NextFunction } from 'express';
import * as committeeService from '../services/committee.service';
import {
  transformCommittee,
  transformMember,
  transformAchievement,
} from '../transformers/committee.transformer';

// ─── Committees ───────────────────────────────────────────────────────────────

export async function listCommitteesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const rows = await committeeService.listCommittees(societyId);
    res.json(rows.map(transformCommittee));
  } catch (err) {
    next(err);
  }
}

export async function getCommitteeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const committee = await committeeService.getCommittee(req.params.id, societyId);
    res.json(transformCommittee(committee));
  } catch (err) {
    next(err);
  }
}

export async function createCommitteeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, societyId } = req.user!;
    const committee = await committeeService.createCommittee(req.body, userId, societyId);
    res.status(201).json(transformCommittee(committee));
  } catch (err) {
    next(err);
  }
}

export async function updateCommitteeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const committee = await committeeService.updateCommittee(req.params.id, req.body, societyId);
    res.json(transformCommittee(committee));
  } catch (err) {
    next(err);
  }
}

export async function deleteCommitteeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    await committeeService.deleteCommittee(req.params.id, societyId);
    res.json({ message: 'Committee deleted' });
  } catch (err) {
    next(err);
  }
}

export async function activateCommitteeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const committee = await committeeService.activateCommittee(req.params.id, societyId);
    res.json(transformCommittee(committee));
  } catch (err) {
    next(err);
  }
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function addMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const member = await committeeService.addMember(req.params.id, req.body, societyId);
    res.status(201).json(transformMember(member));
  } catch (err) {
    next(err);
  }
}

export async function updateMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const member = await committeeService.updateMember(
      req.params.id,
      req.params.memberId,
      req.body,
      societyId
    );
    res.json(transformMember(member));
  } catch (err) {
    next(err);
  }
}

export async function removeMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    await committeeService.removeMember(req.params.id, req.params.memberId, societyId);
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function addAchievementHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const achievement = await committeeService.addAchievement(req.params.id, req.body, societyId);
    res.status(201).json(transformAchievement(achievement));
  } catch (err) {
    next(err);
  }
}

export async function deleteAchievementHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    await committeeService.deleteAchievement(req.params.id, req.params.achievementId, societyId);
    res.json({ message: 'Achievement deleted' });
  } catch (err) {
    next(err);
  }
}