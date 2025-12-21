"use client";

import { useEffect, useRef, useCallback } from "react";
import { chatService, ChatConversation, ChatMessage } from "@/services/chat.service";
import { useToast } from "@/context/ToastContext";
import { useChatStore, Conversation, Message } from "@/store/chatStore";
import { getProfile } from "@/services/auth.service";
import type { Socket } from "socket.io-client";
import { uploadService } from "@/services/upload.service";

type Participant =
  | { _id: string; firstName?: string; lastName?: string; avatar?: string }
  | string;

function participantId(p: Participant): string {
  return typeof p === "string" ? p : p._id;
}

function toUiConversation(c: ChatConversation, selfId: string): Conversation {
  const participants: Participant[] = Array.isArray(c.participants)
    ? (c.participants as Participant[])
    : [];
  const other = participants.find((p) => participantId(p) !== selfId);
  const name = other
    ? `${typeof other === "string" ? "" : other.firstName || ""} ${typeof other === "string" ? "" : other.lastName || ""
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
    participants: participants,
  };
}

function toUiMessage(msg: ChatMessage, selfId: string): Message {
  const senderId =
    typeof msg.sender === "object"
      ? (msg.sender as { _id: string })._id
      : msg.sender;
  return {
    id: msg._id,
    sender: senderId === selfId ? "me" : "other",
    content: msg.content,
    time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: (msg.type as any) || "text",
    createdAt: msg.createdAt,
    isRead: false,
  };
}

export function useChat() {
  const { push: showToast } = useToast();
  const {
    conversations,
    selectedConversationId,
    messages,
    socket,
    isConnected,
    isLoading,
    isSending,
    isTyping,
    isLoadingMessages,
    searchQuery,
    filterTab,
    isNewChatOpen,
    isDeleteDialogOpen,
    conversationToDelete,
    messagePages,
    hasMoreMessages,
    error,
    setConversations,
    addConversation,
    updateConversation,
    removeConversation,
    setSelectedConversation,
    setMessages,
    addMessage,
    updateMessage,
    removeMessage,
    prependMessages,
    setSocket,
    setConnected,
    setLoading,
    setSending,
    setTyping,
    setLoadingMessages,
    setSearchQuery,
    setFilterTab,
    setNewChatOpen,
    setDeleteDialogOpen,
    setConversationToDelete,
    setMessagePage,
    setHasMoreMessages,
    addOnlineUser,
    removeOnlineUser,
    setError,
    clearError,
  } = useChatStore();

  const selfIdRef = useRef<string>("");
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        setLoading(true);
        const profile = await getProfile();
        if (!profile.success || !profile.data) {
          showToast({ message: "Failed to load profile", type: "error" });
          return;
        }
        const me = profile.data;
        selfIdRef.current = me.id;
        const socketInstance = chatService.connect();
        setSocket(socketInstance);

        socketInstance.on("connect", () => {
          if (!mounted) return;
          setConnected(true);
          showToast({ message: "Connected to chat", type: "success" });
        });

        socketInstance.on("disconnect", () => {
          if (!mounted) return;
          setConnected(false);
          showToast({ message: "Disconnected from chat", type: "error" });
        });

        socketInstance.on(
          "conversations_list",
          (payload: { conversations: ChatConversation[]; total: number }) => {
            if (!mounted) return;
            const list = (payload?.conversations || []).map((c) =>
              toUiConversation(c, selfIdRef.current)
            );
            setConversations(list);
            if (list.length && !selectedConversationId) {
              setSelectedConversation(list[0].id);
            }
            setLoading(false);
          }
        );

        socketInstance.on("new_conversation", (c: ChatConversation) => {
          if (!mounted) return;
          const newConv = toUiConversation(c, selfIdRef.current);
          addConversation(newConv);
          showToast({ message: "New conversation created", type: "success" });
        });

        socketInstance.on(
          "conversation_updated",
          (data: { conversationId: string; lastMessage: ChatMessage }) => {
            if (!mounted) return;
            updateConversation(data.conversationId, {
              lastMessage: data.lastMessage.content,
              lastTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            });
          }
        );

        socketInstance.on("new_message", (msg: ChatMessage) => {
          if (!mounted) return;
          const convId =
            typeof msg.conversation === "string"
              ? msg.conversation
              : (msg.conversation as { _id: string })._id;
          const uiMessage = toUiMessage(msg, selfIdRef.current);
          addMessage(convId, uiMessage);
          updateConversation(convId, {
            lastMessage: msg.content,
            lastTime: uiMessage.time,
          });
        });

        socketInstance.on(
          "user_typing",
          (data: { conversationId: string; typing: boolean; userId: string }) => {
            if (!mounted) return;
            if (data.conversationId === selectedConversationId) {
              setTyping(data.conversationId, data.typing);
            }
          }
        );

        socketInstance.on("messages_read", (data: { messageIds: string[] }) => {
          if (!mounted) return;
          // Update read status for messages
          if (selectedConversationId) {
            const convMessages = messages[selectedConversationId] || [];
            convMessages.forEach((m) => {
              if (data.messageIds.includes(m.id)) {
                updateMessage(selectedConversationId, m.id, { isRead: true });
              }
            });
          }
        });
      } catch (error) {
        console.error("Chat init error:", error);
        showToast({ message: "Failed to initialize chat", type: "error" });
        setError(error instanceof Error ? error.message : "Unknown error");
        setLoading(false);
      }
    }
    void init();
    return () => {
      mounted = false;
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    async function loadMessages() {
      if (!socket || !selectedConversationId) return;
      try {
        setLoadingMessages(selectedConversationId, true);
        const resp = await chatService.joinConversation(
          socket,
          selectedConversationId
        );
        if (resp.success && resp.messages) {
          const msgs: Message[] = resp.messages.map((msg) =>
            toUiMessage(msg, selfIdRef.current)
          );
          setMessages(selectedConversationId, msgs);
          setMessagePage(selectedConversationId, 1);
          setHasMoreMessages(selectedConversationId, resp.messages.length >= 50);
        }
      } catch (error) {
        showToast({ message: "Failed to load messages", type: "error" });
      } finally {
        setLoadingMessages(selectedConversationId, false);
      }
    }
    void loadMessages();
  }, [selectedConversationId, socket]);

  // Typing indicator with debounce
  const handleTyping = useCallback(
    (conversationId: string) => {
      if (!socket || !conversationId) return;

      // Clear existing timeout
      if (typingTimeoutRef.current[conversationId]) {
        clearTimeout(typingTimeoutRef.current[conversationId]);
      }

      // Start typing
      chatService.typingStart(socket, conversationId);

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current[conversationId] = setTimeout(() => {
        chatService.typingStop(socket, conversationId);
      }, 3000);
    },
    [socket]
  );

  // Send message
  const sendMessage = async (
    conversationId: string,
    content: string,
    type: string = "text"
  ) => {
    if (!content.trim() || !socket || !conversationId || isSending) return;

    try {
      setSending(true);
      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const optimisticMsg: Message = {
        id: Math.random().toString(36).slice(2),
        sender: "me",
        content: content.trim(),
        time: now,
        type: type as any,
      };
      addMessage(conversationId, optimisticMsg);
      updateConversation(conversationId, {
        lastMessage: content.trim(),
        lastTime: "Just now",
      });

      const result = await chatService.sendMessageSocket(
        socket,
        conversationId,
        content.trim(),
        type
      );

      if (!result.success) {
        // Remove optimistic message on error
        removeMessage(conversationId, optimisticMsg.id);
        showToast({ message: result.error || "Failed to send message", type: "error" });
      } else if (result.message) {
        // Replace optimistic message with real one
        removeMessage(conversationId, optimisticMsg.id);
        const realMsg = toUiMessage(result.message, selfIdRef.current);
        addMessage(conversationId, realMsg);
      }
    } catch (error) {
      showToast({ message: "Failed to send message", type: "error" });
    } finally {
      setSending(false);
    }
  };

  // Send file/image
  const sendFile = async (
    conversationId: string,
    file: File,
    type: "image" | "file" = "file"
  ) => {
    if (!socket || !conversationId || isSending) return;

    try {
      setSending(true);
      showToast({ message: "Uploading file...", type: "info" });

      const uploadResult = await uploadService.uploadFile(file, {
        type: type === "image" ? "image" : "raw",
        onProgress: (progress) => {
          // Could show progress in UI
        },
      });

      // Send message with file URL
      await sendMessage(
        conversationId,
        uploadResult.url,
        type === "image" ? "image" : "file"
      );

      showToast({ message: "File sent successfully", type: "success" });
    } catch (error) {
      showToast({ message: "Failed to upload file", type: "error" });
    } finally {
      setSending(false);
    }
  };

  // Create conversation
  const createConversation = async (
    title: string,
    participantIds: string[]
  ) => {
    if (!socket || !title.trim()) {
      showToast({ message: "Please enter a chat title", type: "error" });
      return;
    }

    try {
      setSending(true);
      const result = await chatService.createConversationSocket(socket, {
        title: title.trim(),
        participants: [...participantIds, selfIdRef.current],
        type: "direct",
      });

      if (result.success) {
        showToast({
          message: "Conversation created successfully",
          type: "success",
        });
        setNewChatOpen(false);
        if (result.conversation) {
          const newConv = toUiConversation(result.conversation, selfIdRef.current);
          addConversation(newConv);
          setSelectedConversation(newConv.id);
        }
      } else {
        showToast({ message: result.error || "Failed to create conversation", type: "error" });
      }
    } catch (error) {
      showToast({ message: "Error creating conversation", type: "error" });
    } finally {
      setSending(false);
    }
  };

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      setSending(true);
      const result = await chatService.deleteConversation(conversationId);

      if (result.success !== false) {
        removeConversation(conversationId);
        showToast({
          message: "Conversation deleted successfully",
          type: "success",
        });
        setDeleteDialogOpen(false);
        setConversationToDelete(null);
      } else {
        showToast({ message: "Failed to delete conversation", type: "error" });
      }
    } catch (error) {
      showToast({ message: "Error deleting conversation", type: "error" });
    } finally {
      setSending(false);
    }
  };

  // Edit message
  const editMessage = async (
    conversationId: string,
    messageId: string,
    content: string
  ) => {
    try {
      const result = await chatService.updateMessage(messageId, content);
      if (result.success && result.data) {
        const updatedMsg = toUiMessage(result.data, selfIdRef.current);
        updateMessage(conversationId, messageId, {
          content: updatedMsg.content,
          isEdited: true,
        });
        showToast({ message: "Message updated", type: "success" });
      } else {
        showToast({ message: result.error || "Failed to update message", type: "error" });
      }
    } catch (error) {
      showToast({ message: "Failed to update message", type: "error" });
    }
  };

  // Delete message
  const deleteMessage = async (conversationId: string, messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      removeMessage(conversationId, messageId);
      showToast({ message: "Message deleted", type: "success" });
    } catch (error) {
      showToast({ message: "Failed to delete message", type: "error" });
    }
  };

  // Mark messages as read
  const markAsRead = async (conversationId: string, messageIds: string[]) => {
    if (!socket || !messageIds.length) return;
    try {
      await Promise.all(
        messageIds.map((id) => chatService.markAsRead(id))
      );
      // Update read status in store
      messageIds.forEach((id) => {
        updateMessage(conversationId, id, { isRead: true });
      });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = async (conversationId: string) => {
    if (!socket || isLoadingMessages[conversationId] || !hasMoreMessages[conversationId]) return;

    try {
      setLoadingMessages(conversationId, true);
      const currentPage = messagePages[conversationId] || 1;
      const nextPage = currentPage + 1;

      const result = await chatService.getMessages(conversationId, {
        page: nextPage,
        limit: 50,
      });

      if (result.success && result.data) {
        const newMessages = result.data.messages.map((msg) =>
          toUiMessage(msg, selfIdRef.current)
        );
        prependMessages(conversationId, newMessages);
        setMessagePage(conversationId, nextPage);
        setHasMoreMessages(
          conversationId,
          result.data.messages.length >= 50
        );
      }
    } catch (error) {
      showToast({ message: "Failed to load more messages", type: "error" });
    } finally {
      setLoadingMessages(conversationId, false);
    }
  };

  // Filter conversations
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

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const selectedMessages = selectedConversationId
    ? messages[selectedConversationId] || []
    : [];

  return {
    // State
    conversations: filteredConversations,
    selectedConversation,
    selectedMessages,
    socket,
    isConnected,
    isLoading,
    isSending,
    isTyping: selectedConversationId
      ? isTyping[selectedConversationId] || false
      : false,
    isLoadingMessages: selectedConversationId
      ? isLoadingMessages[selectedConversationId] || false
      : false,
    searchQuery,
    filterTab,
    isNewChatOpen,
    isDeleteDialogOpen,
    conversationToDelete,
    hasMoreMessages: selectedConversationId
      ? hasMoreMessages[selectedConversationId] || false
      : false,
    error,

    // Actions
    sendMessage,
    sendFile,
    createConversation,
    deleteConversation,
    editMessage,
    deleteMessage,
    markAsRead,
    loadMoreMessages,
    handleTyping,
    setSelectedConversation,
    setSearchQuery,
    setFilterTab,
    setNewChatOpen,
    setDeleteDialogOpen,
    setConversationToDelete,
    clearError,
    messagesEndRef,
  };
}
