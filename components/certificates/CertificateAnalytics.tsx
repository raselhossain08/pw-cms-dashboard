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
  const { data: stats, isLoading } = useQuery({
    queryKey: ["certificate-stats"],
    queryFn: () => certificatesService.getCertificateStats(),
  });

  const certificateStats = stats as CertificateStats | undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Top Courses by Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificateStats?.topCourses &&
            certificateStats.topCourses.length > 0 ? (
              certificateStats.topCourses.map((course, index: number) => (
                <div
                  key={course.courseId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{course.courseName}</p>
                      <p className="text-xs text-gray-600">
                        {course.count} certificates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${
                            certificateStats.topCourses[0]?.count
                              ? (course.count /
                                  certificateStats.topCourses[0].count) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">
                No certificate data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Recent Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {certificateStats?.recentCertificates &&
            certificateStats.recentCertificates.length > 0 ? (
              certificateStats.recentCertificates.map((cert) => {
                const student = cert.student;
                const course = cert.course;

                return (
                  <div
                    key={cert._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-600">{course.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-gray-900">
                        {cert.certificateId}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(cert.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">
                No recent certificates
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
