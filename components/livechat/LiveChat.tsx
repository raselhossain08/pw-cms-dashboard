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

const initialConversations: Conversation[] = [
  {
    id: "c1",
    name: "Sarah Johnson",
    topic: "Web Development Course",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    online: true,
    lastMessage: "Thanks for the help with the assignment!",
    lastTime: "2 min ago",
    unread: 1,
    messages: [
      {
        id: "m1",
        sender: "other",
        content:
          "Hi! I'm having trouble with the CSS grid layout in the portfolio project. Could you help me understand how to make it responsive?",
        time: "10:30 AM",
      },
      {
        id: "m2",
        sender: "me",
        content:
          "Of course! CSS Grid can be tricky at first. Have you tried using the fr units and media queries for responsiveness?",
        time: "10:32 AM",
      },
      {
        id: "m3",
        sender: "other",
        content:
          "I tried using fr units, but the columns aren't stacking properly on mobile. Here's my code:",
        time: "10:34 AM",
      },
      {
        id: "m4",
        sender: "other",
        type: "code",
        codeLanguage: "css",
        content: `.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}`,
        time: "10:34 AM",
      },
      {
        id: "m5",
        sender: "me",
        content:
          "I see the issue! You need to add a media query for mobile devices. Try this:",
        time: "10:35 AM",
      },
      {
        id: "m6",
        sender: "me",
        type: "code",
        codeLanguage: "css",
        content: `@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
}`,
        time: "10:35 AM",
      },
      {
        id: "m7",
        sender: "other",
        content: "That worked perfectly! Thank you so much! 😊",
        time: "10:36 AM",
      },
    ],
  },
  {
    id: "c2",
    name: "Michael Chen",
    topic: "Data Science Course",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
    online: true,
    lastMessage: "I have a question about the data analysis project",
    lastTime: "1 hour ago",
    unread: 3,
    messages: [
      {
        id: "m1",
        sender: "other",
        content: "I have a question about the data analysis project",
        time: "09:45 AM",
      },
    ],
  },
  {
    id: "c3",
    name: "Emma Wilson",
    topic: "UI/UX Design Course",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
    online: false,
    lastMessage: "When is the next design review session?",
    lastTime: "3 hours ago",
    messages: [
      {
        id: "m1",
        sender: "other",
        content: "When is the next design review session?",
        time: "08:02 AM",
      },
    ],
  },
  {
    id: "c4",
    name: "Dr. James Wilson",
    topic: "Instructor",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
    online: true,
    lastMessage: "Can we schedule a meeting about the new curriculum?",
    lastTime: "Yesterday",
    messages: [
      {
        id: "m1",
        sender: "other",
        content: "Can we schedule a meeting about the new curriculum?",
        time: "Yesterday",
      },
    ],
  },
];

const onlineUsers = [
  {
    id: "u1",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    name: "Sarah",
  },
  {
    id: "u2",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
    name: "Michael",
  },
  {
    id: "u3",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
    name: "James",
  },
];

export default function LiveChat() {
  const [conversations, setConversations] =
    React.useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = React.useState<string>(
    initialConversations[0].id
  );
  const [messageInput, setMessageInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [filterTab, setFilterTab] = React.useState<"all" | "unread">("all");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const selected = conversations.find((c) => c.id === selectedId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [selected?.messages, isTyping]);

  const filteredConversations = conversations.filter((c) => {
    if (filterTab === "unread") return c.unread && c.unread > 0;
    return true;
  });

  const sendMessage = () => {
    const text = messageInput.trim();
    if (!text || !selected) return;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const updated = conversations.map((c) => {
      if (c.id !== selected.id) return c;
      const newMsg: Message = {
        id: Math.random().toString(36).slice(2),
        sender: "me",
        content: text,
        time: now,
      };
      return {
        ...c,
        messages: [...c.messages, newMsg],
        lastMessage: text,
        lastTime: "Just now",
      };
    });
    setConversations(updated);
    setMessageInput("");

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate receiving a response
      const responseTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const updatedWithResponse = updated.map((c) => {
        if (c.id !== selected.id) return c;
        const responseMsg: Message = {
          id: Math.random().toString(36).slice(2),
          sender: "other",
          content:
            "One more question - should I use CSS Grid or Flexbox for the navigation menu?",
          time: responseTime,
        };
        return {
          ...c,
          messages: [...c.messages, responseMsg],
          lastMessage: responseMsg.content,
          lastTime: "Just now",
        };
      });
      setConversations(updatedWithResponse);
    }, 3000);
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

          {/* Online Users */}
          <div className="p-4 border-t border-gray-200">
            <h4 className="font-medium text-secondary mb-3">Online Now</h4>
            <div className="flex space-x-2">
              {onlineUsers.map((user) => (
                <div key={user.id} className="relative">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                </div>
              ))}
              <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+5</span>
              </div>
            </div>
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
