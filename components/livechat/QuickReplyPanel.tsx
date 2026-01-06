"use client";

import * as React from "react";
import { Zap, Plus, X, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuickReply {
  id: string;
  title: string;
  message: string;
}

interface QuickReplyPanelProps {
  onSelect: (message: string) => void;
}

const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  {
    id: "1",
    title: "Thank you",
    message: "Thank you for contacting us! How can I help you today?",
  },
  {
    id: "2",
    title: "Working on it",
    message:
      "I'm currently looking into your issue. I'll get back to you shortly.",
  },
  {
    id: "3",
    title: "Resolved",
    message:
      "Great! I'm glad we could resolve your issue. Is there anything else I can help you with?",
  },
  {
    id: "4",
    title: "More Info",
    message: "Could you please provide more details about your issue?",
  },
  {
    id: "5",
    title: "Follow Up",
    message:
      "I'll follow up with you via email within 24 hours with more information.",
  },
];

export default function QuickReplyPanel({ onSelect }: QuickReplyPanelProps) {
  const [quickReplies, setQuickReplies] = React.useState<QuickReply[]>(
    DEFAULT_QUICK_REPLIES
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingReply, setEditingReply] = React.useState<QuickReply | null>(
    null
  );
  const [newTitle, setNewTitle] = React.useState("");
  const [newMessage, setNewMessage] = React.useState("");

  // Load quick replies from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("chat-quick-replies");
    if (stored) {
      try {
        setQuickReplies(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse quick replies:", error);
      }
    }
  }, []);

  // Save quick replies to localStorage
  const saveQuickReplies = (replies: QuickReply[]) => {
    localStorage.setItem("chat-quick-replies", JSON.stringify(replies));
    setQuickReplies(replies);
  };

  const handleAddOrEdit = () => {
    if (!newTitle.trim() || !newMessage.trim()) return;

    if (editingReply) {
      // Update existing
      const updated = quickReplies.map((r) =>
        r.id === editingReply.id
          ? { ...r, title: newTitle, message: newMessage }
          : r
      );
      saveQuickReplies(updated);
    } else {
      // Add new
      const newReply: QuickReply = {
        id: Date.now().toString(),
        title: newTitle,
        message: newMessage,
      };
      saveQuickReplies([...quickReplies, newReply]);
    }

    setIsDialogOpen(false);
    setEditingReply(null);
    setNewTitle("");
    setNewMessage("");
  };

  const handleEdit = (reply: QuickReply) => {
    setEditingReply(reply);
    setNewTitle(reply.title);
    setNewMessage(reply.message);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = quickReplies.filter((r) => r.id !== id);
    saveQuickReplies(updated);
  };

  const handleSelect = (reply: QuickReply) => {
    onSelect(reply.message);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Replies
            </CardTitle>
            <CardDescription>
              Click a template to use it in your message
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingReply(null);
              setNewTitle("");
              setNewMessage("");
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickReplies.map((reply) => (
            <div
              key={reply.id}
              className="group relative p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
              onClick={() => handleSelect(reply)}
            >
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-medium text-secondary">
                  {reply.title}
                </h4>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(reply);
                    }}
                    className="p-1 text-gray-400 hover:text-primary rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(reply.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {reply.message}
              </p>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReply ? "Edit Quick Reply" : "Add Quick Reply"}
            </DialogTitle>
            <DialogDescription>
              Create reusable message templates for faster responses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Welcome Message"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter your quick reply message..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOrEdit}>
              <Check className="w-4 h-4 mr-2" />
              {editingReply ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

