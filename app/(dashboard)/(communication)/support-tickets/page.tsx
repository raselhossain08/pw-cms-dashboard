import AppLayout from "@/components/layout/AppLayout";
import SupportTickets from "@/components/supporttickets/SupportTickets";
import RequireAuth from "@/components/RequireAuth";

export default function SupportTicketsPage() {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <SupportTickets />
      </AppLayout>
    </RequireAuth>
  );
}
