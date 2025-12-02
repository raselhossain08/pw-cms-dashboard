import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import { TermsConditionsEditor } from "@/components/cms/TermsConditionsEditor";

export const metadata: Metadata = {
  title: "Terms & Conditions Management",
  description:
    "Manage terms & conditions content, sections, contact info, and SEO settings",
};

export default function TermsConditionsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <TermsConditionsEditor />
      </div>
    </AppLayout>
  );
}
