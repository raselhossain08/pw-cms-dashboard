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


    </div>
  );
}
