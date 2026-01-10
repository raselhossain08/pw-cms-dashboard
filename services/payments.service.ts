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
    } | null;
    amount: number;
    currency: string;
    type: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    description: string;
    gateway: string;
    gatewayTransactionId?: string;
    createdAt?: string;
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
    revenueChart?: Array<{
        date: string;
        revenue: number;
    }>;
}

class PaymentsService {
    // Helper function to normalize Mongoose documents
    private normalizeTransaction(transaction: any): Transaction {
        // Handle Mongoose _doc structure
        const doc = transaction._doc || transaction;

        // Helper to convert MongoDB ObjectId buffer to string
        const toIdString = (id: any): string => {
            if (!id) return '';
            if (typeof id === 'string') return id;
            if (id.buffer && typeof id.buffer === 'object') {
                // Convert buffer array to hex string - only process available indices
                const bytes: number[] = [];
                for (let i = 0; i < 12 && id.buffer[i] !== undefined; i++) {
                    bytes.push(id.buffer[i]);
                }
                return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
            }
            // Handle MongoDB ObjectId toString
            if (id && typeof id.toString === 'function') {
                return id.toString();
            }
            return String(id);
        };

        // Enhanced helper to check and process date values
        const processDate = (val: any): string | undefined => {
            if (!val) return undefined;

            // Handle empty objects (common Mongoose issue)
            if (typeof val === 'object' && Object.keys(val).length === 0) return undefined;

            // Handle MongoDB Date objects
            if (val && typeof val === 'object' && val.$date) {
                const date = new Date(val.$date);
                return !isNaN(date.getTime()) ? date.toISOString() : undefined;
            }

            // Handle Mongoose Date objects
            if (val && typeof val.getTime === 'function') {
                return !isNaN(val.getTime()) ? val.toISOString() : undefined;
            }

            // Handle string dates
            if (typeof val === 'string') {
                const date = new Date(val);
                return !isNaN(date.getTime()) ? date.toISOString() : undefined;
            }

            // Handle timestamp numbers
            if (typeof val === 'number') {
                const date = new Date(val);
                return !isNaN(date.getTime()) ? date.toISOString() : undefined;
            }

            // Try to parse as Date directly
            try {
                const date = new Date(val);
                return !isNaN(date.getTime()) ? date.toISOString() : undefined;
            } catch {
                return undefined;
            }
        };

        // Enhanced helper to normalize user data
        const normalizeUser = (user: any) => {
            if (!user) return null;

            // Handle different user data structures from MongoDB population
            let userData = null;

            // Case 1: Direct user object (standard case)
            if (user.email && user._id) {
                userData = user;
            }
            // Case 2: User data in _doc
            else if (user._doc && user._doc.email) {
                userData = user._doc;
            }
            // Case 3: Mongoose populated structure
            else if (user.$__ && user.$__.populated && user.$__.populated.user) {
                // Try to get user from populated options
                const populatedUser = user.$__.populated.user;

                // Check if it's in _childDocs
                if (populatedUser.options && populatedUser.options._childDocs) {
                    const childDocs = populatedUser.options._childDocs;
                    // Find the first valid child doc with email
                    for (const childDoc of childDocs) {
                        if (childDoc && childDoc._doc && childDoc._doc.email) {
                            userData = childDoc._doc;
                            break;
                        }
                        // Sometimes data is directly in the child doc
                        else if (childDoc && childDoc.email) {
                            userData = childDoc;
                            break;
                        }
                    }
                }
            }
            // Case 4: Check if the transaction itself has direct user fields
            else if (transaction.user && typeof transaction.user === 'object') {
                // Sometimes user data is nested differently
                const userRef = transaction.user;
                if (userRef.email) {
                    userData = userRef;
                }
            }

            // If still no userData found, try to extract from Mongoose structure
            if (!userData && transaction.$__ && transaction.$__.populated && transaction.$__.populated.user) {
                const populatedUser = transaction.$__.populated.user;

                // Check if it's in _childDocs at transaction level
                if (populatedUser.options && populatedUser.options._childDocs) {
                    const childDocs = populatedUser.options._childDocs;
                    for (const childDoc of childDocs) {
                        if (childDoc && childDoc._doc && childDoc._doc.email) {
                            userData = childDoc._doc;
                            break;
                        } else if (childDoc && childDoc.email) {
                            userData = childDoc;
                            break;
                        }
                    }
                }
            }

            // If still no userData found, return null
            if (!userData || !userData.email) {
                return null;
            }

            return {
                _id: toIdString(userData._id),
                firstName: userData.firstName || 'Unknown',
                lastName: userData.lastName || 'User',
                email: userData.email,
                avatar: userData.avatar,
            };
        };

        // Try to extract dates from transaction ID if available (fallback)
        const extractDateFromTransactionId = (txnId: string): string | undefined => {
            if (!txnId) return undefined;

            // Look for timestamp patterns in transaction ID
            const timestampMatch = txnId.match(/(\d{13})/); // 13-digit timestamp
            if (timestampMatch) {
                const timestamp = parseInt(timestampMatch[1]);
                const date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            }

            // Look for shorter timestamp patterns
            const shortTimestampMatch = txnId.match(/(\d{10})/); // 10-digit timestamp
            if (shortTimestampMatch) {
                const timestamp = parseInt(shortTimestampMatch[1]) * 1000; // Convert to milliseconds
                const date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            }

            return undefined;
        };

        // Process dates with fallback logic
        const createdAt = processDate(doc.createdAt) ||
            processDate(doc.updatedAt) ||
            extractDateFromTransactionId(doc.transactionId) ||
            undefined;

        const processedAt = processDate(doc.processedAt) ||
            processDate(doc.createdAt) ||
            undefined;

        return {
            _id: toIdString(doc._id),
            transactionId: doc.transactionId,
            user: normalizeUser(doc.user || transaction.user),
            amount: doc.amount,
            currency: doc.currency,
            type: doc.type,
            status: doc.status,
            description: doc.description,
            gateway: doc.gateway,
            gatewayTransactionId: doc.gatewayTransactionId,
            createdAt,
            processedAt,
            refundReason: doc.refundReason,
            refundedAt: processDate(doc.refundedAt),
            refundAmount: doc.refundAmount,
        };
    }

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
            const { data } = await apiClient.get<any>("/admin/payments/transactions", { params });

            // Normalize transactions to handle Mongoose _doc structure
            if (data?.data?.transactions && Array.isArray(data.data.transactions)) {
                data.data.transactions = data.data.transactions.map((t: any) => this.normalizeTransaction(t));
            }
            // Also handle if transactions are directly in data
            else if (data?.transactions && Array.isArray(data.transactions)) {
                data.transactions = data.transactions.map((t: any) => this.normalizeTransaction(t));
            }

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
        type?: string;
        status?: string;
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
