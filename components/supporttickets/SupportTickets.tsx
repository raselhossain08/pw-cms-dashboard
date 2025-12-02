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

type TicketStatus = "open" | "pending" | "closed" | "escalated" | "in-progress";
type TicketPriority = "high" | "medium" | "low";

type TicketItem = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requester: string;
  createdAgo: string;
  category: string;
  assignedTo?: string;
};

const initialTickets: TicketItem[] = [
  {
    id: "t1",
    title: "Course access issue - urgent",
    description: "Student cannot access the \"Advanced Mathematics\" course after payment.",
    status: "escalated",
    priority: "high",
    requester: "Sarah Johnson",
    createdAgo: "2 hours ago",
    category: "Technical",
  },
  {
    id: "t2",
    title: "Video playback problems",
    description: "Video lessons keep buffering and stopping during playback.",
    status: "in-progress",
    priority: "medium",
    requester: "Michael Chen",
    createdAgo: "5 hours ago",
    category: "Technical",
    assignedTo: "You",
  },
  {
    id: "t3",
    title: "Certificate download issue",
    description: "Completed course but unable to download the certificate.",
    status: "open",
    priority: "low",
    requester: "Emma Wilson",
    createdAgo: "1 day ago",
    category: "Content",
  },
  {
    id: "t4",
    title: "Refund request for cancelled course",
    description: "Student requested refund after course cancellation.",
    status: "pending",
    priority: "medium",
    requester: "David Brown",
    createdAgo: "2 days ago",
    category: "Billing",
    assignedTo: "Finance Team",
  },
  {
    id: "t5",
    title: "Course material suggestion",
    description: "Student suggested additional resources for the Python course.",
    status: "closed",
    priority: "low",
    requester: "Lisa Anderson",
    createdAgo: "3 days ago",
    category: "Feedback",
  },
];

