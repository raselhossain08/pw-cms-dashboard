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
  ChevronLeft,
  ChevronRight,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/context/ToastContext";
import { CheckSquare, Square } from "lucide-react";
import { formatDate, formatDateTime, isValidDate } from "@/utils/date";

type ViewMode = "grid" | "table";

// Performance Analytics Component
function PerformanceAnalytics() {
  const [performanceData, setPerformanceData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const { apiClient } = await import("@/lib/api-client");
        const response = await apiClient.get(
          "/admin/instructors/performance-tiers"
        );
        setPerformanceData(response.data);
      } catch (error) {
        console.error("Failed to fetch performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Instructor Performance Analytics
        </h3>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return null;
  }

  const { summary } = performanceData;

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-secondary mb-4">
        Instructor Performance Analytics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {summary.topPerformersPercentage}%
          </div>
          <div className="text-sm text-gray-600">Top Performers</div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.topPerformers} instructors
          </div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {summary.strongPerformersPercentage}%
          </div>
          <div className="text-sm text-gray-600">Strong Performers</div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.strongPerformers} instructors
          </div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {summary.averagePerformersPercentage}%
          </div>
          <div className="text-sm text-gray-600">Average Performers</div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.averagePerformers} instructors
          </div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600 mb-2">
            {summary.needsSupportPercentage}%
          </div>
          <div className="text-sm text-gray-600">Needs Support</div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.needsSupport} instructors
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Instructors() {
  const {
    instructors,
    stats,
    loading,
    statsLoading,
    total,
    pagination,
    fetchInstructors,
    fetchStats,
    createInstructor,
    updateInstructor,
    deleteInstructor,
    bulkDeleteInstructors,
    approveInstructor,
    suspendInstructor,
    activateInstructor,
    deactivateInstructor,
    exportInstructors,
    sendBroadcast,
    sendMessage,
  } = useInstructors();
  const { push } = useToast();

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
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [announcementOpen, setAnnouncementOpen] = React.useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    React.useState<Instructor | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Form states
  const [formData, setFormData] = React.useState<CreateInstructorDto>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    specialization: "",
    experience: "intermediate",
    country: "",
    status: "active",
  });
  const [formLoading, setFormLoading] = React.useState(false);

  // Announcement form state
  const [announcementData, setAnnouncementData] = React.useState({
    subject: "",
    message: "",
    sendToAll: true,
  });

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  // Fetch data on mount
  React.useEffect(() => {
    fetchInstructors({
      page: 1,
      limit: itemsPerPage,
    });
    fetchStats();
  }, []);

  // Fetch data when filters change
  React.useEffect(() => {
    fetchInstructors({
      page: currentPage,
      limit: itemsPerPage,
      search,
      status: statusFilter !== "all" ? statusFilter : undefined,
      specialization:
        specializationFilter !== "all" ? specializationFilter : undefined,
      experience: experienceFilter !== "all" ? experienceFilter : undefined,
      sortBy,
    });
  }, [
    currentPage,
    statusFilter,
    specializationFilter,
    experienceFilter,
    sortBy,
  ]);

  // Debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchInstructors({
          page: 1,
          limit: itemsPerPage,
          search,
          status: statusFilter !== "all" ? statusFilter : undefined,
          specialization:
            specializationFilter !== "all" ? specializationFilter : undefined,
          experience: experienceFilter !== "all" ? experienceFilter : undefined,
          sortBy,
        });
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

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

  // Filter instructors (client-side filtering for tab and additional filters)
  const filteredInstructors = React.useMemo(() => {
    let filtered = [...instructors];

    // Tab filter (client-side only, as API doesn't handle tabs)
    if (activeTab !== "all") {
      filtered = filtered.filter((i) => i.status === activeTab);
    }

    // Additional client-side search filter (if search wasn't sent to API)
    // Note: Search is handled by API, but we keep this for immediate UI feedback

    // Sort (client-side sorting for immediate feedback)
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
  }, [instructors, activeTab, sortBy]);

  // Pagination
  const paginatedInstructors = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInstructors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInstructors, currentPage]);

  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);

  // Get unique specializations
  const specializations = React.useMemo(() => {
    const specs = new Set(
      instructors
        .map((i) => i.specialization)
        .filter((s): s is string => Boolean(s))
    );
    return Array.from(specs);
  }, [instructors]);

  // Calculate specialization distribution
  const specializationDistribution = React.useMemo(() => {
    const distribution: Record<string, number> = {};
    let totalWithSpecialization = 0;

    instructors.forEach((instructor) => {
      if (instructor.specialization) {
        const spec = instructor.specialization;
        distribution[spec] = (distribution[spec] || 0) + 1;
        totalWithSpecialization++;
      }
    });

    const totalInstructors = instructors.length || 1;

    return Object.entries(distribution)
      .map(([spec, count]) => ({
        specialization: spec,
        count,
        percentage: Math.round((count / totalInstructors) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4); // Show top 4 specializations
  }, [instructors]);

  // Form handlers with type-safe validation
  const handleFormChange = (field: keyof CreateInstructorDto, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Validate specialization length
      if (field === "specialization" && value && value.length > 200) {
        push({
          type: "error",
          message: "Specialization must not exceed 200 characters",
        });
        return prev;
      }

      // Validate experience enum
      if (field === "experience" && value) {
        const validExperience = ["expert", "advanced", "intermediate"];
        if (!validExperience.includes(value)) {
          push({
            type: "error",
            message: "Invalid experience level selected",
          });
          return prev;
        }
      }

      return newData;
    });
  };

  // Enhanced validation with detailed feedback
  const validateFormData = (
    data: CreateInstructorDto,
    isEdit: boolean = false
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields
    if (!data.firstName?.trim()) errors.push("First name is required");
    if (!data.lastName?.trim()) errors.push("Last name is required");
    if (!data.email?.trim()) errors.push("Email is required");

    // Password only required when creating, not editing
    if (!isEdit && !data.password?.trim()) {
      errors.push("Password is required");
    }

    // Field length validations
    if (data.firstName && data.firstName.trim().length < 2) {
      errors.push("First name must be at least 2 characters");
    }
    if (data.lastName && data.lastName.trim().length < 2) {
      errors.push("Last name must be at least 2 characters");
    }
    if (!isEdit && data.password && data.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push("Please enter a valid email address");
    }

    // Phone format if provided
    if (data.phone) {
      const phoneRegex =
        /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(data.phone.replace(/\s/g, ""))) {
        errors.push("Please enter a valid phone number");
      }
    }

    // Bio length
    if (data.bio && data.bio.length > 2000) {
      errors.push("Bio must not exceed 2000 characters");
    }

    // Specialization validation
    if (data.specialization && data.specialization.length > 200) {
      errors.push("Specialization must not exceed 200 characters");
    }

    // Experience validation
    if (data.experience) {
      const validExperience = ["expert", "advanced", "intermediate"];
      if (!validExperience.includes(data.experience)) {
        errors.push(
          "Experience must be one of: expert, advanced, or intermediate"
        );
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      bio: "",
      specialization: "",
      experience: "intermediate",
      country: "",
      status: "active",
    });
  };

  const handleCreate = async () => {
    // Use comprehensive validation
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        push({ type: "error", message: error });
      });
      return;
    }

    // Check for duplicate email in existing instructors
    const duplicateEmail = instructors.find(
      (i) => i.email.toLowerCase() === formData.email.toLowerCase()
    );
    if (duplicateEmail) {
      push({
        type: "error",
        message: `An instructor with email ${formData.email} already exists`,
      });
      return;
    }

    setFormLoading(true);
    try {
      console.log("Creating instructor with validated data:", {
        ...formData,
        fieldTypes: {
          firstName: typeof formData.firstName,
        },
      });
      await createInstructor(formData);
      setCreateOpen(false);
      resetForm();
      push({
        type: "success",
        message: `✓ Instructor ${formData.firstName} ${formData.lastName} created successfully`,
      });

      // Refresh data to show updated state
      await fetchInstructors({
        page: currentPage,
        limit: itemsPerPage,
        search,
        status: statusFilter !== "all" ? statusFilter : undefined,
        specialization:
          specializationFilter !== "all" ? specializationFilter : undefined,
        experience: experienceFilter !== "all" ? experienceFilter : undefined,
        sortBy,
      });
      fetchStats();
    } catch (error: any) {
      console.error("Failed to create instructor:", error);
      // Provide detailed error feedback
      if (error?.message?.includes("already exists")) {
        push({
          type: "error",
          message: `An instructor with this email already exists. Please use a different email.`,
        });
      } else if (error?.message?.includes("Invalid")) {
        push({
          type: "error",
          message: error.message,
        });
      } else {
        push({
          type: "error",
          message: "Failed to create instructor. Please try again.",
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedInstructor) return;

    // Use comprehensive validation (isEdit = true, password not required)
    const validation = validateFormData(formData, true);
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        push({ type: "error", message: error });
      });
      return;
    }

    // Check for duplicate email (excluding current instructor)
    const duplicateEmail = instructors.find(
      (i) =>
        i._id !== selectedInstructor._id &&
        i.email.toLowerCase() === formData.email.toLowerCase()
    );
    if (duplicateEmail) {
      push({
        type: "error",
        message: `Another instructor with email ${formData.email} already exists`,
      });
      return;
    }

    setFormLoading(true);
    try {
      console.log("Updating instructor:", selectedInstructor._id, formData);

      // Remove password from update data if it's empty
      const updateData = { ...formData };
      if (!updateData.password || updateData.password.trim() === "") {
        delete updateData.password;
      }

      await updateInstructor(
        selectedInstructor._id,
        updateData as UpdateInstructorDto
      );
      setEditOpen(false);
      setSelectedInstructor(null);
      resetForm();
      push({
        type: "success",
        message: `✓ Instructor ${formData.firstName} ${formData.lastName} updated successfully`,
      });

      // Refresh data to show updated state
      await fetchInstructors({
        page: currentPage,
        limit: itemsPerPage,
        search,
        status: statusFilter !== "all" ? statusFilter : undefined,
        specialization:
          specializationFilter !== "all" ? specializationFilter : undefined,
        experience: experienceFilter !== "all" ? experienceFilter : undefined,
        sortBy,
      });
      fetchStats();
    } catch (error: any) {
      console.error("Failed to update instructor:", error);
      // Provide detailed error feedback
      if (error?.message?.includes("already exists")) {
        push({
          type: "error",
          message: `An instructor with this email already exists. Please use a different email.`,
        });
      } else if (error?.message?.includes("Invalid")) {
        push({
          type: "error",
          message: error.message,
        });
      } else {
        push({
          type: "error",
          message: "Failed to update instructor. Please try again.",
        });
      }
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
      fetchInstructors({
        page: currentPage,
        limit: itemsPerPage,
        search,
        status: statusFilter !== "all" ? statusFilter : undefined,
        specialization:
          specializationFilter !== "all" ? specializationFilter : undefined,
        experience: experienceFilter !== "all" ? experienceFilter : undefined,
        sortBy,
      });
      fetchStats();
    } catch (error) {
      // Error handled in hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setFormLoading(true);
    try {
      await bulkDeleteInstructors(selectedIds);
      setBulkDeleteOpen(false);
      setSelectedIds([]);
      fetchInstructors({
        page: currentPage,
        limit: itemsPerPage,
        search,
        status: statusFilter !== "all" ? statusFilter : undefined,
        specialization:
          specializationFilter !== "all" ? specializationFilter : undefined,
        experience: experienceFilter !== "all" ? experienceFilter : undefined,
        sortBy,
      });
      fetchStats();
    } catch (error) {
      // Error handled in hook
    } finally {
      setFormLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedInstructors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedInstructors.map((i) => i._id));
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

  const handleExport = async () => {
    try {
      await exportInstructors({
        search,
        status: statusFilter !== "all" ? statusFilter : undefined,
        specialization:
          specializationFilter !== "all" ? specializationFilter : undefined,
        experience: experienceFilter !== "all" ? experienceFilter : undefined,
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementData.subject.trim() || !announcementData.message.trim()) {
      push({
        type: "error",
        message: "Subject and message are required",
      });
      return;
    }

    setFormLoading(true);
    try {
      await sendBroadcast({
        subject: announcementData.subject,
        message: announcementData.message,
        instructorIds: announcementData.sendToAll ? undefined : selectedIds,
      });
      setAnnouncementOpen(false);
      setAnnouncementData({
        subject: "",
        message: "",
        sendToAll: true,
      });
      setSelectedIds([]);
    } catch (error) {
      // Error handled in hook
    } finally {
      setFormLoading(false);
    }
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
    <main className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start lg:items-center lg:justify-between gap-3 md:gap-4">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary mb-1 sm:mb-2">
            Instructors Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage instructor accounts, monitor performance, and track
            engagement
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            className="border-gray-300 text-sm sm:text-base"
            onClick={handleExport}
            disabled={loading}
            size="sm"
          >
            <Download className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="text-sm sm:text-base"
          >
            <UserPlus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Instructor</span>
            <span className="sm:hidden">Add</span>
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
        <TabsList className="grid w-full max-w-full sm:max-w-2xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-gray-100 gap-1">
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
      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 gap-3">
          <div className="flex flex-wrap gap-2">
            <Select
              value={specializationFilter}
              onValueChange={setSpecializationFilter}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-40 md:w-48">
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.filter(Boolean).map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={experienceFilter}
              onValueChange={setExperienceFilter}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue placeholder="All Experience Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience Levels</SelectItem>
                <SelectItem value="expert">Expert (5+ years)</SelectItem>
                <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                <SelectItem value="intermediate">
                  Intermediate (1-3 years)
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-40 md:w-48">
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
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="instructor-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search instructors..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className={`text-gray-600 hover:text-primary ${
                  viewMode === "grid" ? "bg-primary/10 text-primary" : ""
                }`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <Grid2x2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`text-gray-600 hover:text-primary ${
                  viewMode === "table" ? "bg-primary/10 text-primary" : ""
                }`}
                onClick={() => setViewMode("table")}
                title="Table View"
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
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
      {!loading && instructors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Users2 className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No instructors found
          </h3>
          <p className="text-gray-500 mb-6">
            {filteredInstructors.length === 0 && instructors.length > 0
              ? "Try adjusting your filters"
              : "Get started by adding your first instructor"}
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Instructor
          </Button>
        </div>
      )}

      {/* No Results After Filtering */}
      {!loading &&
        instructors.length > 0 &&
        filteredInstructors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Filter className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No instructors match your filters
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setSpecializationFilter("all");
                setExperienceFilter("all");
                setActiveTab("all");
              }}
            >
              <X className="w-4 h-4 mr-2" /> Clear Filters
            </Button>
          </div>
        )}

      {/* Grid View */}
      {!loading && viewMode === "grid" && filteredInstructors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {paginatedInstructors.map((instructor) => (
            <div
              key={instructor._id}
              className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-base sm:text-lg shrink-0">
                    {instructor.firstName?.[0]}
                    {instructor.lastName?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {instructor.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 truncate">
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
                  Joined {formatDate(instructor.createdAt)}
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

      {/* Table View */}
      {!loading && viewMode === "table" && paginatedInstructors.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-secondary">
                All Instructors
              </h3>
              <p className="text-gray-600 text-sm">
                Complete list of instructors with detailed information
              </p>
            </div>
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center"
                    >
                      {selectedIds.length === paginatedInstructors.length ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
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
                      <button
                        onClick={() => toggleSelect(it._id)}
                        className="flex items-center"
                      >
                        {selectedIds.includes(it._id) ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
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
                          <div className="text-sm text-gray-500">
                            {it.email}
                          </div>
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
                      {new Date(it.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openViewDialog(it)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(it)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Instructor
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {it.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleApprove(it)}>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {it.status === "active" && (
                            <DropdownMenuItem onClick={() => handleSuspend(it)}>
                              <Ban className="w-4 h-4 mr-2 text-orange-600" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {it.status === "suspended" && (
                            <DropdownMenuItem
                              onClick={() => handleActivate(it)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          {it.status === "inactive" && (
                            <DropdownMenuItem
                              onClick={() => handleActivate(it)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(it)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> instructors
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className={currentPage === pageNum ? "" : "border-gray-300"}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Analytics - Now with Real Data */}
      <div data-section="performance-analytics">
        <PerformanceAnalytics />
      </div>

      {specializationDistribution.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Instructor Specialization Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specializationDistribution.map((item, index) => {
              const colors = [
                "text-primary",
                "text-blue-600",
                "text-purple-600",
                "text-green-600",
              ];
              return (
                <div
                  key={item.specialization}
                  className="text-center p-4 border border-gray-200 rounded-lg"
                >
                  <div
                    className={`text-xl font-bold ${
                      colors[index] || "text-gray-600"
                    } mb-2`}
                  >
                    {item.count}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.specialization}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.percentage}% of instructors
                  </div>
                </div>
              );
            })}
          </div>
          {specializationDistribution.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">
              No specialization data available
            </p>
          )}
        </div>
      )}

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCreateOpen(true)}
            disabled={formLoading}
            aria-label="Add new instructor"
            className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              {formLoading ? (
                <Loader2 className="text-white w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="text-white w-5 h-5" />
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Add Instructor</p>
              <p className="text-sm text-gray-600">New instructor</p>
            </div>
          </button>
          <button
            onClick={() => setAnnouncementOpen(true)}
            disabled={formLoading || instructors.length === 0}
            aria-label="Send announcement to all instructors"
            className="flex items-center space-x-3 p-4 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Mail className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Send Announcement</p>
              <p className="text-sm text-gray-600">All instructors</p>
            </div>
          </button>
          <button
            onClick={handleExport}
            disabled={loading || formLoading || instructors.length === 0}
            aria-label="Export instructor data"
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              {loading ? (
                <Loader2 className="text-white w-5 h-5 animate-spin" />
              ) : (
                <Download className="text-white w-5 h-5" />
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Data</p>
              <p className="text-sm text-gray-600">Instructor reports</p>
            </div>
          </button>
          <button
            onClick={() => {
              // Scroll to performance analytics section
              const analyticsSection = document.querySelector(
                '[data-section="performance-analytics"]'
              );
              if (analyticsSection) {
                analyticsSection.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                push({
                  type: "success",
                  message: "Scrolled to performance analytics",
                });
              } else {
                push({
                  type: "info",
                  message: "Performance analytics displayed above",
                });
              }
            }}
            disabled={formLoading}
            aria-label="View performance analytics"
            className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Instructor</DialogTitle>
            <DialogDescription>
              Create a new instructor account with all necessary details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleFormChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleFormChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                placeholder="instructor@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={formData.password || ""}
                onChange={(e) => handleFormChange("password", e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Input
                  type="text"
                  value={formData.country || ""}
                  onChange={(e) => handleFormChange("country", e.target.value)}
                  placeholder="Enter country"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <Input
                  type="text"
                  value={formData.specialization || ""}
                  onChange={(e) =>
                    handleFormChange("specialization", e.target.value)
                  }
                  placeholder="e.g., Web Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) =>
                    handleFormChange("experience", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    <SelectItem value="advanced">
                      Advanced (3-5 years)
                    </SelectItem>
                    <SelectItem value="intermediate">
                      Intermediate (1-3 years)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio/Introduction
              </label>
              <Textarea
                value={formData.bio || ""}
                onChange={(e) => handleFormChange("bio", e.target.value)}
                rows={3}
                placeholder="Brief introduction about the instructor's background and expertise"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleFormChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setCreateOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Instructor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Instructor</DialogTitle>
            <DialogDescription>Update instructor information</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleFormChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleFormChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                placeholder="instructor@example.com"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Input
                  type="text"
                  value={formData.country || ""}
                  onChange={(e) => handleFormChange("country", e.target.value)}
                  placeholder="Enter country"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <Input
                  type="text"
                  value={formData.specialization || ""}
                  onChange={(e) =>
                    handleFormChange("specialization", e.target.value)
                  }
                  placeholder="e.g., Web Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) =>
                    handleFormChange("experience", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    <SelectItem value="advanced">
                      Advanced (3-5 years)
                    </SelectItem>
                    <SelectItem value="intermediate">
                      Intermediate (1-3 years)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio/Introduction
              </label>
              <Textarea
                value={formData.bio || ""}
                onChange={(e) => handleFormChange("bio", e.target.value)}
                rows={3}
                placeholder="Brief introduction about the instructor's background and expertise"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleFormChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setEditOpen(false);
                resetForm();
                setSelectedInstructor(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Instructor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Instructor Details</DialogTitle>
            <DialogDescription>
              View complete instructor information
            </DialogDescription>
          </DialogHeader>
          {selectedInstructor && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                  {selectedInstructor.firstName?.[0]}
                  {selectedInstructor.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedInstructor.name}
                  </h3>
                  <p className="text-gray-600">{selectedInstructor.email}</p>
                  <div className="flex gap-2 mt-2">
                    <StatusBadge status={selectedInstructor.status} />
                    <ExperienceBadge
                      experience={selectedInstructor.experience}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">
                    {selectedInstructor.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">
                    {selectedInstructor.country || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Specialization</p>
                  <p className="font-medium">
                    {selectedInstructor.specialization || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium capitalize">
                    {selectedInstructor.experience || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Courses</p>
                  <p className="font-medium">
                    {selectedInstructor.coursesCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Students</p>
                  <p className="font-medium">
                    {selectedInstructor.studentsCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {selectedInstructor.rating?.toFixed(1) || "0.0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium">
                    {formatDateTime(selectedInstructor.createdAt)}
                  </p>
                </div>
              </div>
              {selectedInstructor.bio && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Bio</p>
                  <p className="text-gray-700">{selectedInstructor.bio}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setViewOpen(false);
                setSelectedInstructor(null);
              }}
            >
              Close
            </Button>
            {selectedInstructor && (
              <Button
                onClick={() => {
                  setViewOpen(false);
                  openEditDialog(selectedInstructor);
                }}
              >
                Edit Instructor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedInstructor?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedInstructor(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Instructors</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length}{" "}
              instructor(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Announcement Dialog */}
      <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Announcement to Instructors</DialogTitle>
            <DialogDescription>
              Compose and send an announcement to{" "}
              {announcementData.sendToAll
                ? "all instructors"
                : `${selectedIds.length} selected instructor(s)`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Recipients:{" "}
                  {announcementData.sendToAll
                    ? `All instructors (${instructors.length})`
                    : `${selectedIds.length} selected`}
                </p>
                <p className="text-xs text-blue-700">
                  {announcementData.sendToAll
                    ? "This announcement will be sent to all instructors"
                    : "This announcement will be sent to selected instructors only"}
                </p>
              </div>
            </div>

            {!announcementData.sendToAll && selectedIds.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Please select instructors from the list or toggle "Send to
                  All" option
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() =>
                  setAnnouncementData((prev) => ({
                    ...prev,
                    sendToAll: !prev.sendToAll,
                  }))
                }
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  announcementData.sendToAll
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {announcementData.sendToAll ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  Send to all instructors
                </span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={announcementData.subject}
                onChange={(e) =>
                  setAnnouncementData((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                placeholder="Enter announcement subject"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={announcementData.message}
                onChange={(e) =>
                  setAnnouncementData((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={8}
                placeholder="Enter your announcement message..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {announcementData.message.length} characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setAnnouncementOpen(false);
                setAnnouncementData({
                  subject: "",
                  message: "",
                  sendToAll: true,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendAnnouncement}
              disabled={
                formLoading ||
                !announcementData.subject.trim() ||
                !announcementData.message.trim() ||
                (!announcementData.sendToAll && selectedIds.length === 0)
              }
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Announcement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
