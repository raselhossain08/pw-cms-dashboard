import { create } from 'zustand';
import type {
    ActivityLog,
    ErrorLog,
    AiLog,
    ChatLog,
    SystemLog,
    ActivityStats,
    ErrorStats,
    AiStats,
    ChatStats,
    SystemStats,
    LogFilters,
    LogsPagination,
} from '@/types/activity-logs';

interface ActivityLogsState {
    // Data
    activityLogs: ActivityLog[];
    errorLogs: ErrorLog[];
    aiLogs: AiLog[];
    chatLogs: ChatLog[];
    systemLogs: SystemLog[];

    // Stats
    activityStats: ActivityStats | null;
    errorStats: ErrorStats | null;
    aiStats: AiStats | null;
    chatStats: ChatStats | null;
    systemStats: SystemStats | null;

    // Pagination
    activityPagination: LogsPagination | null;
    errorPagination: LogsPagination | null;
    aiPagination: LogsPagination | null;
    chatPagination: LogsPagination | null;
    systemPagination: LogsPagination | null;

    // Loading states
    isLoadingActivity: boolean;
    isLoadingErrors: boolean;
    isLoadingAi: boolean;
    isLoadingChat: boolean;
    isLoadingSystem: boolean;
    isLoadingStats: boolean;

    // Error states
    activityError: string | null;
    errorLogsError: string | null;
    aiError: string | null;
    chatError: string | null;
    systemError: string | null;

    // Filters
    activityFilters: LogFilters;
    errorFilters: LogFilters;
    aiFilters: LogFilters;
    chatFilters: LogFilters;
    systemFilters: LogFilters;

    // Actions
    setActivityLogs: (logs: ActivityLog[], pagination: LogsPagination) => void;
    setErrorLogs: (logs: ErrorLog[], pagination: LogsPagination) => void;
    setAiLogs: (logs: AiLog[], pagination: LogsPagination) => void;
    setChatLogs: (logs: ChatLog[], pagination: LogsPagination) => void;
    setSystemLogs: (logs: SystemLog[], pagination: LogsPagination) => void;

    setActivityStats: (stats: ActivityStats) => void;
    setErrorStats: (stats: ErrorStats) => void;
    setAiStats: (stats: AiStats) => void;
    setChatStats: (stats: ChatStats) => void;
    setSystemStats: (stats: SystemStats) => void;

    setActivityFilters: (filters: LogFilters) => void;
    setErrorFilters: (filters: LogFilters) => void;
    setAiFilters: (filters: LogFilters) => void;
    setChatFilters: (filters: LogFilters) => void;
    setSystemFilters: (filters: LogFilters) => void;

    setLoadingActivity: (loading: boolean) => void;
    setLoadingErrors: (loading: boolean) => void;
    setLoadingAi: (loading: boolean) => void;
    setLoadingChat: (loading: boolean) => void;
    setLoadingSystem: (loading: boolean) => void;
    setLoadingStats: (loading: boolean) => void;

    setActivityError: (error: string | null) => void;
    setErrorLogsError: (error: string | null) => void;
    setAiError: (error: string | null) => void;
    setChatError: (error: string | null) => void;
    setSystemError: (error: string | null) => void;

    clearFilters: () => void;
    resetStore: () => void;
}

const initialFilters: LogFilters = {
    page: 1,
    limit: 50,
};

