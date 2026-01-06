"use client";

import * as React from "react";
import {
  CreditCard,
  Download,
  FileText,
  Search as SearchIcon,
  Grid2x2,
  List,
  ArrowUp,
  TrendingUp,
  Wallet,
  Banknote,
  DollarSign,
  Eye,
  RotateCcw,
  Loader2,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayments, Transaction, Invoice, Payout } from "@/hooks/usePayments";
import { RevenueChart } from "@/components/analytics/charts/RevenueChart";

export default function Payments() {
  const {
    transactions,
    invoices,
    payouts,
    analytics,
    loading,
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
  } = usePayments();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("date-desc");
  const [activeTab, setActiveTab] = React.useState("transactions");
  const [dateRange, setDateRange] = React.useState({
    startDate: "",
    endDate: "",
  });
  const [analyticsPeriod, setAnalyticsPeriod] = React.useState("30d");

  // Dialog states
  const [invoiceDialogOpen, setInvoiceDialogOpen] = React.useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [payoutDetailsDialogOpen, setPayoutDetailsDialogOpen] =
    React.useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(
    null
  );
  const [selectedPayout, setSelectedPayout] = React.useState<Payout | null>(
    null
  );
  const [refundReason, setRefundReason] = React.useState("");
  const [refundAmount, setRefundAmount] = React.useState("");

  // Form states
  const [invoiceForm, setInvoiceForm] = React.useState({
    studentName: "",
    studentEmail: "",
    course: "",
    amount: "",
    paymentMethod: "Credit Card",
    invoiceDate: new Date().toISOString().split("T")[0],
    notes: "",
    sendEmail: true,
    markAsPaid: false,
  });

  React.useEffect(() => {
    fetchTransactions({ page: 1, limit: 10 });
    fetchAnalytics({ period: analyticsPeriod });
  }, [fetchTransactions, fetchAnalytics, analyticsPeriod]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        const el = document.getElementById(
          "payment-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleViewDetails = async (transaction: Transaction) => {
    const details = await getTransactionDetails(transaction._id);
    if (details) {
      setSelectedTransaction(details as Transaction);
      setDetailsDialogOpen(true);
    }
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    const fullInvoice = await getInvoiceById(invoice._id);
    if (fullInvoice) {
      setSelectedInvoice(fullInvoice as Invoice);
      setDetailsDialogOpen(true);
    }
  };

  const handleRefund = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRefundReason("");
    setRefundAmount(transaction.amount.toString());
    setRefundDialogOpen(true);
  };

  const handleProcessRefund = async () => {
    if (!selectedTransaction || !refundReason.trim()) return;

    const result = await processRefund(selectedTransaction._id, {
      reason: refundReason,
      amount: refundAmount ? parseFloat(refundAmount) : undefined,
    });

    if (result) {
      setRefundDialogOpen(false);
      setRefundReason("");
      setRefundAmount("");
      handleFilter();
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.studentEmail || !invoiceForm.amount) return;

    const result = await createInvoice({
      user: invoiceForm.studentEmail,
      amount: parseFloat(invoiceForm.amount),
      billingInfo: {
        companyName: invoiceForm.studentName,
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
      items: [
        {
          description: invoiceForm.course || "Course Payment",
          quantity: 1,
          unitPrice: parseFloat(invoiceForm.amount),
          total: parseFloat(invoiceForm.amount),
        },
      ],
      status: invoiceForm.markAsPaid ? "paid" : "pending",
      invoiceDate: invoiceForm.invoiceDate,
    });

    if (result) {
      setInvoiceDialogOpen(false);
      setInvoiceForm({
        studentName: "",
        studentEmail: "",
        course: "",
        amount: "",
        paymentMethod: "Credit Card",
        invoiceDate: new Date().toISOString().split("T")[0],
        notes: "",
        sendEmail: true,
        markAsPaid: false,
      });
      if (activeTab === "invoices") {
        fetchInvoices({ page: 1, limit: pagination?.limit || 10 });
      }
    }
  };

  const handleExportReport = () => {
    exportReport({
      format: "csv",
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    });
  };

  const handleFilter = () => {
    const filters: any = {
      page: 1,
      limit: pagination?.limit || 10,
      search: search || undefined,
    };

    if (statusFilter !== "all") filters.status = statusFilter.toLowerCase();
    if (methodFilter !== "all") filters.method = methodFilter.toLowerCase();
    if (dateRange.startDate) filters.startDate = dateRange.startDate;
    if (dateRange.endDate) filters.endDate = dateRange.endDate;

    // Apply sorting
    if (sortBy === "date-desc") {
      // Backend should handle this
    } else if (sortBy === "date-asc") {
      filters.sortBy = "createdAt";
      filters.sortOrder = "asc";
    } else if (sortBy === "amount-desc") {
      filters.sortBy = "amount";
      filters.sortOrder = "desc";
    } else if (sortBy === "amount-asc") {
      filters.sortBy = "amount";
      filters.sortOrder = "asc";
    }

    if (activeTab === "transactions") {
      fetchTransactions(filters);
    } else if (activeTab === "invoices") {
      fetchInvoices(filters);
    } else if (activeTab === "payouts") {
      fetchPayouts(filters);
    }
  };

  React.useEffect(() => {
    const debounce = setTimeout(() => {
      handleFilter();
    }, 300);

    return () => clearTimeout(debounce);
  }, [search, statusFilter, methodFilter, sortBy, dateRange, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearch("");
    setStatusFilter("all");
    setMethodFilter("all");

    if (value === "transactions") {
      fetchTransactions({ page: 1, limit: pagination?.limit || 10 });
    } else if (value === "invoices") {
      fetchInvoices({ page: 1, limit: pagination?.limit || 10 });
    } else if (value === "payouts") {
      fetchPayouts({ page: 1, limit: pagination?.limit || 10 });
    }
  };

  const handlePageChange = (page: number) => {
    const filters: any = {
      page,
      limit: pagination?.limit || 10,
      search: search || undefined,
    };

    if (statusFilter !== "all") filters.status = statusFilter.toLowerCase();
    if (methodFilter !== "all") filters.method = methodFilter.toLowerCase();
    if (dateRange.startDate) filters.startDate = dateRange.startDate;
    if (dateRange.endDate) filters.endDate = dateRange.endDate;

    if (activeTab === "transactions") {
      fetchTransactions(filters);
    } else if (activeTab === "invoices") {
      fetchInvoices(filters);
    } else if (activeTab === "payouts") {
      fetchPayouts(filters);
    }
  };

  const handleProcessPayout = async (payout: Payout) => {
    const result = await processInstructorPayout(
      payout.instructorId || payout.id,
      {}
    );
    if (result) {
      fetchPayouts({
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
      });
    }
  };

  const handleViewPayoutDetails = (payout: Payout) => {
    setSelectedPayout(payout);
    setPayoutDetailsDialogOpen(true);
  };

  const handleAnalyticsPeriodChange = (period: string) => {
    setAnalyticsPeriod(period);
    fetchAnalytics({ period });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { icon: any; class: string; label: string }
    > = {
      completed: {
        icon: CheckCircle2,
        class: "bg-green-100 text-green-800",
        label: "Completed",
      },
      pending: {
        icon: Clock,
        class: "bg-yellow-100 text-yellow-800",
        label: "Pending",
      },
      failed: {
        icon: XCircle,
        class: "bg-red-100 text-red-800",
        label: "Failed",
      },
      refunded: {
        icon: RotateCcw,
        class: "bg-blue-100 text-blue-800",
        label: "Refunded",
      },
      scheduled: {
        icon: Clock,
        class: "bg-blue-100 text-blue-800",
        label: "Scheduled",
      },
      processing: {
        icon: Loader2,
        class: "bg-yellow-100 text-yellow-800",
        label: "Processing",
      },
      paid: {
        icon: CheckCircle2,
        class: "bg-green-100 text-green-800",
        label: "Paid",
      },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${config.class}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get payment method breakdown from analytics
  const paymentMethodStats = analytics?.methodBreakdown;

  // Render pagination buttons
  const renderPagination = () => {
    if (!pagination || !pagination.totalPages || !pagination.page) {
      return null;
    }
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    const pages = [];

    // Show max 5 page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="border-gray-300"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        {pages.map((page) => (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? "default" : "outline"}
            className={page === currentPage ? "" : "border-gray-300"}
            onClick={() => handlePageChange(page)}
            disabled={loading}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="border-gray-300"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  };

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Payments</h2>
          <p className="text-gray-600">
            Manage payment transactions, invoices, and revenue tracking
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={handleExportReport}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Reports
          </Button>
          <Button onClick={() => setInvoiceDialogOpen(true)}>
            <FileText className="w-4 h-4 mr-2" /> Create Invoice
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {loading && !analytics ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </p>
                <p className="text-accent text-sm mt-1">
                  <ArrowUp className="inline w-3 h-3" /> Active payments
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-primary w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Successful Payments
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {analytics.overview.successfulPayments}
                </p>
                <p className="text-accent text-sm mt-1">
                  Completed transactions
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <CreditCard className="text-accent w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Refund Rate</p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {analytics.overview.refundRate}%
                </p>
                <p className="text-accent text-sm mt-1">
                  {formatCurrency(analytics.overview.refundedAmount)} refunded
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-yellow-600 w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Failed Payments
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {analytics.overview.failedPayments}
                </p>
                <p className="text-accent text-sm mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Revenue Chart */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-secondary">
            Revenue Overview
          </h3>
          <div className="flex space-x-2">
            <Select
              value={analyticsPeriod}
              onValueChange={handleAnalyticsPeriodChange}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="365d">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <RevenueChart
          data={
            analytics?.revenueByDay?.map((item) => ({
              label: new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              value: item.revenue,
              date: item.date,
            })) || []
          }
          isLoading={loading && !analytics}
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="credit card">Credit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="amount-desc">
                  Amount (High to Low)
                </SelectItem>
                <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-40 text-sm"
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-40 text-sm"
                placeholder="End Date"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="payment-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payments... (Cmd+K)"
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Stats */}
      {analytics?.methodBreakdown && analytics.methodBreakdown.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Payment Methods
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.methodBreakdown.map((method, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="text-blue-600 w-6 h-6" />
                </div>
                <h4 className="font-medium text-secondary capitalize">
                  {method.method}
                </h4>
                <p className="text-sm text-gray-600">
                  {method.count} transactions
                </p>
                <p className="text-lg font-bold text-secondary mt-1">
                  {formatCurrency(method.total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-secondary">
                Transactions
              </h3>
              <p className="text-gray-600 text-sm">
                Latest payment transactions
              </p>
            </div>
            {loading && !transactions ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No transactions found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {transaction.transactionId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {transaction.user?.avatar ? (
                                <img
                                  className="h-8 w-8 rounded-full"
                                  src={transaction.user.avatar}
                                  alt=""
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-medium text-sm">
                                    {transaction.user?.firstName?.charAt(0)}
                                    {transaction.user?.lastName?.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {transaction.user?.firstName}{" "}
                                  {transaction.user?.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {transaction.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {transaction.description || "Payment"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {transaction.gateway}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleViewDetails(transaction)}
                              className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            {transaction.status === "completed" && (
                              <button
                                onClick={() => handleRefund(transaction)}
                                className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination &&
                  pagination.page &&
                  pagination.limit &&
                  pagination.total && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Showing{" "}
                        <span className="font-medium">
                          {(pagination.page - 1) * pagination.limit + 1}-
                          {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">{pagination.total}</span>{" "}
                        transactions
                      </div>
                      {renderPagination()}
                    </div>
                  )}
              </>
            )}
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-secondary">Invoices</h3>
              <p className="text-gray-600 text-sm">
                Manage and view all invoices
              </p>
            </div>
            {loading && !invoices ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !invoices || invoices.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No invoices found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {invoice.user?.avatar ? (
                                <img
                                  className="h-8 w-8 rounded-full"
                                  src={invoice.user.avatar}
                                  alt=""
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-medium text-sm">
                                    {invoice.user?.firstName?.charAt(0)}
                                    {invoice.user?.lastName?.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {invoice.user?.firstName}{" "}
                                  {invoice.user?.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {invoice.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(invoice.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(invoice.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(invoice.invoiceDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination &&
                  pagination.page &&
                  pagination.limit &&
                  pagination.total && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Showing{" "}
                        <span className="font-medium">
                          {(pagination.page - 1) * pagination.limit + 1}-
                          {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">{pagination.total}</span>{" "}
                        invoices
                      </div>
                      {renderPagination()}
                    </div>
                  )}
              </>
            )}
          </div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-secondary">
                Instructor Payouts
              </h3>
              <p className="text-gray-600 text-sm">
                Upcoming payouts and earnings by instructor
              </p>
            </div>
            {loading && !payouts ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !payouts || payouts.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12">
                <DollarSign className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No payouts found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instructor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Courses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Earnings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Next Payout
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {payout.avatar ? (
                                <img
                                  className="h-8 w-8 rounded-full"
                                  src={payout.avatar}
                                  alt=""
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-medium text-sm">
                                    {payout.instructorName.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {payout.instructorName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {payout.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payout.courseCount} courses
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payout.totalEarnings)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payout.nextPayout}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payout.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleViewPayoutDetails(payout)}
                              className="text-primary hover:text-primary/80 mr-3"
                            >
                              Details
                            </button>
                            {payout.status === "scheduled" && (
                              <button
                                onClick={() => handleProcessPayout(payout)}
                                className="text-green-600 hover:text-green-800"
                                disabled={loading}
                              >
                                Process
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination &&
                  pagination.page &&
                  pagination.limit &&
                  pagination.total && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Showing{" "}
                        <span className="font-medium">
                          {(pagination.page - 1) * pagination.limit + 1}-
                          {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">{pagination.total}</span>{" "}
                        payouts
                      </div>
                      {renderPagination()}
                    </div>
                  )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setInvoiceDialogOpen(true)}
            className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Create Invoice</p>
              <p className="text-sm text-gray-600">New billing</p>
            </div>
          </button>
          <button
            onClick={handleExportReport}
            disabled={loading}
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Reports</p>
              <p className="text-sm text-gray-600">Financial data</p>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab("payouts");
              handleTabChange("payouts");
            }}
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Process Payouts</p>
              <p className="text-sm text-gray-600">Instructor payments</p>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab("transactions");
              handleTabChange("transactions");
            }}
            className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">View Analytics</p>
              <p className="text-sm text-gray-600">Revenue insights</p>
            </div>
          </button>
        </div>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTransaction
                ? "Transaction Details"
                : selectedInvoice
                ? "Invoice Details"
                : "Details"}
            </DialogTitle>
            <DialogDescription>Complete information</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Transaction ID
                  </p>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedTransaction.transactionId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Amount</p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {formatCurrency(selectedTransaction.amount)}{" "}
                    {selectedTransaction.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Payment Method
                  </p>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedTransaction.gateway}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Created At
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(selectedTransaction.createdAt)}
                  </p>
                </div>
                {selectedTransaction.processedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Processed At
                    </p>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(selectedTransaction.processedAt)}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-sm text-gray-900">
                  {selectedTransaction.description}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Customer</p>
                <p className="text-sm text-gray-900">
                  {selectedTransaction.user?.firstName}{" "}
                  {selectedTransaction.user?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedTransaction.user?.email}
                </p>
              </div>
              {selectedTransaction.gatewayTransactionId && (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Gateway Transaction ID
                  </p>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedTransaction.gatewayTransactionId}
                  </p>
                </div>
              )}
              {selectedTransaction.refundReason && (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Refund Reason
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedTransaction.refundReason}
                  </p>
                </div>
              )}
            </div>
          )}
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Invoice Number
                  </p>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedInvoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Total Amount
                  </p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {formatCurrency(selectedInvoice.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Tax</p>
                  <p className="text-sm text-gray-900">
                    {formatCurrency(selectedInvoice.tax || 0)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                <div className="border rounded-lg divide-y">
                  {selectedInvoice.items.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.total)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund transaction {selectedTransaction?.transactionId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Transaction Amount
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedTransaction &&
                  formatCurrency(selectedTransaction.amount)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount (leave empty for full refund)
              </label>
              <Input
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={selectedTransaction?.amount.toString()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessRefund}
              disabled={!refundReason.trim() || loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for a student
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={invoiceForm.studentName}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      studentName: e.target.value,
                    })
                  }
                  placeholder="Enter student name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={invoiceForm.studentEmail}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      studentEmail: e.target.value,
                    })
                  }
                  placeholder="student@example.com"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <Input
                  type="text"
                  value={invoiceForm.course}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, course: e.target.value })
                  }
                  placeholder="Course name or description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={invoiceForm.amount}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <Select
                  value={invoiceForm.paymentMethod}
                  onValueChange={(value) =>
                    setInvoiceForm({ ...invoiceForm, paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date
                </label>
                <Input
                  type="date"
                  value={invoiceForm.invoiceDate}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      invoiceDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <Textarea
                value={invoiceForm.notes}
                onChange={(e) =>
                  setInvoiceForm({ ...invoiceForm, notes: e.target.value })
                }
                rows={3}
                placeholder="Additional details"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Invoice Options
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={invoiceForm.sendEmail}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      sendEmail: e.target.checked,
                    })
                  }
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Send invoice via email
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={invoiceForm.markAsPaid}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      markAsPaid: e.target.checked,
                    })
                  }
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Mark as paid automatically
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setInvoiceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Create Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payout Details Dialog */}
      <Dialog
        open={payoutDetailsDialogOpen}
        onOpenChange={setPayoutDetailsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
            <DialogDescription>Instructor payout information</DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Instructor
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedPayout.instructorName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">
                    {selectedPayout.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Total Earnings
                  </p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {formatCurrency(selectedPayout.totalEarnings)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Course Count
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedPayout.courseCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Next Payout
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedPayout.nextPayout}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedPayout.status)}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setPayoutDetailsDialogOpen(false)}
            >
              Close
            </Button>
            {selectedPayout && selectedPayout.status === "scheduled" && (
              <Button
                onClick={() => handleProcessPayout(selectedPayout)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Process Payout
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
