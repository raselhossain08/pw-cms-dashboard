"use client";

import { useState, useEffect, useCallback } from "react";
import {
    aiAgentsService,
    type Agent,
    type AgentAnalytics,
    type ConversationRow,
    type CreateAgentDto,
    type UpdateAgentDto,
    type AgentStatus,
} from "@/services/ai-agents.service";
import { useToast } from "@/context/ToastContext";

export function useAIAgents() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);
    const [conversations, setConversations] = useState<ConversationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { push } = useToast();

    // Fetch all agents
    const fetchAgents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await aiAgentsService.getAllAgents();
            setAgents(data || []);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || "Failed to fetch agents";
            setError(errorMsg);
            push({
                message: errorMsg,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [push]);

    // Fetch analytics
    const fetchAnalytics = useCallback(async () => {
        try {
            const { data } = await aiAgentsService.getAnalytics();
            setAnalytics(data);
        } catch (err: any) {
            console.error("Failed to fetch analytics:", err);
        }
    }, []);

    // Fetch conversations
    const fetchConversations = useCallback(async (agentId?: string) => {
        try {
            const { data } = await aiAgentsService.getConversations(agentId);
            setConversations(data || []);
        } catch (err: any) {
            console.error("Failed to fetch conversations:", err);
        }
    }, []);

    // Create agent
    const createAgent = useCallback(
        async (agentData: CreateAgentDto) => {
            try {
                setCreating(true);
                setError(null);
                const { data } = await aiAgentsService.createAgent(agentData);
                setAgents((prev) => [data, ...prev]);
                push({
                    message: "AI Agent created successfully",
                    type: "success",
                });
                await fetchAnalytics();
                return data;
            } catch (err: any) {
                const errorMsg = err?.response?.data?.message || "Failed to create agent";
                setError(errorMsg);
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw err;
            } finally {
                setCreating(false);
            }
        },
        [push, fetchAnalytics]
    );

    // Update agent
    const updateAgent = useCallback(
        async (id: string, agentData: UpdateAgentDto) => {
            try {
                setUpdating(true);
                setError(null);
                const { data } = await aiAgentsService.updateAgent(id, agentData);
                setAgents((prev) =>
                    prev.map((agent) => (agent._id === id ? data : agent))
                );
                push({
                    message: "AI Agent updated successfully",
                    type: "success",
                });
                return data;
            } catch (err: any) {
                const errorMsg = err?.response?.data?.message || "Failed to update agent";
                setError(errorMsg);
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw err;
            } finally {
                setUpdating(false);
            }
        },
        [push]
    );

    // Delete agent
    const deleteAgent = useCallback(
        async (id: string) => {
            try {
                setDeleting(true);
                setError(null);
                await aiAgentsService.deleteAgent(id);
                setAgents((prev) => prev.filter((agent) => agent._id !== id));
                push({
                    message: "AI Agent deleted successfully",
                    type: "success",
                });
                await fetchAnalytics();
            } catch (err: any) {
                const errorMsg = err?.response?.data?.message || "Failed to delete agent";
                setError(errorMsg);
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw err;
            } finally {
                setDeleting(false);
            }
        },
        [push, fetchAnalytics]
    );

    // Toggle agent status
    const toggleStatus = useCallback(
        async (id: string, status: AgentStatus) => {
            try {
                setError(null);
                const { data } = await aiAgentsService.toggleAgentStatus(id, status);
                setAgents((prev) =>
                    prev.map((agent) => (agent._id === id ? data : agent))
                );
                push({
                    message: `Agent ${status === "active" ? "activated" : status === "inactive" ? "deactivated" : "set to training"}`,
                    type: "success",
                });
                await fetchAnalytics();
            } catch (err: any) {
                const errorMsg = err?.response?.data?.message || "Failed to toggle status";
                setError(errorMsg);
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw err;
            }
        },
        [push, fetchAnalytics]
    );

    // Duplicate agent
    const duplicateAgent = useCallback(
        async (id: string) => {
            try {
                setError(null);
                const { data } = await aiAgentsService.duplicateAgent(id);
                setAgents((prev) => [data, ...prev]);
                push({
                    message: "AI Agent duplicated successfully",
                    type: "success",
                });
                await fetchAnalytics();
                return data;
            } catch (err: any) {
                const errorMsg = err?.response?.data?.message || "Failed to duplicate agent";
                setError(errorMsg);
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw err;
            }
        },
        [push, fetchAnalytics]
    );

    // Initial data fetch
    useEffect(() => {
        fetchAgents();
        fetchAnalytics();
        fetchConversations();
    }, [fetchAgents, fetchAnalytics, fetchConversations]);

    return {
        agents,
        analytics,
        conversations,
        loading,
        creating,
        updating,
        deleting,
        error,
        fetchAgents,
        fetchAnalytics,
        fetchConversations,
        createAgent,
        updateAgent,
        deleteAgent,
        toggleStatus,
        duplicateAgent,
    };
}
