import { useState, useCallback } from "react";
import { ordersService, Order, UpdateOrderDto } from "@/services/orders.service";
import { useToast } from "@/context/ToastContext";

export interface OrderStats {
    totalOrders: number;
    completed: number;
    pending: number;
    processing: number;
    cancelled: number;
    refunded: number;
    shipped: number;
    totalRevenue: number;
    weeklyGrowth: number;
}

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<OrderStats>({
        totalOrders: 0,
        completed: 0,
        pending: 0,
        processing: 0,
        cancelled: 0,
        refunded: 0,
        shipped: 0,
        totalRevenue: 0,
        weeklyGrowth: 0,
    });
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { push } = useToast(); const fetchOrders = useCallback(
        async (params: {
            page?: number;
            limit?: number;
            search?: string;
            status?: string;
            paymentStatus?: string;
            startDate?: string;
            endDate?: string;
        } = {}) => {
            setLoading(true);
            try {
                const response: any = await ordersService.getAllOrders(params);
                setOrders(response.orders || []);
                setTotal(response.total || 0);
                return response;
            } catch (error: any) {
                push({
                    message: error.response?.data?.message || "Failed to fetch orders",
                    type: "error",
                });
                return { orders: [], total: 0 };
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    const fetchOrderStats = useCallback(async () => {
        try {
            const response: any = await ordersService.getOrderStats();
            setStats(response);
            return response;
        } catch (error: any) {
            push({
                message: error.response?.data?.message || "Failed to fetch order stats",
                type: "error",
            });
            return null;
        }
    }, [push]);

    const fetchOrderById = useCallback(
        async (id: string) => {
            setLoading(true);
            try {
                const order: any = await ordersService.getOrderById(id);
                setSelectedOrder(order);
                return order;
            } catch (error: any) {
                push({
                    message: error.response?.data?.message || "Failed to fetch order details",
                    type: "error",
                });
                return null;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    const updateOrder = useCallback(
        async (id: string, orderData: UpdateOrderDto) => {
            setLoading(true);
            try {
                const updatedOrder: any = await ordersService.updateOrder(id, orderData);
                setOrders((prev) =>
                    prev.map((order) => (order._id === id ? updatedOrder : order))
                );
                push({
                    message: "Order updated successfully",
                    type: "success",
                });
                return updatedOrder;
            } catch (error: any) {
                push({
                    message: error.response?.data?.message || "Failed to update order",
                    type: "error",
                });
                return null;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    const cancelOrder = useCallback(
        async (id: string, reason?: string) => {
            setLoading(true);
            try {
                const cancelledOrder: any = await ordersService.cancelOrder(id, reason);
                setOrders((prev) =>
                    prev.map((order) => (order._id === id ? cancelledOrder : order))
                );
                push({
                    message: "Order cancelled successfully",
                    type: "success",
                });
                return cancelledOrder;
            } catch (error: any) {
                push({
                    message: error.response?.data?.message || "Failed to cancel order",
                    type: "error",
                });
                return null;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    const refundOrder = useCallback(
        async (id: string, reason?: string) => {
            setLoading(true);
            try {
                const refundedOrder: any = await ordersService.refundOrder(id, reason);
                setOrders((prev) =>
                    prev.map((order) => (order._id === id ? refundedOrder : order))
                );
                push({
                    message: "Order refunded successfully",
                    type: "success",
                });
                return refundedOrder;
            } catch (error: any) {
                push({
                    message: error.response?.data?.message || "Failed to refund order",
                    type: "error",
                });
                return null;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    const deleteOrder = useCallback(
        async (id: string) => {
            setLoading(true);
            try {
                await ordersService.deleteOrder(id);
                setOrders((prev) => prev.filter((order) => order._id !== id));
                push({
                    message: "Order deleted successfully",
                    type: "success",
                });
                return true;
            } catch (error: any) {
                push({
                    message: error.response?.data?.message || "Failed to delete order",
                    type: "error",
                });
                return false;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    const resendReceipt = useCallback(
        async (id: string) => {
            setLoading(true);
            try {
                await ordersService.resendReceipt(id);
                push({
                    message: "Receipt sent successfully",
                    type: "success",
                });
                return true;
            } catch (error: any) {
                push({
                    message: error.response?.data?.message || "Failed to send receipt",
                    type: "error",
                });
                return false;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    const exportOrders = useCallback(
        async (format: "csv" | "excel" = "csv") => {
            setLoading(true);
            try {
                await ordersService.exportOrders(format);
                push({
                    message: `Orders exported as ${format.toUpperCase()}`,
                    type: "success",
                });
                return true;
            } catch (error: any) {
                push({
                    message: error.response?.data?.message || "Failed to export orders",
                    type: "error",
                });
                return false;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    return {
        orders,
        stats,
        total,
        loading,
        selectedOrder,
        fetchOrders,
        fetchOrderStats,
        fetchOrderById,
        updateOrder,
        cancelOrder,
        refundOrder,
        deleteOrder,
        resendReceipt,
        exportOrders,
    };
}
