"use client";

import * as React from "react";
import AppLayout from "@/components/layout/AppLayout";
import CourseDetail from "@/components/courses/CourseDetail";
import CourseAnalytics from "@/components/courses/CourseAnalytics";
import RequireAuth from "@/components/RequireAuth";
import CourseErrorBoundary from "@/components/courses/CourseErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const [courseId, setCourseId] = React.useState<string>("");

  React.useEffect(() => {
    params.then(({ id }) => setCourseId(id));
  }, [params]);

  if (!courseId) {
    return (
      <RequireAuth roles={["admin", "super_admin", "instructor"]}>
        <AppLayout>
          <div className="p-8 flex items-center justify-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </AppLayout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth roles={["admin", "super_admin", "instructor"]}>
      <AppLayout>
        <CourseErrorBoundary>
          <div className="p-4 sm:p-6 lg:p-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="details">Course Details</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <CourseDetail courseId={courseId} />
              </TabsContent>
              <TabsContent value="analytics">
                <CourseAnalytics courseId={courseId} />
              </TabsContent>
            </Tabs>
          </div>
        </CourseErrorBoundary>
      </AppLayout>
    </RequireAuth>
  );
}
