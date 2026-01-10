import React from "react";
import {
  ArrowUp,
  TrendingUp,
  CreditCard,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PaymentAnalytics } from "@/hooks/usePayments";

interface PaymentStatsProps {
  analytics: PaymentAnalytics | null;
  loading: boolean;
}

export function PaymentStats({ analytics, loading }: PaymentStatsProps) {
  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-secondary mt-1">
              {formatCurrency(analytics.overview.totalRevenue)}
            </p>
            <p className="text-accent text-sm mt-1">
              <ArrowUp className="inline w-3 h-3" /> Active payments
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-primary w-6 h-6" />
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">
              Successful Payments
            </p>
            <p className="text-2xl font-bold text-secondary mt-1">
              {analytics.overview.successfulPayments}
            </p>
            <p className="text-accent text-sm mt-1">Completed transactions</p>
          </div>
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <CreditCard className="text-accent w-6 h-6" />
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Refund Rate</p>
            <p className="text-2xl font-bold text-secondary mt-1">
              {analytics.overview.refundRate}%
            </p>
            <p className="text-accent text-sm mt-1">
              {formatCurrency(analytics.overview.refundedAmount)} refunded
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <DollarSign className="text-yellow-600 w-6 h-6" />
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">
              Failed Payments
            </p>
            <p className="text-2xl font-bold text-secondary mt-1">
              {analytics.overview.failedPayments}
            </p>
            <p className="text-accent text-sm mt-1">Requires attention</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="text-red-600 w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
