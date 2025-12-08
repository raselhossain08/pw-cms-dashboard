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
  } = useAiAssistant();

  const typingTimeoutRef = React.useRef<number | null>(null);
  const canSend = (input || "").trim().length > 0;
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  function renderMarkdown(text: string) {
    const parts = text.split(/```([\s\S]*?)```/g);
    const nodes: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i++) {
      const chunk = parts[i];
      if (i % 2 === 1) {
        nodes.push(
          <pre
            key={`code-${i}`}
            className="bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto text-xs"
          >
            <code>{chunk}</code>
          </pre>
        );
      } else {
        const segments = chunk
          .split(/(https?:\/\/[^\s)]+)|(\*\*[^*]+\*\*)|(_[^_]+_)/g)
          .filter(Boolean);
        nodes.push(
          <span key={`txt-${i}`}>
            {segments.map((seg, idx) => {
              if (/^https?:\/\//.test(seg)) {
                return (
                  <a
                    key={idx}
                    href={seg}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {seg}
                  </a>
                );
              }
              if (/^\*\*.*\*\*$/.test(seg)) {
                return (
                  <strong key={idx}>{seg.replace(/^\*\*|\*\*$/g, "")}</strong>
                );
              }
              if (/^_.*_$/.test(seg)) {
                return <em key={idx}>{seg.replace(/^_|_$/g, "")}</em>;
              }
              return <span key={idx}>{seg}</span>;
            })}
          </span>
        );
      }
    }
    return <div className="space-y-3">{nodes}</div>;
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
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary">
                      AI Status
                    </p>
                    <p className="text-xs text-accent">Online & Ready</p>
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
                        className="w-full text-left p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => {
                          selectConversation(c.sessionId);
                        }}
                      >
                        <p className="text-sm font-medium text-secondary truncate">
                          {title}
                        </p>
                        <p className="text-xs text-gray-500">{time}</p>
                      </button>
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
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
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
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <Bot className="text-white w-4 h-4" />
                            </div>
                          </div>
                          <div className="max-w-[90%] sm:max-w-xl">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                              {renderMarkdown(m.content)}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
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
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                  onClick={() => saveToNotes(m.content)}
                                >
                                  Save to Notes
                                </button>
                                <button
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                  onClick={exportTranscriptCSV}
                                >
                                  Export CSV
                                </button>
                                <button
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                  onClick={exportTranscriptHTML}
                                >
                                  Export PDF
                                </button>
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
                          <div className="flex-shrink-0">
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
                        <div className="flex-shrink-0">
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
                          className="text-gray-400 hover:text-primary transition-colors"
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
