import React from "react";
import { Invoice } from "@/hooks/usePayments";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentPagination } from "./PaymentPagination";
import { Loader2, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoicesTableProps {
  invoices: Invoice[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export function InvoicesTable({
  invoices,
  loading,
  pagination,
  onPageChange,
  onViewInvoice,
}: InvoicesTableProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-secondary">Invoices</h3>
        <p className="text-gray-600 text-sm">Manage and view all invoices</p>
      </div>
      {loading && invoices.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No invoices found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Invoice Number",
                    "Customer",
                    "Amount",
                    "Status",
                    "Invoice Date",
                    "Due Date",
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
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {invoice.user?.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={invoice.user.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                              {invoice.user?.firstName?.charAt(0)}
                              {invoice.user?.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.user?.firstName} {invoice.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentStatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewInvoice(invoice)}
                        className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
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
                  invoices
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
