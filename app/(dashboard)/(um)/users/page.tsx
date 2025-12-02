import AppLayout from "@/components/layout/AppLayout";
import Users from "@/components/users/Users";
import RequireAuth from "@/components/RequireAuth";

export default function UsersPage() {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <Users />
      </AppLayout>
    </RequireAuth>
  );
}
