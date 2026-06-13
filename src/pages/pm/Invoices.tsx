import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import ApprovalBadge from "../../components/ApprovalBadge";
import { Eye, Trash2, Plus, ArrowLeft, Edit, Loader2, ChevronDown } from "lucide-react";
import { useActivity } from "../../context/ActivityContext";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";
import { financeService } from "../../services/financeService";
import type { Invoice, InvoiceStatus } from "../../types/finance";

function Invoices() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { logActivity } = useActivity();
    const { activeDivision } = useDivision();
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // 1. Fetch data
    const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
        queryKey: ["invoices", activeDivision],
        queryFn: financeService.getInvoices,
        select: (data: Invoice[]) => {
            const filteredByGlobal = activeDivision === "all" 
                ? data 
                : data.filter((item) => {
                    const branchLower = (item.division || item.branch || "Contracting").toLowerCase();
                    const activeLower = activeDivision.toLowerCase();
                    if (activeLower === "service") {
                        return branchLower === "service" || branchLower === "business";
                    }
                    return branchLower === activeLower;
                });

            return filteredByGlobal.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt || 0).getTime();
                const dateB = new Date(b.date || b.createdAt || 0).getTime();
                return dateB - dateA;
            });
        }
    });

    // 2. Mutations
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: InvoiceStatus }) => financeService.updatePaymentStatus(id, status),
        onSuccess: (_, variables) => {
            const inv = (invoices as Invoice[]).find((i) => i.id === variables.id);
            logActivity(`Marked Invoice ${inv?.invoiceNo} as ${variables.status}`, "finance", "/invoices", inv?.invoiceNo);
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: financeService.deleteInvoice,
        onSuccess: (_, id) => {
            const inv = (invoices as Invoice[]).find((i) => i.id === id);
            logActivity(`Deleted Invoice ${inv?.invoiceNo}`, "finance", "/invoices", inv?.invoiceNo);
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        }
    });

    const toggleStatus = (id: string, currentStatus: string, invoiceNo: string) => {
        const isPaid = currentStatus?.toUpperCase() === "PAID";
        const newStatus = (isPaid ? "Unpaid" : "Paid") as InvoiceStatus;
        if (window.confirm(`Mark invoice ${invoiceNo} as ${newStatus}?`)) {
            updateStatusMutation.mutate({ id, status: newStatus });
        }
    };

    const handleDelete = (id: string, invoiceNo: string) => {
        if (window.confirm(`Are you sure you want to delete invoice ${invoiceNo}?`)) {
            deleteMutation.mutate(id);
        }
    };

    const filteredInvoices = (invoices as any[]).filter((inv) => {
        if (statusFilter === "all") return true;
        return inv.status?.toLowerCase() === statusFilter.toLowerCase();
    });

    const tableData = filteredInvoices.map((invoice) => ({
        ...invoice,
        "Invoice No": invoice.invoice_number || invoice.invoiceNo,
        "Client": invoice.client_name || invoice.company_name || invoice.client || "N/A",
        "Sector": (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                (invoice.division?.toLowerCase() === 'service' || invoice.branch?.toLowerCase() === 'service' || invoice.branch?.toLowerCase() === 'business') ? 'bg-amber-100 text-amber-600' :
                (invoice.division?.toLowerCase() === 'trading' || invoice.branch?.toLowerCase() === 'trading') ? 'bg-emerald-100 text-emerald-600' :
                'bg-blue-100 text-blue-600'
            }`}>
                {invoice.branch?.toLowerCase() === 'business' ? 'Service' : (invoice.division || invoice.branch || 'Contracting')}
            </span>
        ),
        "Ref Type": invoice.ref_type || invoice.refType || "General",
        "Ref No": invoice.ref_no || invoice.refNo || "-",
        "Total": `QAR ${Number(invoice.total_amount || 0).toLocaleString()}`,
        "Balance": `QAR ${Number(invoice.balance_amount || 0).toLocaleString()}`,
        "Status": <StatusBadge status={invoice.status} />,
        "Date": (() => {
            const dateStr = String(invoice.invoice_date || invoice.date || invoice.createdAt || "-");
            return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        })(),
        "Actions": (
            <div className="flex gap-2 items-center">
                <Link to={`/invoice-details/${invoice.id}`} title="View" className="p-1 text-slate-400 hover:text-brand-600 transition-colors">
                    <Eye size={16} />
                </Link>
                <Link to={`/edit-invoice/${invoice.id}`} title="Edit" className="p-1 text-slate-400 hover:text-brand-600 transition-colors">
                    <Edit size={16} />
                </Link>
                <button
                    onClick={() => handleDelete(invoice.id!, invoice.invoiceNo!)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending && deleteMutation.variables === invoice.id ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Trash2 size={16} />
                    )}
                </button>
            </div>
        )
    }));

    const columns = ["Invoice No", "Client", "Sector", "Total", "Balance", "Status", "Date", "Actions"];

    const currentDivision = DIVISIONS.find(d => d.id === activeDivision);
    const pageTitle = activeDivision === "all" ? "All Sales Invoices" : `${currentDivision?.label} Invoices`;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">{pageTitle}</h1>
                        <p className="text-slate-500">Manage invoices and payment statuses for {currentDivision?.label || "all sectors"}</p>
                    </div>
                </div>
                <Link
                    to="/create-invoice"
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm"
                >
                    <Plus size={16} />
                    Create Invoice
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 size={40} className="animate-spin text-brand-600" />
                        <p className="text-sm font-medium">Loading invoices...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={tableData}
                        filters={
                            <div className="relative w-full sm:w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none w-full bg-white border border-slate-200 text-slate-600 pl-3 pr-9 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm font-bold text-xs uppercase outline-none cursor-pointer focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="paid">Paid</option>
                                    <option value="unpaid">Unpaid</option>
                                    <option value="due">Due</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        }
                    />
                )}
            </div>
        </div>
    );
}

export default Invoices;
