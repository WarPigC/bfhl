import type { CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Ticket, StatusType } from '../types/ticket';
import { TicketCard } from './TicketCard';

interface DraggableTicketCardProps {
  ticket: Ticket;
  onUpdateStatus: (id: string, status: StatusType) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onError: (message: string) => void;
}

export function DraggableTicketCard({
  ticket,
  onUpdateStatus,
  onDelete,
  onError,
}: DraggableTicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: ticket._id,
      data: { ticket },
    });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : undefined,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TicketCard
        ticket={ticket}
        onUpdateStatus={onUpdateStatus}
        onDelete={onDelete}
        onError={onError}
        isDragging={isDragging}
      />
    </div>
  );
}
