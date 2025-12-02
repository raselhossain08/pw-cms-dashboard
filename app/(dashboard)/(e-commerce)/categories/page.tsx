import AppLayout from "@/components/layout/AppLayout";
import Categories from "@/components/shop/Categories";
import RequireAuth from "@/components/RequireAuth";

export default function CategoriesPage() {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <Categories />
      </AppLayout>
    </RequireAuth>
  );
}
