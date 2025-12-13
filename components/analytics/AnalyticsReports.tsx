"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  Calendar,
  FileText,
  Download,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Users as UsersIcon,
  EllipsisVertical,
  BarChart3,
  PieChart,
  Eye,
  Check,
  Loader2,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  FileDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { useToast } from "@/context/ToastContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

type ReportType = "Overview" | "Sales" | "Engagement" | "Traffic" | "Custom";
type ReportStatus = "draft" | "scheduled" | "generated" | "failed";

type ReportItem = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  period: string;
  type: ReportType;
  status: ReportStatus;
  createdAt?: string;
  updatedAt?: string;
  generatedAt?: string;
  scheduledAt?: string;
  fileUrl?: string;
  fileFormat?: string;
  createdBy?: { firstName?: string; lastName?: string };
};

export default function AnalyticsReports() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [period, setPeriod] = React.useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const [reportType, setReportType] = React.useState<ReportType>("Overview");
  const [activeTab, setActiveTab] = React.useState<
    "Overview" | "Sales" | "Customers" | "Products" | "Marketing"
  >("Overview");
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<ReportItem | null>(
    null
  );
  const [exportFormat, setExportFormat] = React.useState<
    "pdf" | "csv" | "xlsx"
  >("pdf");

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    type: "Overview" as ReportType,
    period: "",
    status: "draft" as ReportStatus,
    autoGenerate: false,
  });

  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => analyticsService.getDashboardStats(),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: revenueData, isLoading: loadingRevenue } = useQuery({
    queryKey: ["analytics", "revenue", period],
    queryFn: () => analyticsService.getRevenueData({ period }),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: conversionRates } = useQuery({
    queryKey: ["analytics", "conversion"],
    queryFn: () => analyticsService.getConversionRates(),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: geoData } = useQuery({
    queryKey: ["analytics", "geo"],
    queryFn: () => analyticsService.getGeographicDistribution(),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: coursePerformance } = useQuery({
    queryKey: ["analytics", "course-performance"],
    queryFn: () => analyticsService.getCoursePerformance(),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ["analytics", "reports", reportType],
    queryFn: () =>
      analyticsService.getAllReports({
        type: reportType === "Overview" ? undefined : reportType,
      }),
    staleTime: 30_000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => analyticsService.createReport(data),
    onMutate: () => {
      push({ message: "Creating report...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Report created successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to create report",
        type: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      analyticsService.updateReport(id, data),
    onMutate: () => {
      push({ message: "Updating report...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Report updated successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
      setEditDialogOpen(false);
      setSelectedReport(null);
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to update report",
        type: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => analyticsService.deleteReport(id),
    onMutate: () => {
      push({ message: "Deleting report...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Report deleted successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
      setDeleteDialogOpen(false);
      setSelectedReport(null);
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to delete report",
        type: "error",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: (id: string) => analyticsService.generateReport(id),
    onMutate: () => {
      push({ message: "Generating report...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Report generated successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to generate report",
        type: "error",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: ({ id, format }: { id: string; format: string }) =>
      analyticsService.exportReport(id, format as any),
    onMutate: () => {
      push({ message: "Preparing export...", type: "loading", duration: 0 });
    },
    onSuccess: (data) => {
      push({ message: "Export ready for download!", type: "success" });
      if ((data as any)?.url) {
        window.open((data as any).url, "_blank");
      }
      setExportOpen(false);
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to export report",
        type: "error",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "Overview",
      period: "",
      status: "draft",
      autoGenerate: false,
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.period) {
      push({ message: "Please fill in all required fields", type: "error" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (!selectedReport || !formData.name) {
      push({ message: "Invalid report data", type: "error" });
      return;
    }
    updateMutation.mutate({
      id: selectedReport._id || selectedReport.id || "",
      data: formData,
    });
  };

  const handleDelete = () => {
    if (!selectedReport) return;
    deleteMutation.mutate(selectedReport._id || selectedReport.id || "");
  };

  const openEditDialog = (report: ReportItem) => {
    setSelectedReport(report);
    setFormData({
      name: report.name,
      description: report.description || "",
      type: report.type,
      period: report.period,
      status: report.status,
      autoGenerate: false,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (report: ReportItem) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const handleGenerate = (reportId: string) => {
    generateMutation.mutate(reportId);
  };

  const handleExport = (report: ReportItem) => {
    setSelectedReport(report);
    setExportOpen(true);
  };

  const confirmExport = () => {
    if (!selectedReport) return;
    exportMutation.mutate({
      id: selectedReport._id || selectedReport.id || "",
      format: exportFormat,
    });
  };

  const reports = (reportsData as any)?.reports || [];
  const filteredReports = reports.filter((r: ReportItem) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const statusConfig = {
    generated: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2,
      label: "Generated",
    },
    scheduled: {
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Clock,
      label: "Scheduled",
    },
    failed: {
      color: "bg-red-100 text-red-700 border-red-200",
      icon: AlertCircle,
      label: "Failed",
    },
    draft: {
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: FileText,
      label: "Draft",
    },
  };

  const funnel = [
    {
      label: "Page Views",
      value: ((conversionRates as any)?.funnelData?.visits ||
        (conversionRates as any)?.visits ||
        0) as number,
      pct: 100,
      bg: "bg-blue-500",
      icon: Eye,
      iconBg: "bg-blue-100",
      iconFg: "text-blue-600",
    },
    {
      label: "Add to Cart",
      value: ((conversionRates as any)?.addsToCart ?? 0) as number,
      pct: Number(
        (((conversionRates as any)?.addsToCart ?? 0) /
          Math.max(
            (conversionRates as any)?.funnelData?.visits ||
              (conversionRates as any)?.visits ||
              1,
            1
          )) *
          100
      ).toFixed(1),
      bg: "bg-purple-500",
      icon: ShoppingCart,
      iconBg: "bg-purple-100",
      iconFg: "text-purple-600",
    },
    {
      label: "Checkout",
      value: ((conversionRates as any)?.checkouts ?? 0) as number,
      pct: Number(
        (((conversionRates as any)?.checkouts ?? 0) /
          Math.max(
            (conversionRates as any)?.funnelData?.visits ||
              (conversionRates as any)?.visits ||
              1,
            1
          )) *
          100
      ).toFixed(1),
      bg: "bg-green-500",
      icon: CreditCard,
      iconBg: "bg-green-100",
      iconFg: "text-green-600",
    },
    {
      label: "Purchases",
      value: ((conversionRates as any)?.funnelData?.purchases ||
        (conversionRates as any)?.purchases ||
        0) as number,
      pct: Number(
        (((conversionRates as any)?.funnelData?.purchases ||
          (conversionRates as any)?.purchases ||
          0) /
          Math.max(
            (conversionRates as any)?.funnelData?.visits ||
              (conversionRates as any)?.visits ||
              1,
            1
          )) *
          100
      ).toFixed(1),
      bg: "bg-accent",
      icon: Check,
      iconBg: "bg-accent",
      iconFg: "text-white",
    },
  ];

  type CoursePerfItem = {
    title?: string;
    name?: string;
    enrollments?: number;
    sales?: number;
    revenue?: number | string;
    change?: string;
  };
  const topProducts = (
    ((coursePerformance as any)?.topPerformers || []) as CoursePerfItem[]
  ).map((c) => ({
    name: c?.title || c?.name || "",
    sales: c?.enrollments || c?.sales || 0,
    revenue:
      typeof c?.revenue === "number"
        ? `$${(c.revenue as number).toLocaleString()}`
        : c?.revenue || "",
    change: c?.change || "",
  }));

  type GeoItem = {
    country?: string;
    label?: string;
    name?: string;
    percentage?: number;
    pct?: number;
    visitsPct?: number;
    revenue?: number | string;
  };
  const geoArray = Array.isArray((geoData as any)?.countries)
    ? (geoData as any).countries
    : Array.isArray(geoData)
    ? geoData
    : [];
  const geo = (geoArray as GeoItem[]).slice(0, 10).map((g, i: number) => ({
    label: g?.country || g?.label || g?.name || `Country ${i + 1}`,
    pct: (typeof g?.percentage === "number"
      ? g.percentage
      : typeof g?.pct === "number"
      ? g.pct
      : typeof g?.visitsPct === "number"
      ? g.visitsPct
      : 0) as number,
    revenue:
      typeof g?.revenue === "number"
        ? `$${(g.revenue as number).toLocaleString()}`
        : g?.revenue || "",
    bar: [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-indigo-500",
      "bg-teal-500",
    ][i % 5],
  }));

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics & Reports
          </h2>
          <p className="text-gray-600">
            Track performance metrics and generate business reports
          </p>
        </div>
        <div className="flex space-x-3 items-center flex-wrap">
          {(loadingDashboard || loadingRevenue) && (
            <span className="inline-flex items-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading data
            </span>
          )}
          <Button
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["analytics"] });
              push({
                message: "Refreshing data...",
                type: "loading",
                duration: 1000,
              });
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Report
          </Button>
        </div>
      </div>

      {/* Tabs */}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="w-full"
      >
        <TabsList className="bg-card rounded-xl p-1 shadow-sm border border-gray-100">
          {(
            ["Overview", "Sales", "Customers", "Products", "Marketing"] as const
          ).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-[state=active]:bg-primary data-[state=active]:text-white px-6 py-2 rounded-lg transition-all"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab} className="mt-0" />
      </Tabs>

      {/* Filters */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Today", value: "day" },
              { label: "Last 7 days", value: "week" },
              { label: "Last 30 days", value: "month" },
              { label: "This Year", value: "year" },
            ].map(({ label, value }) => (
              <Button
                key={value}
                variant={period === value ? "default" : "secondary"}
                className={
                  period === value
                    ? "shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
                onClick={() => setPeriod(value as typeof period)}
              >
                <Calendar className="w-4 h-4 mr-2" /> {label}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select
              value={reportType}
              onValueChange={(v) => setReportType(v as ReportType)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Overview">All Reports</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Engagement">Engagement</SelectItem>
                <SelectItem value="Traffic">Traffic</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search reports and metrics..."
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Revenue",
            value: (dashboard as any)?.overview?.totalRevenue,
            format: "currency",
            growth: (revenueData as any)?.growth,
            icon: CreditCard,
            color: "primary",
          },
          {
            label: "Enrollments",
            value: (dashboard as any)?.overview?.totalEnrollments,
            format: "number",
            subtext: `${
              (dashboard as any)?.overview?.conversionRate?.toFixed(1) || 0
            }% CR`,
            icon: ShoppingCart,
            color: "blue",
          },
          {
            label: "Conversion Rate",
            value: (dashboard as any)?.overview?.conversionRate,
            format: "percent",
            icon: TrendingUp,
            color: "green",
          },
          {
            label: "Active Users",
            value: (dashboard as any)?.overview?.activeUsers,
            format: "number",
            icon: UsersIcon,
            color: "purple",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stat.format === "currency" && typeof stat.value === "number"
                    ? `$${stat.value.toLocaleString()}`
                    : stat.format === "percent" &&
                      typeof stat.value === "number"
                    ? `${stat.value.toFixed(1)}%`
                    : typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : "—"}
                </p>
                {stat.growth !== undefined && (
                  <p
                    className={`text-sm mt-1 flex items-center gap-1 ${
                      stat.growth > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.growth > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.growth > 0 ? "+" : ""}
                    {stat.growth.toFixed(1)}%
                  </p>
                )}
                {stat.subtext && (
                  <p className="text-accent text-sm mt-1">{stat.subtext}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <stat.icon className="text-primary w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Revenue Overview
            </h3>
            <div className="flex space-x-2">
              {["Monthly", "Quarterly", "Yearly"].map((btn, i) => (
                <button
                  key={btn}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    i === 0
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 rounded-lg flex items-center justify-center">
            {loadingRevenue ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Revenue chart placeholder
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Sales Funnel
            </h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
              View Details
            </button>
          </div>
          <div className="space-y-4">
            {funnel.map((step, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 ${step.iconBg} rounded-lg flex items-center justify-center transition-transform hover:scale-110`}
                    >
                      <step.icon className={`${step.iconFg} w-4 h-4`} />
                    </div>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {step.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{step.pct}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${step.bg} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">
              Top Performing Products
            </h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200" />
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.sales} enrollments
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{p.revenue}</div>
                  <div className="text-xs text-accent">{p.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">
              Customer Acquisition
            </h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              View Report
            </button>
          </div>
          <div className="h-64 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
            <PieChart className="w-6 h-6 text-gray-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Geographic Distribution
          </h3>
          <div className="space-y-4">
            {geo.map((g, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-4 ${g.bar} rounded-sm`} />
                    <span className="text-sm">{g.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{g.pct}%</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {g.revenue}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${g.bar} rounded-full h-2`}
                    style={{ width: `${g.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Device Analytics
          </h3>
          <div className="space-y-4">
            {[
              { label: "Desktop", pct: 58, bar: "bg-blue-500" },
              { label: "Mobile", pct: 34, bar: "bg-green-500" },
              { label: "Tablet", pct: 8, bar: "bg-purple-500" },
            ].map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{d.label}</span>
                  <span className="text-sm font-medium">{d.pct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${d.bar} rounded-full h-2`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-secondary">
            Recent Reports
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-secondary">
                <EllipsisVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setExportOpen(true)}>
                <Download className="w-4 h-4 mr-2" /> Export Table
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" /> Generate Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3 font-medium">Event</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">When</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {((dashboard as any)?.recentActivities || []).map(
                (
                  act: {
                    eventType?: string;
                    createdAt?: string;
                    user?: { firstName?: string; lastName?: string };
                  },
                  idx: number
                ) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-secondary">
                      {act.eventType || "Activity"}
                    </td>
                    <td className="py-3">
                      {act.user
                        ? `${act.user.firstName ?? ""} ${
                            act.user.lastName ?? ""
                          }`.trim()
                        : "—"}
                    </td>
                    <td className="py-3">
                      {act.createdAt
                        ? formatDistanceToNow(new Date(act.createdAt), {
                            addSuffix: true,
                          })
                        : "—"}
                    </td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        Recorded
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="text-primary hover:text-primary/80">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            className="border-gray-300 mr-2"
            onClick={() => setExportOpen(true)}
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-primary" /> Export Reports
            </DialogTitle>
            <DialogDescription>Select format and confirm</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <Select defaultValue="csv">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="xlsx">XLSX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={() => setExportOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  push({
                    message: "Preparing export...",
                    type: "loading",
                    duration: 0,
                  });
                  setTimeout(() => {
                    push({ message: "Export ready", type: "success" });
                  }, 1200);
                  setExportOpen(false);
                }}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
