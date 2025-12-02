import AppLayout from "@/components/layout/AppLayout";
import EditCourse from "../../../../../../components/courses/EditCourse";
import RequireAuth from "@/components/RequireAuth";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("EditCoursePage - Course ID:", id);
  return (
    <RequireAuth roles={["admin", "super_admin", "instructor"]}>
      <AppLayout>
        <EditCourse courseId={id} />
      </AppLayout>
    </RequireAuth>
  );
}
