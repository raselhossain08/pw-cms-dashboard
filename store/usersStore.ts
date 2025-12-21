import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, CreateUserDto, UpdateUserDto } from '@/services/users.service';

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  students: number;
  instructors: number;
  recentUsers: number;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

interface UsersState {
  // Data
  users: User[];
  selectedUsers: string[];
  stats: UserStats | null;
  total: number;

  // Loading states
  isLoading: boolean;
  isStatsLoading: boolean;
  isActionLoading: boolean;

  // Error states
  error: string | null;
  statsError: string | null;

  // Filters
  filters: UserFilters;

  // Actions - Data
  setUsers: (users: User[]) => void;
  setStats: (stats: UserStats) => void;
  setTotal: (total: number) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  removeUser: (id: string) => void;
  removeUsers: (ids: string[]) => void;

  // Actions - Selection
  setSelectedUsers: (ids: string[]) => void;
  toggleUserSelection: (id: string) => void;
  selectAllUsers: (ids: string[]) => void;
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
  setFilters: (filters: Partial<UserFilters>) => void;
  resetFilters: () => void;

  // Actions - Reset
  resetStore: () => void;
}

const initialFilters: UserFilters = {
  page: 1,
  limit: 10,
};

const initialState = {
  users: [],
  selectedUsers: [],
  stats: null,
  total: 0,
  isLoading: false,
  isStatsLoading: false,
  isActionLoading: false,
  error: null,
  statsError: null,
  filters: initialFilters,
};

export const useUsersStore = create<UsersState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Data actions
      setUsers: (users) => set({ users }),
      setStats: (stats) => set({ stats }),
      setTotal: (total) => set({ total }),
      addUser: (user) => set((state) => ({ users: [user, ...state.users], total: state.total + 1 })),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) => (u._id === id ? { ...u, ...updates } : u)),
        })),
      removeUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u._id !== id),
          total: Math.max(0, state.total - 1),
          selectedUsers: state.selectedUsers.filter((uid) => uid !== id),
        })),
      removeUsers: (ids) =>
        set((state) => ({
          users: state.users.filter((u) => !ids.includes(u._id)),
          total: Math.max(0, state.total - ids.length),
          selectedUsers: [],
        })),

      // Selection actions
      setSelectedUsers: (ids) => set({ selectedUsers: ids }),
      toggleUserSelection: (id) =>
        set((state) => ({
          selectedUsers: state.selectedUsers.includes(id)
            ? state.selectedUsers.filter((uid) => uid !== id)
            : [...state.selectedUsers, id],
        })),
      selectAllUsers: (ids) => set({ selectedUsers: ids }),
      clearSelection: () => set({ selectedUsers: [] }),

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
    { name: 'UsersStore' }
  )
);