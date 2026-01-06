import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import Instructors from "@/components/instructors/Instructors";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Instructors Management | Dashboard",
  description:
    "Manage instructor accounts, monitor performance, and track engagement",
};

export default function InstructorsPage() {
  return (
    <RequireAuth roles={["admin", "super_admin", "instructor"]}>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <Instructors />
        </div>
      </AppLayout>
    </RequireAuth>
  );
}
