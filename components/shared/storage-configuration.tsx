"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";

export const StorageConfiguration = () => {
  const [storageLimit, setStorageLimit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateLimit = async () => {
    if (storageLimit <= 0) {
      toast.error("Invalid Storage Limit", {
        description: "Storage limit must be greater than 0 GB",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.patch("/system-status/storage/limit", {
        limitGB: storageLimit,
      });

      toast.success("Storage Limit Updated", {
        description: `Storage limit set to ${storageLimit}GB. Update your .env file and restart the server to persist this change.`,
      });

      console.log("Storage limit update response:", response.data);
    } catch (error: any) {
      toast.error("Failed to Update Storage Limit", {
        description:
          error.message || "An error occurred while updating the storage limit",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Storage Configuration</CardTitle>
        <CardDescription>
          Configure the storage limit for your CMS uploads directory
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="storage-limit">Storage Limit (GB)</Label>
          <Input
            id="storage-limit"
            type="number"
            min="1"
            max="1000"
            value={storageLimit}
            onChange={(e) => setStorageLimit(parseInt(e.target.value) || 0)}
            placeholder="Enter storage limit in GB"
          />
        </div>
        <Button
          onClick={handleUpdateLimit}
          disabled={isLoading || storageLimit <= 0}
          className="w-full"
        >
          {isLoading ? "Updating..." : "Update Storage Limit"}
        </Button>
        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Note:</strong> To permanently apply this change:
          </p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>
              Update <code>STORAGE_LIMIT_GB={storageLimit}</code> in your{" "}
              <code>.env</code> file
            </li>
            <li>Restart the backend server</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
