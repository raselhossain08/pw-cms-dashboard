import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
    Agent,
    AgentAnalytics,
    ConversationRow,
    AgentStatus,
} from '@/services/ai-agents.service';

export interface AgentFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    agentType?: string;
    sortBy?: string;
}

interface AIAgentsState {
    // Data
    agents: Agent[];
    selectedAgents: string[];
    analytics: AgentAnalytics | null;
    conversations: ConversationRow[];
    selectedConversation: ConversationRow | null;

    // Pagination
    agentsPagination: {
        page: number;
        limit: number;
        total: number;
    };
    conversationsPagination: {
        page: number;
        limit: number;
        total: number;
    };

    // Loading states
    isLoading: boolean;
    isAnalyticsLoading: boolean;
    isConversationsLoading: boolean;
    isActionLoading: boolean;

    // Error states
    error: string | null;
    analyticsError: string | null;
    conversationsError: string | null;

    // Filters
    filters: AgentFilters;

    // Actions - Data
    setAgents: (agents: Agent[]) => void;
    setAnalytics: (analytics: AgentAnalytics) => void;
    setConversations: (conversations: ConversationRow[]) => void;
    setSelectedConversation: (conversation: ConversationRow | null) => void;
    addAgent: (agent: Agent) => void;
    updateAgent: (id: string, agent: Partial<Agent>) => void;
    removeAgent: (id: string) => void;
    removeAgents: (ids: string[]) => void;

    // Actions - Selection
    setSelectedAgents: (ids: string[]) => void;
    toggleAgentSelection: (id: string) => void;
    selectAllAgents: (ids: string[]) => void;
    clearSelection: () => void;

    // Actions - Loading
    setLoading: (loading: boolean) => void;
    setAnalyticsLoading: (loading: boolean) => void;
    setConversationsLoading: (loading: boolean) => void;
    setActionLoading: (loading: boolean) => void;

    // Actions - Error
    setError: (error: string | null) => void;
    setAnalyticsError: (error: string | null) => void;
    setConversationsError: (error: string | null) => void;
    clearErrors: () => void;

    // Actions - Filters
    setFilters: (filters: Partial<AgentFilters>) => void;
    resetFilters: () => void;

    // Actions - Pagination
    setAgentsPagination: (pagination: Partial<AIAgentsState['agentsPagination']>) => void;
    setConversationsPagination: (pagination: Partial<AIAgentsState['conversationsPagination']>) => void;

    // Actions - Reset
    resetStore: () => void;
}

const initialFilters: AgentFilters = {
    page: 1,
    limit: 10,
};

const initialState = {
    agents: [],
    selectedAgents: [],
    analytics: null,
    conversations: [],
    selectedConversation: null,
    agentsPagination: {
        page: 1,
        limit: 10,
        total: 0,
    },
    conversationsPagination: {
        page: 1,
        limit: 10,
        total: 0,
    },
    isLoading: false,
    isAnalyticsLoading: false,
    isConversationsLoading: false,
    isActionLoading: false,
    error: null,
    analyticsError: null,
    conversationsError: null,
    filters: initialFilters,
};

export const useAIAgentsStore = create<AIAgentsState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Data actions
            setAgents: (agents) => set({ agents }),
            setAnalytics: (analytics) => set({ analytics }),
            setConversations: (conversations) => set({ conversations }),
            setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
            addAgent: (agent) =>
                set((state) => ({
                    agents: [agent, ...state.agents],
                    agentsPagination: {
                        ...state.agentsPagination,
                        total: state.agentsPagination.total + 1,
                    },
                })),
            updateAgent: (id, updates) =>
                set((state) => ({
                    agents: state.agents.map((a) => (a._id === id ? { ...a, ...updates } : a)),
                })),
            removeAgent: (id) =>
                set((state) => ({
                    agents: state.agents.filter((a) => a._id !== id),
                    agentsPagination: {
                        ...state.agentsPagination,
                        total: Math.max(0, state.agentsPagination.total - 1),
                    },
                    selectedAgents: state.selectedAgents.filter((aid) => aid !== id),
                })),
            removeAgents: (ids) =>
                set((state) => ({
                    agents: state.agents.filter((a) => !ids.includes(a._id)),
                    agentsPagination: {
                        ...state.agentsPagination,
                        total: Math.max(0, state.agentsPagination.total - ids.length),
                    },
                    selectedAgents: [],
                })),

            // Selection actions
            setSelectedAgents: (ids) => set({ selectedAgents: ids }),
            toggleAgentSelection: (id) =>
                set((state) => ({
                    selectedAgents: state.selectedAgents.includes(id)
                        ? state.selectedAgents.filter((aid) => aid !== id)
                        : [...state.selectedAgents, id],
                })),
            selectAllAgents: (ids) => set({ selectedAgents: ids }),
            clearSelection: () => set({ selectedAgents: [] }),

            // Loading actions
            setLoading: (loading) => set({ isLoading: loading }),
            setAnalyticsLoading: (loading) => set({ isAnalyticsLoading: loading }),
            setConversationsLoading: (loading) => set({ isConversationsLoading: loading }),
            setActionLoading: (loading) => set({ isActionLoading: loading }),

            // Error actions
            setError: (error) => set({ error }),
            setAnalyticsError: (error) => set({ analyticsError: error }),
            setConversationsError: (error) => set({ conversationsError: error }),
            clearErrors: () => set({ error: null, analyticsError: null, conversationsError: null }),

            // Filter actions
            setFilters: (filters) =>
                set((state) => ({
                    filters: { ...state.filters, ...filters },
                })),
            resetFilters: () => set({ filters: initialFilters }),

            // Pagination actions
            setAgentsPagination: (pagination) =>
                set((state) => ({
                    agentsPagination: { ...state.agentsPagination, ...pagination },
                })),
            setConversationsPagination: (pagination) =>
                set((state) => ({
                    conversationsPagination: { ...state.conversationsPagination, ...pagination },
                })),

            // Reset action
            resetStore: () => set(initialState),
        }),
        { name: 'AIAgentsStore' }
    )
);
