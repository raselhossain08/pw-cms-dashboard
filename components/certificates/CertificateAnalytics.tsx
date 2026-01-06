"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { certificatesService } from "@/services/certificates.service";
import {
  Award,
  TrendingUp,
  XCircle,
  AlertTriangle,
  Calendar,
  BookOpen,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CertificateStats {
  totalIssued: number;
  totalRevoked: number;
  totalExpired: number;
  topCourses: Array<{
    courseId: string;
    courseName: string;
    count: number;
  }>;
  recentCertificates: Array<{
    _id: string;
    certificateId: string;
    issuedAt: string;
    student: {
      firstName: string;
      lastName: string;
    };
    course: {
      title: string;
    };
  }>;
}

export default function CertificateAnalytics() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["certificate-stats"],
    queryFn: () => certificatesService.getCertificateStats(),
    retry: 2,
  });

  const certificateStats = stats as CertificateStats | undefined;

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Failed to load analytics</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {error instanceof Error ? error.message : "An error occurred while loading certificate statistics"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {certificateStats?.totalIssued || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revoked</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {certificateStats?.totalRevoked || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Revoked certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {certificateStats?.totalExpired || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Expired certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {certificateStats?.totalIssued
                ? Math.round(
                    ((certificateStats.totalIssued -
                      certificateStats.totalRevoked) /
                      certificateStats.totalIssued) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Valid certificates</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <span>Top Courses by Certificates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {certificateStats?.topCourses &&
            certificateStats.topCourses.length > 0 ? (
              certificateStats.topCourses.map((course, index: number) => (
                <div
                  key={course.courseId || index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm truncate">{course.courseName || "Unknown Course"}</p>
                      <p className="text-xs text-gray-600">
                        {course.count || 0} certificate{course.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="w-full sm:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${
                            certificateStats.topCourses[0]?.count
                              ? Math.min(
                                  (course.count /
                                    certificateStats.topCourses[0].count) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 text-center py-6 sm:py-8">
                No certificate data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <span>Recent Certificates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {certificateStats?.recentCertificates &&
            certificateStats.recentCertificates.length > 0 ? (
              certificateStats.recentCertificates.map((cert) => {
                const student = cert.student || {};
                const course = cert.course || {};

                return (
                  <div
                    key={cert._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">
                          {typeof student === "object"
                            ? `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unknown Student"
                            : "Unknown Student"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {typeof course === "object" ? course.title || "Unknown Course" : "Unknown Course"}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-xs font-mono text-gray-900 break-all sm:break-normal">
                        {cert.certificateId}
                      </p>
                      <p className="text-xs text-gray-600">
                        {cert.issuedAt
                          ? new Date(cert.issuedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-600 text-center py-6 sm:py-8">
                No recent certificates
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
