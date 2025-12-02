import AppLayout from "@/components/layout/AppLayout";
import Modules from "@/components/modules/Modules";
import RequireAuth from "@/components/RequireAuth";

export default function ModulesPage() {
  return (
    <RequireAuth roles={["instructor", "admin", "super_admin"]}>
      <AppLayout>
        <Modules />
      </AppLayout>
    </RequireAuth>
  );
}