export const useActivityLogsStore = create<ActivityLogsState>((set) => ({
    // Initial data
    activityLogs: [],
    errorLogs: [],
    aiLogs: [],
    chatLogs: [],
    systemLogs: [],

    // Initial stats
    activityStats: null,
    errorStats: null,
    aiStats: null,
    chatStats: null,
    systemStats: null,

    // Initial pagination
    activityPagination: null,
    errorPagination: null,
    aiPagination: null,
    chatPagination: null,
    systemPagination: null,

    // Initial loading states
    isLoadingActivity: false,
    isLoadingErrors: false,
    isLoadingAi: false,
    isLoadingChat: false,
    isLoadingSystem: false,
    isLoadingStats: false,

    // Initial error states
    activityError: null,
    errorLogsError: null,
    aiError: null,
    chatError: null,
    systemError: null,

    // Initial filters
    activityFilters: initialFilters,
    errorFilters: initialFilters,
    aiFilters: initialFilters,
    chatFilters: initialFilters,
    systemFilters: initialFilters,

    // Actions
    setActivityLogs: (logs, pagination) =>
        set({ activityLogs: logs, activityPagination: pagination }),
    setErrorLogs: (logs, pagination) =>
        set({ errorLogs: logs, errorPagination: pagination }),
    setAiLogs: (logs, pagination) =>
        set({ aiLogs: logs, aiPagination: pagination }),
    setChatLogs: (logs, pagination) =>
        set({ chatLogs: logs, chatPagination: pagination }),
    setSystemLogs: (logs, pagination) =>
        set({ systemLogs: logs, systemPagination: pagination }),

    setActivityStats: (stats) => set({ activityStats: stats }),
    setErrorStats: (stats) => set({ errorStats: stats }),
    setAiStats: (stats) => set({ aiStats: stats }),
    setChatStats: (stats) => set({ chatStats: stats }),
    setSystemStats: (stats) => set({ systemStats: stats }),

    setActivityFilters: (filters) =>
        set((state) => ({ activityFilters: { ...state.activityFilters, ...filters } })),
    setErrorFilters: (filters) =>
        set((state) => ({ errorFilters: { ...state.errorFilters, ...filters } })),
    setAiFilters: (filters) =>
        set((state) => ({ aiFilters: { ...state.aiFilters, ...filters } })),
    setChatFilters: (filters) =>
        set((state) => ({ chatFilters: { ...state.chatFilters, ...filters } })),
    setSystemFilters: (filters) =>
        set((state) => ({ systemFilters: { ...state.systemFilters, ...filters } })),

    setLoadingActivity: (loading) => set({ isLoadingActivity: loading }),
    setLoadingErrors: (loading) => set({ isLoadingErrors: loading }),
    setLoadingAi: (loading) => set({ isLoadingAi: loading }),
    setLoadingChat: (loading) => set({ isLoadingChat: loading }),
    setLoadingSystem: (loading) => set({ isLoadingSystem: loading }),
    setLoadingStats: (loading) => set({ isLoadingStats: loading }),

    setActivityError: (error) => set({ activityError: error }),
    setErrorLogsError: (error) => set({ errorLogsError: error }),
    setAiError: (error) => set({ aiError: error }),
    setChatError: (error) => set({ chatError: error }),
    setSystemError: (error) => set({ systemError: error }),

    clearFilters: () =>
        set({
            activityFilters: initialFilters,
            errorFilters: initialFilters,
            aiFilters: initialFilters,
            chatFilters: initialFilters,
            systemFilters: initialFilters,
        }),

    resetStore: () =>
        set({
            activityLogs: [],
            errorLogs: [],
            aiLogs: [],
            chatLogs: [],
            systemLogs: [],
            activityStats: null,
            errorStats: null,
            aiStats: null,
            chatStats: null,
            systemStats: null,
            activityPagination: null,
            errorPagination: null,
            aiPagination: null,
            chatPagination: null,
            systemPagination: null,
            isLoadingActivity: false,
            isLoadingErrors: false,
            isLoadingAi: false,
            isLoadingChat: false,
            isLoadingSystem: false,
            isLoadingStats: false,
            activityError: null,
            errorLogsError: null,
            aiError: null,
            chatError: null,
            systemError: null,
            activityFilters: initialFilters,
            errorFilters: initialFilters,
            aiFilters: initialFilters,
            chatFilters: initialFilters,
            systemFilters: initialFilters,
        }),
}));
