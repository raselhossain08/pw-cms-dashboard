import AppLayout from "@/components/layout/AppLayout";
import AnalyticsReports from "@/components/analytics/AnalyticsReports";
import RequireAuth from "@/components/RequireAuth";

export default function AnalyticsPage() {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <AnalyticsReports />
      </AppLayout>
    </RequireAuth>
  );
}
