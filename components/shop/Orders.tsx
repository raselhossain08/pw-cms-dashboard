"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  ArrowUpDown,
  EllipsisVertical,
  Download,
  Plus,
  Eye,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  FileText,
  Mail,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/services/orders.service";

type ActionDialog = {
  type: "view" | "refund" | "cancel" | "delete" | "status" | null;
  order: Order | null;
};

export default function Orders() {
  const {
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
  } = useOrders();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([]);
  const [actionDialog, setActionDialog] = React.useState<ActionDialog>({
    type: null,
    order: null,
  });
  const [actionReason, setActionReason] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<Order["status"]>("pending");
  const limit = 10;

  // Initial data fetch
  React.useEffect(() => {
    fetchOrders({ page: currentPage, limit });
    fetchOrderStats();
  }, []);

  // Fetch orders on filter change
  React.useEffect(() => {
    const params: any = { page: currentPage, limit };

    if (search) params.search = search;
    if (statusFilter !== "all") params.status = statusFilter;

    const debounce = setTimeout(() => {
      fetchOrders(params);
    }, 500);

    return () => clearTimeout(debounce);
  }, [search, statusFilter, currentPage]);

  // Keyboard shortcut for search
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById(
          "orders-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const statusBadge = (s: string) => {
    const statusMap: Record<string, string> = {
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      shipped: "bg-purple-100 text-purple-700",
      refunded: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
      confirmed: "bg-teal-100 text-teal-700",
      failed: "bg-orange-100 text-orange-700",
    };
    return statusMap[s] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const sortedOrders = React.useMemo(() => {
    const sorted = [...orders];

    if (sortBy === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sortBy === "amount") {
      sorted.sort((a, b) => b.total - a.total);
    }

    return sorted;
  }, [orders, sortBy]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map((o) => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  const handleViewOrder = async (order: Order) => {
    await fetchOrderById(order._id);
    setActionDialog({ type: "view", order });
  };

  const handleRefundOrder = async () => {
    if (!actionDialog.order) return;

    setActionLoading(true);
    const result = await refundOrder(actionDialog.order._id, actionReason);
    setActionLoading(false);

    if (result) {
      setActionDialog({ type: null, order: null });
      setActionReason("");
      fetchOrderStats();
    }
  };

  const handleCancelOrder = async () => {
    if (!actionDialog.order) return;

    setActionLoading(true);
    const result = await cancelOrder(actionDialog.order._id, actionReason);
    setActionLoading(false);

    if (result) {
      setActionDialog({ type: null, order: null });
      setActionReason("");
      fetchOrderStats();
    }
  };

  const handleDeleteOrder = async () => {
    if (!actionDialog.order) return;

    setActionLoading(true);
    const result = await deleteOrder(actionDialog.order._id);
    setActionLoading(false);

    if (result) {
      setActionDialog({ type: null, order: null });
      fetchOrderStats();
    }
  };

  const handleResendReceipt = async (orderId: string) => {
    await resendReceipt(orderId);
  };

  const handleExport = async () => {
    await exportOrders("csv");
  };

  const handleUpdateStatus = async () => {
    if (!actionDialog.order) return;

    setActionLoading(true);
    const result = await updateOrder(actionDialog.order._id, {
      status: newStatus,
    });
    setActionLoading(false);

    if (result) {
      setActionDialog({ type: null, order: null });
      fetchOrderStats();
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedOrders.length === 0) return;

    if (action === "export") {
      await handleExport();
    } else if (action === "delete") {
      if (
        window.confirm(
          `Delete ${selectedOrders.length} orders? This cannot be undone.`
        )
      ) {
        setActionLoading(true);
        for (const orderId of selectedOrders) {
          await deleteOrder(orderId);
        }
        setSelectedOrders([]);
        setActionLoading(false);
        fetchOrderStats();
      }
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Orders</h2>
          <p className="text-gray-600">
            Manage customer orders, track shipments, and process returns
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export
          </Button>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" /> Create Order
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-1 shadow-sm border border-gray-100 mb-8 inline-flex">
        {["Products", "Categories", "Orders", "Discounts"].map((t) => (
          <button
            key={t}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              t === "Orders"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats.totalOrders}
              </p>
              <p className="text-accent text-sm mt-1">
                +{stats.weeklyGrowth} this week
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats.completed}
              </p>
              <p className="text-accent text-sm mt-1">On time</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats.pending}
              </p>
              <p className="text-yellow-500 text-sm mt-1">Action needed</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats.cancelled}
              </p>
              <p className="text-red-500 text-sm mt-1">Review</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="orders-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders... (Cmd+K)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="pl-10 w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort by: Newest</SelectItem>
                  <SelectItem value="oldest">Sort by: Oldest</SelectItem>
                  <SelectItem value="amount">Sort by: Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select onValueChange={handleBulkAction}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Bulk Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={
                        selectedOrders.length === orders.length &&
                        orders.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span>Order</span>
                  </div>
                </th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Items</th>
                <th className="py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                sortedOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedOrders.includes(o._id)}
                          onChange={(e) =>
                            handleSelectOrder(o._id, e.target.checked)
                          }
                        />
                        <div>
                          <div className="font-medium text-primary">
                            {o.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {o.items.length > 0 ? o.items[0].type : "Order"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary text-sm font-medium">
                            {o.user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-secondary">
                            {o.user.name || o.user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {o.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`status-badge px-3 py-1 rounded-full text-xs ${statusBadge(
                          o.status
                        )}`}
                      >
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-secondary">
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                      </div>
                      {o.items.length > 0 && (
                        <div className="text-sm text-gray-500">
                          {o.items[0].title}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary"
                          onClick={() => handleViewOrder(o)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500"
                            >
                              <EllipsisVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setNewStatus(o.status);
                                setActionDialog({ type: "status", order: o });
                              }}
                            >
                              <ArrowUpDown className="w-4 h-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setActionDialog({ type: "refund", order: o })
                              }
                              disabled={o.status !== "completed"}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Refund
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setActionDialog({ type: "cancel", order: o })
                              }
                              disabled={
                                o.status === "completed" ||
                                o.status === "cancelled"
                              }
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResendReceipt(o._id)}
                              disabled={o.status !== "completed"}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Resend Receipt
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setActionDialog({ type: "delete", order: o })
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * limit, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> orders
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-gray-300"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                const page = currentPage <= 2 ? i + 1 : currentPage - 1 + i;
                if (page > totalPages) return null;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className={
                      currentPage === page ? "bg-primary" : "border-gray-300"
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                className="border-gray-300"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* View Order Dialog */}
      <Dialog
        open={actionDialog.type === "view"}
        onOpenChange={(open) =>
          !open && setActionDialog({ type: null, order: null })
        }
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Order Details
            </DialogTitle>
            <DialogDescription>{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Customer</Label>
                  <p className="font-medium">
                    {selectedOrder.user.name || selectedOrder.user.email}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Order Date</Label>
                  <p className="font-medium">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <span
                    className={`status-badge px-3 py-1 rounded-full text-xs ${statusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div>
                  <Label className="text-gray-500">Payment Method</Label>
                  <p className="font-medium">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500 mb-2 block">Items</Label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(selectedOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    {formatCurrency(selectedOrder.tax)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium">
                    -{formatCurrency(selectedOrder.discount)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Order Dialog */}
      <Dialog
        open={actionDialog.type === "refund"}
        onOpenChange={(open) =>
          !open && setActionDialog({ type: null, order: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Refund Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to refund order{" "}
              {actionDialog.order?.orderNumber}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refund-reason">Refund Reason (Optional)</Label>
              <Textarea
                id="refund-reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter refund reason..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ type: null, order: null })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleRefundOrder} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Refund Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog
        open={actionDialog.type === "cancel"}
        onOpenChange={(open) =>
          !open && setActionDialog({ type: null, order: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-orange-600" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order{" "}
              {actionDialog.order?.orderNumber}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">
                Cancellation Reason (Optional)
              </Label>
              <Textarea
                id="cancel-reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ type: null, order: null })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCancelOrder} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={actionDialog.type === "status"}
        onOpenChange={(open) =>
          !open && setActionDialog({ type: null, order: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-blue-600" />
              Update Order Status
            </DialogTitle>
            <DialogDescription>
              Update status for order {actionDialog.order?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-status">New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value: any) => setNewStatus(value)}
              >
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ type: null, order: null })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog
        open={actionDialog.type === "delete"}
        onOpenChange={(open) =>
          !open && setActionDialog({ type: null, order: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order{" "}
              {actionDialog.order?.orderNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ type: null, order: null })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrder}
              disabled={actionLoading}
            >
              {actionLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">
              Order Status Distribution
            </h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              View Report
            </button>
          </div>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Chart placeholder</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">
              Revenue Trends
            </h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              View Report
            </button>
          </div>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Chart placeholder</p>
          </div>
        </div>
      </div>
    </main>
  );
}
