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
  Trash2,
  Edit2,
  MoreVertical,
  UserPlus,
  Settings,
  Archive,
  Star,
  Loader2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  chatService,
  type ChatConversation,
  type ChatMessage,
} from "@/services/chat.service";
import type { Socket } from "socket.io-client";
import { getProfile } from "@/services/auth.service";
import { useToast } from "@/context/ToastContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState<
    string | null
  >(null);
  const [newChatTitle, setNewChatTitle] = React.useState("");
  const [newChatParticipants, setNewChatParticipants] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const socketRef = React.useRef<Socket | null>(null);
  const selfIdRef = React.useRef<string>("");
  const { push: showToast } = useToast();

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
      try {
        setIsLoading(true);
        const profile = await getProfile();
        if (!profile.success || !profile.data) {
          showToast({ message: "Failed to load profile", type: "error" });
          return;
        }
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
            setIsLoading(false);
          }
        );

        socket.on("new_conversation", (c: ChatConversation) => {
          const newConv = toUiConversation(c, selfIdRef.current);
          setConversations((prev) => [newConv, ...prev]);
          showToast({ message: "New conversation created", type: "success" });
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
          showToast({ message: "Disconnected from chat", type: "error" });
        });
      } catch (error) {
        console.error("Chat init error:", error);
        showToast({ message: "Failed to initialize chat", type: "error" });
        setIsLoading(false);
      }
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
    if (searchQuery) {
      return (
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const sendMessage = async () => {
    const text = messageInput.trim();
    if (!text || !selected || !socketRef.current || isSending) return;

    try {
      setIsSending(true);
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
      await chatService.sendMessageSocket(
        socketRef.current,
        selected.id,
        text,
        "text"
      );
    } catch (error) {
      showToast({ message: "Failed to send message", type: "error" });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newChatTitle.trim() || !socketRef.current) {
      showToast({ message: "Please enter a chat title", type: "error" });
      return;
    }

    try {
      const loadingId = showToast({
        message: "Creating conversation...",
        type: "loading",
      });
      const participants = newChatParticipants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const result = await chatService.createConversationSocket(
        socketRef.current,
        {
          title: newChatTitle,
          participants: [...participants, selfIdRef.current],
          type: "direct",
        }
      );

      if (result.success) {
        showToast({
          message: "Conversation created successfully",
          type: "success",
        });
        setIsNewChatOpen(false);
        setNewChatTitle("");
        setNewChatParticipants("");
      } else {
        showToast({ message: "Failed to create conversation", type: "error" });
      }
    } catch (error) {
      showToast({ message: "Error creating conversation", type: "error" });
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      const loadingId = showToast({
        message: "Deleting conversation...",
        type: "loading",
      });
      // Call API to delete conversation
      const response = await fetch(
        `/api/chat/conversations/${conversationToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setConversations((prev) =>
          prev.filter((c) => c.id !== conversationToDelete)
        );
        if (selectedId === conversationToDelete) {
          setSelectedId(conversations[0]?.id || "");
        }
        showToast({
          message: "Conversation deleted successfully",
          type: "success",
        });
      } else {
        showToast({ message: "Failed to delete conversation", type: "error" });
      }
    } catch (error) {
      showToast({ message: "Error deleting conversation", type: "error" });
    } finally {
      setIsDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const handleExportChat = async () => {
    if (!selected) return;
    try {
      const loadingId = showToast({
        message: "Exporting chat...",
        type: "loading",
      });
      const chatData = JSON.stringify(
        {
          conversation: selected.name,
          messages: selected.messages,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      );
      const blob = new Blob([chatData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${selected.name}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast({ message: "Chat exported successfully", type: "success" });
    } catch (error) {
      showToast({ message: "Failed to export chat", type: "error" });
    }
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
            <Button
              variant="outline"
              className="border-gray-300 hover:border-primary hover:text-primary transition-all"
              onClick={handleExportChat}
              disabled={!selected}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Chat
            </Button>

            {/* New Chat Dialog */}
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shadow-lg transition-all hover:shadow-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Create New Conversation
                  </DialogTitle>
                  <DialogDescription>
                    Start a new conversation with team members. Enter the chat
                    title and participant IDs.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Chat Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Project Discussion"
                      value={newChatTitle}
                      onChange={(e) => setNewChatTitle(e.target.value)}
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="participants"
                      className="text-sm font-medium"
                    >
                      Participant IDs (comma-separated)
                    </Label>
                    <Input
                      id="participants"
                      placeholder="e.g., user123, user456"
                      value={newChatParticipants}
                      onChange={(e) => setNewChatParticipants(e.target.value)}
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsNewChatOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateConversation}
                    className="bg-primary"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Create Chat
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Delete Conversation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Delete Conversation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone and all messages will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setConversationToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-colors">
                    <EllipsisVertical className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Archive className="w-4 h-4 mr-2" />
                    Archived Chats
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Star className="w-4 h-4 mr-2" />
                    Starred Messages
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setFilterTab("all")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  filterTab === "all"
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab("unread")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  filterTab === "unread"
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Loading conversations...
                  </p>
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No conversations found
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setIsNewChatOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start a Chat
                  </Button>
                </div>
              </div>
            ) : (
              filteredConversations.map((c) => (
                <div
                  key={c.id}
                  className={`group p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 relative ${
                    selectedId === c.id
                      ? "bg-indigo-50 border-r-4 border-r-primary"
                      : ""
                  }`}
                >
                  <div
                    onClick={() => setSelectedId(c.id)}
                    className="flex items-center space-x-3"
                  >
                    <div className="relative">
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      {c.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-secondary truncate">
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
                          <span className="flex items-center justify-center min-w-5 h-5 px-1.5 bg-primary text-white text-xs font-medium rounded-full shrink-0 ml-2">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {c.topic}
                      </div>
                    </div>
                  </div>

                  {/* Context Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute top-4 right-2 p-1.5 text-gray-400 hover:text-primary hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer">
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Star className="w-4 h-4 mr-2" />
                        Star
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600"
                        onClick={() => {
                          setConversationToDelete(c.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
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
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all">
                    <Code className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      disabled={isSending}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!messageInput.trim() || isSending}
                    className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
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
