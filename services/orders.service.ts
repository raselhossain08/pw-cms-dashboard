import { apiClient } from "@/lib/api-client";

export interface Order {
    _id: string;
    orderNumber: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    items: Array<{
        _id: string;
        type: "course" | "product";
        itemId: string;
        title: string;
        price: number;
        quantity: number;
    }>;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: "pending" | "processing" | "completed" | "cancelled" | "refunded";
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    paymentMethod: string;
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface UpdateOrderDto {
    status?: Order["status"];
    paymentStatus?: Order["paymentStatus"];
    trackingNumber?: string;
    notes?: string;
}

class OrdersService {
    async getAllOrders(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        paymentStatus?: string;
        startDate?: string;
        endDate?: string;
    } = {}) {
        try {
            const { data } = await apiClient.get("/orders", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            throw error;
        }
    }

    async getOrderById(id: string) {
        try {
            const { data } = await apiClient.get(`/orders/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch order ${id}:`, error);
            throw error;
        }
    }

    async updateOrder(id: string, orderData: UpdateOrderDto) {
        try {
            const { data } = await apiClient.put(`/orders/${id}`, orderData);
            return data;
        } catch (error) {
            console.error(`Failed to update order ${id}:`, error);
            throw error;
        }
    }

    async cancelOrder(id: string, reason?: string) {
        try {
            const { data } = await apiClient.patch(`/orders/${id}/cancel`, { reason });
            return data;
        } catch (error) {
            console.error(`Failed to cancel order ${id}:`, error);
            throw error;
        }
    }

    async refundOrder(id: string, reason?: string) {
        try {
            const { data } = await apiClient.post(`/orders/${id}/refund`, { reason });
            return data;
        } catch (error) {
            console.error(`Failed to refund order ${id}:`, error);
            throw error;
        }
    }

    async getOrderStats() {
        try {
            const { data } = await apiClient.get("/orders/stats");
            return data;
        } catch (error) {
            console.error("Failed to fetch order stats:", error);
            throw error;
        }
    }

    async deleteOrder(id: string) {
        try {
            const { data } = await apiClient.delete(`/orders/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to delete order ${id}:`, error);
            throw error;
        }
    }

    async resendReceipt(id: string) {
        try {
            const { data } = await apiClient.post(`/orders/${id}/resend-receipt`);
            return data;
        } catch (error) {
            console.error(`Failed to resend receipt for order ${id}:`, error);
            throw error;
        }
    }

    async exportOrders(format: "csv" | "excel" = "csv") {
        try {
            const { data } = await apiClient.get<Blob>("/orders/export", {
                params: { format },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(data);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `orders-${Date.now()}.${format === "csv" ? "csv" : "xlsx"}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error("Failed to export orders:", error);
            throw error;
        }
    }

    async downloadOrder(id: string) {
        try {
            const { data } = await apiClient.get(`/orders/${id}/download`);
            return data;
        } catch (error) {
            console.error(`Failed to download order ${id}:`, error);
            throw error;
        }
    }
}

export const ordersService = new OrdersService();
export default ordersService;