export default function SupportTickets() {
  const [tickets, setTickets] = React.useState<TicketItem[]>(initialTickets);
  const [search, setSearch] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("All Priorities");
  const [sortBy, setSortBy] = React.useState("Sort by: Newest");
  const [tab, setTab] = React.useState("All Tickets");
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("ticket-search") as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filtered = tickets
    .filter((t) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.requester.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      const matchesPriority = priorityFilter === "All Priorities" || t.priority === priorityFilter.toLowerCase();
      const matchesTab =
        tab === "All Tickets" ||
        (tab === "Open" && t.status === "open") ||
        (tab === "Pending" && t.status === "pending") ||
        (tab === "Closed" && t.status === "closed") ||
        (tab === "Assigned to Me" && t.assignedTo === "You");
      return matchesSearch && matchesPriority && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy.includes("Newest")) return a.id < b.id ? 1 : -1;
      if (sortBy.includes("Oldest")) return a.id > b.id ? 1 : -1;
      if (sortBy.includes("Priority")) {
        const order: Record<TicketPriority, number> = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      if (sortBy.includes("Status")) {
        const order: Record<TicketStatus, number> = {
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

  const priorityBorder = (p: TicketPriority) =>
    p === "high" ? "border-l-4 border-red-500" : p === "medium" ? "border-l-4 border-yellow-500" : "border-l-4 border-green-500";

  const statusBadge = (s: TicketStatus) => {
    if (s === "open") return "bg-accent text-white";
    if (s === "pending") return "bg-yellow-500 text-white";
    if (s === "closed") return "bg-gray-500 text-white";
    if (s === "escalated") return "bg-red-500 text-white";
    return "bg-primary text-white";
  };

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Support Tickets</h2>
          <p className="text-gray-600">Manage and resolve student and instructor support requests</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Open Tickets</p>
              <p className="text-2xl font-bold text-secondary mt-1">{tickets.filter((t) => t.status === "open").length}</p>
              <p className="text-accent text-sm mt-1">+8 from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Ticket className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg. Response Time</p>
              <p className="text-2xl font-bold text-secondary mt-1">2.4h</p>
              <p className="text-accent text-sm mt-1">-0.6h from last week</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Clock className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-secondary mt-1">92%</p>
              <p className="text-accent text-sm mt-1">+3% from last month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Escalated Tickets</p>
              <p className="text-2xl font-bold text-secondary mt-1">{tickets.filter((t) => t.status === "escalated").length}</p>
              <p className="text-red-500 text-sm mt-1">+2 urgent issues</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {[
              "All Tickets",
              "Open",
              "Pending",
              "Closed",
              "Assigned to Me",
            ].map((label) => (
              <Button
                key={label}
                variant={tab === label ? "default" : "outline"}
                className={tab === label ? "" : "border-gray-300"}
                onClick={() => setTab(label)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="pl-10 w-40">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Priorities">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="pl-10 w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sort by: Newest">Sort by: Newest</SelectItem>
                  <SelectItem value="Sort by: Oldest">Sort by: Oldest</SelectItem>
                  <SelectItem value="Sort by: Priority">Sort by: Priority</SelectItem>
                  <SelectItem value="Sort by: Status">Sort by: Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="ticket-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets... (Cmd+K)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {filtered.map((t) => (
          <div key={t.id} className={`bg-card rounded-xl p-6 shadow-sm border border-gray-100 ${priorityBorder(t.priority)}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        t.priority === "high"
                          ? "bg-red-100"
                          : t.priority === "medium"
                          ? "bg-yellow-100"
                          : "bg-green-100"
                      }`}
                    >
                      {t.priority === "high" ? (
                        <AlertTriangle className="text-red-600 w-5 h-5" />
                      ) : t.priority === "medium" ? (
                        <Clock className="text-yellow-600 w-5 h-5" />
                      ) : (
                        <Tag className="text-green-600 w-5 h-5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-secondary">{t.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${statusBadge(t.status)}`}>
                        {t.status === "in-progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{t.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{t.requester}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Created: {t.createdAgo}</span>
                      </div>
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        <span>{t.category}</span>
                      </div>
                      {t.assignedTo && (
                        <div className="flex items-center">
                          <UserCheck className="w-4 h-4 mr-1" />
                          <span>Assigned to: {t.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 lg:mt-0 lg:ml-4 flex space-x-2">
                {t.status === "in-progress" ? (
                  <Button className="bg-accent hover:bg-accent/90">Resolve</Button>
                ) : t.status === "closed" ? (
                  <Button variant="outline" className="border-gray-300">Reopen</Button>
                ) : t.status === "pending" ? (
                  <Button>Follow Up</Button>
                ) : (
                  <Button>Assign to Me</Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="border-gray-300">
                      <EllipsisVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">Tickets by Category</h3>
          <div id="category-chart" style={{ height: 300 }} />
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">Response Time Trend</h3>
          <div id="response-time-chart" style={{ height: 300 }} />
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Support Ticket</DialogTitle>
            <DialogDescription>Provide details to open a support request</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Title</label>
              <input
                type="text"
                id="ticket-title"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Brief description of the issue"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Select defaultValue="Low">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select defaultValue="Technical">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="Feedback">Feedback</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="ticket-desc"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={4}
                placeholder="Detailed description of the issue..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Drag and drop files here or click to upload</p>
                <Button variant="outline" className="mt-2 border-gray-300">Select Files</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
                <Select defaultValue="Sarah Johnson">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                    <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                    <SelectItem value="David Brown">David Brown</SelectItem>
                    <SelectItem value="Lisa Anderson">Lisa Anderson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <Select defaultValue="Unassigned">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                    <SelectItem value="Myself">Myself</SelectItem>
                    <SelectItem value="Technical Team">Technical Team</SelectItem>
                    <SelectItem value="Billing Team">Billing Team</SelectItem>
                    <SelectItem value="Content Team">Content Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" className="border-gray-300" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const titleEl = document.getElementById("ticket-title") as HTMLInputElement | null;
                  const descEl = document.getElementById("ticket-desc") as HTMLTextAreaElement | null;
                  const title = titleEl?.value.trim() || "New Ticket";
                  const desc = descEl?.value.trim() || "";
                  const newT: TicketItem = {
                    id: Math.random().toString(36).slice(2),
                    title,
                    description: desc || "Newly created support ticket",
                    status: "open",
                    priority: "low",
                    requester: "Sarah Johnson",
                    createdAgo: "just now",
                    category: "Technical",
                  };
                  setTickets([newT, ...tickets]);
                  setCreateOpen(false);
                }}
              >
                Create Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

