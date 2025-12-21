import AppLayout from "@/components/layout/AppLayout";
import Courses from "@/components/courses/Courses";
import RequireAuth from "@/components/RequireAuth";

export default function CoursesPage() {
  return (
    <RequireAuth roles={["instructor", "admin", "super_admin"]}>
      <AppLayout>
        <Courses />
      </AppLayout>
    </RequireAuth>
  );
}
