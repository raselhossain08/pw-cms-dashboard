import { useState, useCallback } from 'react';
import { useToast } from '@/context/ToastContext';
import { paymentsService, Transaction, Invoice, Payout, PaymentAnalytics } from '@/services/payments.service';

// Re-export types from service
export type { Transaction, Invoice, Payout, PaymentAnalytics } from '@/services/payments.service';

export const usePayments = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const { push } = useToast();

    // Fetch all transactions with filters
    const fetchTransactions = useCallback(
        async (filters: {
            page?: number;
            limit?: number;
            status?: string;
            method?: string;
            search?: string;
            startDate?: string;
            endDate?: string;
        } = {}) => {
            setLoading(true);
            setError(null);
            try {
                const response: any = await paymentsService.getAllTransactions(filters);
                setTransactions(response.transactions);
                setPagination({
                    page: response.page,
                    limit: response.limit,
                    total: response.total,
                    totalPages: response.totalPages,
                });
            } catch (err: any) {
                const errorMsg = err?.message || err?.response?.data?.message || 'Failed to fetch transactions';
                setError(errorMsg);
                push({ message: errorMsg, type: 'error' });
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    // Fetch payment analytics
    const fetchAnalytics = useCallback(
        async (filters: { period?: string; startDate?: string; endDate?: string } = {}) => {
            setLoading(true);
            setError(null);
            try {
                const response: any = await paymentsService.getAnalytics(filters);
                setAnalytics(response);
            } catch (err: any) {
                const errorMsg = err?.message || err?.response?.data?.message || 'Failed to fetch analytics';
                setError(errorMsg);
                push({ message: errorMsg, type: 'error' });
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    // Fetch all invoices
    const fetchInvoices = useCallback(
        async (filters: { page?: number; limit?: number; status?: string; search?: string } = {}) => {
            setLoading(true);
            setError(null);
            try {
                const response: any = await paymentsService.getAllInvoices(filters);
                setInvoices(response.invoices);
                setPagination({
                    page: response.page,
                    limit: response.limit,
                    total: response.total,
                    totalPages: response.totalPages,
                });
            } catch (err: any) {
                const errorMsg = err?.message || err?.response?.data?.message || 'Failed to fetch invoices';
                setError(errorMsg);
                push({ message: errorMsg, type: 'error' });
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    // Get transaction details
    const getTransactionDetails = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                const response = await paymentsService.getTransactionById(id);
                return response;
            } catch (err: any) {
                const errorMsg = err?.message || err?.response?.data?.message || 'Failed to fetch transaction details';
                setError(errorMsg);
                push({ message: errorMsg, type: 'error' });
                return null;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    // Get invoice by ID
    const getInvoiceById = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                const response = await paymentsService.getInvoiceById(id);
                return response;
            } catch (err: any) {
                const errorMsg = err?.message || err?.response?.data?.message || 'Failed to fetch invoice';
                setError(errorMsg);
                push({ message: errorMsg, type: 'error' });
                return null;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    // Create manual invoice
    const createInvoice = useCallback(
        async (invoiceData: any) => {
            setLoading(true);
            setError(null);
            try {
                const response = await paymentsService.createInvoice(invoiceData);
                push({ message: 'Invoice created successfully', type: 'success' });
                return response;
            } catch (err: any) {
                const errorMsg = err?.message || err?.response?.data?.message || 'Failed to create invoice';
                setError(errorMsg);
                push({ message: errorMsg, type: 'error' });
                return null;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    // Process refund
    const processRefund = useCallback(
        async (transactionId: string, refundData: { reason: string; amount?: number }) => {
            setLoading(true);
            setError(null);
            try {
                const response = await paymentsService.processRefund(transactionId, refundData);
                push({ message: 'Refund processed successfully', type: 'success' });
                return response;
            } catch (err: any) {
                const errorMsg = err?.message || err?.response?.data?.message || 'Failed to process refund';
                setError(errorMsg);
                push({ message: errorMsg, type: 'error' });
                return null;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    // Fetch instructor payouts
    const fetchPayouts = useCallback(
        async (filters: { page?: number; limit?: number; status?: string } = {}) => {
            setLoading(true);
            setError(null);
            try {
                const response: any = await paymentsService.getAllPayouts(filters);
                setPayouts(response.payouts);
                setPagination({
                    page: response.page,
                    limit: response.limit,
                    total: response.total,
                    totalPages: response.totalPages,
                });
            } catch (err: any) {
                const errorMsg = err?.message || err?.response?.data?.message || 'Failed to fetch payouts';
                setError(errorMsg);
                push({ message: errorMsg, type: 'error' });
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    // Process instructor payout
    const processInstructorPayout = useCallback(
        async (instructorId: string, payoutData: any) => {
            setLoading(true);
            setError(null);
            try {
                const response = await paymentsService.processPayout(instructorId, payoutData);
                push({ message: 'Payout processed successfully', type: 'success' });
                return response;
            } catch (err: any) {
                const errorMsg = err?.message || err?.response?.data?.message || 'Failed to process payout';
                setError(errorMsg);
                push({ message: errorMsg, type: 'error' });
                return null;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    // Export payment report
    const exportReport = useCallback(
        async (filters: { format?: string; startDate?: string; endDate?: string } = {}) => {
            setLoading(true);
            setError(null);
            try {
                await paymentsService.exportReport(filters);
                push({ message: 'Report exported successfully', type: 'success' });
            } catch (err: any) {
                const errorMsg = err?.message || err?.response?.data?.message || 'Failed to export report';
                setError(errorMsg);
                push({ message: errorMsg, type: 'error' });
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    return {
        transactions,
        invoices,
        payouts,
        analytics,
        loading,
        error,
        pagination,
        fetchTransactions,
        fetchAnalytics,
        fetchInvoices,
        getTransactionDetails,
        getInvoiceById,
        createInvoice,
        processRefund,
        fetchPayouts,
        processInstructorPayout,
        exportReport,
    };
};
