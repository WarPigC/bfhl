import React, { useState } from 'react';
import { useTickets } from './hooks/useTickets';
import { useToast } from './hooks/useToast';
import { StatsStrip } from './components/StatsStrip';
import { FilterBar } from './components/FilterBar';
import { BoardColumn } from './components/BoardColumn';
import { CreateTicketModal } from './components/CreateTicketModal';
import { ToastContainer } from './components/ToastContainer';
import type { StatusType, PriorityType } from './types/ticket';

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

  const handleError = (message: string) => {
    addToast(message, 'error');
  };

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

      {/* Board */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        id="ticket-board"
      >
        {COLUMNS.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tickets={getTicketsByStatus(status)}
            onUpdateStatus={updateStatus}
            onDelete={deleteTicket}
            onError={handleError}
          />
        ))}
      </div>

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
