// src/lib/store/footer-store.ts
import { create } from 'zustand';
import { produce } from 'immer';
import { footerService } from '@/lib/api/footer-service';
import type { Footer } from '@/types/footer';

interface FooterState {
    activeFooter: Footer | null;
    loading: boolean;
    error: string | null;
    currentAction: string | null;
    isDirty: boolean;
    editingSection: string | null;
    uploadProgress: Record<string, number>;
    originalFooter: Footer | null; // For rollback on error

    // Actions
    fetchActiveFooter: () => Promise<void>;
    saveAll: () => Promise<void>;
    updateActiveFooter: (data: any) => Promise<void>;
    updateLogo: (logoData: { src: string; alt: string; width: number; height: number }) => Promise<void>;
    updateDescription: (descriptionData: { text: string; enabled: boolean }) => Promise<void>;
    updateSocialMedia: (socialMediaData: any) => Promise<void>;
    updateSections: (sectionsData: any) => Promise<void>;
    updateNewsletter: (newsletterData: any) => Promise<void>;
    updateContact: (contactData: any) => Promise<void>;
    updateBottomLinks: (bottomLinksData: any) => Promise<void>;
    updateLanguageSelector: (languageSelectorData: any) => Promise<void>;
    updateCopyright: (copyrightData: any) => Promise<void>;
    updateStats: (statsData: any) => Promise<void>;
    updateStyling: (stylingData: any) => Promise<void>;
    updateSEO: (seoData: any) => Promise<void>;
    toggleFooter: (enabled: boolean) => Promise<void>;
    setEditingSection: (section: string | null) => void;
    setUploadProgress: (field: string, progress: number) => void;
    clearUploadProgress: (field: string) => void;
    setDirty: (dirty: boolean) => void;
    clearError: () => void;
    optimisticUpdate: (section: keyof Footer, data: any) => void;
    rollback: () => void;
}

export const useFooterStore = create<FooterState>((set, get) => ({
    activeFooter: null,
    loading: false,
    error: null,
    currentAction: null,
    isDirty: false,
    editingSection: null,
    uploadProgress: {},
    originalFooter: null,

    fetchActiveFooter: async () => {
        set({ loading: true, error: null });
        try {
            const activeFooter = await footerService.getActiveFooter();
            set({
                activeFooter,
                originalFooter: activeFooter,
                loading: false,
                isDirty: false
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch footer', loading: false });
        }
    },

    saveAll: async () => {
        const { activeFooter } = get();
        if (!activeFooter || !get().isDirty) return;

        set({ loading: true, error: null, currentAction: 'saving-all' });

        try {
            const updatedFooter = await footerService.updateActiveFooter(activeFooter);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
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

    updateActiveFooter: async (data: any) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating', originalFooter: activeFooter });

        try {
            const updatedFooter = await footerService.updateActiveFooter(data);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update footer',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateLogo: async (logoData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-logo', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.logo = { ...state.activeFooter.logo, ...logoData };
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateLogo(logoData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
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

    updateDescription: async (descriptionData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-description', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.description = { ...state.activeFooter.description, ...descriptionData };
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateDescription(descriptionData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update description',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateSocialMedia: async (socialMediaData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-social-media', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.socialMedia = socialMediaData;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateSocialMedia(socialMediaData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update social media',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateSections: async (sectionsData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-sections', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.sections = sectionsData;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateSections(sectionsData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update sections',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateNewsletter: async (newsletterData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-newsletter', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.newsletter = newsletterData;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateNewsletter(newsletterData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update newsletter',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateContact: async (contactData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-contact', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.contact = contactData;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateContact(contactData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update contact',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateBottomLinks: async (bottomLinksData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-bottom-links', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.bottomLinks = bottomLinksData;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateBottomLinks(bottomLinksData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update bottom links',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateLanguageSelector: async (languageSelectorData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-language-selector', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.languageSelector = languageSelectorData;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateLanguageSelector(languageSelectorData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update language selector',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateCopyright: async (copyrightData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-copyright', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.copyright = copyrightData;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateCopyright(copyrightData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update copyright',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateStats: async (statsData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-stats', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.stats = statsData;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateStats(statsData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update stats',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateStyling: async (stylingData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-styling', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.styling = stylingData;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateStyling(stylingData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update styling',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    updateSEO: async (seoData) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'updating-seo', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.seo = seoData;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.updateSEO(seoData);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
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

    toggleFooter: async (enabled) => {
        const { activeFooter } = get();
        set({ loading: true, error: null, currentAction: 'toggling-footer', originalFooter: activeFooter });

        // Optimistic update
        if (activeFooter) {
            set(produce((state: FooterState) => {
                if (state.activeFooter) {
                    state.activeFooter.enabled = enabled;
                }
            }));
        }

        try {
            const updatedFooter = await footerService.toggleFooter(enabled);
            set({
                activeFooter: updatedFooter,
                originalFooter: updatedFooter,
                loading: false,
                currentAction: null,
                isDirty: false
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to toggle footer',
                loading: false,
                currentAction: null
            });
            get().rollback();
        }
    },

    setEditingSection: (section) => set({ editingSection: section }),

    setUploadProgress: (field, progress) =>
        set(produce((state: FooterState) => {
            state.uploadProgress[field] = progress;
        })),

    clearUploadProgress: (field) =>
        set(produce((state: FooterState) => {
            delete state.uploadProgress[field];
        })),

    setDirty: (dirty) => set({ isDirty: dirty }),

    clearError: () => set({ error: null }),

    optimisticUpdate: (section, data) =>
        set(produce((state: FooterState) => {
            if (state.activeFooter) {
                (state.activeFooter as any)[section] = data;
                state.isDirty = true;
            }
        })),

    rollback: () => {
        const { originalFooter } = get();
        if (originalFooter) {
            set({ activeFooter: originalFooter, isDirty: false });
        }
    },
}));