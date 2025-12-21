"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PlayCircle,
  Heart,
  Calendar,
  MessageSquare,
  Newspaper,
  Image as ImageIcon,
  ShieldCheck,
  CircleHelp,
  Users,
  RefreshCw,
  Download,
  Search,
  TrendingUp,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Settings,
  BarChart3,
} from "lucide-react";
import { useCMSOverview } from "@/hooks/useCMSOverview";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const iconMap: Record<string, React.ReactNode> = {
  PlayCircle: <PlayCircle className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  Calendar: <Calendar className="w-6 h-6" />,
  MessageSquare: <MessageSquare className="w-6 h-6" />,
  Newspaper: <Newspaper className="w-6 h-6" />,
  Image: <ImageIcon className="w-6 h-6" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6" />,
  CircleHelp: <CircleHelp className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="secondary" className="bg-gray-500">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      );
    case "configured":
      return (
        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Configured
        </Badge>
      );
    case "empty":
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700">
          <EyeOff className="w-3 h-3 mr-1" />
          Empty
        </Badge>
      );
    case "loading":
      return (
        <Badge variant="secondary">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Loading
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <Settings className="w-3 h-3 mr-1" />
          Manage
        </Badge>
      );
  }
};

export default function CMS() {
  const {
    stats,
    sections,
    loading,
    error,
    refreshing,
    refreshOverview,
    exportCMSData,
  } = useCMSOverview();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [activeTab, setActiveTab] = React.useState("overview");
  const [isExporting, setIsExporting] = React.useState(false);

  const filteredSections = React.useMemo(() => {
    return sections.filter((section) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!section.label.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== "all" && section.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "active" && section.status !== "active") {
          return false;
        }
        if (statusFilter === "inactive" && section.status !== "inactive") {
          return false;
        }
        if (statusFilter === "empty" && section.status !== "empty") {
          return false;
        }
        if (statusFilter === "configured" && section.status !== "configured") {
          return false;
        }
      }

      return true;
    });
  }, [sections, searchQuery, categoryFilter, statusFilter]);

  const statCards = React.useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "Banners",
        value: stats.banners.total,
        active: stats.banners.active,
        iconBg: "bg-primary/10",
        icon: <PlayCircle className="text-primary w-6 h-6" />,
        trend: "+12%",
      },
      {
        label: "Events",
        value: stats.events.total,
        active: stats.events.active,
        iconBg: "bg-green-100",
        icon: <Calendar className="text-green-600 w-6 h-6" />,
        trend: "+5%",
      },
      {
        label: "Testimonials",
        value: stats.testimonials.total,
        active: stats.testimonials.active,
        iconBg: "bg-purple-100",
        icon: <MessageSquare className="text-purple-600 w-6 h-6" />,
        trend: "+8%",
      },
      {
        label: "Blog Posts",
        value: stats.blogPosts.total,
        active: stats.blogPosts.published,
        iconBg: "bg-orange-100",
        icon: <Newspaper className="text-orange-600 w-6 h-6" />,
        trend: "+15%",
      },
    ];
  }, [stats]);

  const handleExport = async (format: "json" | "csv") => {
    setIsExporting(true);
    try {
      await exportCMSData(format);
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const completionPercentage = React.useMemo(() => {
    if (!sections.length) return 0;
    const configured = sections.filter(
      (s) => s.status === "active" || s.status === "configured"
    ).length;
    return Math.round((configured / sections.length) * 100);
  }, [sections]);

  if (loading && !stats) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Content Management System
                </h2>
                <p className="text-slate-600 text-sm">
                  Manage homepage sections and content pages
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting || loading}>
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={refreshOverview}
              disabled={refreshing || loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Completion Progress */}
        <Card className="mb-8 border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                CMS Completion
              </CardTitle>
              <Badge variant="outline" className="text-lg font-bold">
                {completionPercentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-sm text-slate-600 mt-2">
              {
                sections.filter(
                  (s) => s.status === "active" || s.status === "configured"
                ).length
              }{" "}
              of {sections.length} sections configured
            </p>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((s, i) => (
            <Card
              key={i}
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-slate-600 text-sm font-medium mb-1">
                      {s.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">
                      {s.value}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        {s.active} Active
                      </Badge>
                      <span className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {s.trend}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-14 h-14 ${s.iconBg} rounded-xl flex items-center justify-center`}
                  >
                    {s.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for Organization */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <TabsList className="grid w-full lg:w-auto grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 lg:flex-initial lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="pages">Pages</SelectItem>
                  <SelectItem value="policies">Policies</SelectItem>
                  <SelectItem value="navigation">Navigation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="configured">Configured</SelectItem>
                  <SelectItem value="empty">Empty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections.map((sec) => (
                <Card
                  key={sec.id}
                  className="shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        {iconMap[sec.icon] || <FileText className="w-6 h-6" />}
                      </div>
                      {getStatusBadge(sec.status)}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{sec.label}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {sec.category}
                      </Badge>
                      <Link href={sec.href} className="inline-flex">
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredSections.length === 0 && (
              <Card className="border-slate-200">
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No sections found
                  </h3>
                  <p className="text-slate-600">
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="home" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections
                .filter((s) => s.category === "home")
                .map((sec) => (
                  <Card
                    key={sec.id}
                    className="shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          {iconMap[sec.icon] || (
                            <FileText className="w-6 h-6" />
                          )}
                        </div>
                        {getStatusBadge(sec.status)}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {sec.label}
                      </h3>
                      <Link href={sec.href} className="inline-flex">
                        <Button size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections
                .filter((s) => s.category === "pages")
                .map((sec) => (
                  <Card
                    key={sec.id}
                    className="shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          {iconMap[sec.icon] || (
                            <FileText className="w-6 h-6" />
                          )}
                        </div>
                        {getStatusBadge(sec.status)}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {sec.label}
                      </h3>
                      <Link href={sec.href} className="inline-flex">
                        <Button size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections
                .filter((s) => s.category === "policies")
                .map((sec) => (
                  <Card
                    key={sec.id}
                    className="shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          {iconMap[sec.icon] || (
                            <FileText className="w-6 h-6" />
                          )}
                        </div>
                        {getStatusBadge(sec.status)}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {sec.label}
                      </h3>
                      <Link href={sec.href} className="inline-flex">
                        <Button size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
