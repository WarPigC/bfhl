import { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketStats, CreateTicketData, StatusType, PriorityType } from '../types/ticket';
import { ticketApi } from '../api/tickets';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    priority?: PriorityType;
    breached?: boolean;
  }>({});

  const fetchTickets = useCallback(async () => {
    try {
      setError(null);
      const data = await ticketApi.getAll({
        priority: filters.priority,
        breached: filters.breached,
      });
      setTickets(data);
    } catch (err: any) {
      setError(err.error || 'Failed to fetch tickets');
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await ticketApi.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTickets(), fetchStats()]);
    setLoading(false);
  }, [fetchTickets, fetchStats]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const createTicket = async (data: CreateTicketData): Promise<Ticket> => {
    const newTicket = await ticketApi.create(data);
    setTickets((prev) => [newTicket, ...prev]);
    await fetchStats();
    return newTicket;
  };

  const updateStatus = async (id: string, status: StatusType): Promise<Ticket> => {
    const updated = await ticketApi.updateStatus(id, status);
    setTickets((prev) =>
      prev.map((t) => (t._id === id ? updated : t))
    );
    await fetchStats();
    return updated;
  };

  const deleteTicket = async (id: string): Promise<void> => {
    await ticketApi.delete(id);
    setTickets((prev) => prev.filter((t) => t._id !== id));
    await fetchStats();
  };

  const getTicketsByStatus = (status: StatusType): Ticket[] => {
    return tickets.filter((t) => t.status === status);
  };

  return {
    tickets,
    stats,
    loading,
    error,
    filters,
    setFilters,
    createTicket,
    updateStatus,
    deleteTicket,
    getTicketsByStatus,
    refresh: loadAll,
  };
}
