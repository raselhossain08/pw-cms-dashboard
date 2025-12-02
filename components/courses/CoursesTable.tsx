"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Course } from "@/services/courses.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CoursesTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onDuplicate: (courseId: string) => void;
  onPublish: (courseId: string) => void;
  onUnpublish: (courseId: string) => void;
  actionLoading?: string | null;
}

export default function CoursesTable({
  courses,
  onEdit,
  onDelete,
  onDuplicate,
  onPublish,
  onUnpublish,
  actionLoading,
}: CoursesTableProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "archived":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-primary/10 text-primary";
      case "advanced":
        return "bg-orange-100 text-orange-700";
      case "expert":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const calculateSalesProgress = (course: Course): number => {
    if (!course.maxStudents) return 0;
    const enrolled = course.enrollmentCount || 0;
    return Math.min((enrolled / course.maxStudents) * 100, 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Thumbnail</TableHead>
            <TableHead>Course Title</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Categories</TableHead>
            <TableHead className="text-center">Students</TableHead>
            <TableHead className="text-center">Rating</TableHead>
            <TableHead className="w-[200px]">Sales Progress</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center py-8 text-gray-500"
              >
                No courses found
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => {
              const salesProgress = calculateSalesProgress(course);
              const enrolled = course.enrollmentCount || 0;
              const maxStudents = course.maxStudents || 0;
              const instructor =
                typeof course.instructor === "object"
                  ? course.instructor
                  : null;

              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-md">
                      <Link
                        href={`/courses/${course.id}`}
                        className="font-semibold text-secondary hover:text-primary transition-colors line-clamp-2"
                      >
                        {course.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={getLevelColor(course.level)}
                        >
                          {course.level}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {course.duration} hours
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {instructor ? (
                      <div className="flex items-center gap-2">
                        {instructor.avatar && (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                            <Image
                              src={instructor.avatar}
                              alt={`${instructor.firstName || ""} ${
                                instructor.lastName || ""
                              }`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-secondary">
                            {instructor.firstName} {instructor.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {instructor.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        No instructor
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {course.categories && course.categories.length > 0 ? (
                        course.categories.slice(0, 2).map((cat, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-primary/10 text-primary border-primary/30"
                          >
                            {cat}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          No category
                        </span>
                      )}
                      {course.categories && course.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.categories.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="font-semibold text-secondary">
                      {enrolled}
                    </div>
                    <div className="text-xs text-gray-500">/ {maxStudents}</div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">
                        {course.rating ? course.rating.toFixed(1) : "N/A"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ({course.totalRatings || 0})
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Enrollment</span>
                        <span className="font-semibold">
                          {salesProgress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            salesProgress >= 80
                              ? "bg-green-500"
                              : salesProgress >= 50
                              ? "bg-primary"
                              : "bg-yellow-500"
                          }`}
                          style={{ width: `${salesProgress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {enrolled} / {maxStudents} students
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="font-bold text-primary">
                        ${course.price.toFixed(2)}
                      </div>
                      {course.originalPrice &&
                        course.originalPrice > course.price && (
                          <>
                            <div className="text-xs text-gray-400 line-through">
                              ${course.originalPrice.toFixed(2)}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 text-green-600 border-green-200"
                            >
                              -
                              {Math.round(
                                ((course.originalPrice - course.price) /
                                  course.originalPrice) *
                                  100
                              )}
                              % OFF
                            </Badge>
                          </>
                        )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={getStatusColor(course.status)}
                    >
                      {course.status ||
                        (course.isPublished ? "published" : "draft")}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={actionLoading === course.id}
                        >
                          {actionLoading === course.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MoreVertical className="w-4 h-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/courses/${course.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(course)}
                          disabled={!!actionLoading}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => course.id && onDuplicate(course.id)}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === course.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {course.isPublished ? (
                          <DropdownMenuItem
                            onClick={() => course.id && onUnpublish(course.id)}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === course.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => course.id && onPublish(course.id)}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === course.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                            )}
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => course.id && onDelete(course.id)}
                          className="text-red-600 focus:text-red-600"
                          disabled={!!actionLoading}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
