/**
 * Ticket status transition validation.
 * 
 * Allowed forward transitions (no skipping):
 *   open -> in_progress -> resolved -> closed
 * 
 * Allowed backward transitions (only one step back):
 *   in_progress -> open
 *   resolved -> in_progress
 *   closed -> resolved
 */

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'] as const;

// Map of current status -> set of allowed next statuses
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  open: ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved: ['in_progress', 'closed'],
  closed: ['resolved'],
};

export function isValidTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  if (currentStatus === newStatus) return false;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
}

export function getTransitionError(
  currentStatus: string,
  newStatus: string
): string {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus as any);
  const newIndex = STATUS_ORDER.indexOf(newStatus as any);

  if (currentIndex === -1 || newIndex === -1) {
    return `Invalid status value. Must be one of: ${STATUS_ORDER.join(', ')}`;
  }

  if (currentStatus === newStatus) {
    return `Ticket is already in '${currentStatus}' status`;
  }

  const forward = newIndex > currentIndex;
  const gap = Math.abs(newIndex - currentIndex);

  if (forward && gap > 1) {
    return `Cannot skip statuses. '${currentStatus}' can only move forward to '${STATUS_ORDER[currentIndex + 1]}'`;
  }

  if (!forward && gap > 1) {
    return `Can only move one step back. '${currentStatus}' can only move back to '${STATUS_ORDER[currentIndex - 1]}'`;
  }

  return `Invalid transition from '${currentStatus}' to '${newStatus}'`;
}
