"use client";

import { useState, useEffect, useCallback } from "react";
import { RefundPolicyService, RefundPolicy } from "@/lib/services/refund-policy.service";
import { useToast } from "@/context/ToastContext";

interface UseRefundPolicyResult {
  refundPolicy: RefundPolicy | null;
  loading: boolean;
  saving: boolean;
  uploadProgress: number;
  error: string | null;
  fetchRefundPolicy: () => Promise<void>;
  createRefundPolicy: (data: Partial<RefundPolicy>) => Promise<RefundPolicy | null>;
  updateRefundPolicy: (id: string, data: Partial<RefundPolicy>) => Promise<RefundPolicy | null>;
  updateRefundPolicyWithUpload: (id: string, formData: FormData) => Promise<RefundPolicy | null>;
  deleteRefundPolicy: (id: string) => Promise<boolean>;
  toggleActiveStatus: (id: string) => Promise<RefundPolicy | null>;
  duplicateRefundPolicy: (id: string) => Promise<RefundPolicy | null>;
  exportRefundPolicy: (format: "json" | "pdf", id?: string) => Promise<void>;
  refreshRefundPolicy: () => Promise<void>;
}

export function useRefundPolicy(): UseRefundPolicyResult {
  const { push } = useToast();
  const [refundPolicy, setRefundPolicy] = useState<RefundPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchRefundPolicy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await RefundPolicyService.getDefaultRefundPolicy();
      if (response.success && response.data) {
        setRefundPolicy(response.data);
      } else {
        // Create default if none exists
        const createResponse = await RefundPolicyService.createRefundPolicy({
          headerSection: {
            title: "Refund Policy",
            subtitle: "Our commitment to your satisfaction with clear refund guidelines",
            image: "",
            imageAlt: "",
          },
          lastUpdated: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          sections: [],
          contactInfo: {
            refundDepartment: "refunds@personalwings.com",
            generalSupport: "support@personalwings.com",
            phone: "+444 555 666 777",
            businessHours: "Monday - Friday, 9:00 AM - 6:00 PM (EST)",
            address: "123 Education Street, Learning City, ED 12345",
          },
          seoMeta: {
            title: "Refund Policy | Personal Wings",
            description: "Learn about our refund policy",
            keywords: [],
            canonicalUrl: "https://personalwings.com/refund-policy",
          },
          isActive: true,
        });
        if (createResponse.success && createResponse.data) {
          setRefundPolicy(createResponse.data);
        }
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to fetch Refund Policy";
      setError(errorMessage);
      push({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [push]);

  const createRefundPolicy = useCallback(
    async (data: Partial<RefundPolicy>): Promise<RefundPolicy | null> => {
      setSaving(true);
      try {
        const response = await RefundPolicyService.createRefundPolicy(data);
        if (response.success && response.data) {
          setRefundPolicy(response.data);
          push({
            message: "Refund Policy created successfully!",
            type: "success",
          });
          return response.data;
        }
        throw new Error(response.message || "Failed to create Refund Policy");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to create Refund Policy";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const updateRefundPolicy = useCallback(
    async (id: string, data: Partial<RefundPolicy>): Promise<RefundPolicy | null> => {
      setSaving(true);
      try {
        const response = await RefundPolicyService.updateRefundPolicy(id, data);
        if (response.success && response.data) {
          setRefundPolicy(response.data);
          push({
            message: "Refund Policy updated successfully!",
            type: "success",
          });
          return response.data;
        }
        throw new Error(response.message || "Failed to update Refund Policy");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update Refund Policy";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const updateRefundPolicyWithUpload = useCallback(
    async (id: string, formData: FormData): Promise<RefundPolicy | null> => {
      setSaving(true);
      setUploadProgress(0);
      try {
        const response = await RefundPolicyService.updateRefundPolicyWithUpload(id, formData);
        if (response.success && response.data) {
          setRefundPolicy(response.data);
          push({
            message: "Refund Policy updated successfully!",
            type: "success",
          });
          setUploadProgress(0);
          return response.data;
        }
        throw new Error(response.message || "Failed to update Refund Policy");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update Refund Policy";
        push({
          message: errorMessage,
          type: "error",
        });
        setUploadProgress(0);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const deleteRefundPolicy = useCallback(
    async (id: string): Promise<boolean> => {
      setSaving(true);
      try {
        const response = await RefundPolicyService.deleteRefundPolicy(id);
        if (response.success) {
          push({
            message: "Refund Policy deleted successfully!",
            type: "success",
          });
          return true;
        }
        throw new Error(response.message || "Failed to delete Refund Policy");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete Refund Policy";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const toggleActiveStatus = useCallback(
    async (id: string): Promise<RefundPolicy | null> => {
      setSaving(true);
      try {
        const response = await RefundPolicyService.toggleActiveStatus(id);
        if (response.success && response.data) {
          setRefundPolicy(response.data);
          push({
            message: `Refund Policy ${response.data.isActive ? "activated" : "deactivated"} successfully!`,
            type: "success",
          });
          return response.data;
        }
        throw new Error(response.message || "Failed to toggle Refund Policy status");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle Refund Policy status";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const duplicateRefundPolicy = useCallback(
    async (id: string): Promise<RefundPolicy | null> => {
      setSaving(true);
      try {
        const response = await RefundPolicyService.duplicateRefundPolicy(id);
        if (response.success && response.data) {
          push({
            message: "Refund Policy duplicated successfully!",
            type: "success",
          });
          return response.data;
        }
        throw new Error(response.message || "Failed to duplicate Refund Policy");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to duplicate Refund Policy";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const exportRefundPolicy = useCallback(
    async (format: "json" | "pdf", id?: string): Promise<void> => {
      setSaving(true);
      try {
        await RefundPolicyService.exportRefundPolicy(format, id);
        push({
          message: `Refund Policy exported successfully as ${format.toUpperCase()}!`,
          type: "success",
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to export Refund Policy";
        push({
          message: errorMessage,
          type: "error",
        });
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const refreshRefundPolicy = useCallback(async () => {
    await fetchRefundPolicy();
  }, [fetchRefundPolicy]);

  useEffect(() => {
    fetchRefundPolicy();
  }, [fetchRefundPolicy]);

  return {
    refundPolicy,
    loading,
    saving,
    uploadProgress,
    error,
    fetchRefundPolicy,
    createRefundPolicy,
    updateRefundPolicy,
    updateRefundPolicyWithUpload,
    deleteRefundPolicy,
    toggleActiveStatus,
    duplicateRefundPolicy,
    exportRefundPolicy,
    refreshRefundPolicy,
  };
}
