import AppLayout from "@/components/layout/AppLayout";
import Lessons from "@/components/lessons/Lessons";
import RequireAuth from "@/components/RequireAuth";

export default function LessonsPage() {
  return (
    <RequireAuth roles={["instructor", "admin", "super_admin"]}>
      <AppLayout>
        <Lessons />
      </AppLayout>
    </RequireAuth>
  );
}
