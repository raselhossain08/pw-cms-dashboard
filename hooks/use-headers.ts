// src/hooks/use-headers.ts
import { useEffect } from 'react';
import { useHeaderStore } from '@/lib/store/header-store';

export const useHeaders = () => {
    const {
        activeHeader,
        loading,
        error,
        fetchActiveHeader
    } = useHeaderStore();

    useEffect(() => {
        fetchActiveHeader();
    }, [fetchActiveHeader]);

    return {
        activeHeader,
        loading,
        error,
        refetch: fetchActiveHeader
    };
};