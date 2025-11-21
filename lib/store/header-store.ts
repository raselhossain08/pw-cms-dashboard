// src/lib/store/header-store.ts
import { create } from 'zustand';
import { produce } from 'immer';
import { headerService } from '@/lib/api/header-service';
import type { Header } from '@/types/header';

interface HeaderState {
    activeHeader: Header | null;
    loading: boolean;
    error: string | null;
    currentAction: string | null;
    isDirty: boolean;
    editingSection: string | null;
    uploadProgress: Record<string, number>;
    originalHeader: Header | null; // For rollback on error

    // Actions
    fetchActiveHeader: () => Promise<void>;
    saveAll: () => Promise<void>;
    updateActiveHeader: (data: any) => Promise<void>;
    updateLogo: (logoData: { dark: string; light: string; alt: string }) => Promise<void>;
    updateTopBar: (topBarData: any) => Promise<void>;
    updateNavigation: (navigationData: any) => Promise<void>;
    updateCart: (cartData: any) => Promise<void>;
    updateUserMenu: (userMenuData: any) => Promise<void>;
    updateSEO: (seoData: any) => Promise<void>;
    updateTheme: (themeData: any) => Promise<void>;
    updateMenuOrder: (menuItems: Array<{ id: string; position: number }>) => Promise<void>;
    setEditingSection: (section: string | null) => void;
    setUploadProgress: (field: string, progress: number) => void;
    clearUploadProgress: (field: string) => void;
    setDirty: (dirty: boolean) => void;
    clearError: () => void;
    optimisticUpdate: (section: keyof Header, data: any) => void;
    rollback: () => void;
}

export const useHeaderStore = create<HeaderState>((set, get) => ({
    activeHeader: null,
    loading: false,
    error: null,
    currentAction: null,
    isDirty: false,
    editingSection: null,
    uploadProgress: {},
    originalHeader: null,

    fetchActiveHeader: async () => {
        set({ loading: true, error: null });
        try {
            const activeHeader = await headerService.getActiveHeader();
            set({
                activeHeader,
                originalHeader: activeHeader,
                loading: false,
                isDirty: false
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch header', loading: false });
        }
    },

    saveAll: async () => {
        const { activeHeader } = get();
        if (!activeHeader || !get().isDirty) return;

        set({ loading: true, error: null, currentAction: 'saving-all' });

        try {
            const updatedHeader = await headerService.updateActiveHeader(activeHeader);
            set({
                activeHeader: updatedHeader,
                originalHeader: updatedHeader,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to save changes',
                loading: false,
                currentAction: null
            });
        }
    },

    updateActiveHeader: async (data: any) => {
        const { activeHeader } = get();
        set({ loading: true, error: null, currentAction: 'updating', originalHeader: activeHeader });

        try {
            const updatedHeader = await headerService.updateActiveHeader(data);
            set({
                activeHeader: updatedHeader,
                originalHeader: updatedHeader,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update header',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateLogo: async (logoData) => {
        const { activeHeader } = get();
        set({ loading: true, error: null, currentAction: 'updating-logo', originalHeader: activeHeader });

        // Optimistic update
        if (activeHeader) {
            set(produce((state: HeaderState) => {
                if (state.activeHeader) {
                    state.activeHeader.logo = logoData;
                }
            }));
        }

        try {
            const updatedHeader = await headerService.updateLogo(logoData);
            set({
                activeHeader: updatedHeader,
                originalHeader: updatedHeader,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update logo',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateTopBar: async (topBarData) => {
        const { activeHeader } = get();
        set({ loading: true, error: null, currentAction: 'updating-topbar', originalHeader: activeHeader });

        // Optimistic update
        if (activeHeader) {
            set(produce((state: HeaderState) => {
                if (state.activeHeader) {
                    state.activeHeader.topBar = topBarData;
                }
            }));
        }

        try {
            const updatedHeader = await headerService.updateTopBar(topBarData);
            set({
                activeHeader: updatedHeader,
                originalHeader: updatedHeader,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update topbar',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateNavigation: async (navigationData) => {
        const { activeHeader } = get();
        set({ loading: true, error: null, currentAction: 'updating-navigation', originalHeader: activeHeader });

        // Optimistic update
        if (activeHeader) {
            set(produce((state: HeaderState) => {
                if (state.activeHeader) {
                    state.activeHeader.navigation = navigationData;
                }
            }));
        }

        try {
            const updatedHeader = await headerService.updateNavigation(navigationData);
            set({
                activeHeader: updatedHeader,
                originalHeader: updatedHeader,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update navigation',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateCart: async (cartData) => {
        const { activeHeader } = get();
        set({ loading: true, error: null, currentAction: 'updating-cart', originalHeader: activeHeader });

        try {
            const updatedHeader = await headerService.updateCart(cartData);
            set({
                activeHeader: updatedHeader,
                originalHeader: updatedHeader,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update cart',
                loading: false,
                currentAction: null
            });
        }
    },

    updateUserMenu: async (userMenuData) => {
        const { activeHeader } = get();
        set({ loading: true, error: null, currentAction: 'updating-user-menu', originalHeader: activeHeader });

        try {
            const updatedHeader = await headerService.updateUserMenu(userMenuData);
            set({
                activeHeader: updatedHeader,
                originalHeader: updatedHeader,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update user menu',
                loading: false,
                currentAction: null
            });
        }
    },

    updateSEO: async (seoData) => {
        const { activeHeader } = get();
        set({ loading: true, error: null, currentAction: 'updating-seo', originalHeader: activeHeader });

        // Optimistic update
        if (activeHeader) {
            set(produce((state: HeaderState) => {
                if (state.activeHeader) {
                    state.activeHeader.seo = seoData;
                }
            }));
        }

        try {
            const updatedHeader = await headerService.updateSEO(seoData);
            set({
                activeHeader: updatedHeader,
                originalHeader: updatedHeader,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update SEO',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateTheme: async (themeData) => {
        const { activeHeader } = get();
        set({ loading: true, error: null, currentAction: 'updating-theme', originalHeader: activeHeader });

        // Optimistic update
        if (activeHeader) {
            set(produce((state: HeaderState) => {
                if (state.activeHeader) {
                    state.activeHeader.theme = themeData;
                }
            }));
        }

        try {
            const updatedHeader = await headerService.updateTheme(themeData);
            set({
                activeHeader: updatedHeader,
                originalHeader: updatedHeader,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update theme',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateMenuOrder: async (menuItems) => {
        const { activeHeader } = get();
        set({ loading: true, error: null, currentAction: 'reordering-menu', originalHeader: activeHeader });

        try {
            const updatedHeader = await headerService.updateMenuOrder(menuItems);
            set({
                activeHeader: updatedHeader,
                originalHeader: updatedHeader,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to reorder menu',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    setEditingSection: (section) => set({ editingSection: section }),

    setUploadProgress: (field, progress) =>
        set(produce((state: HeaderState) => {
            state.uploadProgress[field] = progress;
        })),

    clearUploadProgress: (field) =>
        set(produce((state: HeaderState) => {
            delete state.uploadProgress[field];
        })),

    setDirty: (dirty) => set({ isDirty: dirty }),

    clearError: () => set({ error: null }),

    optimisticUpdate: (section, data) =>
        set(produce((state: HeaderState) => {
            if (state.activeHeader) {
                (state.activeHeader as any)[section] = data;
                state.isDirty = true;
            }
        })),

    rollback: () => {
        const { originalHeader } = get();
        if (originalHeader) {
            set({ activeHeader: originalHeader, isDirty: false });
        }
    },
}));