"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { coursesService } from "@/services/courses.service";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  BookOpen,
  Award,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseAnalyticsProps {
  courseId: string;
}

export default function CourseAnalytics({ courseId }: CourseAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["course-analytics", courseId],
    queryFn: () => coursesService.getCourseAnalytics(courseId),
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            No analytics data available for this course
          </p>
        </CardContent>
      </Card>
    );
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">
                {analytics.totalEnrollments || 0}
              </p>
              {analytics.enrollmentChange !== undefined && (
                <div
                  className={`flex items-center gap-1 text-sm ${getChangeColor(
                    analytics.enrollmentChange
                  )}`}
                >
                  {getChangeIcon(analytics.enrollmentChange)}
                  <span>{Math.abs(analytics.enrollmentChange)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">
                ${(analytics.totalRevenue || 0).toLocaleString()}
              </p>
              {analytics.revenueChange !== undefined && (
                <div
                  className={`flex items-center gap-1 text-sm ${getChangeColor(
                    analytics.revenueChange
                  )}`}
                >
                  {getChangeIcon(analytics.revenueChange)}
                  <span>{Math.abs(analytics.revenueChange)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {(analytics.averageRating || 0).toFixed(1)}
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(analytics.averageRating || 0)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {analytics.totalReviews || 0} reviews
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">
                {(analytics.completionRate || 0).toFixed(1)}%
              </p>
              {analytics.completionChange !== undefined && (
                <div
                  className={`flex items-center gap-1 text-sm ${getChangeColor(
                    analytics.completionChange
                  )}`}
                >
                  {getChangeIcon(analytics.completionChange)}
                  <span>{Math.abs(analytics.completionChange)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg. Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {analytics.averageCompletionTime || 0} days
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Expected: {analytics.expectedDuration || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{analytics.activeStudents || 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.activePercentage || 0}% of total enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certificates Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {analytics.certificatesIssued || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.certificatePercentage || 0}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      {analytics.engagementMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Video Views</p>
                <p className="text-xl font-bold">
                  {analytics.engagementMetrics.videoViews || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Quiz Attempts</p>
                <p className="text-xl font-bold">
                  {analytics.engagementMetrics.quizAttempts || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Quiz Score</p>
                <p className="text-xl font-bold">
                  {(analytics.engagementMetrics.averageQuizScore || 0).toFixed(
                    1
                  )}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Discussion Posts</p>
                <p className="text-xl font-bold">
                  {analytics.engagementMetrics.discussionPosts || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Lessons */}
      {analytics.topLessons && analytics.topLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topLessons.map((lesson: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{lesson.title}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {lesson.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {lesson.completionRate}% completion
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {lesson.engagement}% engaged
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
