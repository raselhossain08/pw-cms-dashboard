import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import { PrivacyPolicyEditor } from "@/components/cms/PrivacyPolicyEditor";

export const metadata: Metadata = {
  title: "Privacy Policy Management",
  description:
    "Manage privacy policy content, sections, contact info, and SEO settings",
};

export default function PrivacyPolicyPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <PrivacyPolicyEditor />
      </div>
    </AppLayout>
  );
}
