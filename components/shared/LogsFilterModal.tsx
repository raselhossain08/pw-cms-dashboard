"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  LogLevel,
  LogCategory,
  ErrorSeverity,
  AiModel,
  ChatType,
  SystemEventType,
  SystemStatus,
  type LogFilters,
} from "@/types/activity-logs";

interface LogsFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
  filters: LogFilters;
  onApplyFilters: (filters: LogFilters) => void;
  onClearFilters: () => void;
}

export function LogsFilterModal({
  open,
  onOpenChange,
  activeTab,
  filters,
  onApplyFilters,
  onClearFilters,
}: LogsFilterModalProps) {
  const [localFilters, setLocalFilters] = React.useState<LogFilters>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocalFilters({ page: 1, limit: 50 });
    onClearFilters();
  };

  const updateFilter = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter {activeTab}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Common Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={localFilters.startDate || ""}
                onChange={(e) => updateFilter("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={localFilters.endDate || ""}
                onChange={(e) => updateFilter("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search in logs..."
              value={localFilters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>

          {/* Activity Timeline Filters */}
          {activeTab === "Activity Timeline" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="level">Log Level</Label>
                <Select
                  value={localFilters.level || ""}
                  onValueChange={(value) => updateFilter("level", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {Object.values(LogLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={localFilters.category || ""}
                  onValueChange={(value) => updateFilter("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {Object.values(LogCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Error Logs Filters */}
          {activeTab === "Error Logs" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={localFilters.severity || ""}
                  onValueChange={(value) => updateFilter("severity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Severities</SelectItem>
                    {Object.values(ErrorSeverity).map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {severity.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="errorType">Error Type</Label>
                <Input
                  id="errorType"
                  placeholder="e.g., ValidationError, DatabaseError"
                  value={localFilters.errorType || ""}
                  onChange={(e) => updateFilter("errorType", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isResolved">Status</Label>
                <Select
                  value={
                    localFilters.isResolved === undefined
                      ? ""
                      : localFilters.isResolved.toString()
                  }
                  onValueChange={(value) =>
                    updateFilter(
                      "isResolved",
                      value === "" ? undefined : value === "true"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="false">Unresolved</SelectItem>
                    <SelectItem value="true">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* AI Logs Filters */}
          {activeTab === "AI Logs" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select
                  value={localFilters.model || ""}
                  onValueChange={(value) => updateFilter("model", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Models" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Models</SelectItem>
                    {Object.values(AiModel).map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={localFilters.status || ""}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="timeout">Timeout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minResponseTime">
                    Min Response Time (ms)
                  </Label>
                  <Input
                    id="minResponseTime"
                    type="number"
                    placeholder="0"
                    value={localFilters.minResponseTime || ""}
                    onChange={(e) =>
                      updateFilter("minResponseTime", Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxResponseTime">
                    Max Response Time (ms)
                  </Label>
                  <Input
                    id="maxResponseTime"
                    type="number"
                    placeholder="10000"
                    value={localFilters.maxResponseTime || ""}
                    onChange={(e) =>
                      updateFilter("maxResponseTime", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* Chat Logs Filters */}
          {activeTab === "Chat Logs" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="chatType">Chat Type</Label>
                <Select
                  value={localFilters.chatType || ""}
                  onValueChange={(value) => updateFilter("chatType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {Object.values(ChatType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversationId">Conversation ID</Label>
                <Input
                  id="conversationId"
                  placeholder="Enter conversation ID"
                  value={localFilters.conversationId || ""}
                  onChange={(e) =>
                    updateFilter("conversationId", e.target.value)
                  }
                />
              </div>
            </>
          )}

          {/* System Logs Filters */}
          {activeTab === "System Logs" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={localFilters.eventType || ""}
                  onValueChange={(value) => updateFilter("eventType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Events</SelectItem>
                    {Object.values(SystemEventType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemStatus">Status</Label>
                <Select
                  value={localFilters.status || ""}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {Object.values(SystemStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiresAction">Requires Action</Label>
                <Select
                  value={
                    localFilters.requiresAction === undefined
                      ? ""
                      : localFilters.requiresAction.toString()
                  }
                  onValueChange={(value) =>
                    updateFilter(
                      "requiresAction",
                      value === "" ? undefined : value === "true"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page">Page</Label>
              <Input
                id="page"
                type="number"
                min="1"
                value={localFilters.page || 1}
                onChange={(e) => updateFilter("page", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Items per Page</Label>
              <Input
                id="limit"
                type="number"
                min="10"
                max="100"
                value={localFilters.limit || 50}
                onChange={(e) => updateFilter("limit", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear} className="mr-auto">
            Clear All
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="bg-primary hover:bg-primary/90"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
