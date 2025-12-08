"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  EllipsisVertical,
  Send,
  Paperclip,
  Image as ImageIcon,
  Code,
  Phone,
  Video,
  Info,
  Download,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  chatService,
  type ChatConversation,
  type ChatMessage,
} from "@/services/chat.service";
import type { Socket } from "socket.io-client";
import { getProfile } from "@/services/auth.service";

type Message = {
  id: string;
  sender: "me" | "other";
  content: string;
  time: string;
  type?: "text" | "code";
  codeLanguage?: string;
};

type Conversation = {
  id: string;
  name: string;
  topic: string;
  avatarUrl: string;
  online: boolean;
  lastMessage: string;
  lastTime: string;
  unread?: number;
  messages: Message[];
};

type Participant =
  | { _id: string; firstName?: string; lastName?: string; avatar?: string }
  | string;
function participantId(p: Participant) {
  return typeof p === "string" ? p : p._id;
}
function toUiConversation(c: ChatConversation, selfId: string): Conversation {
  const participants: Participant[] = Array.isArray(c.participants)
    ? (c.participants as Participant[])
    : [];
  const other = participants.find((p) => participantId(p) !== selfId);
  const name = other
    ? `${typeof other === "string" ? "" : other.firstName || ""} ${
        typeof other === "string" ? "" : other.lastName || ""
      }`.trim() || "Unknown"
    : c.title || "Conversation";
  const avatarUrl =
    typeof other === "string"
      ? "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
      : other?.avatar ||
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg";
  const lastMsg =
    typeof c.lastMessage === "object"
      ? (c.lastMessage as ChatMessage)
      : undefined;
  const lastMessage = lastMsg?.content || "";
  const lastTime = new Date(c.createdAt || Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    id: c._id,
    name,
    topic: c.title || "",
    avatarUrl,
    online: true,
    lastMessage,
    lastTime,
    unread: c.unreadCount || 0,
    messages: [],
  };
}

