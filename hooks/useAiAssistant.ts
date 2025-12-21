"use client";

import * as React from "react";
import type {
  BotConversationDoc,
  BotMessageResponse,
} from "@/services/ai-bot.service";
import { aiBotService } from "@/services/ai-bot.service";
import { uploadService, type UploadResult } from "@/services/upload.service";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import type { Socket } from "socket.io-client";

export function useAiAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<
    Array<{ from: "ai" | "user"; content: string; timestamp?: string }>
  >([]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const [quickReplies, setQuickReplies] = React.useState<string[]>([]);
  const [conversations, setConversations] = React.useState<
    BotConversationDoc[]
  >([]);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [attachments, setAttachments] = React.useState<Array<{
    id?: string;
    file?: File;
    name: string;
    type?: string;
    size?: number;
    url?: string;
    progress?: number;
    uploaded?: boolean;
  }>>([]);
  const [preferences, setPreferences] = React.useState<{
    showTimestamps: boolean;
    compactMode: boolean;
    retainDays: number;
  }>({ showTimestamps: true, compactMode: false, retainDays: 30 });
  const [connectionStatus, setConnectionStatus] = React.useState<"connected" | "disconnected" | "connecting">("connecting");
  const [aiStatus, setAiStatus] = React.useState<{
    status: string;
    aiEnabled: boolean;
    openAIEnabled: boolean;
    geminiEnabled: boolean;
  } | null>(null);
  const [canStopGeneration, setCanStopGeneration] = React.useState(false);
  const sessionIdRef = React.useRef<string>("");
  const socketRef = React.useRef<Socket | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollToBottom = React.useCallback(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  React.useEffect(() => {
    sessionIdRef.current = globalThis.crypto?.randomUUID?.() || `${Date.now()}`;
    void loadRecentConversations();
    void loadSessionHistory();
    try {
      const raw = localStorage.getItem("aiAssistantPrefs");
      if (raw) setPreferences(JSON.parse(raw));
    } catch { }
  }, []);

  React.useEffect(() => {
    if (!user?.id) return;
    const socket = aiBotService.connect(user.id, sessionIdRef.current);
    socketRef.current = socket;
    
    socket.on("connect", () => {
      setConnectionStatus("connected");
    });
    
    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });
    
    socket.on("connect_error", () => {
      setConnectionStatus("disconnected");
    });
    
    socket.on("bot-typing", ({ isTyping }) => {
      setTyping(!!isTyping);
      setCanStopGeneration(!!isTyping);
    });
    
    socket.on("bot-message", (resp: BotMessageResponse) => {
      const reply = resp?.message || "";
      const qr = Array.isArray(resp?.quickReplies) ? resp.quickReplies : [];
      if (resp?.sessionId) sessionIdRef.current = resp.sessionId;
      setMessages((prev) => [
        ...prev,
        { from: "ai", content: reply, timestamp: "Personal Wings AI • Just now" },
      ]);
      if (qr.length) setQuickReplies(qr);
      setCanStopGeneration(false);
      setTyping(false);
      void loadRecentConversations();
    });
    
    socket.on("generation-stopped", () => {
      setTyping(false);
      setCanStopGeneration(false);
    });
    
    socket.on("error", (error: any) => {
      setError(error.message || "Connection error occurred");
      setTyping(false);
      setCanStopGeneration(false);
    });
    
    void loadAiStatus();
    
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);
  
  async function loadAiStatus() {
    try {
      const { data } = await aiBotService.getStatus();
      setAiStatus(data);
    } catch {
      setAiStatus(null);
    }
  }

  async function loadSessionHistory() {
    try {
      const { data } = await aiBotService.getHistory(sessionIdRef.current);
      const conversation = Array.isArray(data) ? data[0] : null;
      if (conversation && Array.isArray(conversation.messages)) {
        const mapped: Array<{
          from: "ai" | "user";
          content: string;
          timestamp?: string;
        }> = conversation.messages.map((m) => ({
          from: (m.role === "bot" ? "ai" : "user") as "ai" | "user",
          content: m.content,
          timestamp: m.timestamp
            ? formatDistanceToNow(new Date(m.timestamp), { addSuffix: true })
            : undefined,
        }));
        setMessages(mapped);
      }
    } catch { }
  }

  async function loadRecentConversations() {
    try {
      const { data } = await aiBotService.getHistory();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      setConversations([]);
    }
  }

  async function selectConversation(id: string) {
    sessionIdRef.current = id;
    await loadSessionHistory();
  }

  function updatePreferences(next: Partial<typeof preferences>) {
    setPreferences((prev) => {
      const merged = { ...prev, ...next };
      try { localStorage.setItem("aiAssistantPrefs", JSON.stringify(merged)); } catch { }
      return merged;
    });
  }

  async function addAttachments(files: FileList | File[]) {
    const list: File[] = files instanceof FileList ? Array.from(files) : (files as File[]);
    const newItems = list.map((f) => ({ name: f.name, type: f.type, size: f.size, file: f, progress: 0, uploaded: false }));
    setAttachments((prev) => [...prev, ...newItems]);
    for (const f of list) {
      try {
        const res: UploadResult = await uploadService.uploadFile(f, {
          type: "auto",
          onProgress: (p) => {
            setAttachments((prev) => prev.map((a) => a.file === f ? { ...a, progress: p.percentage } : a));
          },
        });
        setAttachments((prev) => prev.map((a) => a.file === f ? { ...a, id: res.id, url: res.url, uploaded: true } : a));
      } catch {
        setAttachments((prev) => prev.filter((a) => a.file !== f));
        setError("Attachment upload failed");
      }
    }
  }

  function removeAttachment(name: string) {
    setAttachments((prev) => prev.filter((a) => a.name !== name));
  }

  function clearAttachments() { setAttachments([]); }

  function newConversation() {
    sessionIdRef.current = globalThis.crypto?.randomUUID?.() || `${Date.now()}`;
    setMessages([]);
    setQuickReplies([]);
  }

  function clearCurrentMessages() { setMessages([]); }
  
  async function rateConversation(rating: number, feedback?: string) {
    try {
      await aiBotService.rateConversation(sessionIdRef.current, rating, feedback);
      await loadRecentConversations();
      return true;
    } catch {
      return false;
    }
  }
  
  async function escalateToHuman(reason?: string) {
    try {
      await aiBotService.escalateToHuman(sessionIdRef.current, reason);
      await loadRecentConversations();
      return true;
    } catch {
      return false;
    }
  }
  
  async function deleteConversation(sessionId: string) {
    try {
      await aiBotService.deleteConversation(sessionId);
      if (sessionId === sessionIdRef.current) {
        newConversation();
      }
      await loadRecentConversations();
      return true;
    } catch {
      return false;
    }
  }
  
  function stopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setTyping(false);
    setCanStopGeneration(false);
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("stop-generation", { sessionId: sessionIdRef.current });
    }
  }
  
  async function regenerateLastResponse() {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find(m => m.from === "user");
    if (!lastUserMessage) return;
    
    // Remove last AI response
    setMessages(prev => {
      const newMessages = [...prev];
      const lastAiIndex = newMessages.map((m, i) => ({ m, i })).reverse().find(({ m }) => m.from === "ai")?.i;
      if (lastAiIndex !== undefined) {
        newMessages.splice(lastAiIndex, 1);
      }
      return newMessages;
    });
    
    // Resend the last user message
    await sendMessage(lastUserMessage.content);
  }

  async function sendMessage(content?: string) {
    const text = (content ?? input).trim();
    if (!text) return;
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setMessages((prev) => [
      ...prev,
      { from: "user", content: text, timestamp: "You • Just now" },
    ]);
    setInput("");
    setTyping(true);
    setSending(true);
    setError(undefined);
    setCanStopGeneration(true);
    
    try {
      const socket = socketRef.current;
      const context = attachments.length ? { attachments: attachments.filter((a) => a.uploaded && a.url).map((a) => ({ id: a.id, url: a.url, name: a.name, type: a.type, size: a.size })) } : undefined;
      
      if (socket && socket.connected) {
        socket.emit("message", { message: text, sessionId: sessionIdRef.current, context });
      } else {
        // Fallback to REST API
        const { data } = await aiBotService.sendMessageRest(text, sessionIdRef.current, context);
        const reply = data?.message || "";
        const qr = Array.isArray(data?.quickReplies) ? data.quickReplies : [];
        if (data?.sessionId) sessionIdRef.current = data.sessionId;
        setMessages((prev) => [
          ...prev,
          { from: "ai", content: reply, timestamp: "Personal Wings AI • Just now" },
        ]);
        if (qr.length) setQuickReplies(qr);
        await loadRecentConversations();
        setTyping(false);
        setCanStopGeneration(false);
      }
      clearAttachments();
    } catch (err: any) {
      // Check if request was aborted
      if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        setTyping(false);
        setCanStopGeneration(false);
        return;
      }
      
      setError("Failed to send message. Please try again.");
      setMessages((prev) => [
        ...prev,
        { from: "ai", content: "Sorry, something went wrong. Please try again or escalate to a human agent.", timestamp: "Personal Wings AI • Just now" },
      ]);
      setTyping(false);
      setCanStopGeneration(false);
    } finally {
      setSending(false);
      abortControllerRef.current = null;
    }
  }

  function emitUserTyping(isTyping: boolean) {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("typing", { sessionId: sessionIdRef.current, isTyping });
    }
  }

  return {
    // state
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
    // setters
    setInput,
    setListening,
    setHistoryOpen,
    updatePreferences,
    // actions
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
  };
}
