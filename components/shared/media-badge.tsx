"use client";

import { Badge } from "@/components/ui/badge";
import { useMediaCount } from "@/hooks/use-media-count";

interface MediaBadgeProps {
  variant?: "default" | "secondary";
  className?: string;
  isActive?: boolean;
}

export const MediaBadge = ({
  variant = "secondary",
  className,
  isActive = false,
}: MediaBadgeProps) => {
  const { data: mediaCount, isLoading } = useMediaCount();

  if (isLoading) {
    return (
      <Badge variant={variant} className={className}>
        ...
      </Badge>
    );
  }

  const count = mediaCount?.count || 0;

  return (
    <Badge variant={isActive ? "default" : variant} className={className}>
      {count}
    </Badge>
  );
};
