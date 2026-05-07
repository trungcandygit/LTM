import { ORDER_STATUS_MAP } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const statusInfo = ORDER_STATUS_MAP[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        statusInfo.color,
        className
      )}
    >
      {statusInfo.label}
    </span>
  );
}
