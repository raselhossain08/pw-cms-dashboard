"use client";

import {
  PlayCircle,
  Plus,
  FileText,
  CircleHelp,
  ListTodo,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonEmptyStateProps {
  onCreateLesson?: () => void;
  title?: string;
  description?: string;
  showQuickActions?: boolean;
}

export default function LessonEmptyState({
  onCreateLesson,
  title = "No lessons yet",
  description = "Start creating engaging lessons for your students",
  showQuickActions = true,
}: LessonEmptyStateProps) {
  return (
    <div className="empty-state min-h-[400px] bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 rounded-2xl border-2 border-dashed border-gray-300">
      <div className="relative">
        {/* Animated Background Icons */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <PlayCircle
            className="absolute top-10 left-10 w-16 h-16 text-primary animate-float"
            style={{ animationDelay: "0s" }}
          />
          <FileText
            className="absolute top-20 right-20 w-12 h-12 text-blue-600 animate-float"
            style={{ animationDelay: "0.5s" }}
          />
          <CircleHelp
            className="absolute bottom-20 left-20 w-14 h-14 text-purple-600 animate-float"
            style={{ animationDelay: "1s" }}
          />
          <ListTodo
            className="absolute bottom-10 right-10 w-10 h-10 text-orange-600 animate-float"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <div className="empty-state-icon mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
              <BookOpen className="relative w-24 h-24 text-primary mx-auto" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">{description}</p>

          {showQuickActions && onCreateLesson && (
            <div className="space-y-4">
              <Button
                onClick={onCreateLesson}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Lesson
              </Button>

              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative bg-white border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                    onClick={onCreateLesson}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Video Lesson
                  </Button>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                    onClick={onCreateLesson}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Text Lesson
                  </Button>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                    onClick={onCreateLesson}
                  >
                    <CircleHelp className="w-4 h-4 mr-2" />
                    Quiz
                  </Button>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative bg-white border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
                    onClick={onCreateLesson}
                  >
                    <ListTodo className="w-4 h-4 mr-2" />
                    Assignment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
