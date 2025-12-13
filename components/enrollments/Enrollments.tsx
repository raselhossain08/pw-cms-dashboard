"use client";

import * as React from "react";
import {
  UserPlus,
  Download,
  Search as SearchIcon,
  Grid2x2,
  List,
  ArrowUp,
  BarChart2,
  Users,
  CheckCircle,
  Clock,
  EllipsisVertical,
  Eye,
  Edit,
  Trash2,
  X,
  Check,
  Ban,
  Loader2,
  AlertCircle,
  UserCheck,
  Calendar,
  Mail,
  Book,
  GraduationCap,
  TrendingUp,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useToast } from "@/context/ToastContext";
import { Enrollment } from "@/services/enrollments.service";
import { coursesService } from "@/services/courses.service";
import { usersService } from "@/services/users.service";

export default function Enrollments() {
  const {
    enrollments,
    stats,
    distribution,
    loading,
    statsLoading,
    distributionLoading,
    total,
    fetchEnrollments,
    fetchStats,
    fetchDistribution,
    getEnrollmentById,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    bulkDeleteEnrollments,
    approveEnrollment,
    cancelEnrollment,
    exportEnrollments,
  } = useEnrollments();

  const { push } = useToast();

  const [search, setSearch] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [instructorFilter, setInstructorFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Dialog states
  const [createOpen, setCreateOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] =
    React.useState<Enrollment | null>(null);

  // Form states
  const [formLoading, setFormLoading] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    studentId: "",
    courseId: "",
    status: "active" as "active" | "pending",
  });
  const [editForm, setEditForm] = React.useState({
    status: "",
    notes: "",
  });
  const [cancelReason, setCancelReason] = React.useState("");

  // Dropdown data
  const [courses, setCourses] = React.useState<any[]>([]);
  const [students, setStudents] = React.useState<any[]>([]);
  const [instructors, setInstructors] = React.useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = React.useState(false);
  const [studentsLoading, setStudentsLoading] = React.useState(false);

  // Load initial data
  React.useEffect(() => {
    loadData();
  }, [
    page,
    search,
    courseFilter,
    statusFilter,
    instructorFilter,
    sortBy,
    sortOrder,
  ]);

  React.useEffect(() => {
    fetchStats();
    fetchDistribution();
    loadDropdownData();
  }, []);

  const loadData = async () => {
    const params: any = { page, limit, sortBy, sortOrder };
    if (search) params.search = search;
    if (courseFilter !== "all") params.courseId = courseFilter;
    if (statusFilter !== "all") params.status = statusFilter;
    if (instructorFilter !== "all") params.instructorId = instructorFilter;

    await fetchEnrollments(params);
  };

  const loadDropdownData = async () => {
    try {
      setCoursesLoading(true);
      setStudentsLoading(true);

      const [coursesData, studentsData, instructorsData] = await Promise.all([
        coursesService.getAllCourses({ limit: 100 }),
        usersService.getAllUsers({ role: "student", limit: 100 }),
        usersService.getAllUsers({ role: "instructor", limit: 100 }),
      ]);

      setCourses((coursesData as any).courses || []);
      setStudents((studentsData as any).users || []);
      setInstructors((instructorsData as any).users || []);
    } catch (error) {
      push({ type: "error", message: "Failed to load dropdown data" });
    } finally {
      setCoursesLoading(false);
      setStudentsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await createEnrollment(createForm);
      setCreateOpen(false);
      setCreateForm({ studentId: "", courseId: "", status: "active" });
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = async (enrollment: Enrollment) => {
    setFormLoading(true);
    try {
      const detailed = await getEnrollmentById(enrollment._id);
      setSelectedEnrollment(detailed);
      setViewOpen(true);
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setEditForm({
      status: enrollment.status,
      notes: enrollment.notes?.join("\n") || "",
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    setFormLoading(true);
    try {
      await updateEnrollment(selectedEnrollment._id, {
        status: editForm.status as any,
        notes: editForm.notes.split("\n").filter(Boolean),
      });
      setEditOpen(false);
      setSelectedEnrollment(null);
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEnrollment) return;

    setFormLoading(true);
    try {
      await deleteEnrollment(selectedEnrollment._id);
      setDeleteOpen(false);
      setSelectedEnrollment(null);
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setFormLoading(true);
    try {
      await bulkDeleteEnrollments(selectedIds);
      setBulkDeleteOpen(false);
      setSelectedIds([]);
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (enrollment: Enrollment) => {
    try {
      await approveEnrollment(enrollment._id);
      loadData();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancelEnrollment = async () => {
    if (!selectedEnrollment) return;

    setFormLoading(true);
    try {
      await cancelEnrollment(selectedEnrollment._id, cancelReason);
      setCancelOpen(false);
      setSelectedEnrollment(null);
      setCancelReason("");
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      await exportEnrollments({
        format,
        courseId: courseFilter !== "all" ? courseFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === enrollments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(enrollments.map((e) => e._id));
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      active: { label: "Active", className: "bg-green-600" },
      pending: { label: "Pending", className: "bg-yellow-500" },
      completed: { label: "Completed", className: "bg-blue-600" },
      dropped: { label: "Dropped", className: "bg-red-600" },
      cancelled: { label: "Cancelled", className: "bg-gray-600" },
      expired: { label: "Expired", className: "bg-orange-600" },
    };
    const badge = badges[status] || badges.active;
    return (
      <span
        className={`text-white text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStudentName = (enrollment: Enrollment) => {
    const student = enrollment.student;
    return (
      student?.name ||
      `${student?.firstName || ""} ${student?.lastName || ""}`.trim() ||
      student?.email ||
      "Unknown"
    );
  };

  const getCourseName = (enrollment: Enrollment) => {
    return enrollment.course?.title || "Unknown Course";
  };

  const getInstructorName = (enrollment: Enrollment) => {
    const instructor = enrollment.course?.instructor as any;
    return (
      instructor?.name ||
      `${instructor?.firstName || ""} ${instructor?.lastName || ""}`.trim() ||
      "Unknown"
    );
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        document.getElementById("enrollment-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Enrollments
          </h2>
          <p className="text-gray-600">
            Manage student enrollments, track progress, and handle course
            registrations
          </p>
        </div>
        <div className="flex space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-300">
                <Download className="w-4 h-4 mr-2" /> Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> New Enrollment
          </Button>
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Enrollments
                  </p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.totalEnrollments?.toLocaleString() || 0}
                  </p>
                  <p className="text-accent text-sm mt-1">
                    <ArrowUp className="inline w-3 h-3" /> Growing steadily
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="text-primary w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Active Enrollments
                  </p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.activeEnrollments?.toLocaleString() || 0}
                  </p>
                  <p className="text-accent text-sm mt-1">Currently learning</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-accent w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.completionRate || 0}%
                  </p>
                  <p className="text-accent text-sm mt-1">Improving steadily</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <BarChart2 className="text-yellow-600 w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Pending Approvals
                  </p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.pendingEnrollments || 0}
                  </p>
                  <p className="text-accent text-sm mt-1">
                    {stats?.pendingEnrollments
                      ? "Action required"
                      : "All clear"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-purple-600 w-6 h-6" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-secondary">
            Enrollment Trends
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
            <BarChart2 className="w-10 h-10 mx-auto mb-2" />
            <p>Enrollment trends visualization would appear here</p>
            <p className="text-sm">
              Showing daily enrollment patterns and growth metrics
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Courses">All Courses</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Digital Marketing">
                  Digital Marketing
                </SelectItem>
                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={instructorFilter}
              onValueChange={setInstructorFilter}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Instructors">All Instructors</SelectItem>
                <SelectItem value="Dr. James Wilson">
                  Dr. James Wilson
                </SelectItem>
                <SelectItem value="Dr. Maria Rodriguez">
                  Dr. Maria Rodriguez
                </SelectItem>
                <SelectItem value="Prof. David Kim">Prof. David Kim</SelectItem>
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
                <SelectItem value="Progress">Sort by: Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="enrollment-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search enrollments... (Cmd+K)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Grid2x2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600">
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Course Enrollment Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-primary mb-2">1,247</div>
            <div className="text-sm text-gray-600">Web Development</div>
            <div className="text-xs text-gray-500 mt-1">32% of enrollments</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-blue-600 mb-2">892</div>
            <div className="text-sm text-gray-600">Data Science</div>
            <div className="text-xs text-gray-500 mt-1">23% of enrollments</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-purple-600 mb-2">956</div>
            <div className="text-sm text-gray-600">UI/UX Design</div>
            <div className="text-xs text-gray-500 mt-1">25% of enrollments</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-green-600 mb-2">752</div>
            <div className="text-sm text-gray-600">Digital Marketing</div>
            <div className="text-xs text-gray-500 mt-1">20% of enrollments</div>
          </div>
        </div>
      </div>

      {/* Grid Cards - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {enrollments.map((it: Enrollment) => (
          <div
            key={it._id}
            className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={it.student?.avatar || "/avatar-placeholder.png"}
                  alt={getStudentName(it)}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-secondary">
                    {getStudentName(it)}
                  </h3>
                  <p className="text-sm text-gray-500">{getCourseName(it)}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <EllipsisVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Enrollment</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Message</DropdownMenuItem>
                  <DropdownMenuItem>View Analytics</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>{it.course?.description || "No description"}</span>
                {getStatusBadge(it.status)}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Enrolled:</span>
                <span className="font-medium">{formatDate(it.createdAt)}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span className="font-medium">{it.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: `${it.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {getInstructorName(it)}
                </span>
                <span>
                  {Object.keys(it.completedLessons || {}).length} lessons
                </span>
              </div>
              <div className="text-primary font-medium">
                {it.student?.email}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Enrollments Table - Always Visible */}
      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-secondary">
            All Enrollments
          </h3>
          <p className="text-gray-600 text-sm">
            Complete list of enrollments with detailed information
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Date
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
              {enrollments.map((it: Enrollment) => (
                <tr key={it._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={it.student?.avatar || "/avatar-placeholder.png"}
                        alt=""
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getStudentName(it)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {it.student?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getCourseName(it)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {it.course?.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getInstructorName(it)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${it.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {it.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(it.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(it.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {it.status === "pending" && (
                      <button
                        onClick={() => handleApprove(it)}
                        className="text-primary hover:text-primary/80 mr-3"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleView(it)}
                      className="text-gray-600 hover:text-primary"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">1-{enrollments.length}</span>{" "}
            of <span className="font-medium">{total}</span> enrollments
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

      {/* Enrollment Analytics Section */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Enrollment Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">68%</div>
            <div className="text-sm text-gray-600">Active Enrollments</div>
            <div className="text-xs text-gray-500 mt-1">2,954 students</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">24%</div>
            <div className="text-sm text-gray-600">Completed Courses</div>
            <div className="text-xs text-gray-500 mt-1">923 students</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-2">6%</div>
            <div className="text-sm text-gray-600">Pending Approval</div>
            <div className="text-xs text-gray-500 mt-1">231 students</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-2">2%</div>
            <div className="text-sm text-gray-600">Dropped Out</div>
            <div className="text-xs text-gray-500 mt-1">77 students</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <UserPlus className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">New Enrollment</p>
              <p className="text-sm text-gray-600">Add student to course</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-accent/5 hover:bg-accent/10 rounded-lg">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Users className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Bulk Enrollments</p>
              <p className="text-sm text-gray-600">Multiple students</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Data</p>
              <p className="text-sm text-gray-600">Enrollment reports</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <BarChart2 className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">View Analytics</p>
              <p className="text-sm text-gray-600">Enrollment insights</p>
            </div>
          </button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Enrollment</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCreateOpen(false);
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select student</option>
                  <option value="1">Sarah Johnson</option>
                  <option value="2">Michael Chen</option>
                  <option value="3">Emily Davis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="web">Web Development</option>
                  <option value="data">Data Science</option>
                  <option value="marketing">Digital Marketing</option>
                  <option value="design">UI/UX Design</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="james">Dr. James Wilson</option>
                  <option value="maria">Dr. Maria Rodriguez</option>
                  <option value="david">Prof. David Kim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modules Count
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0"
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
                placeholder="Any additional notes about this enrollment"
              ></textarea>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Enrollment Settings
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  defaultChecked
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Send welcome email
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  defaultChecked
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Grant immediate access
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Require profile completion
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Enrollment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
