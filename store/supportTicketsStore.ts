import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Ticket, TicketReply, TicketStats, TicketStatus, TicketPriority, TicketCategory } from '@/services/support.service';

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  assignedTo?: string;
  userId?: string;
  search?: string;
}

interface SupportTicketsState {
  // Data
  tickets: Ticket[];
  selectedTickets: string[];
  stats: TicketStats | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;

  // Loading states
  isLoading: boolean;
  isStatsLoading: boolean;
  isActionLoading: boolean;

  // Error states
  error: string | null;
  statsError: string | null;

  // Filters
  filters: TicketFilters;

  // Actions - Data
  setTickets: (tickets: Ticket[]) => void;
  setStats: (stats: TicketStats) => void;
  setPagination: (pagination: SupportTicketsState['pagination']) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, ticket: Partial<Ticket>) => void;
  removeTicket: (id: string) => void;
  removeTickets: (ids: string[]) => void;
  addReply: (ticketId: string, reply: TicketReply) => void;

  // Actions - Selection
  setSelectedTickets: (ids: string[]) => void;
  toggleTicketSelection: (id: string) => void;
  selectAllTickets: (ids: string[]) => void;
  clearSelection: () => void;

  // Actions - Loading
  setLoading: (loading: boolean) => void;
  setStatsLoading: (loading: boolean) => void;
  setActionLoading: (loading: boolean) => void;

  // Actions - Error
  setError: (error: string | null) => void;
  setStatsError: (error: string | null) => void;
  clearErrors: () => void;

  // Actions - Filters
  setFilters: (filters: Partial<TicketFilters>) => void;
  resetFilters: () => void;

  // Actions - Reset
  resetStore: () => void;
}

const initialFilters: TicketFilters = {
  page: 1,
  limit: 20,
};

const initialState = {
  tickets: [],
  selectedTickets: [],
  stats: null,
  pagination: null,
  isLoading: false,
  isStatsLoading: false,
  isActionLoading: false,
  error: null,
  statsError: null,
  filters: initialFilters,
};

export const useSupportTicketsStore = create<SupportTicketsState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Data actions
      setTickets: (tickets) => set({ tickets }),
      setStats: (stats) => set({ stats }),
      setPagination: (pagination) => set({ pagination }),
      addTicket: (ticket) => set((state) => ({
        tickets: [ticket, ...state.tickets],
        pagination: state.pagination ? {
          ...state.pagination,
          total: state.pagination.total + 1
        } : null
      })),
      updateTicket: (id, updates) =>
        set((state) => ({
          tickets: state.tickets.map((t) => (t._id === id ? { ...t, ...updates } : t)),
        })),
      removeTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.filter((t) => t._id !== id),
          pagination: state.pagination ? {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - 1)
          } : null,
          selectedTickets: state.selectedTickets.filter((tid) => tid !== id),
        })),
      removeTickets: (ids) =>
        set((state) => ({
          tickets: state.tickets.filter((t) => !ids.includes(t._id)),
          pagination: state.pagination ? {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - ids.length)
          } : null,
          selectedTickets: [],
        })),
      addReply: (ticketId, reply) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t._id === ticketId
              ? { ...t, replies: [...(t.replies || []), reply] }
              : t
          ),
        })),

      // Selection actions
      setSelectedTickets: (ids) => set({ selectedTickets: ids }),
      toggleTicketSelection: (id) =>
        set((state) => ({
          selectedTickets: state.selectedTickets.includes(id)
            ? state.selectedTickets.filter((tid) => tid !== id)
            : [...state.selectedTickets, id],
        })),
      selectAllTickets: (ids) => set({ selectedTickets: ids }),
      clearSelection: () => set({ selectedTickets: [] }),

      // Loading actions
      setLoading: (loading) => set({ isLoading: loading }),
      setStatsLoading: (loading) => set({ isStatsLoading: loading }),
      setActionLoading: (loading) => set({ isActionLoading: loading }),

      // Error actions
      setError: (error) => set({ error }),
      setStatsError: (error) => set({ statsError: error }),
      clearErrors: () => set({ error: null, statsError: null }),

      // Filter actions
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      resetFilters: () => set({ filters: initialFilters }),

      // Reset action
      resetStore: () => set(initialState),
    }),
    { name: 'SupportTicketsStore' }
  )
);
