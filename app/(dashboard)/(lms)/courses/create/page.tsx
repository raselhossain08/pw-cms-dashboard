import CreateCourse from "@/components/courses/CreateCourse";
import AppLayout from "@/components/layout/AppLayout";
import RequireAuth from "@/components/RequireAuth";

export default function CreateCoursePage() {
  return (
    <RequireAuth roles={["instructor", "admin", "super_admin"]}>
      <AppLayout>
        <CreateCourse />
      </AppLayout>
    </RequireAuth>
  );
}
