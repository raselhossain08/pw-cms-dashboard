"use client";

import { useState, useEffect, useCallback } from "react";
import { PrivacyPolicyService, PrivacyPolicy } from "@/lib/services/privacy-policy.service";
import { useToast } from "@/context/ToastContext";

interface UsePrivacyPolicyResult {
  privacyPolicy: PrivacyPolicy | null;
  loading: boolean;
  saving: boolean;
  uploadProgress: number;
  error: string | null;
  fetchPrivacyPolicy: () => Promise<void>;
  createPrivacyPolicy: (data: Partial<PrivacyPolicy>) => Promise<PrivacyPolicy | null>;
  updatePrivacyPolicy: (id: string, data: Partial<PrivacyPolicy>) => Promise<PrivacyPolicy | null>;
  updatePrivacyPolicyWithUpload: (id: string, formData: FormData) => Promise<PrivacyPolicy | null>;
  deletePrivacyPolicy: (id: string) => Promise<boolean>;
  toggleActiveStatus: (id: string) => Promise<PrivacyPolicy | null>;
  duplicatePrivacyPolicy: (id: string) => Promise<PrivacyPolicy | null>;
  exportPrivacyPolicy: (format: "json" | "pdf", id?: string) => Promise<void>;
  refreshPrivacyPolicy: () => Promise<void>;
}

export function usePrivacyPolicy(): UsePrivacyPolicyResult {
  const { push } = useToast();
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchPrivacyPolicy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await PrivacyPolicyService.getDefaultPrivacyPolicy();
      if (response.success && response.data) {
        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        setPrivacyPolicy(data);
      } else {
        // Create default if none exists
        const createResponse = await PrivacyPolicyService.createPrivacyPolicy({
          headerSection: {
            title: "Privacy Policy",
            subtitle: "Your privacy is important to us. Learn how we protect your data",
            image: "",
            imageAlt: "",
          },
          lastUpdated: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          sections: [],
          contactInfo: {
            privacyTeam: "privacy@personalwings.com",
            generalSupport: "support@personalwings.com",
            phone: "+444 555 666 777",
            address: "123 Education Street, Learning City, ED 12345",
          },
          seoMeta: {
            title: "Privacy Policy | Personal Wings",
            description: "Learn how we protect your privacy",
            keywords: [],
            canonicalUrl: "https://personalwings.com/privacy-policy",
          },
          isActive: true,
        });
        if (createResponse.success && createResponse.data) {
          const data = Array.isArray(createResponse.data)
            ? createResponse.data[0]
            : createResponse.data;
          setPrivacyPolicy(data);
        }
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to fetch Privacy Policy";
      setError(errorMessage);
      push({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [push]);

  const createPrivacyPolicy = useCallback(
    async (data: Partial<PrivacyPolicy>): Promise<PrivacyPolicy | null> => {
      setSaving(true);
      try {
        const response = await PrivacyPolicyService.createPrivacyPolicy(data);
        if (response.success && response.data) {
          const newPolicy = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setPrivacyPolicy(newPolicy);
          push({
            message: "Privacy Policy created successfully!",
            type: "success",
          });
          return newPolicy;
        }
        throw new Error(response.message || "Failed to create Privacy Policy");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to create Privacy Policy";
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

  const updatePrivacyPolicy = useCallback(
    async (id: string, data: Partial<PrivacyPolicy>): Promise<PrivacyPolicy | null> => {
      setSaving(true);
      try {
        const response = await PrivacyPolicyService.updatePrivacyPolicy(id, data);
        if (response.success && response.data) {
          const updated = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setPrivacyPolicy(updated);
          push({
            message: "Privacy Policy updated successfully!",
            type: "success",
          });
          return updated;
        }
        throw new Error(response.message || "Failed to update Privacy Policy");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update Privacy Policy";
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

  const updatePrivacyPolicyWithUpload = useCallback(
    async (id: string, formData: FormData): Promise<PrivacyPolicy | null> => {
      setSaving(true);
      setUploadProgress(0);
      try {
        const response = await PrivacyPolicyService.updatePrivacyPolicyWithUpload(id, formData);
        if (response.success && response.data) {
          const updated = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setPrivacyPolicy(updated);
          push({
            message: "Privacy Policy updated successfully!",
            type: "success",
          });
          setUploadProgress(0);
          return updated;
        }
        throw new Error(response.message || "Failed to update Privacy Policy");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update Privacy Policy";
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

  const deletePrivacyPolicy = useCallback(
    async (id: string): Promise<boolean> => {
      setSaving(true);
      try {
        const response = await PrivacyPolicyService.deletePrivacyPolicy(id);
        if (response.success) {
          push({
            message: "Privacy Policy deleted successfully!",
            type: "success",
          });
          return true;
        }
        throw new Error(response.message || "Failed to delete Privacy Policy");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete Privacy Policy";
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
    async (id: string): Promise<PrivacyPolicy | null> => {
      setSaving(true);
      try {
        const response = await PrivacyPolicyService.toggleActiveStatus(id);
        if (response.success && response.data) {
          const updated = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setPrivacyPolicy(updated);
          push({
            message: `Privacy Policy ${updated.isActive ? "activated" : "deactivated"} successfully!`,
            type: "success",
          });
          return updated;
        }
        throw new Error(response.message || "Failed to toggle Privacy Policy status");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle Privacy Policy status";
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

  const duplicatePrivacyPolicy = useCallback(
    async (id: string): Promise<PrivacyPolicy | null> => {
      setSaving(true);
      try {
        const response = await PrivacyPolicyService.duplicatePrivacyPolicy(id);
        if (response.success && response.data) {
          push({
            message: "Privacy Policy duplicated successfully!",
            type: "success",
          });
          return Array.isArray(response.data) ? response.data[0] : response.data;
        }
        throw new Error(response.message || "Failed to duplicate Privacy Policy");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to duplicate Privacy Policy";
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

  const exportPrivacyPolicy = useCallback(
    async (format: "json" | "pdf", id?: string): Promise<void> => {
      setSaving(true);
      try {
        await PrivacyPolicyService.exportPrivacyPolicy(format, id);
        push({
          message: `Privacy Policy exported successfully as ${format.toUpperCase()}!`,
          type: "success",
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to export Privacy Policy";
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

  const refreshPrivacyPolicy = useCallback(async () => {
    await fetchPrivacyPolicy();
  }, [fetchPrivacyPolicy]);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, [fetchPrivacyPolicy]);

  return {
    privacyPolicy,
    loading,
    saving,
    uploadProgress,
    error,
    fetchPrivacyPolicy,
    createPrivacyPolicy,
    updatePrivacyPolicy,
    updatePrivacyPolicyWithUpload,
    deletePrivacyPolicy,
    toggleActiveStatus,
    duplicatePrivacyPolicy,
    exportPrivacyPolicy,
    refreshPrivacyPolicy,
  };
}
