import { useDroppable } from '@dnd-kit/core';
import type { Ticket, StatusType } from '../types/ticket';
import { STATUS_LABELS } from '../types/ticket';
import { DraggableTicketCard } from './DraggableTicketCard';

interface DroppableBoardColumnProps {
  status: StatusType;
  tickets: Ticket[];
  onUpdateStatus: (id: string, status: StatusType) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onError: (message: string) => void;
  isDropTarget: boolean;
  isInvalidDrop: boolean;
}

const statusColors: Record<StatusType, string> = {
  open: 'var(--color-status-open)',
  in_progress: 'var(--color-status-in-progress)',
  resolved: 'var(--color-status-resolved)',
  closed: 'var(--color-status-closed)',
};

export function DroppableBoardColumn({
  status,
  tickets,
  onUpdateStatus,
  onDelete,
  onError,
  isDropTarget,
  isInvalidDrop,
}: DroppableBoardColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: { status },
  });

  const color = statusColors[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[300px] rounded-xl border overflow-hidden transition-all duration-200 ${
        isOver && isInvalidDrop
          ? 'border-[var(--color-error)] bg-[var(--color-error-bg)] shadow-lg shadow-[var(--color-error-bg)]'
          : isOver
          ? 'border-[var(--color-accent)] bg-[var(--color-bg-card)] shadow-lg shadow-[var(--color-accent-glow)]'
          : isDropTarget
          ? 'border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)]'
      }`}
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

      {/* Drop zone indicator */}
      {isOver && isInvalidDrop && (
        <div className="px-3 py-2 text-center text-xs font-medium text-[var(--color-error)] bg-[var(--color-error-bg)] border-b border-[var(--color-error)]">
          ⚠ Invalid transition
        </div>
      )}

      {/* Tickets */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)]">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-secondary)]">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-2 opacity-30">
              <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 16h32" stroke="currentColor" strokeWidth="2" />
            </svg>
            <p className="text-xs">
              {isOver ? 'Drop here' : 'No tickets'}
            </p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <DraggableTicketCard
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
