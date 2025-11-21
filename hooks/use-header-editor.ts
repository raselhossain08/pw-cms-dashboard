import { useHeaderStore } from '@/lib/store/header-store';
import { useEffect } from 'react';

export const useHeaderEditor = () => {
    const {
        activeHeader,
        loading,
        error,
        isDirty,
        editingSection,
        currentAction,
        fetchActiveHeader,
        saveAll,
        updateLogo,
        updateTopBar,
        updateNavigation,
        updateCart,
        updateUserMenu,
        updateMenuOrder,
        setEditingSection,
        setDirty,
        clearError,
    } = useHeaderStore();

    useEffect(() => {
        fetchActiveHeader();
    }, [fetchActiveHeader]);

    return {
        header: activeHeader,
        loading,
        error,
        isDirty,
        editingSection,
        isSaving: currentAction === 'saving-all',
        saveAll,
        updateLogo,
        updateTopBar,
        updateNavigation,
        updateCart,
        updateUserMenu,
        updateMenuOrder,
        setEditingSection,
        setDirty,
        clearError,
        refetch: fetchActiveHeader,
    };
};
