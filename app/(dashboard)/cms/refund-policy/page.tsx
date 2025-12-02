"use client";

import AppLayout from "@/components/layout/AppLayout";
import { RefundPolicyEditor } from "@/components/cms/RefundPolicyEditor";

export default function RefundPolicyPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Refund Policy Management
            </h1>
            <p className="text-muted-foreground">
              Manage refund policy content, sections, contact info, and SEO
              settings
            </p>
          </div>
        </div>
        <RefundPolicyEditor />
      </div>
    </AppLayout>
  );
}
