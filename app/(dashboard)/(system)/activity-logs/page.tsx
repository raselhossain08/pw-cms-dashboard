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
  Clock,
  Users,
  ShieldAlert,
  ArrowUp,
  AlertTriangle,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type TimelineItem = {
  level: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  title: string;
  time: string;
  message: string;
  meta: string[];
};

const timeline: TimelineItem[] = [
  {
    level: "INFO",
    title: "User Registration",
    time: "2 minutes ago",
    message: "New user sarah.wilson@email.com registered successfully",
    meta: ["IP: 192.168.1.45", "Device: Chrome on Windows"],
  },
  {
    level: "SUCCESS",
    title: "Payment Processed",
    time: "15 minutes ago",
    message:
      "Payment of $325,000 processed for aircraft purchase (Cessna 172S)",
    meta: ["Transaction: TX-789456123", "Method: Bank Transfer"],
  },
  {
    level: "WARNING",
    title: "API Rate Limit",
    time: "1 hour ago",
    message:
      "API rate limit approaching for user michael.chen@flightacademy.com",
    meta: ["85% of limit used", "Endpoint: /api/v1/aircraft"],
  },
  {
    level: "ERROR",
    title: "Database Connection",
    time: "2 hours ago",
    message: "Temporary database connection failure - retrying automatically",
    meta: ["Connection timeout", "Server: db-primary-01"],
  },
  {
    level: "INFO",
    title: "Aircraft Listing",
    time: "3 hours ago",
    message: "New aircraft listing created: Beechcraft King Air 350i",
    meta: ["Price: $4,200,000", "Seller: Aviation Partners Inc."],
  },
];

export default function ActivityLogsPage() {
  const [activeTab, setActiveTab] = React.useState("Activity Timeline");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [severity, setSeverity] = React.useState("All Errors");
  const [aiModel, setAiModel] = React.useState("All Models");
  const [respTime, setRespTime] = React.useState("Any");
  const [chatType, setChatType] = React.useState("All Chats");
  const [timeRange, setTimeRange] = React.useState("Last 24 hours");
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [errorFilter, setErrorFilter] = React.useState("All");
  const [chatFilter, setChatFilter] = React.useState("All");
  const [systemFilter, setSystemFilter] = React.useState("All");

  return (
    <RequireAuth roles={["admin", "super_admin"]}>
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
              >
                <Download className="w-4 h-4 mr-2" /> Export Logs
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
                  <p className="text-2xl font-bold text-secondary mt-1">2,847</p>
                  <p className="text-accent text-sm mt-1">
                    <ArrowUp className="w-3 h-3 inline" /> +12% from yesterday
                  </p>
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
                  <p className="text-2xl font-bold text-secondary mt-1">24</p>
                  <p className="text-red-600 text-sm mt-1">
                    <AlertTriangle className="w-3 h-3 inline" /> 3 critical
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Bug className="text-red-600 text-lg" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">AI Interactions</p>
                  <p className="text-2xl font-bold text-secondary mt-1">1,247</p>
                  <p className="text-accent text-sm mt-1">
                    <Bot className="w-3 h-3 inline" /> 45% of total
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="text-purple-600 text-lg" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Chats</p>
                  <p className="text-2xl font-bold text-secondary mt-1">47</p>
                  <p className="text-accent text-sm mt-1">
                    <MessageSquare className="w-3 h-3 inline" /> 12 unread
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="text-blue-600 text-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {["Activity Timeline", "Error Logs", "AI Logs", "Chat Logs", "System Logs"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 font-medium text-sm ${
                      activeTab === tab
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </nav>
          </div>

          {activeTab === "Activity Timeline" && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-secondary">Activity Timeline</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Time Range:</span>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-40 bg-gray-50 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Last 24 hours">Last 24 hours</SelectItem>
                        <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                        <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                        <SelectItem value="Custom range">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    {["All", "User", "System", "Admin"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                          activeFilter === f
                            ? "bg-primary text-white"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  {timeline.map((t, i) => (
                    <div key={i} className={`relative ${i !== timeline.length - 1 ? "mb-6" : ""}`}>
                      <div className="flex space-x-4">
                        <div className="w-10 relative z-10">
                          <div className="absolute left-1/2 top-2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-primary bg-white"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-white text-xs px-2 py-1 rounded-full ${
                                  t.level === "INFO"
                                    ? "bg-[#6366F1]"
                                    : t.level === "SUCCESS"
                                    ? "bg-[#10B981]"
                                    : t.level === "WARNING"
                                    ? "bg-[#F59E0B]"
                                    : "bg-[#EF4444]"
                                }`}
                              >
                                {t.level}
                              </span>
                              <p className="font-medium text-secondary">{t.title}</p>
                            </div>
                            <span className="text-sm text-gray-500">{t.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {t.message}
                          </p>
                          <div className="text-xs text-gray-500 space-x-2">
                            {t.meta.map((m, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded inline-block ${
                                  m.includes("85%")
                                    ? "bg-yellow-100 text-yellow-800"
                                    : m.includes("timeout")
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100"
                                }`}
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </RequireAuth>
  );
}
