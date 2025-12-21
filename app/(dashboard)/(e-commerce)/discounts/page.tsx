import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import Discounts from "@/components/shop/Discounts";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Discounts & Coupons Management | Dashboard",
  description:
    "Create, manage, and track discount codes and coupons for your e-commerce platform",
};

export default function DiscountsPage() {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <Discounts />
      </AppLayout>
    </RequireAuth>
  );
}
