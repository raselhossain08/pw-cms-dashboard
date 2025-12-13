"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  CheckCircle,
  GraduationCap,
  EllipsisVertical,
  ArrowUp,
  Search as SearchIcon,
  Eye,
  Pencil,
  Mail,
  ChartLine,
  Slash,
  Download,
  Upload,
  SlidersHorizontal,
  List,
  Grid2x2,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useStudents } from "@/hooks/useStudents";

type StudentItem = {
  _id: string;
  name: string;
  email: string;
  course?: string;
  courseDetail?: string;
  status: "active" | "inactive" | "pending" | "suspended";
  progressPercent?: number;
  scorePercent?: number;
  enrolledText?: string;
  joinedDate?: string;
  rating?: number;
  location?: string;
  courseCount?: number;
  avatarUrl?: string;
};

export default function Students() {
  const {
    students,
    stats,
    loading,
    statsLoading,
    total,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    updateStudentStatus,
    exportStudents,
  } = useStudents();

  const [search, setSearch] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("All Courses");
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [countryFilter, setCountryFilter] = React.useState("All Countries");
  const [sortBy, setSortBy] = React.useState("Newest");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] =
    React.useState<StudentItem | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(10);

  // Form state
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    course: "",
    status: "active",
    enrollmentDate: "",
    notes: "",
  });

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        const el = document.getElementById(
          "student-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Fetch students when filters change
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        status:
          statusFilter !== "All Status"
            ? statusFilter.toLowerCase()
            : undefined,
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, currentPage]);

  const filtered = students
    .filter((it) => {
      const matchesCourse =
        courseFilter === "All Courses" || it.course === courseFilter;
      return matchesCourse;
    })
    .sort((a, b) => {
      if (sortBy === "Progress")
        return (b.progressPercent || 0) - (a.progressPercent || 0);
      if (sortBy === "Score")
        return (b.scorePercent || 0) - (a.scorePercent || 0);
      return 0;
    });

  const totalPages = Math.ceil(total / pageSize);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStudent({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: Math.random().toString(36).slice(-8), // Generate temporary password
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        status: formData.status as any,
      });
      setCreateOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "",
        course: "",
        status: "active",
        enrollmentDate: "",
        notes: "",
      });
    } catch (error) {
      console.error("Failed to create student:", error);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await updateStudent(selectedStudent._id, {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        status: formData.status as any,
      });
      setEditOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    try {
      await deleteStudent(selectedStudent._id);
      setDeleteOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "active" | "inactive" | "suspended"
  ) => {
    try {
      await updateStudentStatus(id, status);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const openEditDialog = (student: StudentItem) => {
    setSelectedStudent(student);
    const names = student.name.split(" ");
    setFormData({
      firstName: names[0] || "",
      lastName: names.slice(1).join(" ") || "",
      email: student.email,
      phone: "",
      country: "",
      course: student.course || "",
      status: student.status,
      enrollmentDate: "",
      notes: "",
    });
    setEditOpen(true);
  };

  const openViewDialog = (student: StudentItem) => {
    setSelectedStudent(student);
    setViewOpen(true);
  };

  const openDeleteDialog = (student: StudentItem) => {
    setSelectedStudent(student);
    setDeleteOpen(true);
  };

  const handleExport = async () => {
    try {
      await exportStudents();
    } catch (error) {
      console.error("Failed to export students:", error);
    }
  };

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Students</h2>
          <p className="text-gray-600">
            Manage student accounts, progress, and performance
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
            Export Data
          </Button>
          <Button onClick={() => setCreateOpen(true)} disabled={loading}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.totalStudents || 0}
                </p>
                <p className="text-accent text-sm mt-1">
                  <ArrowUp className="inline w-3 h-3" /> +12% from last month
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
                  Active Students
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.activeStudents || 0}
                </p>
                <p className="text-accent text-sm mt-1">
                  <span className="inline-block w-2 h-2 bg-accent rounded-full mr-1"></span>{" "}
                  {stats?.totalStudents
                    ? (
                        (stats.activeStudents / stats.totalStudents) *
                        100
                      ).toFixed(1)
                    : 0}
                  % active rate
                </p>
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
                  Avg. Completion
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.avgCompletion || 0}%
                </p>
                <p className="text-accent text-sm mt-1">
                  <ArrowUp className="inline w-3 h-3" /> +8% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ChartLine className="text-yellow-600 w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg. Score</p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.avgScore || 0}%
                </p>
                <p className="text-accent text-sm mt-1">
                  <ArrowUp className="inline w-3 h-3" /> +5% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue placeholder="All Courses" />
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
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Probation">Probation</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Countries">All Countries</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="India">India</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue placeholder="Sort by: Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Newest">Sort by: Newest</SelectItem>
                <SelectItem value="Name">Sort by: Name</SelectItem>
                <SelectItem value="Progress">Sort by: Progress</SelectItem>
                <SelectItem value="Enrollment Date">
                  Sort by: Enrollment Date
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-80">
              <input
                id="student-search"
                type="text"
                placeholder="Search students... (Cmd+K)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary"
              >
                <Grid2x2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No students found
          </div>
        ) : (
          filtered.map((it) => (
            <div
              key={`card-${it._id}`}
              className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={it.avatarUrl}
                    alt={it.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-secondary">{it.name}</h3>
                    <p className="text-sm text-gray-500">{it.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 text-gray-400 hover:text-primary rounded">
                      <EllipsisVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={() => openViewDialog(it)}>
                      <Eye className="w-4 h-4 mr-2" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(it)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit Student
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="w-4 h-4 mr-2" /> Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ChartLine className="w-4 h-4 mr-2" /> View Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-700"
                      onClick={() =>
                        it.status === "active"
                          ? handleStatusChange(it._id, "inactive")
                          : handleStatusChange(it._id, "active")
                      }
                    >
                      {it.status === "active" ? (
                        <UserX className="w-4 h-4 mr-2" />
                      ) : (
                        <UserCheck className="w-4 h-4 mr-2" />
                      )}
                      {it.status === "active" ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-700"
                      onClick={() => openDeleteDialog(it)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <span>{it.course || "General"} Course</span>
                  {it.status === "pending" && (
                    <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-yellow-500">
                      Pending
                    </span>
                  )}
                  {it.status === "inactive" && (
                    <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-gray-500">
                      Inactive
                    </span>
                  )}
                  {it.status === "active" && (
                    <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-green-600">
                      Active
                    </span>
                  )}
                  {it.status === "suspended" && (
                    <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-red-600">
                      Suspended
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Joined: </span>
                  <span className="font-medium">{it.joinedDate}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Course Progress</span>
                  <span>{it.progressPercent || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (it.progressPercent || 0) >= 80
                        ? "bg-accent"
                        : (it.progressPercent || 0) >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${it.progressPercent || 0}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />{" "}
                    {it.rating || 0}
                  </span>
                  <span>{it.location || "Unknown"}</span>
                </div>
                <div className="text-primary font-medium">
                  {it.courseCount || 0}{" "}
                  {(it.courseCount || 0) === 1 ? "course" : "courses"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* All Students Table */}
      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-secondary">All Students</h3>
          <p className="text-gray-600 text-sm">
            Complete list of enrolled students with detailed information
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
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((it) => (
                <tr
                  key={`row-${it._id}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={it.avatarUrl}
                        alt=""
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {it.name}
                        </div>
                        <div className="text-sm text-gray-500">{it.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {it.course || "General"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {it.courseDetail || "Course Details"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            (it.progressPercent || 0) >= 80
                              ? "bg-accent"
                              : (it.progressPercent || 0) >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${it.progressPercent || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">
                        {it.progressPercent || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {it.scorePercent || 0}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {it.status === "active" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {it.status === "inactive" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                    {it.status === "pending" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                    {it.status === "suspended" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {it.joinedDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-primary hover:text-primary/80 mr-3"
                      onClick={() => openViewDialog(it)}
                    >
                      View
                    </button>
                    <button
                      className="text-primary hover:text-primary/80 mr-3"
                      onClick={() => openEditDialog(it)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-700"
                      onClick={() => openDeleteDialog(it)}
                    >
                      Delete
                    </button>
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
              {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, total)}
            </span>{" "}
            of <span className="font-medium">{total}</span> students
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 inline" /> Previous
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === page
                      ? "bg-primary text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                >
                  {page}
                </button>
              );
            })}
            <button
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next <ChevronRight className="w-4 h-4 inline" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Student Performance Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">24%</div>
            <div className="text-sm text-gray-600">Excellent Performance</div>
            <div className="text-xs text-gray-500 mt-1">564 students</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">45%</div>
            <div className="text-sm text-gray-600">Good Performance</div>
            <div className="text-xs text-gray-500 mt-1">1,281 students</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-2">21%</div>
            <div className="text-sm text-gray-600">Average Performance</div>
            <div className="text-xs text-gray-500 mt-1">598 students</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-2">10%</div>
            <div className="text-sm text-gray-600">Needs Improvement</div>
            <div className="text-xs text-gray-500 mt-1">284 students</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
            onClick={() => setCreateOpen(true)}
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <UserPlus className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Add Student</p>
              <p className="text-sm text-gray-600">New enrollment</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Mail className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Send Broadcast</p>
              <p className="text-sm text-gray-600">Email all students</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Data</p>
              <p className="text-sm text-gray-600">Student reports</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <ChartLine className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">View Analytics</p>
              <p className="text-sm text-gray-600">Performance insights</p>
            </div>
          </button>
        </div>
      </div>

      {/* Create Student Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Create a student account</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleCreateStudent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                >
                  <option value="">Select country</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                  <option value="in">India</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  required
                >
                  <option value="">Select course</option>
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
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.enrollmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, enrollmentDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Any additional info"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Account Settings
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
                  Generate temporary password
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Require password change on first login
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Pencil className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogDescription>
                  Update student information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleUpdateStudent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Update Student
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Student Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <DialogTitle>Student Details</DialogTitle>
                <DialogDescription>
                  View complete student information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={
                    selectedStudent.avatarUrl ||
                    "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
                  }
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-secondary">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedStudent.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="text-base font-medium text-secondary capitalize mt-1">
                    {selectedStudent.status}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Joined Date
                  </label>
                  <p className="text-base font-medium text-secondary mt-1">
                    {selectedStudent.joinedDate || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Course Progress
                  </label>
                  <p className="text-base font-medium text-secondary mt-1">
                    {selectedStudent.progressPercent || 0}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Average Score
                  </label>
                  <p className="text-base font-medium text-secondary mt-1">
                    {selectedStudent.scorePercent || 0}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rating
                  </label>
                  <p className="text-base font-medium text-secondary mt-1">
                    <Star className="w-4 h-4 inline text-yellow-400 fill-yellow-400" />{" "}
                    {selectedStudent.rating || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Enrolled Courses
                  </label>
                  <p className="text-base font-medium text-secondary mt-1">
                    {selectedStudent.courseCount || 0}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setViewOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setViewOpen(false);
                    openEditDialog(selectedStudent);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Student
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle>Delete Student</DialogTitle>
                <DialogDescription>
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{selectedStudent.name}</span>?
                This will permanently remove their account and all associated
                data.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDeleteOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteStudent}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Student
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
