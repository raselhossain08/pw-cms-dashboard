import AppLayout from "@/components/layout/AppLayout";
import CMS from "@/components/cms/CMS";
import RequireAuth from "@/components/RequireAuth";

export default function CMSPage() {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <CMS />
      </AppLayout>
    </RequireAuth>
  );
}
