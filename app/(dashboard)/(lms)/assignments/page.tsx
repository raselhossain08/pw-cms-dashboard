import AppLayout from "@/components/layout/AppLayout";
import Assignments from "@/components/assignments/Assignments";
import RequireAuth from "@/components/RequireAuth";

export default function AssignmentsPage() {
  return (
    <RequireAuth roles={["instructor", "admin", "super_admin"]}>
      <AppLayout>
        <Assignments />
      </AppLayout>
    </RequireAuth>
  );
}
