// SLA thresholds in minutes per priority level
export const SLA_THRESHOLDS: Record<string, number> = {
  urgent: 60,    // 1 hour
  high: 240,     // 4 hours
  medium: 1440,  // 24 hours
  low: 4320,     // 72 hours
};

export interface DerivedFields {
  ageMinutes: number;
  slaBreached: boolean;
}

/**
 * Compute derived fields for a ticket.
 * - ageMinutes: minutes between createdAt and now (if open/in_progress),
 *   or between createdAt and resolvedAt (if resolved/closed). Stops growing once resolved.
 * - slaBreached: true if the ticket is unresolved and past the SLA target,
 *   or if it was resolved AFTER the SLA target time.
 */
export function computeDerivedFields(ticket: {
  createdAt: Date;
  resolvedAt: Date | null;
  status: string;
  priority: string;
}): DerivedFields {
  const now = new Date();
  const createdAt = new Date(ticket.createdAt);

  // ageMinutes: stop growing once resolved
  let endTime: Date;
  if (
    (ticket.status === 'resolved' || ticket.status === 'closed') &&
    ticket.resolvedAt
  ) {
    endTime = new Date(ticket.resolvedAt);
  } else {
    endTime = now;
  }

  const ageMinutes = Math.floor(
    (endTime.getTime() - createdAt.getTime()) / (1000 * 60)
  );

  // slaBreached: based on priority thresholds
  const threshold = SLA_THRESHOLDS[ticket.priority] || SLA_THRESHOLDS.low;
  const slaBreached = ageMinutes > threshold;

  return { ageMinutes, slaBreached };
}