export default function LiveChat() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [messageInput, setMessageInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [filterTab, setFilterTab] = React.useState<"all" | "unread">("all");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const socketRef = React.useRef<Socket | null>(null);
  const selfIdRef = React.useRef<string>("");

  const selected = conversations.find((c) => c.id === selectedId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [selected?.messages, isTyping]);

  React.useEffect(() => {
    let mounted = true;
    async function init() {
      const profile = await getProfile();
      if (!profile.success || !profile.data) return;
      const me = profile.data;
      selfIdRef.current = me.id;
      const socket = chatService.connect();
      socketRef.current = socket;

      socket.on(
        "conversations_list",
        (payload: { conversations: ChatConversation[]; total: number }) => {
          if (!mounted) return;
          const list = (payload?.conversations || []).map((c) =>
            toUiConversation(c, selfIdRef.current)
          );
          setConversations(list);
          if (list.length && !selectedId) setSelectedId(list[0].id);
        }
      );

      socket.on("new_conversation", (c: ChatConversation) => {
        setConversations((prev) => [
          toUiConversation(c, selfIdRef.current),
          ...prev,
        ]);
      });

      socket.on(
        "conversation_updated",
        (data: { conversationId: string; lastMessage: ChatMessage }) => {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === data.conversationId
                ? {
                    ...c,
                    lastMessage: data.lastMessage.content,
                    lastTime: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  }
                : c
            )
          );
        }
      );

      socket.on("new_message", (msg: ChatMessage) => {
        setConversations((prev) =>
          prev.map((c) => {
            const convId =
              typeof msg.conversation === "string"
                ? msg.conversation
                : (msg.conversation as { _id: string })._id;
            if (c.id !== convId) return c;
            const m: Message = {
              id: msg._id,
              sender:
                (typeof msg.sender === "object"
                  ? (msg.sender as { _id: string })._id
                  : msg.sender) === selfIdRef.current
                  ? "me"
                  : "other",
              content: msg.content,
              time: new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              ),
            };
            return {
              ...c,
              messages: [...c.messages, m],
              lastMessage: msg.content,
              lastTime: m.time,
            };
          })
        );
      });

      socket.on(
        "user_typing",
        (data: { conversationId: string; typing: boolean }) => {
          if (data.conversationId === selectedId) setIsTyping(!!data.typing);
        }
      );

      socket.on("disconnect", () => {
        socketRef.current = null;
      });
    }
    void init();
    return () => {
      mounted = false;
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [selectedId]);

  React.useEffect(() => {
    async function loadMessages() {
      const socket = socketRef.current;
      if (!socket || !selectedId) return;
      const resp = await chatService.joinConversation(socket, selectedId);
      if (resp.success && resp.messages) {
        const msgs: Message[] = resp.messages.map((msg) => ({
          id: msg._id,
          sender:
            (typeof msg.sender === "object"
              ? (msg.sender as { _id: string })._id
              : msg.sender) === selfIdRef.current
              ? "me"
              : "other",
          content: msg.content,
          time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedId ? { ...c, messages: msgs } : c))
        );
      }
    }
    void loadMessages();
  }, [selectedId]);

  const filteredConversations = conversations.filter((c) => {
    if (filterTab === "unread") return c.unread && c.unread > 0;
    return true;
  });

  const sendMessage = async () => {
    const text = messageInput.trim();
    if (!text || !selected || !socketRef.current) return;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const optimisticMsg: Message = {
      id: Math.random().toString(36).slice(2),
      sender: "me",
      content: text,
      time: now,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              messages: [...c.messages, optimisticMsg],
              lastMessage: text,
              lastTime: "Just now",
            }
          : c
      )
    );
    setMessageInput("");
    void chatService.sendMessageSocket(
      socketRef.current,
      selected.id,
      text,
      "text"
    );
  };

  return (
    <main className="p-6 h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-secondary mb-2">
              Live Chat
            </h2>
            <p className="text-gray-600">
              Communicate with students and instructors in real-time
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-gray-300">
              <Download className="w-4 h-4 mr-2" />
              Export Chat
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div
        className="bg-card rounded-xl shadow-sm border border-gray-100 flex overflow-hidden"
        style={{ height: "calc(100% - 120px)" }}
      >
        {/* Chat Sidebar */}
        <div className="w-80 bg-white flex flex-col border-r border-gray-200">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-secondary">Conversations</h3>
              <button className="p-1 text-gray-400 hover:text-primary">
                <EllipsisVertical className="w-5 h-5" />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterTab("all")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  filterTab === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab("unread")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  filterTab === "unread"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedId === c.id
                    ? "bg-indigo-50 border-r-3 border-r-primary"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={c.avatarUrl}
                      alt={c.name}
                      className="w-12 h-12 rounded-full"
                    />
                    {c.online && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-secondary truncate">
                        {c.name}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {c.lastTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {c.lastMessage}
                      </p>
                      {c.unread && c.unread > 0 && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{c.topic}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <h4 className="font-medium text-secondary mb-3">Online Now</h4>
            <div className="text-xs text-gray-500">Connected</div>
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col">
          {selected && (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={selected.avatarUrl}
                      alt={selected.name}
                      className="w-10 h-10 rounded-full"
                    />
                    {selected.online && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">
                      {selected.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">
                        {selected.topic}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-green-600">
                        {selected.online ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-primary">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {/* Date Divider */}
                <div className="flex items-center justify-center my-6">
                  <div className="bg-white px-3 py-1 rounded-full border border-gray-200">
                    <span className="text-xs text-gray-500">Today</span>
                  </div>
                </div>

                {/* Messages */}
                {selected.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex space-x-2 mb-4 ${
                      m.sender === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.sender === "other" && (
                      <img
                        src={selected.avatarUrl}
                        alt={selected.name}
                        className="w-8 h-8 rounded-full shrink-0"
                      />
                    )}
                    <div
                      className={`max-w-[70%] p-3 ${
                        m.sender === "me"
                          ? "bg-primary text-white rounded-[18px] rounded-br-lg"
                          : "bg-gray-200 text-gray-800 rounded-[18px] rounded-bl-lg"
                      }`}
                    >
                      {m.type === "code" ? (
                        <div
                          className={`${
                            m.sender === "me"
                              ? "bg-blue-900 text-white"
                              : "bg-gray-800 text-green-400"
                          } p-2 rounded mt-2 font-mono text-xs whitespace-pre`}
                        >
                          {m.content}
                        </div>
                      ) : (
                        <p className="text-sm">{m.content}</p>
                      )}
                      <span
                        className={`text-xs mt-1 block ${
                          m.sender === "me" ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {m.time}
                      </span>
                    </div>
                    {m.sender === "me" && (
                      <img
                        src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                        alt="You"
                        className="w-8 h-8 rounded-full shrink-0"
                      />
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex space-x-2 mb-4">
                    <img
                      src={selected.avatarUrl}
                      alt={selected.name}
                      className="w-8 h-8 rounded-full shrink-0"
                    />
                    <div className="bg-gray-200 text-gray-800 rounded-[18px] rounded-bl-lg p-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-500 mr-2">
                          {selected.name.split(" ")[0]} is typing
                        </span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                        <span
                          className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-400 hover:text-primary">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary">
                    <Code className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
