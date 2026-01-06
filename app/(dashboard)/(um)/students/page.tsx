import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import Students from "@/components/students/Students";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Students Management | Dashboard",
  description: "Manage student accounts, progress, and performance",
};

export default function StudentsPage() {
  return (
    <RequireAuth roles={["admin", "super_admin", "instructor"]}>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <Students />
        </div>
      </AppLayout>
    </RequireAuth>
  );
}
