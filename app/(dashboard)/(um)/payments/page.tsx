import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import Payments from "@/components/payments/Payments";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Payments Management | Dashboard",
  description: "Manage payment transactions, invoices, and revenue tracking",
};

export default function PaymentsPage() {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <Payments />
      </AppLayout>
    </RequireAuth>
  );
}
