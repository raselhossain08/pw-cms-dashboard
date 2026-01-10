import React from "react";
import { Payout } from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/utils";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentPagination } from "./PaymentPagination";
import { Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PayoutsTableProps {
  payouts: Payout[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onViewDetails: (payout: Payout) => void;
  onProcessPayout: (payout: Payout) => void;
}

export function PayoutsTable({
  payouts,
  loading,
  pagination,
  onPageChange,
  onViewDetails,
  onProcessPayout,
}: PayoutsTableProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-secondary">
          Instructor Payouts
        </h3>
        <p className="text-gray-600 text-sm">
          Upcoming payouts and earnings by instructor
        </p>
      </div>
      {loading && payouts.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-12">
          <DollarSign className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No payouts found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Payout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {payout.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={payout.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                              {payout.instructorName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payout.instructorName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payout.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payout.courseCount} courses
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payout.totalEarnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payout.nextPayout}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentStatusBadge status={payout.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(payout)}
                          className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                          Details
                        </Button>
                        {payout.status === "scheduled" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onProcessPayout(payout)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            disabled={loading}
                          >
                            Process
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
                  payouts
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
