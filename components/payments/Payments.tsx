"use client";

import * as React from "react";
import {
  Download,
  Search as SearchIcon,
  Filter,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayments, Transaction, Invoice, Payout } from "@/hooks/usePayments";
import { RevenueChart } from "@/components/analytics/charts/RevenueChart";
import { PaymentStats } from "./components/PaymentStats";
import { TransactionsTable } from "./components/TransactionsTable";
import { InvoicesTable } from "./components/InvoicesTable";
import { PayoutsTable } from "./components/PayoutsTable";
import { CreateInvoiceDialog } from "./components/CreateInvoiceDialog";
import { RefundDialog } from "./components/RefundDialog";
import { TransactionDetailsDialog } from "./components/TransactionDetailsDialog";
import { InvoiceDetailsDialog } from "./components/InvoiceDetailsDialog";
import { PayoutDetailsDialog } from "./components/PayoutDetailsDialog";
import { toast } from "sonner";

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
  const [invoiceDetailsDialogOpen, setInvoiceDetailsDialogOpen] =
    React.useState(false);

  // Selected items
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(
    null
  );
  const [selectedPayout, setSelectedPayout] = React.useState<Payout | null>(
    null
  );

  // Initial data fetch on component mount
  React.useEffect(() => {
    fetchAnalytics({ period: analyticsPeriod });
    fetchTransactions({ page: 1, limit: pagination?.limit || 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch analytics when period changes
  React.useEffect(() => {
    if (analyticsPeriod) {
      fetchAnalytics({ period: analyticsPeriod });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsPeriod]);

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
      filters.sortBy = "createdAt";
      filters.sortOrder = "desc";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.success("Payout processed successfully");
      setPayoutDetailsDialogOpen(false);
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
  };

  const handleExport = () => {
    exportReport(activeTab, {
      status: statusFilter !== "all" ? statusFilter : undefined,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    toast.success(`${activeTab} report exported successfully`);
  };

  const handleRefund = async (id: string, amount: number, reason: string) => {
    const success = await processRefund(id, { amount, reason });
    if (success) {
      toast.success("Refund processed successfully");
      setRefundDialogOpen(false);
      fetchTransactions({
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
      });
    }
    return !!success;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateInvoice = async (data: any) => {
    const success = await createInvoice(data);
    if (success) {
      toast.success("Invoice created successfully");
      setInvoiceDialogOpen(false);
      if (activeTab === "invoices") {
        fetchInvoices({ page: 1 });
      }
    }
    return !!success;
  };

  return (
    <div className="container mx-auto px-4 py-8  space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Financial Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Manage transactions, invoices, and payouts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={analyticsPeriod}
            onValueChange={handleAnalyticsPeriodChange}
          >
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setInvoiceDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      <PaymentStats analytics={analytics} loading={loading} />

      {activeTab === "transactions" && (
        <div className="mb-8">
          <RevenueChart
            isLoading={loading && !analytics}
            data={
              analytics?.revenueChart?.map((item) => ({
                label: item.date,
                value: item.revenue,
                date: item.date,
              })) ||
              analytics?.revenueByDay?.map((item) => ({
                label: item.date,
                value: item.revenue,
                date: item.date,
              })) ||
              []
            }
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Tabs
          defaultValue="transactions"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  className="pl-9 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  {activeTab === "transactions" && (
                    <SelectItem value="refunded">Refunded</SelectItem>
                  )}
                  {activeTab === "payouts" && (
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {activeTab === "transactions" && (
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFilter}
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="transactions" className="mt-0">
            <TransactionsTable
              transactions={transactions || []}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onViewDetails={(transaction) => {
                setSelectedTransaction(transaction);
                setDetailsDialogOpen(true);
              }}
              onRefund={(transaction) => {
                setSelectedTransaction(transaction);
                setRefundDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="invoices" className="mt-0">
            <InvoicesTable
              invoices={invoices || []}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onViewInvoice={(invoice) => {
                setSelectedInvoice(invoice);
                setInvoiceDetailsDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="payouts" className="mt-0">
            <PayoutsTable
              payouts={payouts || []}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onViewDetails={handleViewPayoutDetails}
              onProcessPayout={handleProcessPayout}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        onCreateInvoice={handleCreateInvoice}
        loading={loading}
      />

      <RefundDialog
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        transaction={selectedTransaction}
        onRefund={handleRefund}
        loading={loading}
      />

      <TransactionDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        transaction={selectedTransaction}
      />

      <InvoiceDetailsDialog
        open={invoiceDetailsDialogOpen}
        onOpenChange={setInvoiceDetailsDialogOpen}
        invoice={selectedInvoice}
        onDownload={(invoice) => {
          toast.success(`Downloading invoice #${invoice.invoiceNumber}...`);
          // Implement download logic
        }}
        onSendEmail={(invoice) => {
          toast.success(
            `Sending invoice #${invoice.invoiceNumber} to ${invoice.user?.email}`
          );
          // Implement email logic
        }}
      />

      <PayoutDetailsDialog
        open={payoutDetailsDialogOpen}
        onOpenChange={setPayoutDetailsDialogOpen}
        payout={selectedPayout}
        onProcess={handleProcessPayout}
        loading={loading}
      />
    </div>
  );
}
