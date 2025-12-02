"use client";

import * as React from "react";
import {
  Bot,
  Search as SearchIcon,
  Filter,
  ArrowUpDown,
  EllipsisVertical,
  MessageSquare,
  Clock,
  Star,
  Plus,
  Power,
  Settings,
  Edit,
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

type AgentStatus = "active" | "inactive" | "training";

type Agent = {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  conversations: number;
  avgResponseSec: number;
  iconBg: string;
  iconColor: string;
};

type ConversationRow = {
  id: string;
  studentName: string;
  studentAvatar: string;
  agentName: string;
  started: string;
  duration: string;
  status: "Completed" | "In Progress";
};

const initialAgents: Agent[] = [
  {
    id: "a1",
    name: "Course Advisor",
    description: "Helps students select appropriate courses based on goals",
    status: "active",
    conversations: 1200,
    avgResponseSec: 0.8,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    id: "a2",
    name: "Study Assistant",
    description: "Provides explanations, examples, and study tips",
    status: "active",
    conversations: 2400,
    avgResponseSec: 1.1,
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    id: "a3",
    name: "Assignment Helper",
    description: "Assists with planning, research, and formatting",
    status: "training",
    conversations: 847,
    avgResponseSec: 1.5,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    id: "a4",
    name: "Progress Tracker",
    description: "Monitors progress and provides recommendations",
    status: "active",
    conversations: 632,
    avgResponseSec: 0.9,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "a5",
    name: "Language Tutor",
    description: "Helps practice and improve language skills",
    status: "inactive",
    conversations: 421,
    avgResponseSec: 1.8,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

const initialConversations: ConversationRow[] = [
  {
    id: "c1",
    studentName: "Sarah Johnson",
    studentAvatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    agentName: "Study Assistant",
    started: "2 hours ago",
    duration: "12 min",
    status: "Completed",
  },
  {
    id: "c2",
    studentName: "Michael Chen",
    studentAvatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
    agentName: "Course Advisor",
    started: "5 hours ago",
    duration: "8 min",
    status: "Completed",
  },
  {
    id: "c3",
    studentName: "Emma Wilson",
    studentAvatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
    agentName: "Assignment Helper",
    started: "1 day ago",
    duration: "15 min",
    status: "In Progress",
  },
  {
    id: "c4",
    studentName: "David Brown",
    studentAvatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
    agentName: "Progress Tracker",
    started: "2 days ago",
    duration: "6 min",
    status: "Completed",
  },
];

export default function AIAgents() {
  const [agents, setAgents] = React.useState<Agent[]>(initialAgents);
  const [statusFilter, setStatusFilter] = React.useState<string>("All Status");
  const [sortBy, setSortBy] = React.useState<string>("Sort by: Newest");
  const [search, setSearch] = React.useState("");
  const [newAgentOpen, setNewAgentOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("agent-search") as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filteredAgents = agents
    .filter((a) => {
      const matchesStatus = statusFilter === "All Status" || a.status === statusFilter.toLowerCase();
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy.includes("Newest")) return a.id < b.id ? 1 : -1;
      if (sortBy.includes("Oldest")) return a.id > b.id ? 1 : -1;
      if (sortBy.includes("Name")) return a.name.localeCompare(b.name);
      if (sortBy.includes("Usage")) return b.conversations - a.conversations;
      return 0;
    });

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">AI Agents</h2>
          <p className="text-gray-600">Manage and configure your AI assistants for enhanced learning experiences</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setNewAgentOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create New Agent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Agents</p>
              <p className="text-2xl font-bold text-secondary mt-1">{agents.filter((a) => a.status === "active").length}</p>
              <p className="text-accent text-sm mt-1">+3 this month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bot className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Daily Conversations</p>
              <p className="text-2xl font-bold text-secondary mt-1">1,247</p>
              <p className="text-accent text-sm mt-1">+45% from last week</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg. Response Time</p>
              <p className="text-2xl font-bold text-secondary mt-1">1.2s</p>
              <p className="text-accent text-sm mt-1">-0.3s from last month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-secondary mt-1">94%</p>
              <p className="text-accent text-sm mt-1">+5% from last month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-secondary">Your AI Agents</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="pl-10 w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
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
                  <SelectItem value="Sort by: Name">Sort by: Name</SelectItem>
                  <SelectItem value="Sort by: Usage">Sort by: Usage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="agent-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents... (Cmd+K)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((a) => (
            <div key={a.id} className="rounded-xl p-6 shadow-sm border border-gray-100 bg-card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${a.iconBg} rounded-lg flex items-center justify-center`}>
                    <Bot className={`${a.iconColor} w-6 h-6`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary">{a.name}</h4>
                    <div className="flex items-center mt-1">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          a.status === "active" ? "bg-accent" : a.status === "inactive" ? "bg-red-500" : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-xs text-gray-500 capitalize">{a.status}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-600">
                      <EllipsisVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Logs</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-gray-600 text-sm mb-4">{a.description}</p>
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{a.conversations.toLocaleString()} convos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{a.avgResponseSec}s avg</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Settings className="w-4 h-4 mr-2" /> Configure
                </Button>
                {a.status === "inactive" ? (
                  <Button variant="outline" className="border-gray-300">
                    <Power className="w-4 h-4" />
                  </Button>
                ) : a.status === "training" ? (
                  <Button variant="outline" className="border-gray-300">
                    <Edit className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button variant="outline" className="border-gray-300">
                    <Power className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <button
            className="rounded-xl p-6 shadow-sm border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 flex flex-col items-center justify-center text-center hover:from-primary/10 hover:to-accent/10 transition-all"
            onClick={() => setNewAgentOpen(true)}
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Plus className="text-primary w-8 h-8" />
            </div>
            <h4 className="font-semibold text-secondary mb-2">Create New Agent</h4>
            <p className="text-gray-600 text-sm">Design a custom AI assistant for your needs</p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">Agent Usage Analytics</h3>
          <div id="usage-chart" style={{ height: 300 }} />
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">Performance Metrics</h3>
          <div id="performance-chart" style={{ height: 300 }} />
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">Recent Conversations</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialConversations.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <img src={row.studentAvatar} alt="Student" className="w-8 h-8 rounded-full" />
                      <span>{row.studentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.agentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.started}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.status === "Completed" ? (
                      <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">Completed</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">In Progress</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button variant="ghost" className="text-primary">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={newAgentOpen} onOpenChange={setNewAgentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New AI Agent</DialogTitle>
            <DialogDescription>Design an assistant tailored to your courses and learners</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input
                type="text"
                id="agent-name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., Math Tutor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="agent-desc"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Describe what this agent will do..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Type</label>
              <Select defaultValue="Course Advisor">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Course Advisor">Course Advisor</SelectItem>
                  <SelectItem value="Study Assistant">Study Assistant</SelectItem>
                  <SelectItem value="Assignment Helper">Assignment Helper</SelectItem>
                  <SelectItem value="Progress Tracker">Progress Tracker</SelectItem>
                  <SelectItem value="Language Tutor">Language Tutor</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Knowledge Base</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                  <span className="ml-2 text-sm">Course Materials</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                  <span className="ml-2 text-sm">FAQ Database</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                  <span className="ml-2 text-sm">Student Handbook</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" className="border-gray-300" onClick={() => setNewAgentOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const nameEl = document.getElementById("agent-name") as HTMLInputElement | null;
                  const descEl = document.getElementById("agent-desc") as HTMLTextAreaElement | null;
                  const name = nameEl?.value.trim() || "New Agent";
                  const desc = descEl?.value.trim() || "Custom assistant";
                  const newA: Agent = {
                    id: Math.random().toString(36).slice(2),
                    name,
                    description: desc,
                    status: "active",
                    conversations: 0,
                    avgResponseSec: 1.2,
                    iconBg: "bg-primary/10",
                    iconColor: "text-primary",
                  };
                  setAgents([newA, ...agents]);
                  setNewAgentOpen(false);
                }}
              >
                Create Agent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

