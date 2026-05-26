import React from 'react';
import { Ticket, StatusType, STATUS_LABELS } from '../types/ticket';
import { TicketCard } from './TicketCard';

interface BoardColumnProps {
  status: StatusType;
  tickets: Ticket[];
  onUpdateStatus: (id: string, status: StatusType) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onError: (message: string) => void;
}

const statusColors: Record<StatusType, string> = {
  open: 'var(--color-status-open)',
  in_progress: 'var(--color-status-in-progress)',
  resolved: 'var(--color-status-resolved)',
  closed: 'var(--color-status-closed)',
};

export function BoardColumn({
  status,
  tickets,
  onUpdateStatus,
  onDelete,
  onError,
}: BoardColumnProps) {
  const color = statusColors[status];

  return (
    <div
      className="flex flex-col min-h-[300px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden"
      id={`column-${status}`}
      data-status={status}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]"
        style={{
          background: `linear-gradient(135deg, ${color}10, transparent)`,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color }}>
            {STATUS_LABELS[status]}
          </h3>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-bold"
          style={{
            color,
            backgroundColor: `${color}20`,
          }}
        >
          {tickets.length}
        </span>
      </div>

      {/* Tickets */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)]">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-secondary)]">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-2 opacity-30">
              <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 16h32" stroke="currentColor" strokeWidth="2" />
            </svg>
            <p className="text-xs">No tickets</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
              onError={onError}
            />
          ))
        )}
      </div>
    </div>
  );
}
