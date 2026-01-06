import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import Users from "@/components/users/Users";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Users Management | Dashboard",
  description: "Manage all users, roles, permissions, and access control across your platform",
};

export default function UsersPage() {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Users />
        </div>
      </AppLayout>
    </RequireAuth>
  );
}
