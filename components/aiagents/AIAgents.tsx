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
  Trash2,
  Copy,
  FileText,
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Database,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAIAgents } from "@/hooks/useAIAgents";
import type {
  Agent,
  AgentStatus,
  CreateAgentDto,
  UpdateAgentDto,
} from "@/services/ai-agents.service";

const getIconStyles = (index: number) => {
  const styles = [
    { bg: "bg-primary/10", color: "text-primary" },
    { bg: "bg-accent/10", color: "text-accent" },
    { bg: "bg-yellow-100", color: "text-yellow-600" },
    { bg: "bg-purple-100", color: "text-purple-600" },
    { bg: "bg-blue-100", color: "text-blue-600" },
    { bg: "bg-green-100", color: "text-green-600" },
  ];
  return styles[index % styles.length];
};

export default function AIAgents() {
  const {
    agents,
    analytics,
    conversations,
    loading,
    creating,
    updating,
    deleting,
    createAgent,
    updateAgent,
    deleteAgent,
    toggleStatus,
    duplicateAgent,
  } = useAIAgents();

  const [statusFilter, setStatusFilter] = React.useState<string>("All Status");
  const [sortBy, setSortBy] = React.useState<string>("Sort by: Newest");
  const [search, setSearch] = React.useState("");
  const [newAgentOpen, setNewAgentOpen] = React.useState(false);
  const [editAgentOpen, setEditAgentOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);

  // Form states
  const [formData, setFormData] = React.useState<CreateAgentDto>({
    name: "",
    description: "",
    agentType: "Course Advisor",
    knowledgeBase: [],
    status: "active",
  });

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById(
          "agent-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleCreateAgent = async () => {
    try {
      await createAgent(formData);
      setNewAgentOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return;
    try {
      await updateAgent(selectedAgent._id, formData);
      setEditAgentOpen(false);
      setSelectedAgent(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update agent:", error);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;
    try {
      await deleteAgent(selectedAgent._id);
      setDeleteDialogOpen(false);
      setSelectedAgent(null);
    } catch (error) {
      console.error("Failed to delete agent:", error);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    const newStatus: AgentStatus =
      agent.status === "active" ? "inactive" : "active";
    try {
      await toggleStatus(agent._id, newStatus);
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleDuplicate = async (agentId: string) => {
    try {
      await duplicateAgent(agentId);
    } catch (error) {
      console.error("Failed to duplicate agent:", error);
    }
  };

  const openEditDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      agentType: agent.agentType,
      knowledgeBase: agent.knowledgeBase || [],
      status: agent.status,
    });
    setEditAgentOpen(true);
  };

  const openDeleteDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      agentType: "Course Advisor",
      knowledgeBase: [],
      status: "active",
    });
  };

  const toggleKnowledgeBase = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      knowledgeBase: prev.knowledgeBase?.includes(item)
        ? prev.knowledgeBase.filter((kb) => kb !== item)
        : [...(prev.knowledgeBase || []), item],
    }));
  };

  const filteredAgents = agents
    .filter((a) => {
      const matchesStatus =
        statusFilter === "All Status" ||
        a.status === statusFilter.toLowerCase();
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy.includes("Newest"))
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortBy.includes("Oldest"))
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      if (sortBy.includes("Name")) return a.name.localeCompare(b.name);
      if (sortBy.includes("Usage")) return b.conversations - a.conversations;
      return 0;
    });

  if (loading) {
    return (
      <main className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading AI Agents...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">AI Agents</h2>
          <p className="text-gray-600">
            Manage and configure your AI assistants for enhanced learning
            experiences
          </p>
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
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.activeAgents || 0}
              </p>
              <p className="text-accent text-sm mt-1">
                {agents.filter((a) => a.status === "active").length} total
                active
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bot className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Daily Conversations
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.dailyConversations?.toLocaleString() || 0}
              </p>
              <p className="text-accent text-sm mt-1">
                {analytics?.conversationTrend
                  ? `${analytics.conversationTrend > 0 ? "+" : ""}${
                      analytics.conversationTrend
                    }%`
                  : "No change"}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Avg. Response Time
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.avgResponseTime?.toFixed(1) || 0}s
              </p>
              <p className="text-accent text-sm mt-1">
                {analytics?.responseTrend
                  ? `${
                      analytics.responseTrend > 0 ? "+" : ""
                    }${analytics.responseTrend.toFixed(1)}s`
                  : "No change"}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Satisfaction Rate
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.satisfactionRate || 0}%
              </p>
              <p className="text-accent text-sm mt-1">
                {analytics?.satisfactionTrend
                  ? `${analytics.satisfactionTrend > 0 ? "+" : ""}${
                      analytics.satisfactionTrend
                    }%`
                  : "No change"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-secondary">
            Your AI Agents
          </h3>
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
                  <SelectItem value="Sort by: Newest">
                    Sort by: Newest
                  </SelectItem>
                  <SelectItem value="Sort by: Oldest">
                    Sort by: Oldest
                  </SelectItem>
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
          {filteredAgents.map((a, index) => {
            const iconStyle = getIconStyles(index);
            return (
              <div
                key={a._id}
                className="rounded-xl p-6 shadow-sm border border-gray-100 bg-card"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 ${iconStyle.bg} rounded-lg flex items-center justify-center`}
                    >
                      <Bot className={`${iconStyle.color} w-6 h-6`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">{a.name}</h4>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            a.status === "active"
                              ? "bg-accent"
                              : a.status === "inactive"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <span className="text-xs text-gray-500 capitalize">
                          {a.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-600"
                      >
                        <EllipsisVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(a)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(a._id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(a)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
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
                    <span>{a.avgResponseSec.toFixed(1)}s avg</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={() => openEditDialog(a)}>
                    <Settings className="w-4 h-4 mr-2" /> Configure
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300"
                    onClick={() => handleToggleStatus(a)}
                    disabled={updating}
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
          <button
            className="rounded-xl p-6 shadow-sm border border-dashed border-primary/30 bg-linear-to-br from-primary/5 to-accent/5 flex flex-col items-center justify-center text-center hover:from-primary/10 hover:to-accent/10 transition-all"
            onClick={() => setNewAgentOpen(true)}
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Plus className="text-primary w-8 h-8" />
            </div>
            <h4 className="font-semibold text-secondary mb-2">
              Create New Agent
            </h4>
            <p className="text-gray-600 text-sm">
              Design a custom AI assistant for your needs
            </p>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Recent Conversations
        </h3>
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No conversations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
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
                {conversations.map((row) => (
                  <tr
                    key={row._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <img
                          src={row.studentAvatar}
                          alt="Student"
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{row.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.agentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.started}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.status === "Completed" ? (
                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button variant="ghost" className="text-primary">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Agent Dialog */}
      <Dialog open={newAgentOpen} onOpenChange={setNewAgentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New AI Agent</DialogTitle>
            <DialogDescription>
              Design an assistant tailored to your courses and learners
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Math Tutor"
              />
            </div>
            <div>
              <Label htmlFor="agent-desc">Description</Label>
              <Textarea
                id="agent-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Describe what this agent will do..."
              />
            </div>
            <div>
              <Label htmlFor="agent-type">Agent Type</Label>
              <Select
                value={formData.agentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, agentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Course Advisor">Course Advisor</SelectItem>
                  <SelectItem value="Study Assistant">
                    Study Assistant
                  </SelectItem>
                  <SelectItem value="Assignment Helper">
                    Assignment Helper
                  </SelectItem>
                  <SelectItem value="Progress Tracker">
                    Progress Tracker
                  </SelectItem>
                  <SelectItem value="Language Tutor">Language Tutor</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Knowledge Base</Label>
              <div className="space-y-2 mt-2">
                {["Course Materials", "FAQ Database", "Student Handbook"].map(
                  (kb) => (
                    <div key={kb} className="flex items-center">
                      <Checkbox
                        id={kb}
                        checked={formData.knowledgeBase?.includes(kb)}
                        onCheckedChange={() => toggleKnowledgeBase(kb)}
                      />
                      <label htmlFor={kb} className="ml-2 text-sm">
                        {kb}
                      </label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewAgentOpen(false);
                resetForm();
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAgent} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Agent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={editAgentOpen} onOpenChange={setEditAgentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit AI Agent</DialogTitle>
            <DialogDescription>
              Update agent settings and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-agent-name">Agent Name</Label>
              <Input
                id="edit-agent-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Math Tutor"
              />
            </div>
            <div>
              <Label htmlFor="edit-agent-desc">Description</Label>
              <Textarea
                id="edit-agent-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Describe what this agent will do..."
              />
            </div>
            <div>
              <Label htmlFor="edit-agent-type">Agent Type</Label>
              <Select
                value={formData.agentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, agentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Course Advisor">Course Advisor</SelectItem>
                  <SelectItem value="Study Assistant">
                    Study Assistant
                  </SelectItem>
                  <SelectItem value="Assignment Helper">
                    Assignment Helper
                  </SelectItem>
                  <SelectItem value="Progress Tracker">
                    Progress Tracker
                  </SelectItem>
                  <SelectItem value="Language Tutor">Language Tutor</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as AgentStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Knowledge Base</Label>
              <div className="space-y-2 mt-2">
                {["Course Materials", "FAQ Database", "Student Handbook"].map(
                  (kb) => (
                    <div key={kb} className="flex items-center">
                      <Checkbox
                        id={`edit-${kb}`}
                        checked={formData.knowledgeBase?.includes(kb)}
                        onCheckedChange={() => toggleKnowledgeBase(kb)}
                      />
                      <label htmlFor={`edit-${kb}`} className="ml-2 text-sm">
                        {kb}
                      </label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditAgentOpen(false);
                setSelectedAgent(null);
                resetForm();
              }}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAgent} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Agent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              agent "{selectedAgent?.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Agent"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
