"use client";

import * as React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Brain,
  History,
  Book,
  Plane,
  LineChart,
  HelpCircle,
  Bot,
  User,
  Mic,
  Paperclip,
  Send,
  Lightbulb,
  Shield,
  Settings,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Loader2,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Database,
  Code,
  Zap,
  Lock,
  Key,
  ShoppingCart,
  GraduationCap,
  FileCode,
  Terminal,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAiAssistant } from "@/hooks/useAiAssistant";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ThumbsUp,
  ThumbsDown,
  UserPlus,
  Trash2,
  RefreshCw,
  X,
  Search,
  Wifi,
  WifiOff,
  BarChart3,
  Activity,
} from "lucide-react";

export default function AIAssistantPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Check if user is Super Admin
  React.useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "super_admin") {
      router.push("/");
      return;
    }
  }, [user, router]);
  const { push } = useToast();
  const {
    messages,
    input,
    typing,
    sending,
    error,
    listening,
    quickReplies,
    conversations,
    historyOpen,
    containerRef,
    attachments,
    preferences,
    connectionStatus,
    aiStatus,
    canStopGeneration,
    setInput,
    setListening,
    setHistoryOpen,
    updatePreferences,
    sendMessage,
    emitUserTyping,
    selectConversation,
    addAttachments,
    removeAttachment,
    clearAttachments,
    newConversation,
    clearCurrentMessages,
    rateConversation,
    escalateToHuman,
    deleteConversation,
    stopGeneration,
    regenerateLastResponse,
  } = useAiAssistant();

  // Local error state for custom errors
  const [localError, setLocalError] = React.useState<string | undefined>(
    undefined
  );

  const typingTimeoutRef = React.useRef<number | null>(null);
  const canSend = (input || "").trim().length > 0;
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [ratingOpen, setRatingOpen] = React.useState(false);
  const [escalateOpen, setEscalateOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [ratingValue, setRatingValue] = React.useState(0);
  const [feedbackText, setFeedbackText] = React.useState("");
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const recognitionRef = React.useRef<any>(null);

  // Initialize Web Speech API
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };

      recognitionRef.current.onerror = () => {
        setListening(false);
        push({ message: "Speech recognition error", type: "error" });
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  React.useEffect(() => {
    if (listening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        setListening(false);
      }
    } else if (!listening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, [listening]);

  function renderMarkdown(text: string) {
    // Split by code blocks first
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts: Array<{
      type: "code" | "text";
      lang?: string;
      content: string;
    }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }
      parts.push({ type: "code", lang: match[1] || "", content: match[2] });
      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.substring(lastIndex) });
    }

    if (parts.length === 0) {
      parts.push({ type: "text", content: text });
    }

    return (
      <div className="space-y-3">
        {parts.map((part, partIdx) => {
          if (part.type === "code") {
            return (
              <pre
                key={`code-${partIdx}`}
                className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono"
              >
                <code>{part.content.trim()}</code>
              </pre>
            );
          }

          // Process text content
          const lines = part.content.split("\n");
          return (
            <div key={`text-${partIdx}`} className="space-y-2">
              {lines.map((line, lineIdx) => {
                // Headers
                if (/^###\s/.test(line)) {
                  return (
                    <h3 key={lineIdx} className="text-lg font-bold mt-4 mb-2">
                      {line.replace(/^###\s/, "")}
                    </h3>
                  );
                }
                if (/^##\s/.test(line)) {
                  return (
                    <h2 key={lineIdx} className="text-xl font-bold mt-4 mb-2">
                      {line.replace(/^##\s/, "")}
                    </h2>
                  );
                }
                if (/^#\s/.test(line)) {
                  return (
                    <h1 key={lineIdx} className="text-2xl font-bold mt-4 mb-2">
                      {line.replace(/^#\s/, "")}
                    </h1>
                  );
                }

                // Lists
                if (/^[-*]\s/.test(line)) {
                  return (
                    <div key={lineIdx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        {renderInlineMarkdown(line.replace(/^[-*]\s/, ""))}
                      </span>
                    </div>
                  );
                }
                if (/^\d+\.\s/.test(line)) {
                  const num = line.match(/^(\d+)\./)?.[1];
                  return (
                    <div key={lineIdx} className="flex items-start">
                      <span className="mr-2 font-semibold">{num}.</span>
                      <span>
                        {renderInlineMarkdown(line.replace(/^\d+\.\s/, ""))}
                      </span>
                    </div>
                  );
                }

                // Empty line
                if (!line.trim()) {
                  return <br key={lineIdx} />;
                }

                // Regular paragraph
                return (
                  <p key={lineIdx} className="leading-relaxed">
                    {renderInlineMarkdown(line)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  function renderInlineMarkdown(text: string) {
    const segments = text
      .split(
        /(https?:\/\/[^\s)]+)|(\*\*[^*]+\*\*)|(_[^_]+_)|(`[^`]+`)|(\*[^*]+\*)/g
      )
      .filter(Boolean);

    return segments.map((seg, idx) => {
      if (/^https?:\/\//.test(seg)) {
        return (
          <a
            key={idx}
            href={seg}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            {seg}
          </a>
        );
      }
      if (/^\*\*.*\*\*$/.test(seg)) {
        return (
          <strong key={idx} className="font-bold">
            {seg.replace(/^\*\*|\*\*$/g, "")}
          </strong>
        );
      }
      if (/^_.*_$/.test(seg)) {
        return (
          <em key={idx} className="italic">
            {seg.replace(/^_|_$/g, "")}
          </em>
        );
      }
      if (/^`.*`$/.test(seg)) {
        return (
          <code
            key={idx}
            className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
          >
            {seg.replace(/^`|`$/g, "")}
          </code>
        );
      }
      if (/^\*.*\*$/.test(seg)) {
        return (
          <em key={idx} className="italic">
            {seg.replace(/^\*|\*$/g, "")}
          </em>
        );
      }
      return <span key={idx}>{seg}</span>;
    });
  }

  function saveToNotes(content: string) {
    try {
      const raw = localStorage.getItem("ai_notes");
      const list = raw ? JSON.parse(raw) : [];
      list.push({ content, ts: Date.now() });
      localStorage.setItem("ai_notes", JSON.stringify(list));
      push({ message: "Saved to notes", type: "success" });
    } catch {
      push({ message: "Failed to save note", type: "error" });
    }
  }

  function exportTranscriptCSV() {
    const rows = ["role,content,timestamp"].concat(
      messages.map(
        (m) =>
          `${m.from},"${(m.content || "").replace(/"/g, '""')}",${
            m.timestamp || ""
          }`
      )
    );
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${Date.now()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportTranscriptHTML() {
    const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Chat Transcript</title><style>body{font-family:system-ui,Segoe UI,Arial;padding:24px} .ai{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin:8px 0} .user{background:#4f46e5;color:#fff;border-radius:12px;padding:12px;margin:8px 0}</style></head><body><h2>Personal Wings AI Assistant</h2>${messages
      .map(
        (m) =>
          `<div class='${m.from}'>${(m.content || "").replace(
            /</g,
            "&lt;"
          )}</div>`
      )
      .join("")}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${Date.now()}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function getFileIcon(type?: string) {
    if (!type) return <File className="w-4 h-4" />;
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (type.includes("pdf")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  }

  function formatFileSize(bytes?: number) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  // socket connection handled by useAiAssistant

  // typing indicator via hook

  return (
    <AppLayout>
      <main className="ai-assistant-container min-h-screen p-4 sm:p-6">
        <div className=" mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-secondary">
                  Super Admin AI Assistant
                </h1>
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  <Shield className="w-4 h-4" />
                  <span>Full System Access</span>
                </div>
              </div>
              <p className="text-gray-600">
                Complete platform control through natural language commands
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ✨ Type commands in plain English to manage users, courses,
                content, orders, and more
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      connectionStatus === "connected"
                        ? "bg-green-100 animate-pulse"
                        : connectionStatus === "connecting"
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    }`}
                  >
                    {connectionStatus === "connected" ? (
                      <Wifi className="text-green-600 w-5 h-5" />
                    ) : connectionStatus === "connecting" ? (
                      <Loader2 className="text-yellow-600 w-5 h-5 animate-spin" />
                    ) : (
                      <WifiOff className="text-red-600 w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary">
                      {connectionStatus === "connected"
                        ? "Connected"
                        : connectionStatus === "connecting"
                        ? "Connecting..."
                        : "Disconnected"}
                    </p>
                    <p className="text-xs text-accent flex items-center gap-1">
                      {aiStatus?.aiEnabled ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          AI Enabled
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-yellow-600" />
                          AI Disabled
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`${
                  showAnalytics
                    ? "bg-primary text-white"
                    : "bg-white text-secondary border border-gray-200"
                } px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center space-x-2`}
                aria-label="Toggle analytics"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setHistoryOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                aria-label="Open chat history"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="bg-white text-secondary px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Analytics Panel */}
          {showAnalytics && (
            <div className="mb-8 animate-in slide-in-from-top duration-300">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    AI Assistant Analytics
                  </h2>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {messages.length}
                    </p>
                    <p className="text-sm text-blue-700">Total Messages</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <History className="w-5 h-5 text-white" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {conversations.length}
                    </p>
                    <p className="text-sm text-green-700">Conversations</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Paperclip className="w-5 h-5 text-white" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      {attachments.length}
                    </p>
                    <p className="text-sm text-purple-700">Attachments</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <Activity className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-900">
                      {connectionStatus === "connected" ? "Online" : "Offline"}
                    </p>
                    <p className="text-sm text-orange-700">Status</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      AI Configuration
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">OpenAI:</span>
                        <span
                          className={`font-medium ${
                            aiStatus?.openAIEnabled
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {aiStatus?.openAIEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gemini:</span>
                        <span
                          className={`font-medium ${
                            aiStatus?.geminiEnabled
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {aiStatus?.geminiEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">WebSocket:</span>
                        <span
                          className={`font-medium ${
                            connectionStatus === "connected"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {connectionStatus === "connected"
                            ? "Connected"
                            : "Disconnected"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary" />
                      Session Info
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Messages:</span>
                        <span className="font-medium text-secondary">
                          {messages.filter((m) => m.from === "user").length}{" "}
                          sent
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Responses:</span>
                        <span className="font-medium text-secondary">
                          {messages.filter((m) => m.from === "ai").length}{" "}
                          received
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quick Replies:</span>
                        <span className="font-medium text-secondary">
                          {quickReplies.length} available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="order-2 lg:order-1 lg:col-span-1 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Super Admin Capabilities
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-secondary block">
                        User Management
                      </span>
                      <span className="text-xs text-gray-600">
                        Create, update, delete users
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <GraduationCap className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-secondary block">
                        Course Management
                      </span>
                      <span className="text-xs text-gray-600">
                        Full course CRUD operations
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <FileCode className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-secondary block">
                        Content Management
                      </span>
                      <span className="text-xs text-gray-600">
                        Blogs, pages, media
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-secondary block">
                        Order Management
                      </span>
                      <span className="text-xs text-gray-600">
                        View, process, refund
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                      <Database className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-secondary block">
                        Database Access
                      </span>
                      <span className="text-xs text-gray-600">
                        Read/write all data
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                    <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-white w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-secondary block">
                        Analytics & Reports
                      </span>
                      <span className="text-xs text-gray-600">
                        All system metrics
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-600" />
                  Admin Command Examples
                </h3>
                <div className="space-y-2">
                  <button
                    className="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all text-sm font-medium text-secondary border border-blue-200"
                    onClick={() =>
                      sendMessage("Show me all users registered today")
                    }
                  >
                    <Users className="w-4 h-4 mr-2 inline text-blue-600" />
                    <span className="block">
                      Show all users registered today
                    </span>
                    <span className="text-xs text-gray-600 block mt-1">
                      User data retrieval
                    </span>
                  </button>
                  <button
                    className="w-full text-left p-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all text-sm font-medium text-secondary border border-green-200"
                    onClick={() =>
                      sendMessage(
                        "Create a new course about React Development with price $99"
                      )
                    }
                  >
                    <GraduationCap className="w-4 h-4 mr-2 inline text-green-600" />
                    <span className="block">Create new course</span>
                    <span className="text-xs text-gray-600 block mt-1">
                      Course creation
                    </span>
                  </button>
                  <button
                    className="w-full text-left p-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all text-sm font-medium text-secondary border border-purple-200"
                    onClick={() =>
                      sendMessage("Write a blog post about aviation safety")
                    }
                  >
                    <FileCode className="w-4 h-4 mr-2 inline text-purple-600" />
                    <span className="block">Create blog post</span>
                    <span className="text-xs text-gray-600 block mt-1">
                      Content generation
                    </span>
                  </button>
                  <button
                    className="w-full text-left p-3 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg transition-all text-sm font-medium text-secondary border border-orange-200"
                    onClick={() =>
                      sendMessage("Show me all pending orders from this week")
                    }
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 inline text-orange-600" />
                    <span className="block">View pending orders</span>
                    <span className="text-xs text-gray-600 block mt-1">
                      Order management
                    </span>
                  </button>
                  <button
                    className="w-full text-left p-3 bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-lg transition-all text-sm font-medium text-secondary border border-pink-200"
                    onClick={() =>
                      sendMessage("Give me analytics for last month")
                    }
                  >
                    <BarChart3 className="w-4 h-4 mr-2 inline text-pink-600" />
                    <span className="block">Get analytics report</span>
                    <span className="text-xs text-gray-600 block mt-1">
                      Data analysis
                    </span>
                  </button>
                  <button
                    className="w-full text-left p-3 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-lg transition-all text-sm font-medium text-secondary border border-red-200"
                    onClick={() =>
                      sendMessage(
                        "Update course ID 123 and set status to published"
                      )
                    }
                  >
                    <Code className="w-4 h-4 mr-2 inline text-red-600" />
                    <span className="block">Update database records</span>
                    <span className="text-xs text-gray-600 block mt-1">
                      Direct modifications
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-secondary mb-4">
                  Recent Conversations
                </h3>
                <div className="space-y-3">
                  <div className="mb-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  {conversations
                    .filter((c) => {
                      if (!searchQuery) return true;
                      const lastMsg =
                        Array.isArray(c.messages) && c.messages.length
                          ? c.messages[c.messages.length - 1]
                          : null;
                      const title = lastMsg?.content || "Conversation";
                      return title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    })
                    .map((c) => {
                      const lastMsg =
                        Array.isArray(c.messages) && c.messages.length
                          ? c.messages[c.messages.length - 1]
                          : null;
                      const title = lastMsg?.content || "Conversation";

                      // Safely format date
                      let time = "";
                      if (c.lastActiveAt) {
                        const date = new Date(c.lastActiveAt);
                        if (!isNaN(date.getTime())) {
                          time = formatDistanceToNow(date, { addSuffix: true });
                        }
                      }
                      return (
                        <div key={c.sessionId} className="group relative">
                          <button
                            className="w-full text-left p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                            onClick={() => {
                              selectConversation(c.sessionId);
                            }}
                          >
                            <p className="text-sm font-medium text-secondary truncate">
                              {title.length > 50
                                ? `${title.substring(0, 50)}...`
                                : title}
                            </p>
                            <p className="text-xs text-gray-500">{time}</p>
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm("Delete this conversation?")) {
                                await deleteConversation(c.sessionId);
                                push({
                                  message: "Conversation deleted",
                                  type: "success",
                                });
                              }
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-opacity"
                            aria-label="Delete conversation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  {!conversations.length && (
                    <p className="text-xs text-gray-500">
                      No conversations yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chat History</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {conversations.map((c) => {
                    const lastMsg =
                      Array.isArray(c.messages) && c.messages.length
                        ? c.messages[c.messages.length - 1]
                        : null;
                    const title = lastMsg?.content || "Conversation";

                    // Safely format date
                    let time = "";
                    if (c.lastActiveAt) {
                      const date = new Date(c.lastActiveAt);
                      if (!isNaN(date.getTime())) {
                        time = formatDistanceToNow(date, { addSuffix: true });
                      }
                    }

                    return (
                      <button
                        key={c.sessionId}
                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors"
                        onClick={() => {
                          selectConversation(c.sessionId);
                          setHistoryOpen(false);
                        }}
                      >
                        <p className="text-sm font-medium text-secondary truncate">
                          {title}
                        </p>
                        <p className="text-xs text-gray-600">{time}</p>
                      </button>
                    );
                  })}
                  {!conversations.length && (
                    <p className="text-xs text-gray-500">
                      No conversations yet
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <div className="order-1 lg:order-2 lg:col-span-2">
              <div className="bg-card rounded-xl shadow-sm border border-gray-100 min-h-[60vh] md:h-[600px] flex flex-col">
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <Bot className="text-white w-6 h-6" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary">
                        Personal Wings AI Assistant
                      </h3>
                      <p className="text-sm text-gray-600">
                        Always learning, always helping
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  ref={containerRef}
                  className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50"
                >
                  {messages.length === 0 && !typing && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-full flex items-center justify-center mb-4 animate-pulse shadow-lg">
                        <Shield className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-secondary mb-2">
                        Welcome, Super Admin!
                      </h3>
                      <p className="text-gray-600 mb-3 max-w-2xl">
                        I'm your AI-powered admin assistant with{" "}
                        <span className="font-semibold text-purple-600">
                          full system access
                        </span>
                        . I can help you manage users, courses, content, orders,
                        and everything else on the platform.
                      </p>
                      <p className="text-sm text-gray-500 mb-6 max-w-2xl">
                        💡{" "}
                        <span className="font-medium">
                          Just type what you want to do in plain English!
                        </span>
                        <br />
                        Examples: "Show me all users", "Create a course",
                        "Update blog post", "Get analytics report"
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl w-full">
                        <button
                          onClick={() =>
                            sendMessage(
                              "Show me all users registered this month"
                            )
                          }
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium shadow-md"
                        >
                          <Users className="w-5 h-5 mx-auto mb-1" />
                          User Management
                        </button>
                        <button
                          onClick={() =>
                            sendMessage(
                              "Create a new course about Web Development"
                            )
                          }
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium shadow-md"
                        >
                          <GraduationCap className="w-5 h-5 mx-auto mb-1" />
                          Course Creation
                        </button>
                        <button
                          onClick={() =>
                            sendMessage(
                              "Give me analytics dashboard for this week"
                            )
                          }
                          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-sm font-medium shadow-md"
                        >
                          <BarChart3 className="w-5 h-5 mx-auto mb-1" />
                          Analytics Report
                        </button>
                      </div>
                    </div>
                  )}
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={
                        m.from === "ai"
                          ? "message-ai mb-6"
                          : "message-user mb-6"
                      }
                    >
                      {m.from === "ai" ? (
                        <div className="flex space-x-3">
                          <div className="shrink-0">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <Bot className="text-white w-4 h-4" />
                            </div>
                          </div>
                          <div className="max-w-[90%] sm:max-w-xl">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                              {renderMarkdown(m.content)}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(
                                        m.content
                                      );
                                      push({
                                        message: "Response copied",
                                        type: "success",
                                      });
                                    } catch {
                                      push({
                                        message: "Copy failed",
                                        type: "error",
                                      });
                                    }
                                  }}
                                >
                                  Copy
                                </button>
                                <button
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
                                  onClick={() => saveToNotes(m.content)}
                                >
                                  Save to Notes
                                </button>
                                <button
                                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1"
                                  onClick={() => {
                                    setRatingValue(5);
                                    setRatingOpen(true);
                                  }}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  Like
                                </button>
                                <button
                                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 flex items-center gap-1"
                                  onClick={() => {
                                    setRatingValue(1);
                                    setRatingOpen(true);
                                  }}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                  Dislike
                                </button>
                                {idx === messages.length - 1 &&
                                  m.from === "ai" && (
                                    <button
                                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1"
                                      onClick={regenerateLastResponse}
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      Regenerate
                                    </button>
                                  )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {m.timestamp}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex space-x-3 justify-end">
                          <div className="max-w-[90%] sm:max-w-md">
                            <div className="bg-primary text-white rounded-lg p-4">
                              {m.content}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">
                              {m.timestamp}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                              <User className="text-white w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {typing && (
                    <div className="message-ai mb-6">
                      <div className="flex space-x-3">
                        <div className="shrink-0">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Bot className="text-white w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="typing-indicator">
                              <span className="typing-dot" />
                              <span className="typing-dot" />
                              <span className="typing-dot" />
                            </div>
                            {canStopGeneration && (
                              <button
                                onClick={stopGeneration}
                                className="mt-2 text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                Stop generating
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 p-3 sm:p-4 bg-white">
                  {/* Quick Replies */}
                  {quickReplies.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2 font-medium">
                        Quick Replies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((s) => (
                          <button
                            key={s}
                            className="suggestion-chip bg-gradient-to-r from-primary/10 to-accent/10 text-secondary px-3 py-2 rounded-full text-xs sm:text-sm hover:from-primary/20 hover:to-accent/20 border border-primary/20 transition-all"
                            onClick={() => sendMessage(s)}
                            aria-label={`Send quick reply ${s}`}
                          >
                            <Lightbulb className="w-3 h-3 inline mr-1" />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Attachments */}
                  {attachments.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        Attachments ({attachments.length}):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachments.map((a) => (
                          <div
                            key={a.name}
                            className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                          >
                            <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              {getFileIcon(a.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-secondary truncate">
                                {a.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(a.size)}
                                {typeof a.progress === "number" &&
                                  !a.uploaded && (
                                    <span className="ml-2 text-primary">
                                      • {a.progress}% uploading...
                                    </span>
                                  )}
                                {a.uploaded && (
                                  <span className="ml-2 text-green-600">
                                    • Uploaded
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              aria-label={`Remove ${a.name}`}
                              onClick={() => removeAttachment(a.name)}
                              className="shrink-0 text-gray-400 hover:text-red-600 transition-colors p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 p-3 sm:p-4 bg-white rounded-b-xl">
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          emitUserTyping(true);
                          if (typingTimeoutRef.current) {
                            clearTimeout(typingTimeoutRef.current);
                          }
                          typingTimeoutRef.current = window.setTimeout(() => {
                            emitUserTyping(false);
                            typingTimeoutRef.current = null;
                          }, 1000);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") sendMessage();
                        }}
                        placeholder={
                          listening
                            ? "Listening... Speak now"
                            : "Ask a professional question..."
                        }
                        className="w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm sm:text-base"
                      />
                      <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex space-x-2">
                        <button
                          aria-label="Attach files"
                          className="text-gray-400 hover:text-primary transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          className={`transition-colors ${
                            listening
                              ? "text-red-500 hover:text-red-600"
                              : "text-gray-400 hover:text-primary"
                          }`}
                          onClick={() => setListening((v) => !v)}
                          aria-label={listening ? "Stop voice" : "Start voice"}
                        >
                          {listening ? (
                            <Square className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          e.target.files && addAttachments(e.target.files)
                        }
                        aria-hidden
                      />
                    </div>
                    <button
                      onClick={() => sendMessage()}
                      disabled={!canSend || sending || typing}
                      className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      aria-label="Send message"
                    >
                      {sending || typing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                  {(error || localError) && (
                    <div
                      className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error || localError}</span>
                      <button
                        onClick={() => setLocalError(undefined)}
                        className="ml-auto text-red-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {connectionStatus === "disconnected" && (
                    <div
                      className="mt-2 flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-2"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        Connection lost. Messages will be sent via REST API.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="order-3 lg:order-3 lg:col-span-1 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Quick Admin Tasks
                </h3>
                <div className="space-y-3">
                  <div
                    className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all"
                    onClick={() =>
                      sendMessage(
                        "Show me all active users and their last login"
                      )
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-medium text-secondary">
                        User Activity Report
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">
                      View all active users with last login
                    </p>
                  </div>
                  <div
                    className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all"
                    onClick={() =>
                      sendMessage("Show me revenue report for last 30 days")
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-secondary">
                        Revenue Analytics
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">
                      30-day revenue and sales data
                    </p>
                  </div>
                  <div
                    className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 cursor-pointer hover:from-purple-100 hover:to-purple-200 transition-all"
                    onClick={() =>
                      sendMessage(
                        "Show me all published courses with enrollment count"
                      )
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <p className="text-sm font-medium text-secondary">
                        Course Performance
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">
                      All courses with enrollment stats
                    </p>
                  </div>
                  <div
                    className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 cursor-pointer hover:from-orange-100 hover:to-orange-200 transition-all"
                    onClick={() =>
                      sendMessage("Show me system status and database health")
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-orange-600" />
                      <p className="text-sm font-medium text-secondary">
                        System Health Check
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">
                      Platform status and metrics
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-purple-600" />
                  Voice Commands
                </h3>
                <div className="text-center">
                  <button
                    className="pulse-glow w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                    onClick={() => {
                      setListening((v) => !v);
                    }}
                  >
                    {listening ? (
                      <Square className="text-white w-6 h-6" />
                    ) : (
                      <Mic className="text-white w-6 h-6" />
                    )}
                  </button>
                  <p className="text-sm font-medium text-secondary">
                    Speak admin commands
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Say things like: "Show me all users" or "Create a course
                    about AI"
                  </p>
                </div>
              </div>

              {/* Admin Info Panel */}
              <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 rounded-xl p-6 shadow-sm border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary mb-2">
                      Full Access Granted
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      As a super admin, this AI can:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        Read all database records
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        Create & modify content
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        Manage users & permissions
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        Process orders & payments
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        Generate reports & analytics
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate this conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className={`w-10 h-10 rounded-lg ${
                      star <= ratingValue
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-100 text-gray-400"
                    } hover:bg-yellow-300 transition-colors`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Feedback (optional)
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you think..."
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                onClick={async () => {
                  const success = await rateConversation(
                    ratingValue,
                    feedbackText
                  );
                  if (success) {
                    push({
                      message: "Thank you for your feedback!",
                      type: "success",
                    });
                    setRatingOpen(false);
                    setRatingValue(0);
                    setFeedbackText("");
                  } else {
                    push({ message: "Failed to submit rating", type: "error" });
                  }
                }}
              >
                Submit
              </button>
              <button
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setRatingOpen(false);
                  setRatingValue(0);
                  setFeedbackText("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to Human Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Would you like to connect with a human agent? They can provide
              more personalized assistance.
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason (optional)
              </label>
              <select
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="user_request">I prefer human assistance</option>
                <option value="complex_issue">Complex issue</option>
                <option value="bot_not_helpful">Bot wasn't helpful</option>
                <option value="technical_problem">Technical problem</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                onClick={async () => {
                  const success = await escalateToHuman(
                    feedbackText || "user_request"
                  );
                  if (success) {
                    push({
                      message: "Escalated to human agent",
                      type: "success",
                    });
                    setEscalateOpen(false);
                    setFeedbackText("");
                  } else {
                    push({ message: "Failed to escalate", type: "error" });
                  }
                }}
              >
                <UserPlus className="w-4 h-4" />
                Escalate Now
              </button>
              <button
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setEscalateOpen(false);
                  setFeedbackText("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent aria-describedby="chat-settings">
          <DialogHeader>
            <DialogTitle>Chat Settings</DialogTitle>
          </DialogHeader>
          <div id="chat-settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="showTimestamps" className="text-sm">
                Show timestamps
              </label>
              <input
                id="showTimestamps"
                type="checkbox"
                checked={preferences.showTimestamps}
                onChange={(e) =>
                  updatePreferences({ showTimestamps: e.target.checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="compactMode" className="text-sm">
                Compact mode
              </label>
              <input
                id="compactMode"
                type="checkbox"
                checked={preferences.compactMode}
                onChange={(e) =>
                  updatePreferences({ compactMode: e.target.checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="retainDays" className="text-sm">
                Retention (days)
              </label>
              <input
                id="retainDays"
                type="number"
                min={1}
                max={365}
                value={preferences.retainDays}
                onChange={(e) =>
                  updatePreferences({
                    retainDays: parseInt(e.target.value || "30", 10),
                  })
                }
                className="w-20 border rounded px-2 py-1"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                className="px-3 py-2 border rounded"
                onClick={() => clearCurrentMessages()}
              >
                Clear messages
              </button>
              <button
                className="px-3 py-2 border rounded bg-primary text-white"
                onClick={() => {
                  newConversation();
                  setSettingsOpen(false);
                }}
              >
                New conversation
              </button>
              <button
                className="px-3 py-2 border rounded flex items-center gap-2"
                onClick={() => {
                  setEscalateOpen(true);
                  setSettingsOpen(false);
                }}
              >
                <UserPlus className="w-4 h-4" />
                Escalate to Human
              </button>
              <button
                className="px-3 py-2 border rounded"
                onClick={exportTranscriptCSV}
              >
                Export CSV
              </button>
              <button
                className="px-3 py-2 border rounded"
                onClick={exportTranscriptHTML}
              >
                Export PDF
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <style jsx>{`
        ::-webkit-scrollbar {
          display: none;
        }
        .ai-assistant-container {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .message-user {
          animation: slideInRight 0.3s ease-out;
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .message-ai {
          animation: slideInLeft 0.3s ease-out;
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .typing-indicator {
          display: inline-flex;
          align-items: center;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #9ca3af;
          margin: 0 2px;
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes typing {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .suggestion-chip {
          transition: all 0.2s ease;
        }
        .suggestion-chip:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }
        .feature-card {
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
        }
        .pulse-glow {
          animation: pulseGlow 2s infinite;
        }
        @keyframes pulseGlow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
          }
        }
      `}</style>
    </AppLayout>
  );
}

function SearchIcon(props: React.ComponentProps<typeof Lightbulb>) {
  return <Lightbulb {...props} />;
}

function BarChart2(props: React.ComponentProps<typeof LineChart>) {
  return <LineChart {...props} />;
}

function Square(props: React.ComponentProps<typeof Shield>) {
  return <Shield {...props} />;
}
