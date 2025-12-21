"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  Filter,
  ArrowUpDown,
  EllipsisVertical,
  Ticket as TicketIcon,
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
import { useSupport } from "@/hooks/useSupport";
import { useUsers } from "@/hooks/useUsers";
import {
  Ticket,
  TicketReply,
  TicketStatus,
  TicketPriority,
} from "@/services/support.service";

export default function SupportTickets() {
  const {
    tickets,
    stats,
    pagination,
    isLoading,
    isActionLoading,
    fetchTickets,
    fetchMyTickets,
    fetchTicketById,
    fetchStats,
    createTicket,
    updateTicket,
    deleteTicket,
    addReply,
    assignTicket,
    setFilters,
  } = useSupport();

  const { users, fetchUsers } = useUsers();

  const [search, setSearch] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [tab, setTab] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(
    null
  );
  const [ticketToDelete, setTicketToDelete] = React.useState<Ticket | null>(
    null
  );
  const [replyMessage, setReplyMessage] = React.useState("");
  const [assignUserId, setAssignUserId] = React.useState("");

  const [formData, setFormData] = React.useState({
    subject: "",
    description: "",
    priority: "low" as TicketPriority,
    category: "technical",
    status: "open" as TicketStatus,
  });

  const { push: showToast } = useToast();

  React.useEffect(() => {
    void loadTickets();
    void fetchStats();
    void fetchUsers({ role: "admin,instructor", limit: 100 });
  }, [tab, page, statusFilter, priorityFilter]);

  const loadTickets = async () => {
    const params: any = {
      page,
      limit: 20,
    };

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    if (priorityFilter !== "all") {
      params.priority = priorityFilter;
    }

    if (tab === "my-tickets") {
      await fetchMyTickets(params);
    } else if (tab === "assigned") {
      // Get current user ID from auth context or store
      // For now, we'll use a placeholder - you may need to get this from auth context
      params.assignedTo = "current-user-id"; // TODO: Replace with actual user ID
      await fetchTickets(params);
    } else {
      await fetchTickets(params);
    }
  };

  const handleCreateTicket = async () => {
    if (!formData.subject.trim()) {
      showToast({ message: "Please enter a subject", type: "error" });
      return;
    }

    try {
      await createTicket({
        subject: formData.subject,
        description: formData.description,
        category: formData.category as any,
        priority: formData.priority,
      });
      setCreateOpen(false);
      setFormData({
        subject: "",
        description: "",
        priority: "low",
        category: "technical",
        status: "open",
      });
      void fetchStats();
      void loadTickets();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      await updateTicket(selectedTicket._id, {
        status: formData.status,
        priority: formData.priority,
        category: formData.category as any,
        subject: formData.subject,
        description: formData.description,
      });
      setEditOpen(false);
      setSelectedTicket(null);
      void fetchStats();
      void loadTickets();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      await deleteTicket(ticketToDelete._id);
      setDeleteOpen(false);
      setTicketToDelete(null);
      void fetchStats();
      void loadTickets();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleStatusChange = async (
    ticketId: string,
    newStatus: TicketStatus
  ) => {
    try {
      await updateTicket(ticketId, { status: newStatus });
      void fetchStats();
      void loadTickets();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAddReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      showToast({ message: "Please enter a reply message", type: "error" });
      return;
    }

    try {
      await addReply(selectedTicket._id, { message: replyMessage });
      setReplyOpen(false);
      setReplyMessage("");
      // Refresh ticket details
      if (selectedTicket) {
        const ticketData = await fetchTicketById(selectedTicket._id);
        setSelectedTicket({ ...selectedTicket, replies: ticketData.replies });
      }
      void loadTickets();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || !assignUserId) {
      showToast({ message: "Please select a user to assign", type: "error" });
      return;
    }

    try {
      await assignTicket(selectedTicket._id, assignUserId);
      setAssignOpen(false);
      setAssignUserId("");
      void loadTickets();
    } catch (error) {
      // Error handled by hook
    }
  };

  const openEditDialog = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority,
      category: ticket.category,
      status: ticket.status,
    });
    // Fetch full ticket with replies
    try {
      const ticketData = await fetchTicketById(ticket._id);
      setSelectedTicket({ ...ticket, replies: ticketData.replies });
    } catch (error) {
      // Use ticket as is if fetch fails
    }
    setEditOpen(true);
  };

  const openViewDialog = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    // Fetch full ticket with replies
    try {
      const ticketData = await fetchTicketById(ticket._id);
      setSelectedTicket({ ...ticket, replies: ticketData.replies });
    } catch (error) {
      // Use ticket as is if fetch fails
    }
    setViewOpen(true);
  };

  const filteredTickets = React.useMemo(() => {
    return tickets
      .filter((t) => {
        const searchLower = search.toLowerCase();
        const userName =
          typeof t.userId === "object" && t.userId
            ? `${t.userId.firstName || ""} ${t.userId.lastName || ""}`.trim()
            : "";
        const matchesSearch =
          !search ||
          t.subject.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.ticketNumber?.toLowerCase().includes(searchLower) ||
          userName.toLowerCase().includes(searchLower);

        const matchesPriority =
          priorityFilter === "all" || t.priority === priorityFilter;
        const matchesStatus =
          statusFilter === "all" || t.status === statusFilter;

        return matchesSearch && matchesPriority && matchesStatus;
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
          const order: Record<string, number> = {
            escalated: 6,
            "in-progress": 5,
            open: 4,
            pending: 3,
            resolved: 2,
            closed: 1,
            waiting_for_customer: 3,
          };
          const aOrder = order[a.status] || 0;
          const bOrder = order[b.status] || 0;
          return bOrder - aOrder;
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
    const styles: Record<string, string> = {
      open: "bg-blue-500 text-white",
      pending: "bg-yellow-500 text-white",
      closed: "bg-gray-500 text-white",
      escalated: "bg-red-500 text-white",
      "in-progress": "bg-primary text-white",
      resolved: "bg-green-500 text-white",
      waiting_for_customer: "bg-orange-500 text-white",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          styles[s] || "bg-gray-500 text-white"
        }`}
      >
        {s.replace("-", " ").replace("_", " ").toUpperCase()}
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
              void loadTickets();
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
              <TicketIcon className="text-blue-600 w-6 h-6" />
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
                          <span>
                            {typeof t.userId === "object" && t.userId
                              ? `${t.userId.firstName || ""} ${
                                  t.userId.lastName || ""
                                }`.trim() ||
                                t.userId.email ||
                                "Unknown User"
                              : "Unknown User"}
                          </span>
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
                            <span>
                              {typeof t.assignedTo === "object" && t.assignedTo
                                ? `${t.assignedTo.firstName || ""} ${
                                    t.assignedTo.lastName || ""
                                  }`.trim() || "Assigned"
                                : "Assigned"}
                            </span>
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
                    onClick={() => void openViewDialog(t)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:border-primary hover:text-primary transition-all"
                    onClick={() => void openEditDialog(t)}
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
                      <DropdownMenuItem onClick={() => void openViewDialog(t)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void openEditDialog(t)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Ticket
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTicket(t);
                          setReplyOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Reply
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTicket(t);
                          setAssignOpen(true);
                        }}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Assign Ticket
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mb-8 bg-card rounded-xl p-4 border border-gray-100">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} tickets
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="border-gray-300"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      disabled={isLoading}
                      className={page === pageNum ? "" : "border-gray-300"}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages || isLoading}
              className="border-gray-300"
            >
              Next
            </Button>
          </div>
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
              disabled={isActionLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isActionLoading ? (
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
                      {typeof selectedTicket.userId === "object" &&
                      selectedTicket.userId
                        ? `${selectedTicket.userId.firstName || ""} ${
                            selectedTicket.userId.lastName || ""
                          }`.trim() ||
                          selectedTicket.userId.email ||
                          "N/A"
                        : "N/A"}
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
              disabled={isActionLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isActionLoading ? (
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
                    {typeof selectedTicket.userId === "object" &&
                    selectedTicket.userId
                      ? `${selectedTicket.userId.firstName || ""} ${
                          selectedTicket.userId.lastName || ""
                        }`.trim() ||
                        selectedTicket.userId.email ||
                        "N/A"
                      : "N/A"}
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
                    {selectedTicket.replies.map((reply: TicketReply) => {
                      const userName =
                        typeof reply.userId === "object" && reply.userId
                          ? `${reply.userId.firstName || ""} ${
                              reply.userId.lastName || ""
                            }`.trim() ||
                            reply.userId.email ||
                            "Staff"
                          : "Staff";
                      return (
                        <div
                          key={reply._id}
                          className={`bg-gray-50 rounded-lg p-4 border-l-4 ${
                            reply.isStaffReply
                              ? "border-primary"
                              : "border-blue-400"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {userName}
                              </span>
                              {reply.isStaffReply && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  Staff
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {reply.message}
                          </p>
                        </div>
                      );
                    })}
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
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (selectedTicket) {
                    setViewOpen(false);
                    void openEditDialog(selectedTicket);
                  }
                }}
                variant="outline"
                className="border-gray-300"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Ticket
              </Button>
              <Button
                onClick={() => {
                  if (selectedTicket) {
                    setViewOpen(false);
                    setSelectedTicket(selectedTicket);
                    setReplyOpen(true);
                  }
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Reply
              </Button>
            </div>
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
              disabled={isActionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isActionLoading ? (
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

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Add Reply</DialogTitle>
                <DialogDescription>
                  {selectedTicket &&
                    `Reply to ticket #${selectedTicket.ticketNumber}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedTicket && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {selectedTicket.subject}
                </p>
                <p className="text-xs text-gray-500">
                  Ticket #{selectedTicket.ticketNumber}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reply-message" className="text-sm font-medium">
                Reply Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reply-message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Enter your reply message..."
                rows={6}
                className="border-gray-300 focus:border-primary resize-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setReplyOpen(false);
                setReplyMessage("");
              }}
              className="border-gray-300"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => void handleAddReply()}
              disabled={isActionLoading || !replyMessage.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Ticket Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Assign Ticket</DialogTitle>
                <DialogDescription>
                  {selectedTicket &&
                    `Assign ticket #${selectedTicket.ticketNumber} to a team member`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedTicket && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {selectedTicket.subject}
                </p>
                <p className="text-xs text-gray-500">
                  Ticket #{selectedTicket.ticketNumber}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="assign-user" className="text-sm font-medium">
                Assign To <span className="text-red-500">*</span>
              </Label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger id="assign-user" className="border-gray-300">
                  <SelectValue placeholder="Select a team member..." />
                </SelectTrigger>
                <SelectContent>
                  {users.length > 0 ? (
                    users
                      .filter(
                        (u) =>
                          u.role === "admin" ||
                          u.role === "instructor" ||
                          u.role === "super_admin"
                      )
                      .map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="no-users" disabled>
                      No team members available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setAssignOpen(false);
                setAssignUserId("");
              }}
              className="border-gray-300"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => void handleAssignTicket()}
              disabled={isActionLoading || !assignUserId}
              className="bg-primary hover:bg-primary/90"
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assign Ticket
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
