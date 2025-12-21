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
  Calendar,
  Filter,
  Printer,
  Send,
  Package,
  CreditCard,
  MapPin,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useOrders } from "@/hooks/useOrders";
import { Order, ordersService } from "@/services/orders.service";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

type ActionDialog = {
  type:
    | "view"
    | "refund"
    | "cancel"
    | "delete"
    | "status"
    | "tracking"
    | "paymentStatus"
    | null;
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
  const { push } = useToast();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState("all");
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
  const [newPaymentStatus, setNewPaymentStatus] =
    React.useState<Order["paymentStatus"]>("pending");
  const [trackingNumber, setTrackingNumber] = React.useState("");
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [showBulkActions, setShowBulkActions] = React.useState(false);
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
    if (paymentStatusFilter !== "all")
      params.paymentStatus = paymentStatusFilter;
    if (dateRange.from) params.startDate = dateRange.from.toISOString();
    if (dateRange.to) params.endDate = dateRange.to.toISOString();

    const debounce = setTimeout(() => {
      fetchOrders(params);
    }, 500);

    return () => clearTimeout(debounce);
  }, [search, statusFilter, paymentStatusFilter, currentPage, dateRange]);

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
    if (!orders || !Array.isArray(orders)) {
      return [];
    }

    const sorted = [...orders];

    if (sortBy === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    } else if (sortBy === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
      );
    } else if (sortBy === "amount") {
      sorted.sort((a, b) => (b.total || 0) - (a.total || 0));
    }

    return sorted;
  }, [orders, sortBy]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders((orders || []).map((o) => o._id).filter(Boolean));
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
    // Export with current filters - backend should handle filters via query params
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
    } else if (action === "status") {
      setShowBulkActions(true);
    } else if (action === "paymentStatus") {
      setShowBulkActions(true);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedOrders.length === 0 || !newStatus) return;
    setActionLoading(true);
    try {
      for (const orderId of selectedOrders) {
        await updateOrder(orderId, { status: newStatus });
      }
      setSelectedOrders([]);
      setShowBulkActions(false);
      fetchOrderStats();
    } catch (error) {
      console.error("Failed to update bulk status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkPaymentStatusUpdate = async () => {
    if (selectedOrders.length === 0 || !newPaymentStatus) return;
    setActionLoading(true);
    try {
      for (const orderId of selectedOrders) {
        await updateOrder(orderId, { paymentStatus: newPaymentStatus });
      }
      setSelectedOrders([]);
      setShowBulkActions(false);
      fetchOrderStats();
    } catch (error) {
      console.error("Failed to update bulk payment status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadReceipt = async (orderId: string) => {
    setActionLoading(true);
    try {
      const response = (await ordersService.downloadOrder(orderId)) as {
        url?: string;
      };
      if (response && response.url) {
        window.open(response.url, "_blank");
        push({
          message: "Receipt download started",
          type: "success",
        });
      } else {
        push({
          message: "Receipt URL not available",
          type: "error",
        });
      }
    } catch (error: any) {
      push({
        message: error.response?.data?.message || "Failed to download receipt",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Order ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order ${order.orderNumber}</h1>
            <p>Date: ${formatDate(order.createdAt)}</p>
          </div>
          <div class="section">
            <h3>Customer Information</h3>
            <p>${order.user.name || order.user.email}</p>
            <p>${order.user.email}</p>
          </div>
          <div class="section">
            <h3>Order Items</h3>
            <table>
              <tr><th>Item</th><th>Quantity</th><th>Price</th></tr>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.title}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                </tr>
              `
                )
                .join("")}
            </table>
          </div>
          <div class="section">
            <p>Subtotal: ${formatCurrency(order.subtotal)}</p>
            <p>Tax: ${formatCurrency(order.tax)}</p>
            <p>Discount: -${formatCurrency(order.discount)}</p>
            <p class="total">Total: ${formatCurrency(order.total)}</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleUpdateTrackingNumber = async () => {
    if (!actionDialog.order || !trackingNumber) return;
    setActionLoading(true);
    try {
      await updateOrder(actionDialog.order._id, { trackingNumber });
      setActionDialog({ type: null, order: null });
      setTrackingNumber("");
      fetchOrderStats();
    } catch (error) {
      console.error("Failed to update tracking number:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setDateRange({ from: undefined, to: undefined });
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
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
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
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
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
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Select
                  value={paymentStatusFilter}
                  onValueChange={setPaymentStatusFilter}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      });
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="border-gray-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              {(search ||
                statusFilter !== "all" ||
                paymentStatusFilter !== "all" ||
                dateRange.from ||
                dateRange.to) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedOrders.length > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {selectedOrders.length} selected
                </Badge>
              )}
              <Select onValueChange={handleBulkAction}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Bulk Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">Export Selected</SelectItem>
                  <SelectItem value="status">Update Status</SelectItem>
                  <SelectItem value="paymentStatus">
                    Update Payment Status
                  </SelectItem>
                  <SelectItem value="delete">Delete Selected</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                        orders &&
                        orders.length > 0 &&
                        selectedOrders.length === orders.length
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
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg font-medium mb-2">
                        No orders found
                      </p>
                      <p className="text-gray-400 text-sm">
                        {search ||
                        statusFilter !== "all" ||
                        paymentStatusFilter !== "all" ||
                        dateRange.from
                          ? "Try adjusting your filters"
                          : "Orders will appear here once customers make purchases"}
                      </p>
                      {(search ||
                        statusFilter !== "all" ||
                        paymentStatusFilter !== "all" ||
                        dateRange.from) && (
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="mt-4"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
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
                            {o.orderNumber || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {o.items && o.items.length > 0
                              ? o.items[0].type
                              : "Order"}
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
                        {o.items?.length || 0} item
                        {(o.items?.length || 0) !== 1 ? "s" : ""}
                      </div>
                      {o.items && o.items.length > 0 && (
                        <div className="text-sm text-gray-500">
                          {o.items[0]?.title || "N/A"}
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
                            <DropdownMenuItem
                              onClick={() => handleDownloadReceipt(o._id)}
                              disabled={o.status !== "completed"}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePrintOrder(o)}
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              Print Order
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setTrackingNumber("");
                                setActionDialog({ type: "tracking", order: o });
                              }}
                              disabled={
                                o.status === "cancelled" ||
                                o.status === "refunded"
                              }
                            >
                              <Package className="w-4 h-4 mr-2" />
                              Update Tracking
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setNewPaymentStatus(o.paymentStatus);
                                setActionDialog({
                                  type: "paymentStatus",
                                  order: o,
                                });
                              }}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Update Payment Status
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {total === 0 ? 0 : (currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * limit, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> orders
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  if (page > totalPages) return null;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={
                        currentPage === page
                          ? "bg-primary text-white"
                          : "border-gray-300"
                      }
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300"
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
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
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created: {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintOrder(selectedOrder)}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReceipt(selectedOrder._id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Customer
                  </Label>
                  <p className="font-medium mt-1">
                    {selectedOrder.user.name || selectedOrder.user.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.user.email}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Order Date
                  </Label>
                  <p className="font-medium mt-1">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">
                    <span
                      className={`status-badge px-3 py-1 rounded-full text-xs ${statusBadge(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status.charAt(0).toUpperCase() +
                        selectedOrder.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment
                  </Label>
                  <p className="font-medium mt-1">
                    {selectedOrder.paymentMethod || "N/A"}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                      selectedOrder.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : selectedOrder.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : selectedOrder.paymentStatus === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedOrder.paymentStatus?.charAt(0).toUpperCase() +
                      selectedOrder.paymentStatus?.slice(1) || "N/A"}
                  </span>
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div>
                  <Label className="text-gray-500 flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">
                      {selectedOrder.shippingAddress.street}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>
                </div>
              )}

              {(selectedOrder as any).refund && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <Label className="text-red-700 font-semibold flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Refund Information
                  </Label>
                  <p className="text-sm text-red-600">
                    Amount:{" "}
                    {formatCurrency((selectedOrder as any).refund.amount)}
                  </p>
                  <p className="text-sm text-red-600">
                    Reason: {(selectedOrder as any).refund.reason || "N/A"}
                  </p>
                  <p className="text-sm text-red-600">
                    Processed:{" "}
                    {(selectedOrder as any).refund.processedAt
                      ? formatDate((selectedOrder as any).refund.processedAt)
                      : "N/A"}
                  </p>
                </div>
              )}

              {(selectedOrder as any).cancellationReason && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <Label className="text-orange-700 font-semibold flex items-center gap-2 mb-2">
                    <X className="w-4 h-4" />
                    Cancellation Reason
                  </Label>
                  <p className="text-sm text-orange-600">
                    {(selectedOrder as any).cancellationReason}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-gray-500 mb-2 block">Items</Label>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <div
                        key={item._id || Math.random()}
                        className="flex justify-between border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{item.title || "N/A"}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity || 0}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(item.price || 0)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No items found</p>
                  )}
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

      {/* Update Tracking Number Dialog */}
      <Dialog
        open={actionDialog.type === "tracking"}
        onOpenChange={(open) =>
          !open && setActionDialog({ type: null, order: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Update Tracking Number
            </DialogTitle>
            <DialogDescription>
              Add or update tracking number for order{" "}
              {actionDialog.order?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tracking-number">Tracking Number</Label>
              <Input
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog({ type: null, order: null });
                setTrackingNumber("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTrackingNumber}
              disabled={actionLoading || !trackingNumber}
            >
              {actionLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Update Tracking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Payment Status Dialog */}
      <Dialog
        open={actionDialog.type === "paymentStatus"}
        onOpenChange={(open) =>
          !open && setActionDialog({ type: null, order: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Update Payment Status
            </DialogTitle>
            <DialogDescription>
              Update payment status for order {actionDialog.order?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select
                value={newPaymentStatus}
                onValueChange={(value: any) => setNewPaymentStatus(value)}
              >
                <SelectTrigger id="payment-status">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
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
            <Button
              onClick={async () => {
                if (!actionDialog.order) return;
                setActionLoading(true);
                const result = await updateOrder(actionDialog.order._id, {
                  paymentStatus: newPaymentStatus,
                });
                setActionLoading(false);
                if (result) {
                  setActionDialog({ type: null, order: null });
                  fetchOrderStats();
                }
              }}
              disabled={actionLoading}
            >
              {actionLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Update Payment Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Apply action to {selectedOrders.length} selected orders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Update Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value: any) => setNewStatus(value)}
              >
                <SelectTrigger>
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
            <div>
              <Label>Update Payment Status</Label>
              <Select
                value={newPaymentStatus}
                onValueChange={(value: any) => setNewPaymentStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleBulkStatusUpdate();
                await handleBulkPaymentStatusUpdate();
              }}
              disabled={actionLoading}
            >
              {actionLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Apply to Selected
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
