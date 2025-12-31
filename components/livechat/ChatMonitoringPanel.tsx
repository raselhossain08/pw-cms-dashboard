"use client";

import * as React from "react";
import {
  Users,
  Clock,
  MessageSquare,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";

interface ChatMonitoringStats {
  activeConversations: number;
  waitingUsers: number;
  onlineAgents: number;
  queueLength: number;
  averageWaitTime: number;
  responseTimes: {
    immediate: number;
    within1Min: number;
    within5Min: number;
    within30Min: number;
    over30Min: number;
  };
  performanceMetrics: {
    firstResponseTime: number;
    resolutionTime: number;
    agentPerformance: Array<{
      agentId: string;
      resolved: number;
      avgTime: number;
    }>;
  };
}

interface ActiveSession {
  id: string;
  userName: string;
  userEmail: string;
  startedAt: string;
  lastMessage: string;
  waitTime: number;
  status: "active" | "waiting" | "resolved";
  agentId?: string;
}

interface ChatMonitoringPanelProps {
  onManualReply?: (sessionId: string) => void;
  onViewHistory?: (sessionId: string) => void;
}

export default function ChatMonitoringPanel({
  onManualReply,
  onViewHistory,
}: ChatMonitoringPanelProps) {
  const [stats, setStats] = React.useState<ChatMonitoringStats | null>(null);
  const [activeSessions, setActiveSessions] = React.useState<ActiveSession[]>(
    []
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());

  const fetchMonitoringData = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch real data from API using apiClient
      const [statsResponse, sessionsResponse] = await Promise.all([
        apiClient.get("/chat/monitoring/stats"),
        apiClient.get("/chat/monitoring/sessions"),
      ]);

      setStats(statsResponse.data as ChatMonitoringStats);
      setActiveSessions(sessionsResponse.data as ActiveSession[]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error);
      // Set empty data on error
      setStats({
        activeConversations: 0,
        waitingUsers: 0,
        onlineAgents: 0,
        queueLength: 0,
        averageWaitTime: 0,
        responseTimes: {
          immediate: 0,
          within1Min: 0,
          within5Min: 0,
          within30Min: 0,
          over30Min: 0,
        },
        performanceMetrics: {
          firstResponseTime: 0,
          resolutionTime: 0,
          agentPerformance: [],
        },
      });
      setActiveSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMonitoringData();

    // Set up polling for real-time updates
    const interval = setInterval(fetchMonitoringData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [fetchMonitoringData]);

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusBadge = (status: ActiveSession["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            Active
          </Badge>
        );
      case "waiting":
        return <Badge variant="secondary">Waiting</Badge>;
      case "resolved":
        return (
          <Badge variant="outline" className="bg-blue-500 text-white">
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 overflow-y-auto">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chat Monitoring</h2>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMonitoringData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeConversations}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.waitingUsers} waiting in queue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.onlineAgents}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.queueLength} in queue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatWaitTime(stats.averageWaitTime) : "0s"}
            </div>
            <p className="text-xs text-muted-foreground">
              First response: {stats?.performanceMetrics.firstResponseTime}s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.responseTimes.immediate}%
            </div>
            <p className="text-xs text-muted-foreground">Immediate responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Real-time monitoring of ongoing chat conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active sessions</p>
              </div>
            ) : (
              activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {session.userName}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {session.userEmail}
                        </p>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>

                    <p className="text-sm text-gray-600 mb-2 truncate">
                      {session.lastMessage}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Wait: {formatWaitTime(session.waitTime)}</span>
                      <span>•</span>
                      <span>
                        Started:{" "}
                        {new Date(session.startedAt).toLocaleTimeString()}
                      </span>
                      {session.agentId && (
                        <>
                          <span>•</span>
                          <span>Agent: {session.agentId}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {onManualReply && session.status === "waiting" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManualReply(session.id)}
                        className="text-xs"
                      >
                        Reply
                      </Button>
                    )}
                    {onViewHistory && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewHistory(session.id)}
                        className="text-xs"
                      >
                        History
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Agent performance and response time analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Response Time Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Immediate (&lt;30s)</span>
                  <span className="font-medium">
                    {stats?.responseTimes.immediate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Within 1 minute</span>
                  <span className="font-medium">
                    {stats?.responseTimes.within1Min}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Within 5 minutes</span>
                  <span className="font-medium">
                    {stats?.responseTimes.within5Min}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Within 30 minutes</span>
                  <span className="font-medium">
                    {stats?.responseTimes.within30Min}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Over 30 minutes</span>
                  <span className="font-medium">
                    {stats?.responseTimes.over30Min}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Agent Performance</h4>
              <div className="space-y-3">
                {stats?.performanceMetrics.agentPerformance.map((agent) => (
                  <div
                    key={agent.agentId}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{agent.agentId}</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {agent.resolved} resolved
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg: {formatWaitTime(agent.avgTime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
