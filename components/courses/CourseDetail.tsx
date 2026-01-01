"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { coursesService } from "@/services/courses.service";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Clock,
  Star,
  BookOpen,
  Award,
  Video,
  FileText,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Target,
  Loader2,
  Globe,
  Calendar,
} from "lucide-react";

interface CourseDetailProps {
  courseId: string;
}

export default function CourseDetail({ courseId }: CourseDetailProps) {
  const router = useRouter();
  const { push } = useToast();

  const { data: courseData, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesService.getCourseById(courseId),
  });

  const course = React.useMemo(() => {
    if (!courseData) return null;
    const raw: any = courseData;
    const c = raw?.data || raw;
    return {
      ...c,
      id: c._id || c.id,
      enrollmentCount: c.studentCount || c.enrollmentCount || 0,
      totalRatings: c.totalRatings || c.ratingsCount || c.reviewCount || 0,
      maxStudents: c.maxStudents || 100,
      rating: c.rating || 0,
      price: c.price || 0,
      duration: c.duration || c.durationHours || 0,
      status: c.status || (c.isPublished ? "published" : "draft"),
      categories: Array.isArray(c.categories) ? c.categories : [],
      instructor: typeof c.instructor === "object" ? c.instructor : null,
    };
  }, [courseData]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Course not found
          </h2>
          <p className="text-gray-500 mb-6">
            The course you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/courses")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const enrollmentProgress = course.maxStudents
    ? (course.enrollmentCount / course.maxStudents) * 100
    : 0;

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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/courses")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              {course.title}
            </h1>
            <p className="text-gray-600">{course.slug}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/courses/${course.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Course
            </Button>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Course Image & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Image */}
        <div className="lg:col-span-2">
          <div className="relative w-full h-96 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary/80">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-semibold">No Course Image</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Course Description
            </h2>
            <div
              className="text-gray-700 leading-relaxed prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  course.description || "<p>No description available.</p>",
              }}
            />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Status & Level */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Badge
                variant="outline"
                className={getStatusColor(course.status)}
              >
                {course.status}
              </Badge>
              <Badge variant="outline" className={getLevelColor(course.level)}>
                {course.level}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-5 h-5" />
                  <span>Price</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary block">
                    ${course.price.toFixed(2)}
                  </span>
                  {course.originalPrice &&
                    course.originalPrice > course.price && (
                      <>
                        <span className="text-sm text-gray-400 line-through block">
                          ${course.originalPrice.toFixed(2)}
                        </span>
                        <Badge className="mt-1 bg-green-500 text-white text-xs">
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>Duration</span>
                </div>
                <span className="font-semibold text-secondary">
                  {course.duration} hours
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>Students</span>
                </div>
                <span className="font-semibold text-secondary">
                  {course.enrollmentCount} / {course.maxStudents}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-5 h-5" />
                  <span>Rating</span>
                </div>
                <span className="font-semibold text-secondary">
                  {course.rating.toFixed(1)} ({course.totalRatings})
                </span>
              </div>

              {course.isFeatured && (
                <div className="flex items-center justify-center gap-2 py-2 px-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold">Featured Course</span>
                </div>
              )}

              {course.providesCertificate && (
                <div className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    Certificate Provided
                  </span>
                </div>
              )}

              {course.moneyBackGuarantee > 0 && (
                <div className="flex items-center justify-center gap-2 py-2 px-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {course.moneyBackGuarantee} Day Money Back
                  </span>
                </div>
              )}

              {course.language && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-5 h-5" />
                    <span>Language</span>
                  </div>
                  <span className="font-semibold text-secondary uppercase">
                    {course.language}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Progress */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-secondary mb-3">
              Enrollment Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Capacity</span>
                <span className="font-semibold">
                  {enrollmentProgress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    enrollmentProgress >= 80
                      ? "bg-green-500"
                      : enrollmentProgress >= 50
                      ? "bg-primary"
                      : "bg-yellow-500"
                  }`}
                  style={{ width: `${enrollmentProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {course.enrollmentCount} out of {course.maxStudents} seats
                filled
              </p>
            </div>
          </div>

          {/* Instructor */}
          {course.instructor && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-secondary mb-4">Instructor</h3>
              <div className="flex items-center gap-3">
                {course.instructor.avatar && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={course.instructor.avatar}
                      alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-secondary">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {course.instructor.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Categories */}
          {course.categories && course.categories.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-secondary mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {course.categories.map((cat: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/30"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Aircraft Types */}
          {course.aircraftTypes && course.aircraftTypes.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-secondary mb-4">
                Aircraft Types
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.aircraftTypes.map((aircraft: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-300"
                  >
                    {aircraft}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Excerpt */}
          {course.excerpt && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-secondary mb-3">
                Quick Overview
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {course.excerpt}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Prerequisites
            </h3>
            <ul className="space-y-2">
              {course.prerequisites.map((prereq: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-primary mt-1">•</span>
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Learning Objectives */}
        {course.learningObjectives && course.learningObjectives.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Learning Objectives
            </h3>
            <ul className="space-y-2">
              {course.learningObjectives.map((obj: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-primary mt-1">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {course.enrollmentCount}
          </div>
          <div className="text-sm opacity-90">Total Enrollments</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {course.completionRate || 0}%
          </div>
          <div className="text-sm opacity-90">Completion Rate</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {course.rating.toFixed(1)}
          </div>
          <div className="text-sm opacity-90">Average Rating</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">
            ${(course.price * course.enrollmentCount).toFixed(0)}
          </div>
          <div className="text-sm opacity-90">Total Revenue</div>
        </div>
      </div>
    </div>
  );
}
