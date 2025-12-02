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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReportItem = {
  id: string;
  name: string;
  period: string;
  type: "Overview" | "Sales" | "Engagement" | "Traffic";
  status: "generated" | "scheduled" | "failed";
};

const initialReports: ReportItem[] = [
  {
    id: "r1",
    name: "Monthly Sales Summary",
    period: "Nov 2025",
    type: "Sales",
    status: "generated",
  },
  {
    id: "r2",
    name: "User Engagement Overview",
    period: "Last 30 days",
    type: "Engagement",
    status: "generated",
  },
  {
    id: "r3",
    name: "Traffic Sources",
    period: "Last 7 days",
    type: "Traffic",
    status: "scheduled",
  },
  {
    id: "r4",
    name: "Executive KPI Overview",
    period: "Q4 2025",
    type: "Overview",
    status: "generated",
  },
];

export default function AnalyticsReports() {
  const [dateRange, setDateRange] = React.useState("Last 30 days");
  const [reportType, setReportType] =
    React.useState<ReportItem["type"]>("Overview");
  const [activeTab, setActiveTab] = React.useState(
    "Overview" as "Overview" | "Sales" | "Customers" | "Products" | "Marketing"
  );
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);

  const filteredReports = initialReports.filter((r) => {
    const matchesType = reportType
      ? r.type === reportType || reportType === "Overview"
      : true;
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const statusChip = (s: ReportItem["status"]) =>
    s === "generated"
      ? "bg-green-100 text-green-700"
      : s === "scheduled"
      ? "bg-blue-100 text-blue-700"
      : "bg-red-100 text-red-700";

  const funnel = [
    {
      label: "Page Views",
      value: 24847,
      pct: 100,
      bg: "bg-blue-500",
      icon: Eye,
      iconBg: "bg-blue-100",
      iconFg: "text-blue-600",
    },
    {
      label: "Add to Cart",
      value: 4562,
      pct: 18.4,
      bg: "bg-purple-500",
      icon: ShoppingCart,
      iconBg: "bg-purple-100",
      iconFg: "text-purple-600",
    },
    {
      label: "Checkout",
      value: 1847,
      pct: 7.4,
      bg: "bg-green-500",
      icon: CreditCard,
      iconBg: "bg-green-100",
      iconFg: "text-green-600",
    },
    {
      label: "Purchases",
      value: 1247,
      pct: 5.0,
      bg: "bg-accent",
      icon: Check,
      iconBg: "bg-accent",
      iconFg: "text-white",
    },
  ];

  const topProducts = [
    {
      name: "Web Development Bootcamp",
      sales: 156,
      revenue: "$31,164",
      change: "+24%",
    },
    {
      name: "Data Science Fundamentals",
      sales: 87,
      revenue: "$11,313",
      change: "+18%",
    },
    {
      name: "Advanced Python Programming",
      sales: 124,
      revenue: "$11,159",
      change: "+15%",
    },
    {
      name: "JavaScript E-book Bundle",
      sales: 73,
      revenue: "$3,649",
      change: "+32%",
    },
  ];

  const geo = [
    { label: "United States", pct: 42, revenue: "$35,418", bar: "bg-blue-500" },
    {
      label: "United Kingdom",
      pct: 18,
      revenue: "$15,179",
      bar: "bg-green-500",
    },
    { label: "Canada", pct: 12, revenue: "$9,842", bar: "bg-purple-500" },
    { label: "Germany", pct: 9, revenue: "$8,115", bar: "bg-indigo-500" },
  ];

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Analytics & Reports
          </h2>
          <p className="text-gray-600">
            Track performance metrics and generate business reports
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={() => setExportOpen(true)}
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" /> Create Report
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-1 shadow-sm border border-gray-100 mb-8 inline-flex">
        {(
          ["Overview", "Sales", "Customers", "Products", "Marketing"] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${
              activeTab === tab
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } px-6 py-2 rounded-lg text-sm font-medium transition-colors`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {["Last 7 days", "Last 30 days", "Last 90 days", "This Month"].map(
              (label) => (
                <Button
                  key={label}
                  variant={dateRange === label ? "default" : "secondary"}
                  className={
                    dateRange === label
                      ? ""
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                  onClick={() => setDateRange(label)}
                >
                  <Calendar className="w-4 h-4 mr-2" /> {label}
                </Button>
              )
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={reportType}
              onValueChange={(v) => setReportType(v as ReportItem["type"])}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Overview">Overview</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Engagement">Engagement</SelectItem>
                <SelectItem value="Traffic">Traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Search reports and metrics..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-secondary mt-1">$84,329</p>
              <p className="text-accent text-sm mt-1">+18.2%</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCard className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Orders</p>
              <p className="text-2xl font-bold text-secondary mt-1">1,240</p>
              <p className="text-accent text-sm mt-1">+5.6%</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">3.2%</p>
              <p className="text-accent text-sm mt-1">Up</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold text-secondary mt-1">5,903</p>
              <p className="text-gray-500 text-sm mt-1">Stable</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <UsersIcon className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">
              Revenue Overview
            </h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-primary text-white rounded-lg text-sm">
                Monthly
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                Quarterly
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                Yearly
              </button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-gray-300" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">
              Sales Funnel
            </h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              View Details
            </button>
          </div>
          <div className="space-y-4">
            {funnel.map((step, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 ${step.iconBg} rounded-lg flex items-center justify-center`}
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
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${step.bg} rounded-full h-2`}
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
                    <div className="text-xs text-gray-500">{p.sales} sales</div>
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
                <th className="pb-3 font-medium">Report</th>
                <th className="pb-3 font-medium">Period</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredReports.map((r) => (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="py-3 font-medium text-secondary">{r.name}</td>
                  <td className="py-3">{r.period}</td>
                  <td className="py-3">{r.type}</td>
                  <td className="py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusChip(
                        r.status
                      )}`}
                    >
                      {r.status === "generated"
                        ? "Generated"
                        : r.status === "scheduled"
                        ? "Scheduled"
                        : "Failed"}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-primary hover:text-primary/80">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
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
            <DialogTitle>Export Reports</DialogTitle>
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
              <Button onClick={() => setExportOpen(false)}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
