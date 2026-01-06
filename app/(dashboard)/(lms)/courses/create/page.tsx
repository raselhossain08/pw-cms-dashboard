import CreateCourse from "@/components/courses/CreateCourse";
import AppLayout from "@/components/layout/AppLayout";
import RequireAuth from "@/components/RequireAuth";
import CourseErrorBoundary from "@/components/courses/CourseErrorBoundary";

export default function CreateCoursePage() {
  return (
    <RequireAuth roles={["instructor", "admin", "super_admin"]}>
      <AppLayout>
        <CourseErrorBoundary>
          <CreateCourse />
        </CourseErrorBoundary>
      </AppLayout>
    </RequireAuth>
  );
}
