import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let variant = "bg-slate-100 text-slate-800 border-slate-200";

  switch (status.toLowerCase()) {
    case "verified":
    case "completed":
    case "approved":
    case "low":
      variant = "bg-green-100 text-green-800 border-green-200";
      break;
    case "in progress":
    case "pending":
    case "medium":
      variant = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case "needs review":
    case "requires manual review":
    case "pendingreview":
      variant = "bg-amber-100 text-amber-800 border-amber-200";
      break;
    case "high":
    case "rejected":
    case "failed":
      variant = "bg-red-100 text-red-800 border-red-200";
      break;
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", 
      variant, 
      className
    )}>
      {status}
    </span>
  );
}
