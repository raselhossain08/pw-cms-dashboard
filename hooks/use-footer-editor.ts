import { useFooterStore } from "@/lib/store/footer-store";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";

export const useFooterEditor = () => {
    const {
        activeFooter,
        loading,
        error,
        fetchActiveFooter,
        updateLogo,
        updateSections,
        updateSocialMedia,
        updateNewsletter,
        updateContact,
        toggleFooter,
    } = useFooterStore();

    // Fetch footer data on mount
    useEffect(() => {
        fetchActiveFooter();
    }, [fetchActiveFooter]);

    // Clear error with toast
    const clearError = useCallback(() => {
        if (error) {
            // The error is managed by the store, so we'll just trigger a refetch
            fetchActiveFooter();
        }
    }, [error, fetchActiveFooter]);

    // Save all changes (for potential future bulk save functionality)
    const saveAll = useCallback(async () => {
        if (!activeFooter) return;

        try {
            toast.info("Saving footer changes...", {
                duration: 1000,
            });

            // Note: In the current implementation, changes are saved immediately
            // This function serves as a placeholder for potential bulk save functionality

            toast.success("All footer changes saved successfully!", {
                duration: 3000,
            });
        } catch (error) {
            toast.error("Failed to save footer changes", {
                description: "Please try again or refresh the page.",
                duration: 4000,
            });
        }
    }, [activeFooter]);

    // Toggle footer visibility
    const handleToggleFooter = useCallback(
        async (enabled: boolean) => {
            try {
                await toggleFooter(enabled);
                toast.success(
                    enabled ? "Footer enabled" : "Footer disabled",
                    {
                        description: enabled
                            ? "Footer is now visible on your website"
                            : "Footer is now hidden from your website",
                        duration: 3000,
                    }
                );
            } catch (error) {
                toast.error("Failed to toggle footer", {
                    description: "Please try again.",
                    duration: 4000,
                });
            }
        },
        [toggleFooter]
    );

    // Update logo with toast
    const updateLogoWithToast = useCallback(
        async (logoData: any) => {
            try {
                await updateLogo(logoData);
                toast.success("Logo updated successfully", {
                    duration: 2000,
                });
            } catch (error) {
                toast.error("Failed to update logo", {
                    description: "Please check your inputs and try again.",
                    duration: 3000,
                });
            }
        },
        [updateLogo]
    );

    // Update sections with toast
    const updateSectionsWithToast = useCallback(
        async (sectionsData: any) => {
            try {
                await updateSections(sectionsData);
                toast.success("Navigation sections updated", {
                    duration: 2000,
                });
            } catch (error) {
                toast.error("Failed to update sections", {
                    description: "Please check your inputs and try again.",
                    duration: 3000,
                });
            }
        },
        [updateSections]
    );

    // Update social media with toast
    const updateSocialMediaWithToast = useCallback(
        async (socialData: any) => {
            try {
                await updateSocialMedia(socialData);
                toast.success("Social media links updated", {
                    duration: 2000,
                });
            } catch (error) {
                toast.error("Failed to update social media", {
                    description: "Please check your inputs and try again.",
                    duration: 3000,
                });
            }
        },
        [updateSocialMedia]
    );

    // Update newsletter with toast
    const updateNewsletterWithToast = useCallback(
        async (newsletterData: any) => {
            try {
                await updateNewsletter(newsletterData);
                toast.success("Newsletter settings updated", {
                    duration: 2000,
                });
            } catch (error) {
                toast.error("Failed to update newsletter", {
                    description: "Please check your inputs and try again.",
                    duration: 3000,
                });
            }
        },
        [updateNewsletter]
    );

    // Update contact with toast
    const updateContactWithToast = useCallback(
        async (contactData: any) => {
            try {
                await updateContact(contactData);
                toast.success("Contact information updated", {
                    duration: 2000,
                });
            } catch (error) {
                toast.error("Failed to update contact", {
                    description: "Please check your inputs and try again.",
                    duration: 3000,
                });
            }
        },
        [updateContact]
    );

    // Check if there are any unsaved changes (placeholder for future functionality)
    const isDirty = useMemo(() => {
        // Since changes are saved immediately, this is always false
        // This could be enhanced in the future for draft functionality
        return false;
    }, []);

    // Check if any save operation is in progress
    const isSaving = useMemo(() => {
        return loading;
    }, [loading]);

    return {
        // State
        footer: activeFooter,
        loading,
        error,
        isDirty,
        isSaving,

        // Actions
        saveAll,
        clearError,
        toggleFooter: handleToggleFooter,

        // Update actions with toast notifications
        updateLogo: updateLogoWithToast,
        updateSections: updateSectionsWithToast,
        updateSocialMedia: updateSocialMediaWithToast,
        updateNewsletter: updateNewsletterWithToast,
        updateContact: updateContactWithToast,

        // Raw actions (without toast) - for when component handles its own feedback
        updateLogoRaw: updateLogo,
        updateSectionsRaw: updateSections,
        updateSocialMediaRaw: updateSocialMedia,
        updateNewsletterRaw: updateNewsletter,
        updateContactRaw: updateContact,

        // Utils
        refresh: fetchActiveFooter,
    };
};