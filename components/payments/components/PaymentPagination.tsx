import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaymentPaginationProps {
  page: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function PaymentPagination({
  page,
  totalPages,
  loading,
  onPageChange,
}: PaymentPaginationProps) {
  if (!totalPages || !page) return null;

  const currentPage = page;
  const pages = [];

  // Show max 5 page numbers
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 4);
    } else {
      startPage = Math.max(1, endPage - 4);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        className="border-gray-300"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === currentPage ? "default" : "outline"}
          className={p === currentPage ? "" : "border-gray-300"}
          onClick={() => onPageChange(p)}
          disabled={loading}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="border-gray-300"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
