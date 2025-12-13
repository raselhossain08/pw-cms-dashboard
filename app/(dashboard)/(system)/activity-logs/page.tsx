"use client";

import * as React from "react";
import RequireAuth from "@/components/RequireAuth";
import {
  ListOrdered,
  Bug,
  Brain,
  MessageSquare,
  Download,
  Filter,
  ArrowUp,
  AlertTriangle,
  Bot,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { LogsFilterModal } from "@/components/shared/LogsFilterModal";
import { formatDistanceToNow } from "date-fns";

export default function ActivityLogsPage() {
  const {
    activityLogs,
    errorLogs,
    aiLogs,
    chatLogs,
    systemLogs,
    activityStats,
    errorStats,
    aiStats,
    chatStats,
    systemStats,
    activityPagination,
    errorPagination,
    aiPagination,
    chatPagination,
    systemPagination,
    isLoadingActivity,
    isLoadingErrors,
    isLoadingAi,
    isLoadingChat,
    isLoadingSystem,
    isLoadingStats,
    fetchActivityLogs,
    fetchErrorLogs,
    fetchAiLogs,
    fetchChatLogs,
    fetchSystemLogs,
    refreshAllStats,
    exportLogs,
    activityFilters,
    errorFilters,
    aiFilters,
    chatFilters,
    systemFilters,
    clearFilters,
  } = useActivityLogs();

  const [activeTab, setActiveTab] = React.useState("Activity Timeline");
  const [filterOpen, setFilterOpen] = React.useState(false);

  React.useEffect(() => {
    refreshAllStats();
    fetchActivityLogs();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "Activity Timeline":
        if (!Array.isArray(activityLogs) || activityLogs.length === 0)
          fetchActivityLogs();
        break;
      case "Error Logs":
        if (!Array.isArray(errorLogs) || errorLogs.length === 0)
          fetchErrorLogs();
        break;
      case "AI Logs":
        if (!Array.isArray(aiLogs) || aiLogs.length === 0) fetchAiLogs();
        break;
      case "Chat Logs":
        if (!Array.isArray(chatLogs) || chatLogs.length === 0) fetchChatLogs();
        break;
      case "System Logs":
        if (!Array.isArray(systemLogs) || systemLogs.length === 0)
          fetchSystemLogs();
        break;
    }
  };

  const handleApplyFilters = (filters: any) => {
    switch (activeTab) {
      case "Activity Timeline":
        fetchActivityLogs(filters);
        break;
      case "Error Logs":
        fetchErrorLogs(filters);
        break;
      case "AI Logs":
        fetchAiLogs(filters);
        break;
      case "Chat Logs":
        fetchChatLogs(filters);
        break;
      case "System Logs":
        fetchSystemLogs(filters);
        break;
    }
  };

  const handleExport = async () => {
    const typeMap: Record<
      string,
      "activity" | "error" | "ai" | "chat" | "system"
    > = {
      "Activity Timeline": "activity",
      "Error Logs": "error",
      "AI Logs": "ai",
      "Chat Logs": "chat",
      "System Logs": "system",
    };
    await exportLogs(typeMap[activeTab]);
  };

  const handlePageChange = (page: number) => {
    switch (activeTab) {
      case "Activity Timeline":
        fetchActivityLogs({ ...activityFilters, page });
        break;
      case "Error Logs":
        fetchErrorLogs({ ...errorFilters, page });
        break;
      case "AI Logs":
        fetchAiLogs({ ...aiFilters, page });
        break;
      case "Chat Logs":
        fetchChatLogs({ ...chatFilters, page });
        break;
      case "System Logs":
        fetchSystemLogs({ ...systemFilters, page });
        break;
    }
  };

  const getCurrentFilters = () => {
    switch (activeTab) {
      case "Activity Timeline":
        return activityFilters;
      case "Error Logs":
        return errorFilters;
      case "AI Logs":
        return aiFilters;
      case "Chat Logs":
        return chatFilters;
      case "System Logs":
        return systemFilters;
      default:
        return {};
    }
  };

  const getCurrentPagination = () => {
    switch (activeTab) {
      case "Activity Timeline":
        return activityPagination;
      case "Error Logs":
        return errorPagination;
      case "AI Logs":
        return aiPagination;
      case "Chat Logs":
        return chatPagination;
      case "System Logs":
        return systemPagination;
      default:
        return null;
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case "Activity Timeline":
        return isLoadingActivity;
      case "Error Logs":
        return isLoadingErrors;
      case "AI Logs":
        return isLoadingAi;
      case "Chat Logs":
        return isLoadingChat;
      case "System Logs":
        return isLoadingSystem;
      default:
        return false;
    }
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "bg-[#6366F1]";
      case "SUCCESS":
        return "bg-[#10B981]";
      case "WARNING":
        return "bg-[#F59E0B]";
      case "ERROR":
        return "bg-[#EF4444]";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <main className="pt-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-secondary mb-2">
                  Logs & Activity
                </h2>
                <p className="text-gray-600">
                  Monitor system activity, errors, AI interactions, and chat
                  conversations.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={handleExport}
                  disabled={isLoading()}
                >
                  <Download className="w-4 h-4 mr-2" /> Export Logs
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={refreshAllStats}
                  disabled={isLoadingStats}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isLoadingStats ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => setFilterOpen(true)}
                >
                  <Filter className="w-4 h-4 mr-2" /> Filter Logs
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Logs Today
                    </p>
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-secondary mt-1">
                          {activityStats?.totalToday || 0}
                        </p>
                        <p className="text-accent text-sm mt-1">
                          <ArrowUp className="w-3 h-3 inline" /> Active
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ListOrdered className="text-primary text-lg" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Errors</p>
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-secondary mt-1">
                          {errorStats?.totalErrors || 0}
                        </p>
                        <p className="text-red-600 text-sm mt-1">
                          <AlertTriangle className="w-3 h-3 inline" />{" "}
                          {(errorStats?.bySeverity || []).find(
                            (s) => s._id === "critical"
                          )?.count || 0}{" "}
                          critical
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Bug className="text-red-600 text-lg" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      AI Interactions
                    </p>
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-secondary mt-1">
                          {aiStats?.totalInteractions || 0}
                        </p>
                        <p className="text-accent text-sm mt-1">
                          <Bot className="w-3 h-3 inline" />{" "}
                          {aiStats?.avgResponseTime || 0}ms avg
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="text-purple-600 text-lg" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Active Chats
                    </p>
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-secondary mt-1">
                          {chatStats?.totalChats || 0}
                        </p>
                        <p className="text-accent text-sm mt-1">
                          <MessageSquare className="w-3 h-3 inline" />{" "}
                          {chatStats?.unreadMessages || 0} unread
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="text-blue-600 text-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  "Activity Timeline",
                  "Error Logs",
                  "AI Logs",
                  "Chat Logs",
                  "System Logs",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`py-4 px-1 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {isLoading() ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {activeTab === "Activity Timeline" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-secondary mb-6">
                      Activity Timeline
                    </h3>
                    <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                      {!activityLogs || activityLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          No activity logs found
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                          {Array.isArray(activityLogs) &&
                            activityLogs.map((log, i) => (
                              <div
                                key={log._id}
                                className={`relative ${
                                  i !== activityLogs.length - 1 ? "mb-6" : ""
                                }`}
                              >
                                <div className="flex space-x-4">
                                  <div className="w-10 relative z-10">
                                    <div className="absolute left-1/2 top-2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-primary bg-white"></div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`text-white text-xs px-2 py-1 rounded-full ${getLevelColor(
                                            log.level
                                          )}`}
                                        >
                                          {log.level}
                                        </span>
                                        <p className="font-medium text-secondary">
                                          {log.title}
                                        </p>
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        {formatTime(log.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {log.message}
                                    </p>
                                    {log.metadata &&
                                      log.metadata.length > 0 && (
                                        <div className="text-xs text-gray-500 space-x-2">
                                          {log.metadata.map((m, idx) => (
                                            <span
                                              key={idx}
                                              className="px-2 py-1 rounded inline-block bg-gray-100"
                                            >
                                              {m}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    {activityPagination &&
                      activityPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                          <div className="text-sm text-gray-600">
                            Showing {activityPagination.page} of{" "}
                            {activityPagination.totalPages} pages
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePageChange(activityPagination.page - 1)
                              }
                              disabled={activityPagination.page === 1}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePageChange(activityPagination.page + 1)
                              }
                              disabled={
                                activityPagination.page ===
                                activityPagination.totalPages
                              }
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {activeTab === "Error Logs" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-secondary mb-6">
                      Error Logs
                    </h3>
                    <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      {!errorLogs || errorLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          No error logs found
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Severity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Error Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Endpoint
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Array.isArray(errorLogs) &&
                                errorLogs.map((error) => (
                                  <tr
                                    key={error._id}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(
                                          error.severity
                                        )}`}
                                      >
                                        {error.severity.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {error.errorType}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                                      {error.message}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {error.endpoint || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatTime(error.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {error.isResolved ? (
                                        <span className="text-green-600 text-sm">
                                          Resolved
                                        </span>
                                      ) : (
                                        <span className="text-red-600 text-sm">
                                          Open
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
                    {errorPagination && errorPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {errorPagination.page} of{" "}
                          {errorPagination.totalPages} pages
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(errorPagination.page - 1)
                            }
                            disabled={errorPagination.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(errorPagination.page + 1)
                            }
                            disabled={
                              errorPagination.page ===
                              errorPagination.totalPages
                            }
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "AI Logs" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-secondary mb-6">
                      AI Interaction Logs
                    </h3>
                    <div className="space-y-4">
                      {!aiLogs || aiLogs.length === 0 ? (
                        <div className="bg-card rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
                          No AI logs found
                        </div>
                      ) : (
                        Array.isArray(aiLogs) &&
                        aiLogs.map((log) => (
                          <div
                            key={log._id}
                            className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Brain className="text-purple-600 w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-medium text-secondary">
                                    {(log.aiModel || "").toUpperCase()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {log.userName || "Anonymous"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  {formatTime(log.createdAt)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {log.responseTime}ms • {log.tokensUsed} tokens
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                  PROMPT
                                </p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                  {log.prompt}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                  RESPONSE
                                </p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                  {log.response}
                                </p>
                              </div>
                            </div>
                            {log.status !== "success" && (
                              <div className="mt-3">
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                  Error: {log.errorMessage}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    {aiPagination && aiPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {aiPagination.page} of{" "}
                          {aiPagination.totalPages} pages
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(aiPagination.page - 1)
                            }
                            disabled={aiPagination.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(aiPagination.page + 1)
                            }
                            disabled={
                              aiPagination.page === aiPagination.totalPages
                            }
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "Chat Logs" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-secondary mb-6">
                      Chat Logs
                    </h3>
                    <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      {!chatLogs || chatLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          No chat logs found
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sender
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Array.isArray(chatLogs) &&
                                chatLogs.map((chat) => (
                                  <tr
                                    key={chat._id}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        {chat.chatType}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {chat.senderName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                                      {chat.message}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatTime(chat.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {chat.isRead ? (
                                        <span className="text-green-600 text-sm">
                                          Read
                                        </span>
                                      ) : (
                                        <span className="text-gray-500 text-sm">
                                          Unread
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
                    {chatPagination && chatPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {chatPagination.page} of{" "}
                          {chatPagination.totalPages} pages
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(chatPagination.page - 1)
                            }
                            disabled={chatPagination.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(chatPagination.page + 1)
                            }
                            disabled={
                              chatPagination.page === chatPagination.totalPages
                            }
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "System Logs" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-secondary mb-6">
                      System Logs
                    </h3>
                    <div className="space-y-4">
                      {!systemLogs || systemLogs.length === 0 ? (
                        <div className="bg-card rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
                          No system logs found
                        </div>
                      ) : (
                        Array.isArray(systemLogs) &&
                        systemLogs.map((log) => (
                          <div
                            key={log._id}
                            className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    log.status === "healthy"
                                      ? "bg-green-100"
                                      : log.status === "warning"
                                      ? "bg-yellow-100"
                                      : "bg-red-100"
                                  }`}
                                >
                                  <AlertTriangle
                                    className={`w-5 h-5 ${
                                      log.status === "healthy"
                                        ? "text-green-600"
                                        : log.status === "warning"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-secondary">
                                    {log.eventType
                                      .replace(/_/g, " ")
                                      .toUpperCase()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {log.message}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  {formatTime(log.createdAt)}
                                </p>
                                <span
                                  className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                                    log.status === "healthy"
                                      ? "bg-green-100 text-green-800"
                                      : log.status === "warning"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {log.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            {log.systemMetrics && (
                              <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                {log.systemMetrics.cpuUsage && (
                                  <div>
                                    <p className="text-xs text-gray-500">CPU</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {log.systemMetrics.cpuUsage}%
                                    </p>
                                  </div>
                                )}
                                {log.systemMetrics.memoryUsage && (
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Memory
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {log.systemMetrics.memoryUsage}%
                                    </p>
                                  </div>
                                )}
                                {log.systemMetrics.diskUsage && (
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Disk
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {log.systemMetrics.diskUsage}%
                                    </p>
                                  </div>
                                )}
                                {log.systemMetrics.activeConnections && (
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Connections
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {log.systemMetrics.activeConnections}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    {systemPagination && systemPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {systemPagination.page} of{" "}
                          {systemPagination.totalPages} pages
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(systemPagination.page - 1)
                            }
                            disabled={systemPagination.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(systemPagination.page + 1)
                            }
                            disabled={
                              systemPagination.page ===
                              systemPagination.totalPages
                            }
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <LogsFilterModal
              open={filterOpen}
              onOpenChange={setFilterOpen}
              activeTab={activeTab}
              filters={getCurrentFilters()}
              onApplyFilters={handleApplyFilters}
              onClearFilters={clearFilters}
            />
          </div>
        </main>
      </AppLayout>
    </RequireAuth>
  );
}
