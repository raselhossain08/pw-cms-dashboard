"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import * as React from "react";
import {
  MessageSquare,
  Headphones,
  Paperclip,
  Smile,
  Minimize,
  X,
  Maximize,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [chatOpen, setChatOpen] = React.useState(false);
  const [minimized, setMinimized] = React.useState(false);
  const [unread, setUnread] = React.useState(3);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const toggleRef = React.useRef<HTMLButtonElement | null>(null);
  const popupRef = React.useRef<HTMLDivElement | null>(null);
  const minimizedRef = React.useRef<HTMLDivElement | null>(null);
  const messagesRef = React.useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = React.useState<
    { sender: "agent" | "me"; text: string; at: string }[]
  >([
    {
      sender: "agent",
      text: "Hello! Welcome to Personal Wings Support. I\u2019m Sarah, how can I help you today?",
      at: "10:30 AM",
    },
    {
      sender: "me",
      text: "Hi, I\u2019m having trouble accessing the aircraft brokerage module. It says I don\u2019t have permission.",
      at: "10:31 AM",
    },
    {
      sender: "agent",
      text: "I can help with that! Let me check your account permissions. What\u2019s your user role?",
      at: "10:32 AM",
    },
    {
      sender: "me",
      text: "I\u2019m an instructor. I need to access aircraft listings for training purposes.",
      at: "10:32 AM",
    },
  ]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        chatOpen &&
        popupRef.current &&
        toggleRef.current &&
        minimizedRef.current &&
        !popupRef.current.contains(t) &&
        !toggleRef.current.contains(t) &&
        !minimizedRef.current.contains(t)
      ) {
        setMinimized(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [chatOpen]);

  const openChat = () => {
    setChatOpen(true);
    setMinimized(false);
  };
  const minimizeChat = () => {
    setMinimized(true);
  };
  const closeChat = () => {
    setChatOpen(false);
    setMinimized(false);
  };
  const maximizeChat = () => {
    setMinimized(false);
    setChatOpen(true);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { sender: "me", text, at: "Just now" }]);
    setInput("");
    setTimeout(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }, 50);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const responses = [
        "I understand the issue. Let me check your instructor permissions for aircraft access.",
        "I can see your account. It looks like you need additional permissions for the brokerage module.",
        "I\u2019ve escalated this to our admin team. They\u2019ll update your permissions within the next hour.",
        "In the meantime, you can access training aircraft through the \u2018Training Resources\u2019 section.",
        "Is there anything else I can help you with today?",
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setMessages((m) => [
        ...m,
        { sender: "agent", text: reply, at: "Just now" },
      ]);
      setUnread((u) => (minimized ? u + 1 : u));
      setTimeout(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      }, 50);
    }, 1500);
  };

  const quickFill = (text: string) => {
    setInput(text);
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <Sidebar />
      <main className="pt-24 lg:ml-64 ">{children}</main>

      <button
        ref={toggleRef}
        onClick={() => {
          if (!chatOpen) openChat();
          else if (minimized) maximizeChat();
          else minimizeChat();
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-40"
      >
        <MessageSquare className="text-white w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
            {unread}
          </span>
        )}
      </button>

      {chatOpen && !minimized && (
        <div
          ref={popupRef}
          className="fixed bottom-24 right-6 w-96 h-[600px] bg-card rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50"
        >
          <div className="bg-primary text-white rounded-t-xl p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Headphones className="text-white w-5 h-5" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-accent rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-semibold">Support Team</h3>
                <p className="text-white/80 text-sm">
                  We\u2019re online and ready to help
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
                onClick={() => router.push("/ai-assitant")}
              >
                AI Assistant
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
                onClick={() => router.push("/live-chat")}
              >
                Live Chat
              </Button>
              <button
                onClick={minimizeChat}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Minimize className="text-white w-4 h-4" />
              </button>
              <button
                onClick={closeChat}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="text-white w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 p-4 overflow-y-auto bg-gray-50"
            ref={messagesRef}
          >
            <div className="space-y-4">
              <div className="text-center">
                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  Today
                </span>
              </div>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-xs lg:max-w-md">
                    <div
                      className={`${
                        m.sender === "me"
                          ? "bg-primary text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      } rounded-lg p-3 shadow-sm`}
                    >
                      <p className="text-sm">{m.text}</p>
                    </div>
                    <p
                      className={`text-xs text-gray-500 mt-1 ${
                        m.sender === "me" ? "text-right" : "text-left"
                      }`}
                    >
                      {m.sender === "me" ? "You" : "Sarah, Support Agent"} •{" "}
                      {m.at}
                    </p>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce mr-1" />
                        <span
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce mr-1"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <Button
                variant="ghost"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
                onClick={() => quickFill("Permission Issues")}
              >
                Permission Issues
              </Button>
              <Button
                variant="ghost"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
                onClick={() => quickFill("Aircraft Access")}
              >
                Aircraft Access
              </Button>
              <Button
                variant="ghost"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
                onClick={() => quickFill("Training Programs")}
              >
                Training Programs
              </Button>
              <Button
                variant="ghost"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
                onClick={() => quickFill("Billing Help")}
              >
                Billing Help
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4 bg-white rounded-b-xl">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={send}
                className="bg-primary text-white px-4 rounded-lg hover:bg-primary/90 flex items-center justify-center disabled:opacity-50"
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {chatOpen && minimized && (
        <div
          ref={minimizedRef}
          className="fixed bottom-24 right-6 w-80 bg-primary text-white rounded-xl shadow-lg p-4 z-50"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Headphones className="text-white w-4 h-4" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-accent rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Support Chat</h3>
                <p className="text-white/80 text-xs">
                  {unread} unread messages
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={maximizeChat}
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                <Maximize className="text-white w-3.5 h-3.5" />
              </button>
              <button
                onClick={closeChat}
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                <X className="text-white w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
