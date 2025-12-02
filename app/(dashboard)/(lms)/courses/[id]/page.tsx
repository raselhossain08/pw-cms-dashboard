import AppLayout from "@/components/layout/AppLayout";
import CourseDetail from "@/components/courses/CourseDetail";
import RequireAuth from "@/components/RequireAuth";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth roles={["admin", "super_admin", "instructor"]}>
      <AppLayout>
        <CourseDetail courseId={id} />
      </AppLayout>
    </RequireAuth>
  );
}
