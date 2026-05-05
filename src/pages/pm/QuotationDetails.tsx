import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useRef } from "react";
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Printer, Edit } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { numberToWords } from "../../utils/numberToWords";
import { printDocument } from "../../utils/exportUtils";
import BusinessProposalView from "./BusinessProposalView";
import ElectricalQuotationView from "./ElectricalQuotationView";
import InvoiceView from "./InvoiceView";
import type { Quotation, QuotationItem } from "../../types/pm";
import { useQuery } from "@tanstack/react-query";
import { quotationService } from "../../services/quotationService";
import { useAuth } from "../../context/AuthContext";

export default function QuotationDetails() {
    const documentRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isInvoice = location.pathname.includes("invoice");

    const { data: rawQuotation, isLoading, error } = useQuery({
        queryKey: ["quotation", id],
        queryFn: () => quotationService.getQuotation(id!),
        enabled: !!id
    });

    if (isLoading) return <div className="p-6 text-center text-slate-500">Loading quotation details...</div>;

    if (error || !rawQuotation) {
        return (
            <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-100 max-w-2xl mx-auto my-12">
                <p className="text-red-500 mb-4 font-bold text-xl">Quotation Not Found</p>
                <p className="text-slate-500 mb-6">The record you are looking for might have been deleted or moved.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition"
                >
                    Return to List
                </button>
            </div>
        );
    }

    // Explicit Mapping for compatibility with the view
    const q: any = rawQuotation;
    const quotation: Quotation = {
        ...q,
        id: q.id,
        "Quote ID": q.qtn_number || q.id,
        refNo: q.qtn_number || q.id,
        project: q.project_name || q.project || "N/A",
        client: q.client_name || q.client_company || q.client || "N/A",
        totalAmount: Number(q.total_amount || 0),
        Status: q.status || "Submitted",
        branch: q.division || "Contracting",
        date: q.created_at || q.date || new Date().toISOString(),
        docTitle: q.doc_title || q.docTitle || "FIRE ALARM AND FIGHTING QUOTATION"
    };

    const handlePrint = () => {
        if (!documentRef.current) return;

        const element = documentRef.current;
        const opt = {
            margin: 0,
            filename: `${isInvoice ? 'Invoice' : 'Quotation'}_${quotation.refNo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    const branch = quotation.branch || "Contracting";
    const isTrading = branch.toLowerCase() === "trading";
    const isBusiness = branch.toLowerCase() === "business" || branch.toLowerCase() === "service";
    const selectedCompanyId = localStorage.getItem("selectedCompanyId");
    const isMEP = selectedCompanyId === "mep" || branch.toLowerCase() === "mep";
    const title = isTrading ? "Al Maha Trading" : (isBusiness ? "Al Maha Business Services" : "Al Maha Contracting");
    const headerColor = isTrading ? "bg-[#8dc63f]" : (isBusiness ? "bg-[#1a1a1a]" : "bg-[#8dc63f]");

    // Ensure items exist
    const items = quotation.items || [];

    const totalAmount = quotation.totalAmount || 0;
    const discount = 0;
    const netTotal = totalAmount - discount;

    // Format Date
    const qDate = new Date(quotation.date || new Date().toISOString());
    const dayStr = qDate.toLocaleDateString('en-GB', { day: '2-digit' });
    const monthStr = qDate.toLocaleDateString('en-GB', { month: 'long' }).toUpperCase();
    const yearStr = qDate.getFullYear();

    const dayNum = qDate.getDate();
    const j = dayNum % 10, k = dayNum % 100;
    let suffix = "TH";
    if (j == 1 && k != 11) suffix = "ST";
    if (j == 2 && k != 12) suffix = "ND";
    if (j == 3 && k != 13) suffix = "RD";

    // All standard quotations (Maintenance & MEP) now use the same dynamic ElectricalQuotationView
    if (selectedCompanyId === "maintenance" || selectedCompanyId === "mep" || !isBusiness) {
        return (
            <div className="bg-slate-50 min-h-screen">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 no-print font-sans">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-2xl font-bold">
                                {isInvoice ? "Invoice" : (isMEP ? "MEP Quotation" : "Quotation")}: {quotation["Quote ID"] || quotation.id}
                            </h1>
                            <StatusBadge status={quotation.Status || "Submitted"} />
                        </div>
                        <div className="flex gap-3">
                            {user?.role !== "CLIENT" && (
                                <button onClick={() => navigate('/edit-quotation/' + (quotation["Quote ID"] || quotation.id))} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition bg-white font-medium">
                                    <Edit size={16} /> Edit
                                </button>
                            )}
                            <button onClick={handlePrint} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm font-medium">
                                <Printer size={16} /> Download
                            </button>
                        </div>
                    </div>
                    <div ref={documentRef}>
                        {isInvoice ? (
                            <InvoiceView quotation={quotation} />
                        ) : (
                            <ElectricalQuotationView quotation={quotation} />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (isBusiness) {
        return (
            <div className="bg-slate-50 min-h-screen">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 no-print font-sans">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-2xl font-bold">Business Proposal: {quotation["Quote ID"] || quotation.id}</h1>
                            <StatusBadge status={quotation.Status || "Submitted"} />
                        </div>
                        <div className="flex gap-3">
                            {user?.role !== "CLIENT" && (
                                <button onClick={() => navigate('/edit-quotation/' + (quotation["Quote ID"] || quotation.id))} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition bg-white font-medium">
                                    <Edit size={16} /> Edit
                                </button>
                            )}
                            <button onClick={handlePrint} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm font-medium">
                                <Printer size={16} /> Download
                            </button>
                        </div>
                    </div>
                    <div ref={documentRef}>
                        <BusinessProposalView quotation={quotation} />
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
