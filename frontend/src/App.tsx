import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useTickets } from './hooks/useTickets';
import { useToast } from './hooks/useToast';
import { StatsStrip } from './components/StatsStrip';
import { FilterBar } from './components/FilterBar';
import { DroppableBoardColumn } from './components/DroppableBoardColumn';
import { CreateTicketModal } from './components/CreateTicketModal';
import { ToastContainer } from './components/ToastContainer';
import { TicketCard } from './components/TicketCard';
import type { StatusType, Ticket } from './types/ticket';
import { ALLOWED_TRANSITIONS, STATUS_LABELS } from './types/ticket';

const COLUMNS: StatusType[] = ['open', 'in_progress', 'resolved', 'closed'];

function App() {
  const {
    stats,
    loading,
    error,
    filters,
    setFilters,
    createTicket,
    updateStatus,
    deleteTicket,
    getTicketsByStatus,
  } = useTickets();

  const { toasts, addToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [overColumn, setOverColumn] = useState<StatusType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const isValidDrop = useCallback(
    (ticketStatus: StatusType, targetColumn: StatusType): boolean => {
      if (ticketStatus === targetColumn) return true;
      const allowed = ALLOWED_TRANSITIONS[ticketStatus];
      return allowed?.includes(targetColumn) ?? false;
    },
    []
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const ticket = event.active.data.current?.ticket as Ticket | undefined;
    if (ticket) {
      setActiveTicket(ticket);
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id as StatusType | undefined;
    setOverColumn(overId ?? null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTicket(null);
      setOverColumn(null);

      if (!over) return;

      const ticket = active.data.current?.ticket as Ticket;
      const targetStatus = over.id as StatusType;

      if (!ticket || ticket.status === targetStatus) return;

      if (!isValidDrop(ticket.status as StatusType, targetStatus)) {
        addToast(
          `Cannot move from "${STATUS_LABELS[ticket.status as StatusType]}" to "${STATUS_LABELS[targetStatus]}"`,
          'error'
        );
        return;
      }

      try {
        await updateStatus(ticket._id, targetStatus);
        addToast(
          `Ticket moved to ${STATUS_LABELS[targetStatus]}`,
          'success'
        );
      } catch (err: any) {
        addToast(err.error || 'Failed to update ticket', 'error');
      }
    },
    [isValidDrop, updateStatus, addToast]
  );

  const handleError = (message: string) => {
    addToast(message, 'error');
  };

  const isInvalidDropTarget =
    activeTicket && overColumn
      ? !isValidDrop(activeTicket.status as StatusType, overColumn)
      : false;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-6" id="app-header">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
              boxShadow: '0 4px 15px var(--color-accent-glow)',
            }}
          >
            D
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              DeskFlow
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Support Ticket Triage Board
            </p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <StatsStrip stats={stats} loading={loading} />

      {/* Filters */}
      <FilterBar
        priorityFilter={filters.priority}
        breachedFilter={filters.breached}
        onPriorityChange={(priority) =>
          setFilters((prev) => ({ ...prev, priority }))
        }
        onBreachedChange={(breached) =>
          setFilters((prev) => ({ ...prev, breached }))
        }
        onCreateClick={() => setShowCreateModal(true)}
      />

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error)] text-sm">
          <p className="font-medium">Failed to load tickets</p>
          <p className="text-xs mt-1 opacity-80">{error}</p>
        </div>
      )}

      {/* Board with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
          id="ticket-board"
        >
          {COLUMNS.map((status) => (
            <DroppableBoardColumn
              key={status}
              status={status}
              tickets={getTicketsByStatus(status)}
              onUpdateStatus={updateStatus}
              onDelete={deleteTicket}
              onError={handleError}
              isDropTarget={activeTicket !== null}
              isInvalidDrop={overColumn === status && !!isInvalidDropTarget}
            />
          ))}
        </div>

        {/* Drag overlay - shows a ghost of the card being dragged */}
        <DragOverlay>
          {activeTicket ? (
            <div className="opacity-80 w-[280px]">
              <TicketCard
                ticket={activeTicket}
                onUpdateStatus={async () => {}}
                onDelete={async () => {}}
                onError={() => {}}
                isDragging={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          await createTicket(data);
          addToast('Ticket created successfully!', 'success');
        }}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
