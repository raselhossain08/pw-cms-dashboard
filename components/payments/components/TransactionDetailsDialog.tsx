import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/hooks/usePayments";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import {
  CreditCard,
  User,
  Calendar,
  DollarSign,
  FileText,
  Hash,
  CheckCircle2,
} from "lucide-react";

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailsDialogProps) {
  if (!transaction) return null;

  const detailItems = [
    {
      icon: Hash,
      label: "Transaction ID",
      value: transaction.transactionId,
    },
    {
      icon: User,
      label: "Customer",
      value: transaction.user
        ? `${transaction.user.firstName || "Unknown"} ${
            transaction.user.lastName || "User"
          }`
        : "Customer information unavailable",
      subValue:
        transaction.user?.email || `Transaction: ${transaction.transactionId}`,
    },
    {
      icon: DollarSign,
      label: "Amount",
      value: formatCurrency(transaction.amount, transaction.currency),
      badge: (
        <span className="text-xs text-gray-500 ml-2">
          {transaction.currency}
        </span>
      ),
    },
    {
      icon: CreditCard,
      label: "Payment Gateway",
      value: transaction.gateway,
      className: "capitalize",
    },
    {
      icon: FileText,
      label: "Description",
      value: transaction.description,
    },
    {
      icon: Calendar,
      label: "Created At",
      value: formatDateTime(transaction.createdAt),
    },
    {
      icon: CheckCircle2,
      label: "Processed At",
      value: transaction.processedAt
        ? formatDateTime(transaction.processedAt)
        : "Not processed",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Section */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <PaymentStatusBadge status={transaction.status} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Type</p>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {transaction.type}
              </span>
            </div>
          </div>

          {/* Transaction Details Grid */}
          <div className="space-y-4">
            {detailItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.label}-${index}`}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {item.label}
                    </p>
                    <p
                      className={`text-sm font-medium text-gray-900 break-words ${
                        item.className || ""
                      }`}
                    >
                      {item.value}
                      {item.badge}
                    </p>
                    {item.subValue && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.subValue}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gateway Transaction ID */}
          {transaction.gatewayTransactionId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Gateway Transaction ID
              </p>
              <p className="text-xs font-mono text-blue-700 break-all">
                {transaction.gatewayTransactionId}
              </p>
            </div>
          )}

          {/* Refund Information */}
          {transaction.status === "refunded" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-yellow-900">
                  Refund Information
                </p>
                {transaction.refundAmount && (
                  <span className="text-sm font-semibold text-yellow-900">
                    {formatCurrency(
                      transaction.refundAmount,
                      transaction.currency
                    )}
                  </span>
                )}
              </div>
              {transaction.refundReason && (
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Reason:</span>{" "}
                  {transaction.refundReason}
                </p>
              )}
              {transaction.refundedAt && (
                <p className="text-xs text-yellow-700">
                  Refunded on {formatDateTime(transaction.refundedAt)}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
