import type { ApprovalStatus } from "../types/approvals";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface Props {
  status?: ApprovalStatus;
  showIcon?: boolean;
}

export default function ApprovalBadge({ status = "pending", showIcon = true }: Props) {
  // Normalize status from backend (e.g. "PENDING_APPROVAL" -> "pending")
  const normalizedStatus = String(status).toLowerCase().replace('_approval', '') as any;

  const configs: any = {
    pending: {
      label: "Pending",
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200",
      icon: Clock
    },
    approved: {
      label: "Approved",
      bg: "bg-gray-900",
      text: "text-white",
      border: "border-gray-900",
      icon: CheckCircle2
    },
    rejected: {
      label: "Rejected",
      bg: "bg-gray-200",
      text: "text-gray-900",
      border: "border-gray-300",
      icon: XCircle
    },
    submitted: {
      label: "Submitted",
      bg: "bg-gray-50",
      text: "text-gray-500",
      border: "border-gray-200",
      icon: Clock
    }
  };

  const config = configs[normalizedStatus] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
      {showIcon && <Icon size={12} strokeWidth={2.5} />}
      {config.label}
    </span>
  );
}
