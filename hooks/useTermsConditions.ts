"use client";

import { useState, useEffect, useCallback } from "react";
import { TermsConditionsService, TermsConditions } from "@/lib/services/terms-conditions.service";
import { useToast } from "@/context/ToastContext";

interface UseTermsConditionsResult {
  termsConditions: TermsConditions | null;
  loading: boolean;
  saving: boolean;
  uploadProgress: number;
  error: string | null;
  fetchTermsConditions: () => Promise<void>;
  createTermsConditions: (data: Partial<TermsConditions>) => Promise<TermsConditions | null>;
  updateTermsConditions: (id: string, data: Partial<TermsConditions>) => Promise<TermsConditions | null>;
  updateTermsConditionsWithUpload: (id: string, formData: FormData) => Promise<TermsConditions | null>;
  deleteTermsConditions: (id: string) => Promise<boolean>;
  toggleActiveStatus: (id: string) => Promise<TermsConditions | null>;
  duplicateTermsConditions: (id: string) => Promise<TermsConditions | null>;
  exportTermsConditions: (format: "json" | "pdf", id?: string) => Promise<void>;
  refreshTermsConditions: () => Promise<void>;
}

export function useTermsConditions(): UseTermsConditionsResult {
  const { push } = useToast();
  const [termsConditions, setTermsConditions] = useState<TermsConditions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchTermsConditions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await TermsConditionsService.getDefaultTermsConditions();
      if (response.success && response.data) {
        setTermsConditions(response.data);
      } else {
        // Create default if none exists
        const createResponse = await TermsConditionsService.createTermsConditions({
          headerSection: {
            title: "Terms & Conditions",
            subtitle: "Please read these terms and conditions carefully before using our service",
            image: "",
            imageAlt: "",
          },
          lastUpdated: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          sections: [],
          contactInfo: {
            email: "support@personalwings.com",
            phone: "+444 555 666 777",
            address: "123 Education Street, Learning City, ED 12345",
          },
          seoMeta: {
            title: "Terms & Conditions | Personal Wings",
            description: "Read our terms and conditions",
            keywords: [],
            canonicalUrl: "https://personalwings.com/terms-conditions",
          },
          isActive: true,
        });
        if (createResponse.success && createResponse.data) {
          setTermsConditions(createResponse.data);
        }
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to fetch Terms & Conditions";
      setError(errorMessage);
      push({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [push]);

  const createTermsConditions = useCallback(
    async (data: Partial<TermsConditions>): Promise<TermsConditions | null> => {
      setSaving(true);
      try {
        const response = await TermsConditionsService.createTermsConditions(data);
        if (response.success && response.data) {
          setTermsConditions(response.data);
          push({
            message: "Terms & Conditions created successfully!",
            type: "success",
          });
          return response.data;
        }
        throw new Error(response.message || "Failed to create Terms & Conditions");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to create Terms & Conditions";
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

  const updateTermsConditions = useCallback(
    async (id: string, data: Partial<TermsConditions>): Promise<TermsConditions | null> => {
      setSaving(true);
      try {
        const response = await TermsConditionsService.updateTermsConditions(id, data);
        if (response.success && response.data) {
          setTermsConditions(response.data);
          push({
            message: "Terms & Conditions updated successfully!",
            type: "success",
          });
          return response.data;
        }
        throw new Error(response.message || "Failed to update Terms & Conditions");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update Terms & Conditions";
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

  const updateTermsConditionsWithUpload = useCallback(
    async (id: string, formData: FormData): Promise<TermsConditions | null> => {
      setSaving(true);
      setUploadProgress(0);
      try {
        const response = await TermsConditionsService.updateTermsConditionsWithUpload(id, formData);
        if (response.success && response.data) {
          setTermsConditions(response.data);
          push({
            message: "Terms & Conditions updated successfully!",
            type: "success",
          });
          setUploadProgress(0);
          return response.data;
        }
        throw new Error(response.message || "Failed to update Terms & Conditions");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update Terms & Conditions";
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

  const deleteTermsConditions = useCallback(
    async (id: string): Promise<boolean> => {
      setSaving(true);
      try {
        const response = await TermsConditionsService.deleteTermsConditions(id);
        if (response.success) {
          push({
            message: "Terms & Conditions deleted successfully!",
            type: "success",
          });
          return true;
        }
        throw new Error(response.message || "Failed to delete Terms & Conditions");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete Terms & Conditions";
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
    async (id: string): Promise<TermsConditions | null> => {
      setSaving(true);
      try {
        const response = await TermsConditionsService.toggleActiveStatus(id);
        if (response.success && response.data) {
          setTermsConditions(response.data);
          push({
            message: `Terms & Conditions ${response.data.isActive ? "activated" : "deactivated"} successfully!`,
            type: "success",
          });
          return response.data;
        }
        throw new Error(response.message || "Failed to toggle Terms & Conditions status");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle Terms & Conditions status";
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

  const duplicateTermsConditions = useCallback(
    async (id: string): Promise<TermsConditions | null> => {
      setSaving(true);
      try {
        const response = await TermsConditionsService.duplicateTermsConditions(id);
        if (response.success && response.data) {
          push({
            message: "Terms & Conditions duplicated successfully!",
            type: "success",
          });
          return response.data;
        }
        throw new Error(response.message || "Failed to duplicate Terms & Conditions");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to duplicate Terms & Conditions";
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

  const exportTermsConditions = useCallback(
    async (format: "json" | "pdf", id?: string): Promise<void> => {
      setSaving(true);
      try {
        await TermsConditionsService.exportTermsConditions(format, id);
        push({
          message: `Terms & Conditions exported successfully as ${format.toUpperCase()}!`,
          type: "success",
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to export Terms & Conditions";
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

  const refreshTermsConditions = useCallback(async () => {
    await fetchTermsConditions();
  }, [fetchTermsConditions]);

  useEffect(() => {
    fetchTermsConditions();
  }, [fetchTermsConditions]);

  return {
    termsConditions,
    loading,
    saving,
    uploadProgress,
    error,
    fetchTermsConditions,
    createTermsConditions,
    updateTermsConditions,
    updateTermsConditionsWithUpload,
    deleteTermsConditions,
    toggleActiveStatus,
    duplicateTermsConditions,
    exportTermsConditions,
    refreshTermsConditions,
  };
}
