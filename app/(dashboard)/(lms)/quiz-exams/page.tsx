"use client";

import AppLayout from "@/components/layout/AppLayout";
import Quizzes from "@/components/quizzes/Quizzes";
import RequireAuth from "@/components/RequireAuth";
import { FileQuestion, BookOpen } from "lucide-react";

export default function QuizExamsPage() {
  return (
    <RequireAuth roles={["instructor", "admin", "super_admin"]}>
      <AppLayout>
        <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-secondary flex items-center gap-2 sm:gap-3 flex-wrap">
                  <FileQuestion className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary shrink-0" />
                  <span className="wrap-break-word">Quiz & Exams</span>
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2">
                  Create, manage, and analyze quizzes and exams for your courses
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Quizzes />
        </div>
      </AppLayout>
    </RequireAuth>
  );
}
