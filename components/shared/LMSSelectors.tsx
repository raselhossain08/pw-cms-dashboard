"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { lmsConnectionsService } from "@/services/lms-connections.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CourseSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CourseSelector({
  value,
  onValueChange,
  placeholder = "Select a course",
  className = "",
  disabled = false,
}: CourseSelectorProps) {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["course-options"],
    queryFn: () => lmsConnectionsService.getCourseOptions(),
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-600">Loading courses...</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {courses && courses.length > 0 ? (
          courses.map((course) => (
            <SelectItem key={course.value} value={course.value}>
              {course.label}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-courses" disabled>
            No courses available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

interface CategorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CategorySelector({
  value,
  onValueChange,
  placeholder = "Select a category",
  className = "",
  disabled = false,
}: CategorySelectorProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["category-options"],
    queryFn: () => lmsConnectionsService.getCategoryOptions(),
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-600">Loading categories...</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories && categories.length > 0 ? (
          categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-categories" disabled>
            No categories available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
