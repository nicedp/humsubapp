// Note: Prisma type imports show VS Code errors due to no local node_modules.
// Docker build is authoritative. Use `any` casts where needed for local type safety.

export function transformContribution(c: any) {
  return {
    id: c.id,
    eventId: c.eventId,
    contributorName: c.contributorName,
    flatId: c.flatId ?? null,
    flatNumber: c.flat?.flatNumber ?? null,
    amount: Number(c.amount),
    paymentMode: c.paymentMode,
    paidOn: c.paidOn instanceof Date ? c.paidOn.toISOString() : c.paidOn,
    notes: c.notes ?? null,
    recordedBy: c.recordedBy ?? null,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
  };
}

export function transformEventExpense(e: any) {
  return {
    id: e.id,
    eventId: e.eventId,
    title: e.title,
    category: e.category,
    amount: Number(e.amount),
    paidOn: e.paidOn instanceof Date ? e.paidOn.toISOString() : e.paidOn,
    vendor: e.vendor ?? null,
    notes: e.notes ?? null,
    recordedBy: e.recordedBy ?? null,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
  };
}

export function transformTeamMember(m: any) {
  return {
    id: m.id,
    eventId: m.eventId,
    residentId: m.residentId,
    residentName: m.resident?.name ?? null,
    flatId: m.resident?.flatId ?? null,
    role: m.role,
    notes: m.notes ?? null,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  };
}

export function transformEvent(event: any) {
  const contributions: any[] = event.contributions ?? [];
  const expenses: any[] = event.expenses ?? [];
  const teamMembers: any[] = event.teamMembers ?? [];

  const totalCollected = contributions.reduce((s: number, c: any) => s + Number(c.amount), 0);
  const totalSpent = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);

  return {
    id: event.id,
    societyId: event.societyId,
    name: event.name,
    description: event.description ?? null,
    eventDate: event.eventDate instanceof Date ? event.eventDate.toISOString() : event.eventDate,
    status: event.status,
    budgetTarget: event.budgetTarget != null ? Number(event.budgetTarget) : null,
    createdBy: event.createdBy ?? null,
    createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
    updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : event.updatedAt,
    // financial summary
    totalCollected,
    totalSpent,
    netBalance: totalCollected - totalSpent,
    contributorCount: contributions.length,
    // sub-resources (only present in detail fetch)
    contributions: event.contributions !== undefined ? contributions.map(transformContribution) : undefined,
    expenses: event.expenses !== undefined ? expenses.map(transformEventExpense) : undefined,
    teamMembers: event.teamMembers !== undefined ? teamMembers.map(transformTeamMember) : undefined,
  };
}

export function transformEvents(events: any[]) {
  return events.map(transformEvent);
}