"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { useAssignments } from "@/hooks/useAssignments";
import { coursesService } from "@/services/courses.service";
import { Assignment } from "@/services/assignments.service";
import {
  FileText,
  Calendar,
  Award,
  Users,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Plane,
  BookOpen,
  Target,
  TrendingUp,
  Power,
  PowerOff,
  CheckSquare,
  Copy,
  RefreshCw,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, isPast, differenceInDays } from "date-fns";

interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle?: string;
  instructorName?: string;
  dueDate: string;
  maxPoints: number;
  attachments: string[];
  status: "upcoming" | "due-soon" | "overdue";
  submissionsCount?: number;
  completionRate?: number;
}

export default function Assignments() {
  const { push } = useToast();
  const {
    assignments: assignmentsList,
    loading: assignmentsLoading,
    createAssignment: createAssignmentHook,
    updateAssignment: updateAssignmentHook,
    deleteAssignment: deleteAssignmentHook,
    toggleAssignmentStatus,
    duplicateAssignment: duplicateAssignmentHook,
    bulkDeleteAssignments,
    bulkToggleStatus,
    exportAssignments,
    refreshAssignments,
    getAssignmentStats,
    getAssignmentSubmissions,
    submissions,
    submissionsLoading,
  } = useAssignments();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("due-date");
  const [selectedCourse, setSelectedCourse] = React.useState<string>("");
  const [previewAssignment, setPreviewAssignment] =
    React.useState<AssignmentItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editAssignment, setEditAssignment] =
    React.useState<AssignmentItem | null>(null);
  const [submissionsOpen, setSubmissionsOpen] = React.useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<
    string | null
  >(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    courseId: "",
    dueDate: "",
    maxPoints: 100,
  });
  const [attachments, setAttachments] = React.useState<File[]>([]);

  // Fetch courses for selection
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => coursesService.getAllCourses({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const courses = React.useMemo(() => {
    const apiData = (coursesData as any)?.data || coursesData;
    const coursesList = apiData?.courses || [];
    return coursesList.map((c: any) => ({
      _id: c._id || c.id,
      title: c.title,
    }));
  }, [coursesData]);

  // Auto-select first course if available
  React.useEffect(() => {
    if (!selectedCourse && courses.length > 0) {
      setSelectedCourse(courses[0]._id);
    }
  }, [courses, selectedCourse]);

  // Fetch assignments when course changes
  React.useEffect(() => {
    if (selectedCourse) {
      refreshAssignments(selectedCourse);
    }
  }, [selectedCourse, refreshAssignments]);

  const assignments: AssignmentItem[] = React.useMemo(() => {
    return assignmentsList.map((a: Assignment) => {
      const dueDate = new Date(a.dueDate);
      const daysUntilDue = differenceInDays(dueDate, new Date());
      let status: "upcoming" | "due-soon" | "overdue" = "upcoming";

      if (isPast(dueDate)) {
        status = "overdue";
      } else if (daysUntilDue <= 3) {
        status = "due-soon";
      }

      return {
        id: a._id,
        title: a.title,
        description: a.description,
        courseId: typeof a.course === "object" ? a.course._id : a.course,
        courseTitle:
          typeof a.course === "object" ? (a.course as any).title : undefined,
        instructorName:
          typeof a.instructor === "object"
            ? `${(a.instructor as any).firstName || ""} ${
                (a.instructor as any).lastName || ""
              }`.trim()
            : undefined,
        dueDate: a.dueDate,
        maxPoints: a.maxPoints || 100,
        attachments: a.attachments || [],
        status,
        submissionsCount: 0, // Will be fetched from stats
        completionRate: 0, // Will be fetched from stats
      };
    });
  }, [assignmentsList]);

  const [assignmentStatsMap, setAssignmentStatsMap] = React.useState<
    Record<string, any>
  >({});

  // Fetch stats for each assignment
  React.useEffect(() => {
    const fetchStats = async () => {
      const statsPromises = assignments.map(async (assignment) => {
        try {
          const stats = await getAssignmentStats(assignment.id);
          return { id: assignment.id, stats };
        } catch (err) {
          return { id: assignment.id, stats: null };
        }
      });
      const results = await Promise.all(statsPromises);
      const statsMap: Record<string, any> = {};
      results.forEach(({ id, stats }) => {
        if (stats) statsMap[id] = stats;
      });
      setAssignmentStatsMap(statsMap);
    };

    if (assignments.length > 0) {
      fetchStats();
    }
  }, [assignments, getAssignmentStats]);

  const assignmentsWithStats = React.useMemo(() => {
    return assignments.map((assignment) => {
      const stats = assignmentStatsMap[assignment.id];
      return {
        ...assignment,
        submissionsCount: stats?.totalSubmissions || 0,
        completionRate: stats?.averageGrade
          ? Math.round((stats.averageGrade / assignment.maxPoints) * 100)
          : 0,
      };
    });
  }, [assignments, assignmentStatsMap]);

  const filtered = React.useMemo(() => {
    return assignmentsWithStats
      .filter((a) => {
        if (search) {
          const searchLower = search.toLowerCase();
          return (
            a.title.toLowerCase().includes(searchLower) ||
            a.description.toLowerCase().includes(searchLower) ||
            a.courseTitle?.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .filter((a) => {
        if (statusFilter === "all") return true;
        return a.status === statusFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "due-date":
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          case "title":
            return a.title.localeCompare(b.title);
          case "points":
            return b.maxPoints - a.maxPoints;
          case "submissions":
            return (b.submissionsCount || 0) - (a.submissionsCount || 0);
          default:
            return 0;
        }
      });
  }, [assignmentsWithStats, search, statusFilter, sortBy]);

  const stats = React.useMemo(() => {
    const total = assignmentsWithStats.length;
    const upcoming = assignmentsWithStats.filter(
      (a) => a.status === "upcoming"
    ).length;
    const dueSoon = assignmentsWithStats.filter(
      (a) => a.status === "due-soon"
    ).length;
    const overdue = assignmentsWithStats.filter(
      (a) => a.status === "overdue"
    ).length;
    const totalSubmissions = assignmentsWithStats.reduce(
      (sum, a) => sum + (a.submissionsCount || 0),
      0
    );
    const avgCompletion =
      assignmentsWithStats.length > 0
        ? Math.round(
            assignmentsWithStats.reduce(
              (sum, a) => sum + (a.completionRate || 0),
              0
            ) / assignmentsWithStats.length
          )
        : 0;

    return {
      total,
      upcoming,
      dueSoon,
      overdue,
      totalSubmissions,
      avgCompletion,
    };
  }, [assignmentsWithStats]);

  const handleCreateAssignment = async () => {
    if (!formData.title || !formData.courseId || !formData.dueDate) {
      push({ type: "error", message: "Please fill in all required fields" });
      return;
    }

    setActionLoading(true);
    try {
      // Upload attachments if any
      let attachmentUrls: string[] = [];
      if (attachments.length > 0) {
        // TODO: Implement file upload service
        // For now, we'll skip attachments
      }

      await createAssignmentHook(formData.courseId, {
        title: formData.title,
        description: formData.description,
        dueDate: new Date(formData.dueDate).toISOString(),
        maxPoints: formData.maxPoints,
        attachments: attachmentUrls,
      });
      setCreateOpen(false);
      setFormData({
        title: "",
        description: "",
        courseId: "",
        dueDate: "",
        maxPoints: 100,
      });
      setAttachments([]);
    } catch (err) {
      console.error("Failed to create assignment:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAssignment = async () => {
    if (!editAssignment || !formData.title || !formData.dueDate) {
      push({ type: "error", message: "Please fill in all required fields" });
      return;
    }

    setActionLoading(true);
    try {
      let attachmentUrls: string[] = [];
      if (attachments.length > 0) {
        // TODO: Implement file upload service
      }

      await updateAssignmentHook(editAssignment.id, {
        title: formData.title,
        description: formData.description,
        dueDate: new Date(formData.dueDate).toISOString(),
        maxPoints: formData.maxPoints,
        attachments: attachmentUrls,
      });
      setEditAssignment(null);
      setFormData({
        title: "",
        description: "",
        courseId: "",
        dueDate: "",
        maxPoints: 100,
      });
      setAttachments([]);
    } catch (err) {
      console.error("Failed to update assignment:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await deleteAssignmentHook(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete assignment:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setActionLoading(true);
    try {
      await toggleAssignmentStatus(id);
    } catch (err) {
      console.error("Failed to toggle assignment status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setActionLoading(true);
    try {
      await duplicateAssignmentHook(id);
    } catch (err) {
      console.error("Failed to duplicate assignment:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewSubmissions = async (id: string) => {
    setSelectedAssignmentId(id);
    setSubmissionsOpen(true);
    await getAssignmentSubmissions(id);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await bulkDeleteAssignments(selectedIds);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } catch (err) {
      console.error("Failed to bulk delete assignments:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkToggleStatus = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await bulkToggleStatus(selectedIds);
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to bulk toggle status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    setIsExporting(true);
    try {
      await exportAssignments(format, {
        courseId: selectedCourse || undefined,
      });
    } catch (err) {
      console.error("Failed to export assignments:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((a) => a.id));
    }
  };

  const openEditDialog = (assignment: AssignmentItem) => {
    setEditAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      dueDate: assignment.dueDate,
      maxPoints: assignment.maxPoints,
    });
    setAttachments([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <Clock className="w-3 h-3" />
            Upcoming
          </span>
        );
      case "due-soon":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">
            <AlertCircle className="w-3 h-3" />
            Due Soon
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Aviation Assignments
                  </h1>
                  <p className="text-slate-600 text-sm">
                    Manage flight training assignments and student submissions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isExporting || assignments.length === 0}
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh Button */}
              <Button
                variant="outline"
                onClick={() =>
                  selectedCourse && refreshAssignments(selectedCourse)
                }
                disabled={assignmentsLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    assignmentsLoading ? "animate-spin" : ""
                  }`}
                />
              </Button>

              {/* Create Button */}
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Assignments
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-primary text-sm mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.upcoming} upcoming
                </p>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="text-primary w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Due Soon
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.dueSoon}
                </p>
                <p className="text-amber-600 text-sm mt-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Within 3 days
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="text-amber-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Submissions
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.totalSubmissions}
                </p>
                <p className="text-green-600 text-sm mt-2 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Student work
                </p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <Upload className="text-green-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Avg. Completion
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.avgCompletion}%
                </p>
                <p className="text-purple-600 text-sm mt-2 flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  Completion rate
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                <Award className="text-purple-600 w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <Select
                value={selectedCourse}
                onValueChange={setSelectedCourse}
                disabled={coursesLoading}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-48 hover:bg-slate-100 transition-colors">
                  <SelectValue
                    placeholder={
                      coursesLoading ? "Loading..." : "Select Course"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-40 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="due-soon">Due Soon</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-52 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due-date">Due Date</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="points">Max Points</SelectItem>
                  <SelectItem value="submissions">Most Submissions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 lg:flex-initial lg:w-64">
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    <CheckSquare className="w-3 h-3 mr-1" />
                    {selectedIds.length} selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkToggleStatus}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4 mr-2" />
                    )}
                    Toggle Status
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkDeleteOpen(true)}
                    disabled={actionLoading}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear
                  </Button>
                </div>
              )}
              {selectedIds.length === 0 && filtered.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedIds.length === filtered.length &&
                      filtered.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-slate-600">Select All</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assignment Cards */}
        {assignmentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-80 animate-pulse bg-slate-100 rounded-xl border border-slate-200"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-200 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="text-slate-400 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {search || statusFilter !== "all"
                ? "No assignments found"
                : "No assignments yet"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for"
                : "Create your first flight training assignment to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((assignment) => (
              <div
                key={assignment.id}
                className="group bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Plane className="text-primary w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">
                        {assignment.title}
                      </h3>
                      {assignment.courseTitle && (
                        <p className="text-sm text-slate-500 truncate mt-0.5">
                          {assignment.courseTitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={selectedIds.includes(assignment.id)}
                      onCheckedChange={() => toggleSelection(assignment.id)}
                      className="mr-1"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-primary hover:bg-primary/10 shrink-0"
                          disabled={actionLoading}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onSelect={() => setPreviewAssignment(assignment)}
                        >
                          <Eye className="w-4 h-4 mr-2 text-primary" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleViewSubmissions(assignment.id)}
                        >
                          <Upload className="w-4 h-4 mr-2 text-green-600" />
                          <span>View Submissions</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => openEditDialog(assignment)}
                          disabled={actionLoading}
                        >
                          <Edit3 className="w-4 h-4 mr-2 text-slate-600" />
                          <span>Edit Assignment</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleDuplicate(assignment.id)}
                          disabled={actionLoading}
                        >
                          <Copy className="w-4 h-4 mr-2 text-blue-600" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleToggleStatus(assignment.id)}
                          disabled={actionLoading}
                        >
                          <Power className="w-4 h-4 mr-2 text-purple-600" />
                          <span>Toggle Status</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onSelect={() => setDeleteId(assignment.id)}
                          disabled={actionLoading}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Description */}
                {assignment.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium">Due:</span>
                    <span className="ml-2">
                      {format(
                        new Date(assignment.dueDate),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Award className="w-4 h-4 mr-2 text-amber-500" />
                    <span className="font-medium">Max Points:</span>
                    <span className="ml-2">{assignment.maxPoints}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    <span className="font-medium">Submissions:</span>
                    <span className="ml-2">
                      {assignment.submissionsCount || 0}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(assignment.status)}
                  {assignment.completionRate && (
                    <div className="text-sm font-semibold text-primary">
                      {assignment.completionRate}% complete
                    </div>
                  )}
                </div>

                {/* Progress */}
                {assignment.completionRate && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                      <span className="font-medium">Completion Rate</span>
                      <span className="font-semibold">
                        {assignment.completionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${assignment.completionRate}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                    onClick={() => setPreviewAssignment(assignment)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => handleViewSubmissions(assignment.id)}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Submissions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Assignment Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Create New Assignment
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Create a new flight training assignment for students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-700"
                >
                  Assignment Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Flight Planning Exercise - Cross Country"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-700"
                >
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Detailed instructions and requirements for the assignment"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="courseId"
                    className="text-sm font-medium text-slate-700"
                  >
                    Select Course *
                  </Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, courseId: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length > 0 ? (
                        courses.map((course: any) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="674845c8b4dc5d024c38e9c6" disabled>
                          No courses available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="maxPoints"
                    className="text-sm font-medium text-slate-700"
                  >
                    Max Points
                  </Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    min="1"
                    value={formData.maxPoints}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxPoints: parseInt(e.target.value) || 100,
                      })
                    }
                    className="focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Due Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dueDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.dueDate ? (
                        format(new Date(formData.dueDate), "PPP 'at' p")
                      ) : (
                        <span>Pick a due date and time</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={
                        formData.dueDate
                          ? new Date(formData.dueDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          // Set time to end of day if not specified
                          const dateWithTime = new Date(date);
                          dateWithTime.setHours(23, 59, 59);
                          setFormData({
                            ...formData,
                            dueDate: dateWithTime.toISOString(),
                          });
                        }
                      }}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Label className="text-xs text-slate-600 mb-2 block">
                        Time (optional)
                      </Label>
                      <Input
                        type="time"
                        value={
                          formData.dueDate
                            ? format(new Date(formData.dueDate), "HH:mm")
                            : ""
                        }
                        onChange={(e) => {
                          if (formData.dueDate && e.target.value) {
                            const [hours, minutes] = e.target.value.split(":");
                            const date = new Date(formData.dueDate);
                            date.setHours(parseInt(hours), parseInt(minutes));
                            setFormData({
                              ...formData,
                              dueDate: date.toISOString(),
                            });
                          }
                        }}
                        className="h-8"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Attachments & Resources
                </Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PDF, DOC, DOCX, Images (Max 10MB each)
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setAttachments(Array.from(e.target.files));
                      }
                    }}
                  />
                </div>
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-50 rounded-lg p-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm text-slate-700">
                            {file.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  setFormData({
                    title: "",
                    description: "",
                    courseId: "",
                    dueDate: "",
                    maxPoints: 100,
                  });
                  setAttachments([]);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAssignment}
                disabled={actionLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={!!previewAssignment}
          onOpenChange={(v) => !v && setPreviewAssignment(null)}
        >
          <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Assignment Details
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Complete assignment overview and requirements
              </DialogDescription>
            </DialogHeader>
            {previewAssignment && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {previewAssignment.title}
                  </h3>
                  {previewAssignment.description && (
                    <p className="text-slate-600 whitespace-pre-line">
                      {previewAssignment.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Due Date</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {format(
                        new Date(previewAssignment.dueDate),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Max Points</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {previewAssignment.maxPoints}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Submissions</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {previewAssignment.submissionsCount || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(previewAssignment.status)}
                    </div>
                  </div>
                </div>

                {previewAssignment.instructorName && (
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm text-primary font-medium mb-1">
                      Instructor
                    </p>
                    <p className="text-lg font-semibold text-blue-900">
                      {previewAssignment.instructorName}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteId}
          onOpenChange={(v) => !v && setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">
                Delete Assignment?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                This action cannot be undone. This will permanently delete the
                assignment and all student submissions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Assignment"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation */}
        <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">
                Delete Assignments?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                This action cannot be undone. This will permanently delete{" "}
                {selectedIds.length} assignment
                {selectedIds.length > 1 ? "s" : ""} and all student submissions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  `Delete ${selectedIds.length} Assignment${
                    selectedIds.length > 1 ? "s" : ""
                  }`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Assignment Dialog */}
        <Dialog
          open={!!editAssignment}
          onOpenChange={(open) => !open && setEditAssignment(null)}
        >
          <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Edit Assignment
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Update assignment details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-title"
                  className="text-sm font-medium text-slate-700"
                >
                  Assignment Title *
                </Label>
                <Input
                  id="edit-title"
                  placeholder="e.g., Flight Planning Exercise - Cross Country"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="text-sm font-medium text-slate-700"
                >
                  Description *
                </Label>
                <Textarea
                  id="edit-description"
                  placeholder="Detailed instructions and requirements for the assignment"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-maxPoints"
                    className="text-sm font-medium text-slate-700"
                  >
                    Max Points
                  </Label>
                  <Input
                    id="edit-maxPoints"
                    type="number"
                    min="1"
                    value={formData.maxPoints}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxPoints: parseInt(e.target.value) || 100,
                      })
                    }
                    className="focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Due Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dueDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.dueDate ? (
                          format(new Date(formData.dueDate), "PPP 'at' p")
                        ) : (
                          <span>Pick a due date and time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={
                          formData.dueDate
                            ? new Date(formData.dueDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            const dateWithTime = new Date(date);
                            dateWithTime.setHours(23, 59, 59);
                            setFormData({
                              ...formData,
                              dueDate: dateWithTime.toISOString(),
                            });
                          }
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Label className="text-xs text-slate-600 mb-2 block">
                          Time (optional)
                        </Label>
                        <Input
                          type="time"
                          value={
                            formData.dueDate
                              ? format(new Date(formData.dueDate), "HH:mm")
                              : ""
                          }
                          onChange={(e) => {
                            if (formData.dueDate && e.target.value) {
                              const [hours, minutes] =
                                e.target.value.split(":");
                              const date = new Date(formData.dueDate);
                              date.setHours(parseInt(hours), parseInt(minutes));
                              setFormData({
                                ...formData,
                                dueDate: date.toISOString(),
                              });
                            }
                          }}
                          className="h-8"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setEditAssignment(null);
                  setFormData({
                    title: "",
                    description: "",
                    courseId: "",
                    dueDate: "",
                    maxPoints: 100,
                  });
                  setAttachments([]);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditAssignment}
                disabled={actionLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Update Assignment
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Submissions Dialog */}
        <Dialog open={submissionsOpen} onOpenChange={setSubmissionsOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Assignment Submissions
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                View and grade student submissions
              </DialogDescription>
            </DialogHeader>
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission: any) => (
                  <div
                    key={submission._id}
                    className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {typeof submission.student === "object"
                            ? `${submission.student.firstName || ""} ${
                                submission.student.lastName || ""
                              }`.trim()
                            : "Student"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Submitted:{" "}
                          {format(
                            new Date(submission.submittedAt),
                            "PPP 'at' p"
                          )}
                        </p>
                      </div>
                      {submission.grade !== undefined && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700"
                        >
                          Grade: {submission.grade}
                        </Badge>
                      )}
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-slate-700 whitespace-pre-line">
                        {submission.content}
                      </p>
                    </div>
                    {submission.feedback && (
                      <div className="bg-blue-50 rounded p-3 mb-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Feedback:
                        </p>
                        <p className="text-sm text-blue-700">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                    {submission.attachments &&
                      submission.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {submission.attachments.map(
                            (url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                <FileText className="w-4 h-4 inline mr-1" />
                                Attachment {idx + 1}
                              </a>
                            )
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
