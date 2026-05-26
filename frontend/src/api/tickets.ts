import type { Ticket, CreateTicketData, TicketStats, ApiError } from '../types/ticket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Network error' }));
    throw data as ApiError;
  }
  return response.json();
}

export const ticketApi = {
  async getAll(filters?: {
    status?: string;
    priority?: string;
    breached?: boolean;
  }): Promise<Ticket[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.breached) params.set('breached', 'true');
    const query = params.toString() ? `?${params}` : '';
    const res = await fetch(`${API_URL}/tickets${query}`);
    return handleResponse<Ticket[]>(res);
  },

  async create(data: CreateTicketData): Promise<Ticket> {
    const res = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Ticket>(res);
  },

  async updateStatus(id: string, status: string): Promise<Ticket> {
    const res = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<Ticket>(res);
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Network error' }));
      throw data as ApiError;
    }
  },

  async getStats(): Promise<TicketStats> {
    const res = await fetch(`${API_URL}/tickets/stats`);
    return handleResponse<TicketStats>(res);
  },
};
