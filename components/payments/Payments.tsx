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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayments, Transaction, Invoice, Payout } from "@/hooks/usePayments";
import { useEffect, useState } from "react";

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
  const [view, setView] = React.useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = React.useState("transactions");

  // Dialog states
  const [invoiceDialogOpen, setInvoiceDialogOpen] = React.useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(
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

  useEffect(() => {
    fetchTransactions({ page: 1, limit: 10 });
    fetchAnalytics({ period: "30d" });
  }, [fetchTransactions, fetchAnalytics]);

  useEffect(() => {
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
      setSelectedTransaction(details);
      setDetailsDialogOpen(true);
    }
  };

  const handleViewInvoice = async (invoiceId: string) => {
    const invoice = await getInvoiceById(invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
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
    if (!selectedTransaction) return;

    const result = await processRefund(selectedTransaction._id, {
      reason: refundReason,
      amount: refundAmount ? parseFloat(refundAmount) : undefined,
    });

    if (result) {
      setRefundDialogOpen(false);
      fetchTransactions({ page: pagination.page, limit: pagination.limit });
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

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
          description: invoiceForm.course,
          quantity: 1,
          unitPrice: parseFloat(invoiceForm.amount),
          total: parseFloat(invoiceForm.amount),
        },
      ],
      status: invoiceForm.markAsPaid ? "paid" : "pending",
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
        fetchInvoices({ page: 1, limit: 10 });
      }
    }
  };

  const handleExportReport = () => {
    exportReport({ format: "csv" });
  };

  const handleFilter = () => {
    const filters: any = {
      page: 1,
      limit: 10,
      search: search || undefined,
    };

    if (statusFilter !== "all") filters.status = statusFilter;
    if (methodFilter !== "all") filters.method = methodFilter;

    if (activeTab === "transactions") {
      fetchTransactions(filters);
    } else if (activeTab === "invoices") {
      fetchInvoices(filters);
    } else if (activeTab === "payouts") {
      fetchPayouts(filters);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleFilter();
    }, 300);

    return () => clearTimeout(debounce);
  }, [search, statusFilter, methodFilter, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearch("");
    setStatusFilter("all");
    setMethodFilter("all");

    if (value === "transactions") {
      fetchTransactions({ page: 1, limit: 10 });
    } else if (value === "invoices") {
      fetchInvoices({ page: 1, limit: 10 });
    } else if (value === "payouts") {
      fetchPayouts({ page: 1, limit: 10 });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
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

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
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
      {analytics && (
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
      )}

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-secondary">
            Revenue Overview
          </h3>
          <div className="flex space-x-2">
            <Select defaultValue="Last 30 days">
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="Last 90 days">Last 90 days</SelectItem>
                <SelectItem value="This year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-10 h-10 mx-auto mb-2" />
            <p>Revenue chart visualization would appear here</p>
            <p className="text-sm">
              Showing monthly revenue trends and projections
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Payment Methods">
                  All Payment Methods
                </SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Date (Newest)">
                  Sort by: Date (Newest)
                </SelectItem>
                <SelectItem value="Date (Oldest)">
                  Sort by: Date (Oldest)
                </SelectItem>
                <SelectItem value="Amount (High to Low)">
                  Sort by: Amount (High to Low)
                </SelectItem>
                <SelectItem value="Amount (Low to High)">
                  Sort by: Amount (Low to High)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="payment-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payments... (Cmd+K)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              variant={view === "grid" ? "outline" : "ghost"}
              size="icon"
              className="text-gray-600"
              onClick={() => setView("grid")}
            >
              <Grid2x2 className="w-5 h-5" />
            </Button>
            <Button
              variant={view === "list" ? "outline" : "ghost"}
              size="icon"
              className="text-gray-600"
              onClick={() => setView("list")}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Payment Methods
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CreditCard className="text-blue-600 w-6 h-6" />
            </div>
            <h4 className="font-medium text-secondary">Credit Card</h4>
            <p className="text-sm text-gray-600">1,024 transactions</p>
            <p className="text-lg font-bold text-secondary mt-1">$68,420</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Wallet className="text-yellow-600 w-6 h-6" />
            </div>
            <h4 className="font-medium text-secondary">PayPal</h4>
            <p className="text-sm text-gray-600">342 transactions</p>
            <p className="text-lg font-bold text-secondary mt-1">$12,940</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Banknote className="text-green-600 w-6 h-6" />
            </div>
            <h4 className="font-medium text-secondary">Bank Transfer</h4>
            <p className="text-sm text-gray-600">98 transactions</p>
            <p className="text-lg font-bold text-secondary mt-1">$3,210</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Star className="text-purple-600 w-6 h-6" />
            </div>
            <h4 className="font-medium text-secondary">Stripe</h4>
            <p className="text-sm text-gray-600">247 transactions</p>
            <p className="text-lg font-bold text-secondary mt-1">$9,759</p>
          </div>
        </div>
      </div>

      {view === "list" && (
        <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-secondary">
              Recent Transactions
            </h3>
            <p className="text-gray-600 text-sm">
              Latest payment transactions and invoices
            </p>
          </div>
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
                    Course
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
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">1,732</span> transactions
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-gray-300">
                Previous
              </Button>
              <Button size="sm">1</Button>
              <Button variant="outline" size="sm" className="border-gray-300">
                2
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300">
                3
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300">
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-secondary">
            Instructor Payouts
          </h3>
          <p className="text-gray-600 text-sm">
            Upcoming payouts and earnings by instructor
          </p>
        </div>
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
              {payouts.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={it.avatar || ""}
                        alt=""
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {it.instructorName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {it.courseCount} courses
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Multiple</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(it.totalEarnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {it.nextPayout}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {it.status === "scheduled" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Scheduled
                      </span>
                    )}
                    {it.status === "processing" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Processing
                      </span>
                    )}
                    {it.status === "paid" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 mr-3">
                      Details
                    </button>
                    <button className="text-gray-600 hover:text-primary">
                      Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Create Invoice</p>
              <p className="text-sm text-gray-600">New billing</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Reports</p>
              <p className="text-sm text-gray-600">Financial data</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Process Payouts</p>
              <p className="text-sm text-gray-600">Instructor payments</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg">
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

      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setInvoiceDialogOpen(false);
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter student name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="web">Web Development</option>
                  <option value="data">Data Science</option>
                  <option value="marketing">Digital Marketing</option>
                  <option value="design">UI/UX Design</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option>Credit Card</option>
                  <option>PayPal</option>
                  <option>Bank Transfer</option>
                  <option>Stripe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Additional details"
              ></textarea>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Invoice Options
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  defaultChecked
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Send invoice via email
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Mark as paid automatically
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setInvoiceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Invoice</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
