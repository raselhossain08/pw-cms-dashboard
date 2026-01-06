import AppLayout from "@/components/layout/AppLayout";
import Courses from "@/components/courses/Courses";
import RequireAuth from "@/components/RequireAuth";
import CourseErrorBoundary from "@/components/courses/CourseErrorBoundary";

export default function CoursesPage() {
  return (
    <RequireAuth roles={["instructor", "admin", "super_admin"]}>
      <AppLayout>
        <CourseErrorBoundary>
          <Courses />
        </CourseErrorBoundary>
      </AppLayout>
    </RequireAuth>
  );
}
