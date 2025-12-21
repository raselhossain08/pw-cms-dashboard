import { apiClient } from "@/lib/api-client";

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
    instructorId: string;
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

class PaymentsService {
    async getAllTransactions(params: {
        page?: number;
        limit?: number;
        status?: string;
        method?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
    } = {}) {
        try {
            const { data } = await apiClient.get("/admin/payments/transactions", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            throw error;
        }
    }

    async getTransactionById(id: string) {
        try {
            const { data } = await apiClient.get(`/admin/payments/transactions/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch transaction ${id}:`, error);
            throw error;
        }
    }

    async processRefund(transactionId: string, refundData: { reason: string; amount?: number }) {
        try {
            const { data } = await apiClient.post(`/admin/payments/refund/${transactionId}`, refundData);
            return data;
        } catch (error) {
            console.error(`Failed to process refund for transaction ${transactionId}:`, error);
            throw error;
        }
    }

    async getAllInvoices(params: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    } = {}) {
        try {
            const { data } = await apiClient.get("/admin/payments/invoices", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch invoices:", error);
            throw error;
        }
    }

    async getInvoiceById(id: string) {
        try {
            const { data } = await apiClient.get(`/admin/payments/invoices/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch invoice ${id}:`, error);
            throw error;
        }
    }

    async createInvoice(invoiceData: {
        user: string;
        amount: number;
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
        status?: string;
        invoiceDate?: string;
        dueDate?: string;
        notes?: string;
    }) {
        try {
            const { data } = await apiClient.post("/admin/payments/invoices", invoiceData);
            return data;
        } catch (error) {
            console.error("Failed to create invoice:", error);
            throw error;
        }
    }

    async getAllPayouts(params: {
        page?: number;
        limit?: number;
        status?: string;
    } = {}) {
        try {
            const { data } = await apiClient.get("/admin/payments/payouts", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch payouts:", error);
            throw error;
        }
    }

    async processPayout(instructorId: string, payoutData: {
        amount?: number;
        notes?: string;
    }) {
        try {
            const { data } = await apiClient.post(`/admin/payments/payouts/${instructorId}/process`, payoutData);
            return data;
        } catch (error) {
            console.error(`Failed to process payout for instructor ${instructorId}:`, error);
            throw error;
        }
    }

    async getAnalytics(params: {
        period?: string;
        startDate?: string;
        endDate?: string;
    } = {}) {
        try {
            const { data } = await apiClient.get("/admin/payments/analytics", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch payment analytics:", error);
            throw error;
        }
    }

    async exportReport(params: {
        format?: string;
        startDate?: string;
        endDate?: string;
    } = {}) {
        try {
            const response = await apiClient.get("/admin/payments/export", { params });

            // Handle file download
            if (response.data && typeof response.data === 'string') {
                const blob = new Blob([response.data], {
                    type: params.format === 'csv' ? 'text/csv' : 'application/json',
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const filename = `payments-report-${Date.now()}.${params.format || 'csv'}`;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }

            return response.data;
        } catch (error) {
            console.error("Failed to export payment report:", error);
            throw error;
        }
    }
}

export const paymentsService = new PaymentsService();
export default paymentsService;
