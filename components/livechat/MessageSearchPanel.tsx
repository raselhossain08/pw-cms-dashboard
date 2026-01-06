"use client";

import * as React from "react";
import { Search, X, ArrowDown, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Message } from "@/store/chatStore";

interface MessageSearchPanelProps {
  messages: Message[];
  onClose: () => void;
  onNavigate: (messageId: string) => void;
}

export default function MessageSearchPanel({
  messages,
  onClose,
  onNavigate,
}: MessageSearchPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Search messages
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentIndex(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = messages.filter((msg) =>
      msg.content.toLowerCase().includes(query)
    );
    setSearchResults(results);
    setCurrentIndex(0);
  }, [searchQuery, messages]);

  const handleNext = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentIndex + 1) % searchResults.length;
    setCurrentIndex(nextIndex);
    onNavigate(searchResults[nextIndex].id);
  };

  const handlePrevious = () => {
    if (searchResults.length === 0) return;
    const prevIndex =
      currentIndex === 0 ? searchResults.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    onNavigate(searchResults[prevIndex].id);
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-md p-3 z-10">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-9"
            autoFocus
          />
        </div>

        {searchResults.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 px-2">
              {currentIndex + 1} / {searchResults.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={searchResults.length === 0}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={searchResults.length === 0}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

