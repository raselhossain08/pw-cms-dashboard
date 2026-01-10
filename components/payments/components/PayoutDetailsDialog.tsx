import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Payout } from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/utils";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { Loader2 } from "lucide-react";

interface PayoutDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payout: Payout | null;
  onProcess: (payout: Payout) => void;
  loading: boolean;
}

export function PayoutDetailsDialog({
  open,
  onOpenChange,
  payout,
  onProcess,
  loading,
}: PayoutDetailsDialogProps) {
  if (!payout) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payout Details</DialogTitle>
        </DialogHeader>
        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Payout Amount</p>
              <h2 className="text-3xl font-bold text-gray-900">
                {formatCurrency(payout.totalEarnings)}
              </h2>
            </div>
            <PaymentStatusBadge status={payout.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Instructor</p>
              <p className="font-medium text-gray-900">
                {payout.instructorName}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Next Scheduled Payout</p>
              <p className="font-medium text-gray-900">{payout.nextPayout}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Instructor Information
            </h4>
            <div className="flex items-center p-4 bg-white border border-gray-200 rounded-lg">
              {payout.avatar ? (
                <img
                  className="h-12 w-12 rounded-full mr-4"
                  src={payout.avatar}
                  alt=""
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <span className="text-primary font-bold text-lg">
                    {payout.instructorName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 text-lg">
                  {payout.instructorName}
                </p>
                <p className="text-sm text-gray-500">{payout.email}</p>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-700 mr-2">
                    {payout.courseCount} Courses
                  </span>
                  <span>ID: {payout.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Payment Method
            </h4>
            <div className="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-50 p-2 rounded mr-3 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-banknote"
                  >
                    <rect width="20" height="12" x="2" y="6" rx="2" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M6 12h.01M18 12h.01" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bank Transfer</p>
                  <p className="text-xs text-gray-500">**** **** **** 4242</p>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                Verified
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {payout.status === "scheduled" && (
            <Button
              onClick={() => onProcess(payout)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Process Payout
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
