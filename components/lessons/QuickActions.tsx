"use client";

import {
  Plus,
  Upload,
  Download,
  Filter,
  RefreshCw,
  Settings,
  PlayCircle,
  FileText,
  CircleHelp,
  ListTodo,
  Layers,
  BarChart3,
  Users,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface QuickActionsProps {
  onCreateLesson?: (type?: string) => void;
  onImport?: () => void;
  onExport?: (format: string) => void;
  onRefresh?: () => void;
  onViewAnalytics?: () => void;
  onManageModules?: () => void;
  onManageStudents?: () => void;
  onSettings?: () => void;
  showAll?: boolean;
}

export default function QuickActions({
  onCreateLesson,
  onImport,
  onExport,
  onRefresh,
  onViewAnalytics,
  onManageModules,
  onManageStudents,
  onSettings,
  showAll = true,
}: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Create Lesson - Primary Action */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-pulse-glow"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Lesson
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Create New Content</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onCreateLesson?.("video")}>
            <PlayCircle className="w-4 h-4 mr-2 text-red-600" />
            <div>
              <div className="font-medium">Video Lesson</div>
              <div className="text-xs text-gray-500">Upload or embed video</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onCreateLesson?.("text")}>
            <FileText className="w-4 h-4 mr-2 text-blue-600" />
            <div>
              <div className="font-medium">Text Lesson</div>
              <div className="text-xs text-gray-500">Rich text content</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onCreateLesson?.("quiz")}>
            <CircleHelp className="w-4 h-4 mr-2 text-purple-600" />
            <div>
              <div className="font-medium">Quiz</div>
              <div className="text-xs text-gray-500">Assessment questions</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onCreateLesson?.("assignment")}>
            <ListTodo className="w-4 h-4 mr-2 text-orange-600" />
            <div>
              <div className="font-medium">Assignment</div>
              <div className="text-xs text-gray-500">
                Student submission task
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showAll && (
        <>
          {/* Import/Export */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={onImport}
              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            <div className="w-px h-6 bg-gray-200" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:bg-green-50 hover:text-green-700"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onExport?.("csv")}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onExport?.("xlsx")}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onExport?.("pdf")}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onViewAnalytics}
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onManageModules}
              className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
            >
              <Layers className="w-4 h-4 mr-1" />
              Modules
            </Button>
          </div>

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onManageStudents}>
                <Users className="w-4 h-4 mr-2" />
                Manage Students
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onManageModules}>
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Modules
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
