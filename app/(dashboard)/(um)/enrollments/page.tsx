import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import Enrollments from "@/components/enrollments/Enrollments";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Enrollments Management | Dashboard",
  description:
    "Comprehensive enrollment management system for tracking student progress, course registrations, and learning analytics",
};

export default function EnrollmentsPage() {
  return (
    <RequireAuth roles={["admin", "super_admin", "instructor"]}>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <Enrollments />
        </div>
      </AppLayout>
    </RequireAuth>
  );
}
