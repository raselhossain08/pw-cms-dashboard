"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Plus,
  Pencil,
  Eye,
  ChartLine,
  EllipsisVertical,
  PlayCircle,
  FileText,
  CircleHelp,
  ListTodo,
  Layers,
  Clock,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface ModuleCardProps {
  module: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddContent?: (moduleId: string, type?: string) => void;
  onEditModule?: (module: any) => void;
  onViewModule?: (moduleId: string) => void;
  onViewAnalytics?: (moduleId: string) => void;
  children?: React.ReactNode;
  isDragOver?: boolean;
}

export default function ModuleCard({
  module,
  isExpanded,
  onToggleExpand,
  onAddContent,
  onEditModule,
  onViewModule,
  onViewAnalytics,
  children,
  isDragOver = false,
}: ModuleCardProps) {
  const lessonsCount = Array.isArray(module.lessons)
    ? module.lessons.length
    : module.lessonsCount || 0;

  const durationMinutes = module.duration || 0;
  const completionRate = module.completion || 0;

  return (
    <div
      className={`
        module-card transition-all duration-300 
        ${isExpanded ? "module-card-expanded shadow-xl" : ""}
        ${isDragOver ? "drop-zone-active" : ""}
      `}
    >
      {/* Module Header */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          {/* Left: Module Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Expand/Collapse Button */}
            <button
              onClick={onToggleExpand}
              className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all group"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              ) : (
                <ChevronRight className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              )}
            </button>

            {/* Module Icon & Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                  {module.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" />
                    {lessonsCount} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {durationMinutes}m
                  </span>
                  {completionRate > 0 && (
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {completionRate}% complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status Badge */}
            <Badge
              className={
                module.status === "published"
                  ? "badge-success"
                  : module.status === "archived"
                  ? "bg-gray-100 text-gray-700 border-gray-200"
                  : "badge-warning"
              }
            >
              {module.status || "draft"}
            </Badge>

            {/* Add Content Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Content
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                  Create New
                </div>
                <DropdownMenuItem
                  onSelect={() =>
                    onAddContent?.(module.id || module._id, "video")
                  }
                >
                  <PlayCircle className="w-4 h-4 mr-2 text-red-600" />
                  Video Lesson
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onAddContent?.(module.id || module._id, "text")
                  }
                >
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Text Lesson
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onAddContent?.(module.id || module._id, "quiz")
                  }
                >
                  <CircleHelp className="w-4 h-4 mr-2 text-purple-600" />
                  Quiz
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onAddContent?.(module.id || module._id, "assignment")
                  }
                >
                  <ListTodo className="w-4 h-4 mr-2 text-orange-600" />
                  Assignment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                  Add Existing
                </div>
                <DropdownMenuItem
                  onSelect={() =>
                    onAddContent?.(module.id || module._id, "existing")
                  }
                >
                  <Layers className="w-4 h-4 mr-2 text-green-600" />
                  Select Existing Lessons
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Module Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditModule?.(module)}
              className="text-gray-600 hover:text-primary hover:bg-primary/10"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit Module
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                >
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => onViewModule?.(module.id || module._id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Module
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onViewAnalytics?.(module.id || module._id)}
                >
                  <ChartLine className="w-4 h-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Bar */}
        {completionRate > 0 && (
          <div className="mt-4">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Module Content (Lessons) */}
      {isExpanded && (
        <div className="bg-gray-50/50 border-t border-gray-200">{children}</div>
      )}
    </div>
  );
}
