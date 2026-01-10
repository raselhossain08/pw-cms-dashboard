import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateInvoice: (data: any) => Promise<boolean>;
  loading: boolean;
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  onCreateInvoice,
  loading,
}: CreateInvoiceDialogProps) {
  const [invoiceForm, setInvoiceForm] = useState({
    studentName: "",
    studentEmail: "",
    course: "",
    amount: "",
    paymentMethod: "Credit Card",
    invoiceDate: new Date().toISOString().split("T")[0],
    notes: "",
    sendEmail: true,
    markAsPaid: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.studentEmail || !invoiceForm.amount) return;

    const success = await onCreateInvoice({
      user: invoiceForm.studentEmail,
      amount: parseFloat(invoiceForm.amount),
      billingInfo: {
        companyName: invoiceForm.studentName,
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
      items: [
        {
          description: invoiceForm.course || "Course Payment",
          quantity: 1,
          unitPrice: parseFloat(invoiceForm.amount),
          total: parseFloat(invoiceForm.amount),
        },
      ],
      status: invoiceForm.markAsPaid ? "paid" : "pending",
      invoiceDate: invoiceForm.invoiceDate,
    });

    if (success) {
      onOpenChange(false);
      setInvoiceForm({
        studentName: "",
        studentEmail: "",
        course: "",
        amount: "",
        paymentMethod: "Credit Card",
        invoiceDate: new Date().toISOString().split("T")[0],
        notes: "",
        sendEmail: true,
        markAsPaid: false,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a student
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={invoiceForm.studentName}
                onChange={(e) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    studentName: e.target.value,
                  })
                }
                placeholder="Enter student name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={invoiceForm.studentEmail}
                onChange={(e) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    studentEmail: e.target.value,
                  })
                }
                placeholder="student@example.com"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <Input
                type="text"
                value={invoiceForm.course}
                onChange={(e) =>
                  setInvoiceForm({ ...invoiceForm, course: e.target.value })
                }
                placeholder="Course name or description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={invoiceForm.amount}
                onChange={(e) =>
                  setInvoiceForm({ ...invoiceForm, amount: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <Select
                value={invoiceForm.paymentMethod}
                onValueChange={(value) =>
                  setInvoiceForm({ ...invoiceForm, paymentMethod: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date
              </label>
              <Input
                type="date"
                value={invoiceForm.invoiceDate}
                onChange={(e) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    invoiceDate: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <Textarea
              value={invoiceForm.notes}
              onChange={(e) =>
                setInvoiceForm({ ...invoiceForm, notes: e.target.value })
              }
              rows={3}
              placeholder="Additional details"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Invoice Options
            </label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={invoiceForm.sendEmail}
                onCheckedChange={(checked) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    sendEmail: checked === true,
                  })
                }
              />
              <label
                htmlFor="sendEmail"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send invoice via email
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="markAsPaid"
                checked={invoiceForm.markAsPaid}
                onCheckedChange={(checked) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    markAsPaid: checked === true,
                  })
                }
              />
              <label
                htmlFor="markAsPaid"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as paid automatically
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
