export interface Ticket {
  _id: string;
  subject: string;
  description: string;
  customerEmail: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  resolvedAt: string | null;
  ageMinutes: number;
  slaBreached: boolean;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  customerEmail: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TicketStats {
  total: number;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  breachedCount: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string>;
}

export type StatusType = 'open' | 'in_progress' | 'resolved' | 'closed';
export type PriorityType = 'low' | 'medium' | 'high' | 'urgent';

export const STATUS_LABELS: Record<StatusType, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<PriorityType, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

// Allowed forward/backward transitions (mirrors backend)
export const ALLOWED_TRANSITIONS: Record<StatusType, StatusType[]> = {
  open: ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved: ['in_progress', 'closed'],
  closed: ['resolved'],
};
