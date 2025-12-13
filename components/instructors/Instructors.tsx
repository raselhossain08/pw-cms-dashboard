"use client";

import * as React from "react";
import {
  Users2,
  UserPlus,
  ArrowUp,
  Search as SearchIcon,
  Grid2x2,
  List,
  Star,
  Book,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Download,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useInstructors,
  CreateInstructorDto,
  UpdateInstructorDto,
  Instructor,
} from "@/hooks/useInstructors";

type ViewMode = "grid" | "table";

export default function Instructors() {
  const {
    instructors,
    stats,
    loading,
    statsLoading,
    total,
    fetchInstructors,
    fetchStats,
    createInstructor,
    updateInstructor,
    deleteInstructor,
    approveInstructor,
    suspendInstructor,
    activateInstructor,
    deactivateInstructor,
  } = useInstructors();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [specializationFilter, setSpecializationFilter] =
    React.useState<string>("all");
  const [experienceFilter, setExperienceFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState("rating");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = React.useState("all");

  // Dialog states
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    React.useState<Instructor | null>(null);

  // Form states
  const [formData, setFormData] = React.useState<CreateInstructorDto>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    specialization: "",
    experience: "intermediate",
    country: "",
    status: "active",
  });
  const [formLoading, setFormLoading] = React.useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  // Fetch data on mount
  React.useEffect(() => {
    fetchInstructors();
    fetchStats();
  }, [fetchInstructors, fetchStats]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        const el = document.getElementById(
          "instructor-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Filter instructors
  const filteredInstructors = React.useMemo(() => {
    let filtered = [...instructors];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(searchLower) ||
          i.email.toLowerCase().includes(searchLower) ||
          (i.specialization &&
            i.specialization.toLowerCase().includes(searchLower))
      );
    }

    // Tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((i) => i.status === activeTab);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    // Specialization filter
    if (specializationFilter !== "all") {
      filtered = filtered.filter(
        (i) => i.specialization === specializationFilter
      );
    }

    // Experience filter
    if (experienceFilter !== "all") {
      filtered = filtered.filter((i) => i.experience === experienceFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "courses":
          return (b.coursesCount || 0) - (a.coursesCount || 0);
        case "students":
          return (b.studentsCount || 0) - (a.studentsCount || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    instructors,
    search,
    activeTab,
    statusFilter,
    specializationFilter,
    experienceFilter,
    sortBy,
  ]);

  // Pagination
  const paginatedInstructors = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInstructors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInstructors, currentPage]);

  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);

  // Get unique specializations
  const specializations = React.useMemo(() => {
    const specs = new Set(
      instructors.map((i) => i.specialization).filter(Boolean)
    );
    return Array.from(specs);
  }, [instructors]);

  // Form handlers
  const handleFormChange = (field: keyof CreateInstructorDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      specialization: "",
      experience: "intermediate",
      country: "",
      status: "active",
    });
  };

  const handleCreate = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) return;
    setFormLoading(true);
    try {
      await createInstructor(formData);
      setCreateOpen(false);
      resetForm();
      fetchStats();
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedInstructor) return;
    setFormLoading(true);
    try {
      await updateInstructor(
        selectedInstructor._id,
        formData as UpdateInstructorDto
      );
      setEditOpen(false);
      setSelectedInstructor(null);
      resetForm();
      fetchStats();
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInstructor) return;
    setFormLoading(true);
    try {
      await deleteInstructor(selectedInstructor._id);
      setDeleteOpen(false);
      setSelectedInstructor(null);
      fetchStats();
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (instructor: Instructor) => {
    try {
      await approveInstructor(instructor._id);
      fetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuspend = async (instructor: Instructor) => {
    try {
      await suspendInstructor(instructor._id);
      fetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const handleActivate = async (instructor: Instructor) => {
    try {
      await activateInstructor(instructor._id);
      fetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const openEditDialog = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setFormData({
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      email: instructor.email,
      phone: instructor.phone || "",
      bio: instructor.bio || "",
      specialization: instructor.specialization || "",
      experience: instructor.experience || "intermediate",
      country: instructor.country || "",
      status: instructor.status as "active" | "pending",
    });
    setEditOpen(true);
  };

  const openViewDialog = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setViewOpen(true);
  };

  const openDeleteDialog = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setDeleteOpen(true);
  };

  const handleExport = () => {
    const csv = [
      [
        "Name",
        "Email",
        "Status",
        "Specialization",
        "Experience",
        "Courses",
        "Students",
        "Rating",
        "Joined Date",
      ].join(","),
      ...filteredInstructors.map((i) =>
        [
          i.name,
          i.email,
          i.status,
          i.specialization || "",
          i.experience || "",
          i.coursesCount || 0,
          i.studentsCount || 0,
          i.rating || 0,
          new Date(i.createdAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `instructors-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200",
      suspended: "bg-red-100 text-red-700 border-red-200",
    };
    const icons = {
      active: CheckCircle,
      pending: Clock,
      inactive: XCircle,
      suspended: Ban,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
          variants[status as keyof typeof variants] || variants.pending
        }`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ExperienceBadge = ({ experience }: { experience?: string }) => {
    if (!experience) return null;
    const variants = {
      expert: "bg-purple-100 text-purple-700 border-purple-200",
      advanced: "bg-blue-100 text-blue-700 border-blue-200",
      intermediate: "bg-teal-100 text-teal-700 border-teal-200",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
          variants[experience as keyof typeof variants] || variants.intermediate
        }`}
      >
        <Award className="w-3 h-3" />
        {experience.charAt(0).toUpperCase() + experience.slice(1)}
      </span>
    );
  };

  return (
    <main className="p-6 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Instructors Management
          </h2>
          <p className="text-gray-600">
            Manage instructor accounts, monitor performance, and track
            engagement
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={handleExport}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" /> Export Data
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Instructor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">
                Total Instructors
              </p>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mt-2" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {stats?.totalInstructors || 0}
                  </p>
                  <p className="text-blue-600 text-xs mt-1 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" /> All registered
                  </p>
                </>
              )}
            </div>
            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users2 className="text-white w-7 h-7" />
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">
                Active Instructors
              </p>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-green-600 mt-2" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {stats?.activeInstructors || 0}
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    {stats?.totalInstructors
                      ? Math.round(
                          ((stats?.activeInstructors || 0) /
                            stats.totalInstructors) *
                            100
                        )
                      : 0}
                    % active rate
                  </p>
                </>
              )}
            </div>
            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <UserCheck className="text-white w-7 h-7" />
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Avg. Rating</p>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-yellow-600 mt-2" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {stats?.avgRating?.toFixed(1) || "0.0"}
                  </p>
                  <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Overall
                    performance
                  </p>
                </>
              )}
            </div>
            <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <Star className="text-white w-7 h-7" />
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-purple-200">
          <div className="flex items-center justify-center">
            <div>
              <p className="text-purple-600 text-sm font-medium">
                Total Courses
              </p>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-purple-600 mt-2" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {stats?.totalCourses || 0}
                  </p>
                  <p className="text-purple-600 text-xs mt-1 flex items-center gap-1">
                    <Book className="w-3 h-3" /> By all instructors
                  </p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Book className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-5 bg-gray-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">
            All ({instructors.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-white">
            Active ({instructors.filter((i) => i.status === "active").length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-white">
            Pending ({instructors.filter((i) => i.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger
            value="inactive"
            className="data-[state=active]:bg-white"
          >
            Inactive (
            {instructors.filter((i) => i.status === "inactive").length})
          </TabsTrigger>
          <TabsTrigger
            value="suspended"
            className="data-[state=active]:bg-white"
          >
            Suspended (
            {instructors.filter((i) => i.status === "suspended").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Select
              value={specializationFilter}
              onValueChange={setSpecializationFilter}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Specializations">
                  All Specializations
                </SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Digital Marketing">
                  Digital Marketing
                </SelectItem>
                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
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
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={experienceFilter}
              onValueChange={setExperienceFilter}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Experience Levels">
                  All Experience Levels
                </SelectItem>
                <SelectItem value="Expert (5+ years)">
                  Expert (5+ years)
                </SelectItem>
                <SelectItem value="Advanced (3-5 years)">
                  Advanced (3-5 years)
                </SelectItem>
                <SelectItem value="Intermediate (1-3 years)">
                  Intermediate (1-3 years)
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rating">Sort by: Rating</SelectItem>
                <SelectItem value="Newest">Sort by: Newest</SelectItem>
                <SelectItem value="Name">Sort by: Name</SelectItem>
                <SelectItem value="Courses Count">
                  Sort by: Courses Count
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="instructor-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search instructors... (Cmd+K)"
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredInstructors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Users2 className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No instructors found
          </h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your filters or add a new instructor
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Instructor
          </Button>
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === "grid" && filteredInstructors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedInstructors.map((instructor) => (
            <div
              key={instructor._id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                    {instructor.firstName?.[0]}
                    {instructor.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {instructor.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {instructor.email}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => openViewDialog(instructor)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openEditDialog(instructor)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Instructor
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {instructor.status === "pending" && (
                      <DropdownMenuItem
                        onClick={() => handleApprove(instructor)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Approve
                      </DropdownMenuItem>
                    )}
                    {instructor.status === "active" && (
                      <DropdownMenuItem
                        onClick={() => handleSuspend(instructor)}
                      >
                        <Ban className="w-4 h-4 mr-2 text-orange-600" />
                        Suspend
                      </DropdownMenuItem>
                    )}
                    {instructor.status === "suspended" && (
                      <DropdownMenuItem
                        onClick={() => handleActivate(instructor)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Reactivate
                      </DropdownMenuItem>
                    )}
                    {instructor.status === "inactive" && (
                      <DropdownMenuItem
                        onClick={() => handleActivate(instructor)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Activate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(instructor)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={instructor.status} />
                  <ExperienceBadge experience={instructor.experience} />
                </div>

                {instructor.specialization && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    {instructor.specialization}
                  </p>
                )}

                {instructor.country && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {instructor.country}
                  </p>
                )}

                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(instructor.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {instructor.coursesCount || 0}
                  </p>
                  <p className="text-xs text-gray-500">Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {instructor.studentsCount || 0}
                  </p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {instructor.rating?.toFixed(1) || "0.0"}
                  </p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Instructors Table */}
      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-secondary">
            All Instructors
          </h3>
          <p className="text-gray-600 text-sm">
            Complete list of instructors with detailed information
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
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedInstructors.map((it: Instructor) => (
                <tr key={it._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                        {it.firstName?.[0]}
                        {it.lastName?.[0]}
                      </div>
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
                      {it.specialization}
                    </div>
                    <div className="text-sm text-gray-500">
                      {it.experience === "expert" && "Expert"}
                      {it.experience === "advanced" && "Advanced"}
                      {it.experience === "intermediate" && "Intermediate"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 w-4 h-4 mr-1" />
                      <span className="text-sm text-gray-900">
                        {it.rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {it.coursesCount || 0} courses
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {it.studentsCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {it.status === "active" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {it.status === "pending" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                    {it.status === "inactive" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                    {it.status === "suspended" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(it.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openViewDialog(it)}
                      className="text-primary hover:text-primary/80 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditDialog(it)}
                      className="text-gray-600 hover:text-primary"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">1-10</span> of{" "}
            <span className="font-medium">47</span> instructors
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

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Instructor Performance Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">32%</div>
            <div className="text-sm text-gray-600">Top Performers</div>
            <div className="text-xs text-gray-500 mt-1">15 instructors</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">45%</div>
            <div className="text-sm text-gray-600">Strong Performers</div>
            <div className="text-xs text-gray-500 mt-1">21 instructors</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-2">18%</div>
            <div className="text-sm text-gray-600">Average Performers</div>
            <div className="text-xs text-gray-500 mt-1">8 instructors</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-2">5%</div>
            <div className="text-sm text-gray-600">Needs Support</div>
            <div className="text-xs text-gray-500 mt-1">3 instructors</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Instructor Specialization Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-primary mb-2">18</div>
            <div className="text-sm text-gray-600">Web Development</div>
            <div className="text-xs text-gray-500 mt-1">38% of instructors</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-blue-600 mb-2">12</div>
            <div className="text-sm text-gray-600">Data Science</div>
            <div className="text-xs text-gray-500 mt-1">26% of instructors</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-purple-600 mb-2">8</div>
            <div className="text-sm text-gray-600">UI/UX Design</div>
            <div className="text-xs text-gray-500 mt-1">17% of instructors</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-green-600 mb-2">9</div>
            <div className="text-sm text-gray-600">Other Fields</div>
            <div className="text-xs text-gray-500 mt-1">19% of instructors</div>
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
              <p className="font-medium text-secondary">Add Instructor</p>
              <p className="text-sm text-gray-600">New instructor</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-accent/5 hover:bg-accent/10 rounded-lg">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <ArrowUp className="text-white w-5 h-5 rotate-90" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Send Announcement</p>
              <p className="text-sm text-gray-600">All instructors</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <ArrowUp className="text-white w-5 h-5 rotate-180" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Data</p>
              <p className="text-sm text-gray-600">Instructor reports</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Star className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">View Analytics</p>
              <p className="text-sm text-gray-600">Performance insights</p>
            </div>
          </button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Instructor</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter first name"
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
                placeholder="instructor@example.com"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select country</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                  <option value="in">India</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select specialization</option>
                  <option value="web">Web Development</option>
                  <option value="data">Data Science</option>
                  <option value="marketing">Digital Marketing</option>
                  <option value="design">UI/UX Design</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select level</option>
                  <option value="expert">Expert (5+ years)</option>
                  <option value="advanced">Advanced (3-5 years)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio/Introduction
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Brief introduction about the instructor's background and expertise"
              ></textarea>
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
                  Require profile completion
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-6">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateOpen(false)}>Add Instructor</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
