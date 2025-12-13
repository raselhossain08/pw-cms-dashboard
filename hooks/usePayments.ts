import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export interface Transaction {
    _id: string;
    transactionId: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
    amount: number;
    currency: string;
    type: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    description: string;
    gateway: string;
    gatewayTransactionId?: string;
    createdAt: string;
    processedAt?: string;
    refundReason?: string;
    refundedAt?: string;
    refundAmount?: number;
}

export interface Invoice {
    _id: string;
    invoiceNumber: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
    amount: number;
    tax?: number;
    total: number;
    status: string;
    invoiceDate: string;
    dueDate: string;
    paidAt?: string;
    billingInfo: {
        companyName: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        taxId?: string;
    };
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    createdAt: string;
}

export interface Payout {
    id: string;
    instructorName: string;
    email: string;
    avatar?: string;
    courseCount: number;
    totalEarnings: number;
    nextPayout: string;
    status: 'scheduled' | 'processing' | 'paid';
}

export interface PaymentAnalytics {
    overview: {
        totalRevenue: number;
        successfulPayments: number;
        failedPayments: number;
        refundedPayments: number;
        refundedAmount: number;
        refundRate: string;
    };
    methodBreakdown: Array<{
        method: string;
        total: number;
        count: number;
    }>;
    statusBreakdown: Array<{
        status: string;
        count: number;
    }>;
    revenueByDay: Array<{
        date: string;
        revenue: number;
        count: number;
    }>;
}

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

    const getAuthToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    };

    const getAuthHeaders = () => {
        const token = getAuthToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

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
                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value.toString());
                });

                const response = await axios.get(
                    `${API_BASE_URL}/admin/payments/transactions?${params.toString()}`,
                    getAuthHeaders()
                );

                setTransactions(response.data.transactions);
                setPagination({
                    page: response.data.page,
                    limit: response.data.limit,
                    total: response.data.total,
                    totalPages: response.data.totalPages,
                });
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch transactions';
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
                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value.toString());
                });

                const response = await axios.get(
                    `${API_BASE_URL}/admin/payments/analytics?${params.toString()}`,
                    getAuthHeaders()
                );

                setAnalytics(response.data);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch analytics';
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
                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value.toString());
                });

                const response = await axios.get(
                    `${API_BASE_URL}/admin/payments/invoices?${params.toString()}`,
                    getAuthHeaders()
                );

                setInvoices(response.data.invoices);
                setPagination({
                    page: response.data.page,
                    limit: response.data.limit,
                    total: response.data.total,
                    totalPages: response.data.totalPages,
                });
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch invoices';
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
                const response = await axios.get(
                    `${API_BASE_URL}/admin/payments/transactions/${id}`,
                    getAuthHeaders()
                );
                return response.data;
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch transaction details';
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
                const response = await axios.get(
                    `${API_BASE_URL}/admin/payments/invoices/${id}`,
                    getAuthHeaders()
                );
                return response.data;
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch invoice';
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
                const response = await axios.post(
                    `${API_BASE_URL}/admin/payments/invoices`,
                    invoiceData,
                    getAuthHeaders()
                );
                push({ message: 'Invoice created successfully', type: 'success' });
                return response.data;
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to create invoice';
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
                const response = await axios.post(
                    `${API_BASE_URL}/admin/payments/refund/${transactionId}`,
                    refundData,
                    getAuthHeaders()
                );
                push({ message: 'Refund processed successfully', type: 'success' });
                return response.data;
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to process refund';
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
                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value.toString());
                });

                const response = await axios.get(
                    `${API_BASE_URL}/admin/payments/payouts?${params.toString()}`,
                    getAuthHeaders()
                );

                setPayouts(response.data.payouts);
                setPagination({
                    page: response.data.page,
                    limit: response.data.limit,
                    total: response.data.total,
                    totalPages: response.data.totalPages,
                });
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch payouts';
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
                const response = await axios.post(
                    `${API_BASE_URL}/admin/payments/payouts/${instructorId}/process`,
                    payoutData,
                    getAuthHeaders()
                );
                push({ message: 'Payout processed successfully', type: 'success' });
                return response.data;
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to process payout';
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
                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value.toString());
                });

                const response = await axios.get(
                    `${API_BASE_URL}/admin/payments/export?${params.toString()}`,
                    getAuthHeaders()
                );

                // Create download link
                const blob = new Blob([response.data.data], {
                    type: filters.format === 'csv' ? 'text/csv' : 'application/json',
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', response.data.filename);
                document.body.appendChild(link);
                link.click();
                link.remove();

                push({ message: 'Report exported successfully', type: 'success' });
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to export report';
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
