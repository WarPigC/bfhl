import { useState } from 'react';
import type {
  Ticket,
  StatusType,
  PriorityType,
} from '../types/ticket';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  ALLOWED_TRANSITIONS,
} from '../types/ticket';

interface TicketCardProps {
  ticket: Ticket;
  onUpdateStatus: (id: string, status: StatusType) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onError: (message: string) => void;
  isDragging?: boolean;
}

function formatAge(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

const priorityColors: Record<PriorityType, string> = {
  low: 'var(--color-priority-low)',
  medium: 'var(--color-priority-medium)',
  high: 'var(--color-priority-high)',
  urgent: 'var(--color-priority-urgent)',
};

const statusArrowIcons: Record<string, string> = {
  forward: '→',
  backward: '←',
};

export function TicketCard({
  ticket,
  onUpdateStatus,
  onDelete,
  onError,
  isDragging = false,
}: TicketCardProps) {
  const [updating, setUpdating] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const allowedTransitions = ALLOWED_TRANSITIONS[ticket.status as StatusType] || [];
  const currentIndex = ['open', 'in_progress', 'resolved', 'closed'].indexOf(ticket.status);

  const handleTransition = async (newStatus: StatusType) => {
    setUpdating(true);
    try {
      await onUpdateStatus(ticket._id, newStatus);
    } catch (err: any) {
      onError(err.error || `Failed to move ticket to ${STATUS_LABELS[newStatus]}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(ticket._id);
    } catch (err: any) {
      onError(err.error || 'Failed to delete ticket');
    }
    setShowConfirmDelete(false);
  };

  return (
    <div
      className={`group rounded-xl border p-4 transition-all duration-200 ${
        isDragging
          ? 'opacity-50 scale-[1.02] shadow-2xl border-[var(--color-accent)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-light)] hover:shadow-lg'
      }`}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        animation: 'fadeIn 0.3s ease-out',
      }}
      data-ticket-id={ticket._id}
    >
      {/* Top Row: Priority Badge + SLA Breach */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest"
          style={{
            color: priorityColors[ticket.priority],
            backgroundColor: `${priorityColors[ticket.priority]}20`,
            border: `1px solid ${priorityColors[ticket.priority]}40`,
          }}
        >
          {PRIORITY_LABELS[ticket.priority]}
        </span>

        <div className="flex items-center gap-2">
          {ticket.slaBreached && (
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-[var(--color-error)] border border-[var(--color-error)] bg-[var(--color-error-bg)]"
              style={{ animation: 'pulse-glow 2s infinite' }}
              title="SLA Breached"
            >
              ⚠ BREACHED
            </span>
          )}
        </div>
      </div>

      {/* Subject */}
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1 line-clamp-2 leading-snug">
        {ticket.subject}
      </h3>

      {/* Email + Age */}
      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-3">
        <span className="truncate max-w-[60%]" title={ticket.customerEmail}>
          {ticket.customerEmail}
        </span>
        <span className="font-mono whitespace-nowrap" title={`${ticket.ageMinutes} minutes`}>
          ⏱ {formatAge(ticket.ageMinutes)}
        </span>
      </div>

      {/* Transition Buttons */}
      <div className="flex items-center gap-2">
        {allowedTransitions.map((status) => {
          const targetIndex = ['open', 'in_progress', 'resolved', 'closed'].indexOf(status);
          const isForward = targetIndex > currentIndex;
          return (
            <button
              key={status}
              onClick={() => handleTransition(status)}
              disabled={updating}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 disabled:opacity-40 cursor-pointer ${
                isForward
                  ? 'border border-[var(--color-success)] text-[var(--color-success)] bg-[var(--color-success-bg)] hover:bg-[#00d2a025]'
                  : 'border border-[var(--color-warning)] text-[var(--color-warning)] bg-[var(--color-warning-bg)] hover:bg-[#ffa72625]'
              }`}
              title={`Move to ${STATUS_LABELS[status]}`}
            >
              <span>{statusArrowIcons[isForward ? 'forward' : 'backward']}</span>
              <span>{STATUS_LABELS[status]}</span>
            </button>
          );
        })}

        {/* Delete Button */}
        {!showConfirmDelete ? (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="p-1.5 rounded-lg border border-transparent text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 hover:border-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-all duration-200 cursor-pointer"
            title="Delete ticket"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M5 2h6M2 4h12M6 4v8M10 4v8M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="px-2 py-1 rounded text-[10px] font-bold text-white bg-[var(--color-error)] hover:opacity-90 cursor-pointer"
            >
              Yes
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="px-2 py-1 rounded text-[10px] font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)] cursor-pointer"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
