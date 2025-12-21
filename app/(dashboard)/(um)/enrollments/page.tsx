import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import Enrollments from "@/components/enrollments/Enrollments";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Enrollments Management | Dashboard",
  description:
    "Manage student enrollments, track progress, and handle course registrations",
};

export default function EnrollmentsPage() {
  return (
    <RequireAuth roles={["admin", "super_admin", "instructor"]}>
      <AppLayout>
        <Enrollments />
      </AppLayout>
    </RequireAuth>
  );
}
