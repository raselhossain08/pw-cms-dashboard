"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  lmsConnectionsService,
  type Breadcrumb as BreadcrumbItem,
} from "@/services/lms-connections.service";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbProps {
  entityType: string;
  entityId: string;
  className?: string;
}

export function LMSBreadcrumb({
  entityType,
  entityId,
  className = "",
}: BreadcrumbProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["breadcrumb", entityType, entityId],
    queryFn: () => lmsConnectionsService.getBreadcrumb(entityType, entityId),
    enabled: !!entityType && !!entityId,
    staleTime: 300000, // 5 minutes
  });

  if (isLoading || !data) {
    return (
      <div
        className={`flex items-center gap-2 text-sm animate-pulse ${className}`}
      >
        <div className="w-16 h-4 bg-slate-200 rounded" />
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <div className="w-24 h-4 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <nav
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {data.breadcrumb.map((item: BreadcrumbItem, index: number) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            {item.current ? (
              <span className="font-semibold text-blue-600 flex items-center gap-1">
                {index === 0 && <Home className="w-4 h-4" />}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.path}
                className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                {index === 0 && <Home className="w-4 h-4" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface SimpleBreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}

export function SimpleBreadcrumb({
  items,
  className = "",
}: SimpleBreadcrumbProps) {
  return (
    <nav
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-blue-600">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
