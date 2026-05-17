import { Badge } from "@/components/ui/badge"
import { OrderStatus } from "@/types"

interface StatusBadgeProps {
  status: OrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<OrderStatus, "pending" | "in_progress" | "completed" | "cancelled"> = {
    pending: "pending",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled",
  }

  const labels: Record<OrderStatus, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  }

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  )
}
