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
        <Students />
      </AppLayout>
    </RequireAuth>
  );
}
