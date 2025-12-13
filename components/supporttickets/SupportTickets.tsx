"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  Filter,
  ArrowUpDown,
  EllipsisVertical,
  Ticket,
  Clock,
  Star,
  AlertTriangle,
  User,
  Calendar,
  Tag,
  UserCheck,
  Plus,
  Loader2,
  Check,
  X,
  AlertCircle,
  Trash2,
  Edit2,
  MessageSquare,
  Eye,
  FileText,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/lib/api-client";

type TicketStatus = "open" | "pending" | "closed" | "escalated" | "in-progress";
type TicketPriority = "high" | "medium" | "low" | "urgent";

type TicketItem = {
  _id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  ticketNumber?: string;
  userId?: {
    _id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  assignedTo?: {
    _id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  replies?: Array<{
    _id: string;
    message: string;
    user?: {
      _id: string;
      name?: string;
    };
    createdAt: string;
  }>;
};

type TicketStats = {
  open: number;
  pending: number;
  closed: number;
  escalated: number;
  inProgress: number;
  avgResponseTime: string;
  satisfactionRate: number;
};

export default function SupportTickets() {
  const [tickets, setTickets] = React.useState<TicketItem[]>([]);
  const [stats, setStats] = React.useState<TicketStats | null>(null);
  const [search, setSearch] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [tab, setTab] = React.useState("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<TicketItem | null>(
    null
  );
  const [ticketToDelete, setTicketToDelete] = React.useState<TicketItem | null>(
    null
  );

  const [formData, setFormData] = React.useState({
    subject: "",
    description: "",
    priority: "low" as TicketPriority,
    category: "technical",
    status: "open" as TicketStatus,
  });

  const { push: showToast } = useToast();

  React.useEffect(() => {
    void fetchTickets();
    void fetchStats();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{
        tickets: TicketItem[];
        pagination: any;
      }>("/tickets");
      setTickets(response.data.tickets || []);
    } catch (error) {
      showToast({ message: "Failed to load tickets", type: "error" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get<any>("/tickets/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleCreateTicket = async () => {
    if (!formData.subject.trim()) {
      showToast({ message: "Please enter a subject", type: "error" });
      return;
    }

    try {
      setIsCreating(true);
      const response = await apiClient.post<TicketItem>("/tickets", formData);
      setTickets([response.data, ...tickets]);
      setCreateOpen(false);
      setFormData({
        subject: "",
        description: "",
        priority: "low",
        category: "technical",
        status: "open",
      });
      showToast({ message: "Ticket created successfully", type: "success" });
      void fetchStats();
    } catch (error) {
      showToast({ message: "Failed to create ticket", type: "error" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      setIsUpdating(true);
      const response = await apiClient.patch<TicketItem>(
        `/tickets/${selectedTicket._id}`,
        formData
      );
      setTickets(
        tickets.map((t) => (t._id === selectedTicket._id ? response.data : t))
      );
      setEditOpen(false);
      setSelectedTicket(null);
      showToast({ message: "Ticket updated successfully", type: "success" });
      void fetchStats();
    } catch (error) {
      showToast({ message: "Failed to update ticket", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      setIsUpdating(true);
      await apiClient.delete(`/tickets/${ticketToDelete._id}`);
      setTickets(tickets.filter((t) => t._id !== ticketToDelete._id));
      setDeleteOpen(false);
      setTicketToDelete(null);
      showToast({ message: "Ticket deleted successfully", type: "success" });
      void fetchStats();
    } catch (error) {
      showToast({ message: "Failed to delete ticket", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (
    ticketId: string,
    newStatus: TicketStatus
  ) => {
    try {
      const response = await apiClient.patch<TicketItem>(
        `/tickets/${ticketId}`,
        { status: newStatus }
      );
      setTickets(tickets.map((t) => (t._id === ticketId ? response.data : t)));
      showToast({ message: "Status updated successfully", type: "success" });
      void fetchStats();
    } catch (error) {
      showToast({ message: "Failed to update status", type: "error" });
    }
  };

  const openEditDialog = (ticket: TicketItem) => {
    setSelectedTicket(ticket);
    setFormData({
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority,
      category: ticket.category,
      status: ticket.status,
    });
    setEditOpen(true);
  };

  const openViewDialog = (ticket: TicketItem) => {
    setSelectedTicket(ticket);
    setViewOpen(true);
  };

  const filteredTickets = React.useMemo(() => {
    return tickets
      .filter((t) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          !search ||
          t.subject.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.ticketNumber?.toLowerCase().includes(searchLower) ||
          (t.userId?.firstName + " " + t.userId?.lastName)
            .toLowerCase()
            .includes(searchLower);

        const matchesPriority =
          priorityFilter === "all" || t.priority === priorityFilter;
        const matchesStatus =
          statusFilter === "all" || t.status === statusFilter;
        const matchesTab =
          tab === "all" ||
          (tab === "open" && t.status === "open") ||
          (tab === "pending" && t.status === "pending") ||
          (tab === "closed" && t.status === "closed") ||
          (tab === "escalated" && t.status === "escalated") ||
          (tab === "in-progress" && t.status === "in-progress");

        return matchesSearch && matchesPriority && matchesStatus && matchesTab;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        }
        if (sortBy === "oldest") {
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        }
        if (sortBy === "priority") {
          const order = { urgent: 4, high: 3, medium: 2, low: 1 };
          return order[b.priority] - order[a.priority];
        }
        if (sortBy === "status") {
          const order = {
            escalated: 5,
            "in-progress": 4,
            open: 3,
            pending: 2,
            closed: 1,
          };
          return order[b.status] - order[a.status];
        }
        return 0;
      });
  }, [tickets, search, priorityFilter, statusFilter, tab, sortBy]);

  const priorityBorder = (p: TicketPriority) => {
    const colors = {
      urgent: "border-l-4 border-red-600",
      high: "border-l-4 border-red-500",
      medium: "border-l-4 border-yellow-500",
      low: "border-l-4 border-green-500",
    };
    return colors[p];
  };

  const statusBadge = (s: TicketStatus) => {
    const styles = {
      open: "bg-blue-500 text-white",
      pending: "bg-yellow-500 text-white",
      closed: "bg-gray-500 text-white",
      escalated: "bg-red-500 text-white",
      "in-progress": "bg-primary text-white",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[s]}`}
      >
        {s.replace("-", " ").toUpperCase()}
      </span>
    );
  };

  const priorityIcon = (p: TicketPriority) => {
    if (p === "urgent" || p === "high")
      return <AlertTriangle className="text-red-600 w-5 h-5" />;
    if (p === "medium") return <Clock className="text-yellow-600 w-5 h-5" />;
    return <Tag className="text-green-600 w-5 h-5" />;
  };

  const priorityBg = (p: TicketPriority) => {
    if (p === "urgent" || p === "high") return "bg-red-100";
    if (p === "medium") return "bg-yellow-100";
    return "bg-green-100";
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "N/A";
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Support Tickets
          </h2>
          <p className="text-gray-600">
            Manage and resolve student and instructor support requests
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-gray-300 hover:border-primary hover:text-primary transition-all"
            onClick={() => {
              void fetchTickets();
              void fetchStats();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 shadow-lg transition-all hover:shadow-xl"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Open Tickets</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats?.open ||
                  tickets.filter((t) => t.status === "open").length}
              </p>
              <p className="text-blue-600 text-sm mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active requests
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ticket className="text-blue-600 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Avg. Response Time
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats?.avgResponseTime || "2.4h"}
              </p>
              <p className="text-green-600 text-sm mt-1">Improved 15%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="text-green-600 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Satisfaction Rate
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats?.satisfactionRate || 92}%
              </p>
              <p className="text-yellow-600 text-sm mt-1">+3% this month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Escalated Tickets
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats?.escalated ||
                  tickets.filter((t) => t.status === "escalated").length}
              </p>
              <p className="text-red-600 text-sm mt-1">Needs attention</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Tickets", icon: FileText },
              { value: "my-tickets", label: "My Tickets", icon: User },
              { value: "assigned", label: "Assigned to Me", icon: UserCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.value}
                  variant={tab === item.value ? "default" : "outline"}
                  className={`transition-all ${
                    tab === item.value
                      ? "shadow-sm"
                      : "border-gray-300 hover:border-primary"
                  }`}
                  onClick={() => setTab(item.value)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="pl-10 w-44 border-gray-300 hover:border-primary transition-colors">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="pl-10 w-44 border-gray-300 hover:border-primary transition-colors">
                  <SelectValue placeholder="Filter Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="pl-10 w-44 border-gray-300 hover:border-primary transition-colors">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="priority">By Priority</SelectItem>
                  <SelectItem value="status">By Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <Input
              id="ticket-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets by title, description, or ticket number..."
              className="pl-10 pr-4 py-2 border-gray-300 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-gray-600 text-lg font-medium">
            Loading tickets...
          </p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-card rounded-xl border border-gray-100">
          <AlertCircle className="w-16 h-16 text-gray-400" />
          <div className="text-center">
            <h3 className="text-xl font-semibold text-secondary mb-2">
              No tickets found
            </h3>
            <p className="text-gray-600">
              {search || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "Create your first support ticket to get started"}
            </p>
          </div>
          {!search && statusFilter === "all" && priorityFilter === "all" && (
            <Button
              className="mt-4 bg-primary hover:bg-primary/90"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Ticket
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {filteredTickets.map((t) => (
            <div
              key={t._id}
              className={`bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow ${priorityBorder(
                t.priority
              )}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${priorityBg(
                          t.priority
                        )}`}
                      >
                        {priorityIcon(t.priority)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold text-secondary text-lg">
                          {t.subject}
                        </h4>
                        {statusBadge(t.status)}
                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                          #{t.ticketNumber}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {t.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{t.userId?.name || "Unknown User"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(t.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-4 h-4" />
                          <span className="capitalize">{t.category}</span>
                        </div>
                        {t.assignedTo && (
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4" />
                            <span>{t.assignedTo.name}</span>
                          </div>
                        )}
                        {t.replies && t.replies.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            <span>{t.replies.length} replies</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:border-primary hover:text-primary transition-all"
                    onClick={() => openViewDialog(t)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:border-primary hover:text-primary transition-all"
                    onClick={() => openEditDialog(t)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:border-primary transition-all"
                      >
                        <EllipsisVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openViewDialog(t)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(t)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Ticket
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => {
                          setTicketToDelete(t);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Ticket
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Tickets by Category
          </h3>
          <div id="category-chart" style={{ height: 300 }} />
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Response Time Trend
          </h3>
          <div id="response-time-chart" style={{ height: 300 }} />
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  Create New Support Ticket
                </DialogTitle>
                <DialogDescription>
                  Provide details to open a support request
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-subject" className="text-sm font-medium">
                Ticket Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-subject"
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Brief description of the issue"
                className="border-gray-300 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="create-priority"
                  className="text-sm font-medium"
                >
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      priority: value as TicketPriority,
                    })
                  }
                >
                  <SelectTrigger
                    id="create-priority"
                    className="border-gray-300"
                  >
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="create-category"
                  className="text-sm font-medium"
                >
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger
                    id="create-category"
                    className="border-gray-300"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="course_content">
                      Course Content
                    </SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="feature_request">
                      Feature Request
                    </SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="create-description"
                className="text-sm font-medium"
              >
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Provide a detailed description of the issue..."
                rows={5}
                className="border-gray-300 focus:border-primary resize-none"
              />
              <p className="text-xs text-gray-500">
                Be as specific as possible to help us resolve your issue quickly
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              className="border-gray-300"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => void handleCreateTicket()}
              disabled={isCreating}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Ticket
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  Edit Support Ticket
                </DialogTitle>
                <DialogDescription>
                  Update ticket details and status
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subject" className="text-sm font-medium">
                  Ticket Subject
                </Label>
                <Input
                  id="edit-subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="border-gray-300 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as TicketStatus,
                      })
                    }
                  >
                    <SelectTrigger id="edit-status" className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-priority"
                    className="text-sm font-medium"
                  >
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        priority: value as TicketPriority,
                      })
                    }
                  >
                    <SelectTrigger
                      id="edit-priority"
                      className="border-gray-300"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-category"
                    className="text-sm font-medium"
                  >
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger
                      id="edit-category"
                      className="border-gray-300"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="course_content">
                        Course Content
                      </SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="feature_request">
                        Feature Request
                      </SelectItem>
                      <SelectItem value="bug_report">Bug Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="text-sm font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  className="border-gray-300 focus:border-primary resize-none"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Ticket Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Ticket #:</span>
                    <span className="ml-2 font-mono">
                      {selectedTicket.ticketNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2">
                      {formatDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Requester:</span>
                    <span className="ml-2">
                      {selectedTicket.userId?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated:</span>
                    <span className="ml-2">
                      {formatDate(selectedTicket.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="border-gray-300"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => void handleUpdateTicket()}
              disabled={isUpdating}
              className="bg-primary hover:bg-primary/90"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">Ticket Details</DialogTitle>
                <DialogDescription>
                  View complete ticket information and replies
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-secondary mb-2">
                    {selectedTicket.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    {statusBadge(selectedTicket.status)}
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${priorityBg(
                        selectedTicket.priority
                      )} flex items-center gap-1.5`}
                    >
                      <span className="w-3.5 h-3.5">
                        {priorityIcon(selectedTicket.priority)}
                      </span>
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      #{selectedTicket.ticketNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created By</p>
                  <p className="text-sm font-medium">
                    {selectedTicket.userId?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-sm font-medium capitalize">
                    {selectedTicket.category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created On</p>
                  <p className="text-sm font-medium">
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                  <p className="text-sm font-medium">
                    {formatDate(selectedTicket.updatedAt)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Description
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Replies ({selectedTicket.replies.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedTicket.replies.map((reply: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {reply.user?.name || "Staff"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setViewOpen(false)}
              className="border-gray-300"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedTicket) {
                  setViewOpen(false);
                  openEditDialog(selectedTicket);
                }
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Delete Ticket</DialogTitle>
                <DialogDescription>
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {ticketToDelete && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 mb-2">
                  Are you sure you want to delete this support ticket?
                </p>
                <div className="bg-white rounded p-3 border border-red-200">
                  <p className="font-semibold text-secondary text-sm mb-1">
                    {ticketToDelete.subject}
                  </p>
                  <p className="text-xs text-gray-600">
                    Ticket #{ticketToDelete.ticketNumber}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                All ticket data, including replies and attachments, will be
                permanently deleted.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleDeleteTicket()}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Ticket
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
