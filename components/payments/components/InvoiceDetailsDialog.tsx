import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/hooks/usePayments";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { Download, Mail } from "lucide-react";

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onDownload: (invoice: Invoice) => void;
  onSendEmail: (invoice: Invoice) => void;
}

export function InvoiceDetailsDialog({
  open,
  onOpenChange,
  invoice,
  onDownload,
  onSendEmail,
}: InvoiceDetailsDialogProps) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Invoice Details</DialogTitle>
          <div className="flex space-x-2 mr-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(invoice)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendEmail(invoice)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Invoice
            </Button>
          </div>
        </DialogHeader>

        <div
          className="bg-white p-8 border border-gray-200 shadow-sm rounded-lg"
          id="invoice-preview"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b pb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">INVOICE</h1>
              <p className="text-gray-500 font-mono">
                #{invoice.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <PaymentStatusBadge status={invoice.status} />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Billed To:</p>
              <h4 className="font-semibold text-gray-900">
                {invoice.user?.firstName} {invoice.user?.lastName}
              </h4>
              <p className="text-gray-600 text-sm">
                {invoice.billingInfo?.companyName}
              </p>
              <p className="text-gray-600 text-sm">{invoice.user?.email}</p>
              {invoice.billingInfo?.address && (
                <p className="text-gray-600 text-sm">
                  {invoice.billingInfo.address}
                  <br />
                  {invoice.billingInfo.city}, {invoice.billingInfo.state}{" "}
                  {invoice.billingInfo.zipCode}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Invoice Date:</p>
                <p className="font-medium text-gray-900">
                  {formatDate(invoice.invoiceDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Due Date:</p>
                <p className="font-medium text-gray-900">
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item, idx) => (
                  <tr key={`${item.description}-${idx}`}>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(invoice.tax || 0)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
