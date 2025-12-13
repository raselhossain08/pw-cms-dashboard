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
  Trash2,
  Copy,
  FileText,
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Database,
  PowerOff,
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
import type { Agent, AgentStatus, CreateAgentDto, UpdateAgentDto } from "@/services/ai-agents.service";

interface FormData {
  name: string;
  description: string;
  agentType: string;
  knowledgeBase: string[];
}

const agentTypes = [
  "Course Advisor",
  "Study Assistant",
  "Assignment Helper",
  "Progress Tracker",
  "Language Tutor",
  "Technical Support",
  "Custom",
];

const knowledgeBaseOptions = [
  { id: "course-materials", label: "Course Materials" },
  { id: "faq-database", label: "FAQ Database" },
  { id: "student-handbook", label: "Student Handbook" },
  { id: "policies", label: "Policies & Guidelines" },
  { id: "technical-docs", label: "Technical Documentation" },
];

export default function AIAgents() {
  const {
    agents,
    analytics,
    conversations,
    loading,
    creating,
    updating,
    deleting,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    toggleStatus,
    duplicateAgent,
  } = useAIAgents();

  const [statusFilter, setStatusFilter] = React.useState<string>("All Status");
  const [sortBy, setSortBy] = React.useState<string>("Sort by: Newest");
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [agentToDelete, setAgentToDelete] = React.useState<Agent | null>(null);

  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    description: "",
    agentType: "Course Advisor",
    knowledgeBase: [],
  });

  // Keyboard shortcut for search
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

  // Filter and sort agents
  const filteredAgents = React.useMemo(() => {
    return agents
      .filter((a) => {
        const matchesStatus =
          statusFilter === "All Status" || a.status === statusFilter.toLowerCase();
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy.includes("Newest")) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy.includes("Oldest")) return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy.includes("Name")) return a.name.localeCompare(b.name);
        if (sortBy.includes("Usage")) return b.conversations - a.conversations;
        return 0;
      });
  }, [agents, statusFilter, sortBy, search]);

  const handleCreateClick = () => {
    setEditMode(false);
    setSelectedAgent(null);
    setFormData({
      name: "",
      description: "",
      agentType: "Course Advisor",
      knowledgeBase: [],
    });
    setDialogOpen(true);
  };

  const handleEditClick = (agent: Agent) => {
    setEditMode(true);
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      agentType: agent.agentType,
      knowledgeBase: agent.knowledgeBase || [],
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && selectedAgent) {
        await updateAgent(selectedAgent._id, formData as UpdateAgentDto);
      } else {
        await createAgent(formData as CreateAgentDto);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save agent:", error);
    }
  };

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (agentToDelete) {
      try {
        await deleteAgent(agentToDelete._id);
        setDeleteDialogOpen(false);
        setAgentToDelete(null);
      } catch (error) {
        console.error("Failed to delete agent:", error);
      }
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    const newStatus: AgentStatus = agent.status === "active" ? "inactive" : "active";
    await toggleStatus(agent._id, newStatus);
  };

  const handleDuplicate = async (agent: Agent) => {
    await duplicateAgent(agent._id);
  };

  const handleKnowledgeBaseChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      knowledgeBase: checked
        ? [...prev.knowledgeBase, id]
        : prev.knowledgeBase.filter((kb) => kb !== id),
    }));
  };

  if (loading) {
    return (
      <main className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Loading AI Agents...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">AI Agents</h2>
          <p className="text-gray-600">
            Manage and configure your AI assistants for enhanced learning experiences
          </p>
        </div>
        <Button onClick={handleCreateClick} disabled={creating}>
          {creating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Create New Agent
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Agents</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.activeAgents || 0}
              </p>
              <p className="text-accent text-sm mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3 this month
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
              <p className="text-gray-600 text-sm font-medium">Daily Conversations</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.dailyConversations.toLocaleString() || 0}
              </p>
              <p className="text-accent text-sm mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{analytics?.conversationTrend || 0}% from last week
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
              <p className="text-gray-600 text-sm font-medium">Avg. Response Time</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.avgResponseTime || 0}s
              </p>
              <p className="text-accent text-sm mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {analytics?.responseTrend || 0}s from last month
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
              <p className="text-gray-600 text-sm font-medium">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.satisfactionRate || 0}%
              </p>
              <p className="text-accent text-sm mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{analytics?.satisfactionTrend || 0}% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Agents Section */}
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

        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No agents found</p>
            <Button onClick={handleCreateClick} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create First Agent
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <div key={agent._id} className="rounded-xl p-6 shadow-sm border border-gray-100 bg-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${agent.iconBg || "bg-primary/10"} rounded-lg flex items-center justify-center`}>
                      <Bot className={`${agent.iconColor || "text-primary"} w-6 h-6`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">{agent.name}</h4>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            agent.status === "active"
                              ? "bg-accent"
                              : agent.status === "inactive"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <span className="text-xs text-gray-500 capitalize">{agent.status}</span>
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
                      <DropdownMenuItem onClick={() => handleEditClick(agent)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(agent)}>
                        {agent.status === "active" ? (
                          <>
                            <PowerOff className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(agent)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteClick(agent)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-gray-600 text-sm mb-4">{agent.description}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{agent.conversations.toLocaleString()} convos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{agent.avgResponseSec}s avg</span>
                  </div>
                </div>
                <Button onClick={() => handleEditClick(agent)} className="w-full">
                  <Settings className="w-4 h-4 mr-2" /> Configure
                </Button>
              </div>
            ))}
            <button
              className="rounded-xl p-6 shadow-sm border border-dashed border-primary/30 bg-linear-to-br from-primary/5 to-accent/5 flex flex-col items-center justify-center text-center hover:from-primary/10 hover:to-accent/10 transition-all"
              onClick={handleCreateClick}
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Plus className="text-primary w-8 h-8" />
              </div>
              <h4 className="font-semibold text-secondary mb-2">Create New Agent</h4>
              <p className="text-gray-600 text-sm">Design a custom AI assistant for your needs</p>
            </button>
          </div>
        )}
      </div>

      {/* Recent Conversations */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">Recent Conversations</h3>
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No conversations yet</div>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversations.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50 transition-colors">
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
                    <td className="px-6 py-4 whitespace-nowrap">{row.agentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.started}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.status === "Completed" ? (
                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs flex items-center w-fit">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs flex items-center w-fit">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bot className="text-primary w-5 h-5" />
              </div>
              <div>
                <DialogTitle>{editMode ? "Edit AI Agent" : "Create New AI Agent"}</DialogTitle>
                <DialogDescription>
                  {editMode
                    ? "Update your AI assistant configuration"
                    : "Design an assistant tailored to your courses and learners"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Math Tutor"
                required
              />
            </div>
            <div>
              <Label htmlFor="agent-desc">Description</Label>
              <Textarea
                id="agent-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe what this agent will do..."
                required
              />
            </div>
            <div>
              <Label htmlFor="agent-type">Agent Type</Label>
              <Select
                value={formData.agentType}
                onValueChange={(value) => setFormData({ ...formData, agentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center mb-2">
                <Database className="w-4 h-4 mr-2" />
                Knowledge Base
              </Label>
              <div className="space-y-2 border rounded-lg p-3">
                {knowledgeBaseOptions.map((option) => (
                  <label key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.knowledgeBase.includes(option.id)}
                      onCheckedChange={(checked) =>
                        handleKnowledgeBaseChange(option.id, checked as boolean)
                      }
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || updating}>
                {creating || updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editMode ? "Update Agent" : "Create Agent"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600 w-5 h-5" />
              </div>
              <AlertDialogTitle>Delete AI Agent</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{agentToDelete?.name}</strong>? This action cannot
              be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Agent
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
