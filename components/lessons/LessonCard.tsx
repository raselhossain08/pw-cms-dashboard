"use client";

import * as React from "react";
import {
  PlayCircle,
  FileText,
  CircleHelp,
  ListTodo,
  Download as DownloadIcon,
  Clock,
  Eye,
  Folder,
  Gift,
  Pencil,
  Copy,
  Trash,
  Power,
  PowerOff,
  ChartLine,
  EllipsisVertical,
  GripVertical,
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

export interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    type: string;
    duration: number;
    durationDisplay: string;
    views: number;
    status: string;
    thumbnail?: string;
    moduleTitle?: string;
    isFree: boolean;
    position: number;
  };
  isSelected?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onEdit?: (lesson: any) => void;
  onPreview?: (lesson: any) => void;
  onAnalytics?: (lesson: any) => void;
  onDuplicate?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const lessonTypeIcons = {
  video: { icon: PlayCircle, className: "lesson-icon-video" },
  text: { icon: FileText, className: "lesson-icon-text" },
  quiz: { icon: CircleHelp, className: "lesson-icon-quiz" },
  assignment: { icon: ListTodo, className: "lesson-icon-assignment" },
  download: { icon: DownloadIcon, className: "lesson-icon-download" },
};

export default function LessonCard({
  lesson,
  isSelected = false,
  isDragging = false,
  isDropTarget = false,
  onSelect,
  onEdit,
  onPreview,
  onAnalytics,
  onDuplicate,
  onToggleStatus,
  onDelete,
  onDragStart,
  onDragEnd,
}: LessonCardProps) {
  const typeConfig =
    lessonTypeIcons[lesson.type as keyof typeof lessonTypeIcons] ||
    lessonTypeIcons.video;
  const IconComponent = typeConfig.icon;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        lesson-card group cursor-grab active:cursor-grabbing p-4 
        ${isDragging ? "lesson-card-dragging" : ""} 
        ${isDropTarget ? "lesson-card-drop-target" : ""}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
        </div>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect?.(lesson.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 mt-1 text-primary rounded border-gray-300 focus:ring-primary"
        />

        {/* Thumbnail/Icon */}
        <div
          className={`lesson-icon-wrapper ${typeConfig.className} flex-shrink-0`}
          onClick={() => onPreview?.(lesson)}
        >
          {lesson.thumbnail ? (
            <img
              src={lesson.thumbnail}
              alt={lesson.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <IconComponent className="w-6 h-6" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4
              className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors cursor-pointer text-lg"
              onClick={() => onPreview?.(lesson)}
            >
              {lesson.title}
            </h4>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit?.(lesson)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPreview?.(lesson)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAnalytics?.(lesson)}>
                  <ChartLine className="w-4 h-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDuplicate?.(lesson.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus?.(lesson.id)}>
                  {lesson.status === "published" ? (
                    <>
                      <PowerOff className="w-4 h-4 mr-2 text-amber-600" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-2 text-green-600" />
                      Publish
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(lesson.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
            <Badge variant="outline" className="capitalize">
              {lesson.type}
            </Badge>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {lesson.durationDisplay}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {lesson.views} views
            </span>
            {lesson.moduleTitle && (
              <span className="flex items-center gap-1 text-primary">
                <Folder className="w-4 h-4" />
                {lesson.moduleTitle}
              </span>
            )}
          </div>

          {/* Status & Tags */}
          <div className="flex items-center gap-2">
            <Badge
              className={
                lesson.status === "published"
                  ? "badge-success"
                  : "badge-warning"
              }
            >
              {lesson.status}
            </Badge>
            {lesson.isFree && (
              <Badge variant="outline" className="badge-info">
                <Gift className="w-3 h-3 mr-1" />
                Free Preview
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
