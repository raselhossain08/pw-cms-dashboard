import React from "react";
import { Transaction } from "@/hooks/usePayments";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentPagination } from "./PaymentPagination";
import { Loader2, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionsTableProps {
  transactions: Transaction[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onViewDetails: (transaction: Transaction) => void;
  onRefund: (transaction: Transaction) => void;
}

export function TransactionsTable({
  transactions,
  loading,
  pagination,
  onPageChange,
  onViewDetails,
  onRefund,
}: TransactionsTableProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-secondary">
          Recent Transactions
        </h3>
        <p className="text-gray-600 text-sm">
          Latest financial activity from all sources
        </p>
      </div>
      {loading && transactions.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-12">
          <DollarSign className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No transactions found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Transaction ID",
                    "Date",
                    "Customer",
                    "Amount",
                    "Status",
                    "Method",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-primary">
                        {transaction.transactionId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.user?.email ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.user.firstName || "Unknown"}{" "}
                            {transaction.user.lastName || "User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.user.email}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400 italic">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Customer information unavailable
                          </div>
                          <div className="text-xs mt-1">
                            Transaction ID: {transaction.transactionId}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentStatusBadge status={transaction.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {transaction.gateway}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(transaction)}
                          className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                          Details
                        </Button>
                        {transaction.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRefund(transaction)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination &&
            pagination.page &&
            pagination.limit &&
            pagination.total && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  transactions
                </div>
                <PaymentPagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  loading={loading}
                  onPageChange={onPageChange}
                />
              </div>
            )}
        </>
      )}
    </div>
  );
}
