"use client";

import * as React from "react";
import AppLayout from "@/components/layout/AppLayout";
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
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAiAssistant } from "@/hooks/useAiAssistant";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "lucide-react";

export default function AIAssistantPage() {
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

  const typingTimeoutRef = React.useRef<number | null>(null);
  const canSend = (input || "").trim().length > 0;
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [ratingOpen, setRatingOpen] = React.useState(false);
  const [escalateOpen, setEscalateOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [ratingValue, setRatingValue] = React.useState(0);
  const [feedbackText, setFeedbackText] = React.useState("");
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

  // socket connection handled by useAiAssistant

  // typing indicator via hook

  return (
    <AppLayout>
      <main className="ai-assistant-container min-h-screen p-4 sm:p-6">
        <div className=" mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-secondary mb-2">
                Personal Wings AI Assistant
              </h1>
              <p className="text-gray-600">Professional support and guidance</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      connectionStatus === "connected"
                        ? "bg-green-100"
                        : connectionStatus === "connecting"
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    }`}
                  >
                    {connectionStatus === "connected" ? (
                      <Wifi className="text-green-600 w-5 h-5" />
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
                    <p className="text-xs text-accent">
                      {aiStatus?.aiEnabled ? "AI Enabled" : "AI Disabled"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setHistoryOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                aria-label="Open chat history"
              >
                <History className="w-4 h-4" />
                <span>Chat History</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="order-2 lg:order-1 lg:col-span-1 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-secondary mb-4">
                  AI Capabilities
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Book className="text-white w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-secondary">
                      Course Guidance
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-accent/5 rounded-lg">
                    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                      <Plane className="text-white w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-secondary">
                      Aircraft Knowledge
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-100 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <LineChart className="text-white w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-secondary">
                      Progress Analysis
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-100 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <HelpCircle className="text-white w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-secondary">
                      Technical Support
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-secondary mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    className="w-full text-left p-3 bg-gray-50 hover:bg-primary/5 rounded-lg transition-colors text-sm font-medium text-secondary"
                    onClick={() => sendMessage("Explain Training Module")}
                  >
                    <Bot className="w-4 h-4 mr-2 inline text-primary" />
                    Explain Training Module
                  </button>
                  <button
                    className="w-full text-left p-3 bg-gray-50 hover:bg-primary/5 rounded-lg transition-colors text-sm font-medium text-secondary"
                    onClick={() => sendMessage("Find Aircraft Specifications")}
                  >
                    <SearchIcon className="w-4 h-4 mr-2 inline text-primary" />
                    Find Aircraft Specifications
                  </button>
                  <button
                    className="w-full text-left p-3 bg-gray-50 hover:bg-primary/5 rounded-lg transition-colors text-sm font-medium text-secondary"
                    onClick={() => sendMessage("Analyze Progress Report")}
                  >
                    <BarChart2 className="w-4 h-4 mr-2 inline text-primary" />
                    Analyze Progress Report
                  </button>
                  <button
                    className="w-full text-left p-3 bg-gray-50 hover:bg-primary/5 rounded-lg transition-colors text-sm font-medium text-secondary"
                    onClick={() => sendMessage("Platform Help")}
                  >
                    <Settings className="w-4 h-4 mr-2 inline text-primary" />
                    Platform Help
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
                      const time = c.lastActiveAt
                        ? formatDistanceToNow(new Date(c.lastActiveAt), {
                            addSuffix: true,
                          })
                        : "";
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
                    const time = c.lastActiveAt
                      ? formatDistanceToNow(new Date(c.lastActiveAt), {
                          addSuffix: true,
                        })
                      : "";
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
                  <div className="flex flex-wrap gap-2">
                    {(quickReplies.length ? quickReplies : []).map((s) => (
                      <button
                        key={s}
                        className="suggestion-chip bg-gray-100 text-secondary px-3 py-2 rounded-full text-xs sm:text-sm hover:bg-gray-200"
                        onClick={() => sendMessage(s)}
                        aria-label={`Send quick reply ${s}`}
                      >
                        {s}
                      </button>
                    ))}
                    {attachments.map((a) => (
                      <span
                        key={a.name}
                        className="inline-flex items-center gap-2 bg-gray-100 text-secondary px-3 py-2 rounded-full text-xs"
                      >
                        {a.name}{" "}
                        {typeof a.progress === "number" && !a.uploaded
                          ? `${a.progress}%`
                          : ""}
                        <button
                          aria-label={`Remove ${a.name}`}
                          onClick={() => removeAttachment(a.name)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
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
                      disabled={!canSend || sending}
                      className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-red-600 mt-2" role="alert">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="order-3 lg:order-3 lg:col-span-1 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-secondary mb-4">
                  Learning Resources
                </h3>
                <div className="space-y-3">
                  <div
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() =>
                      sendMessage("Show me aviation regulations guide")
                    }
                  >
                    <p className="text-sm font-medium text-secondary">
                      Aviation Regulations Guide
                    </p>
                    <p className="text-xs text-gray-600">
                      FAA & EASA compliance
                    </p>
                  </div>
                  <div
                    className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => sendMessage("Open training manuals")}
                  >
                    <p className="text-sm font-medium text-secondary">
                      Training Manuals
                    </p>
                    <p className="text-xs text-gray-600">
                      Complete course materials
                    </p>
                  </div>
                  <div
                    className="p-3 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => sendMessage("Browse aircraft database")}
                  >
                    <p className="text-sm font-medium text-secondary">
                      Aircraft Databases
                    </p>
                    <p className="text-xs text-gray-600">
                      Specifications & manuals
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-secondary mb-4">
                  Voice Control
                </h3>
                <div className="text-center">
                  <button
                    className="pulse-glow w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3"
                    onClick={() => {
                      setListening((v) => {
                        const next = !v;
                        if (next) {
                          setTimeout(() => {
                            const voiceText =
                              "What are the requirements for commercial pilot training?";
                            setInput(voiceText);
                            sendMessage(voiceText);
                            setListening(false);
                          }, 3000);
                        }
                        return next;
                      });
                    }}
                  >
                    {listening ? (
                      <Square className="text-white w-6 h-6" />
                    ) : (
                      <Mic className="text-white w-6 h-6" />
                    )}
                  </button>
                  <p className="text-sm text-gray-600">
                    Click to speak with AI Assistant
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports natural language queries
                  </p>
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
