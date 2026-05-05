interface Props {
  status: string;
}

const statusStyles: Record<string, string> = {
  "New": "bg-gray-100 text-gray-600 ring-gray-200",
  "Submitted": "bg-gray-100 text-gray-700 ring-gray-200",
  "Under Process": "bg-gray-50 text-gray-800 ring-gray-200",
  "Approved": "bg-gray-900 text-white ring-gray-900",
  "Completed": "bg-gray-200 text-gray-800 ring-gray-300",
  "Delivered": "bg-gray-100 text-gray-700 ring-gray-200",
  "Paid": "bg-gray-800 text-white ring-gray-800",
  "Unpaid": "bg-gray-50 text-gray-900 ring-gray-200",
  "Pending": "bg-gray-100 text-gray-700 ring-gray-200",
  "Overdue": "bg-gray-50 text-gray-900 ring-gray-200",
  "Due": "bg-gray-200 text-gray-800 ring-gray-300",
  "Active": "bg-gray-800 text-white ring-gray-800",
  "Inactive": "bg-gray-100 text-gray-400 ring-gray-200",
  "Expiring Soon": "bg-gray-100 text-gray-700 ring-gray-200",
  "Expired": "bg-gray-50 text-gray-500 ring-gray-200",
  "EXPIRING SOON": "bg-gray-100 text-gray-700 ring-gray-200",
  "EXPIRED": "bg-gray-50 text-gray-500 ring-gray-200",
  "In Progress": "bg-gray-50 text-gray-800 ring-gray-200",
  "COMPLETED": "bg-gray-200 text-gray-800 ring-gray-300",
  "Cancelled": "bg-gray-50 text-gray-400 ring-gray-200",
};

function StatusBadge({ status }: Props) {
  if (!status) return <span className="text-[10px] text-slate-400">N/A</span>;

  // Normalize string for lookup: "PENDING_APPROVAL" -> "Pending Approval"
  const normalizedStatus = status.replace(/_/g, ' ').split(' ').map(word => 
    word ? (word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) : ''
  ).join(' ');

  let displayStatus = normalizedStatus;
  if (normalizedStatus.toUpperCase() === "PENDING") displayStatus = "Unpaid";
  if (normalizedStatus.toUpperCase() === "PARTIAL") displayStatus = "Due";

  const style = statusStyles[displayStatus] || statusStyles[normalizedStatus] || statusStyles[status] || "bg-gray-100 text-gray-600 ring-gray-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] rounded-full font-medium ring-1 ring-inset ${style}`}>
      <span
        className={`w-1 h-1 rounded-full mr-1.5 ${style.includes("bg-gray-900") || style.includes("bg-gray-800") ? "bg-white" : "bg-gray-400"}`}/>
      {displayStatus}
    </span>
  );
}

export default StatusBadge;