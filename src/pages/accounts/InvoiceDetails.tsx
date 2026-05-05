import { useState, useEffect, useRef } from "react";
import html2pdf from 'html2pdf.js';
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Edit, Loader2, CreditCard } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { financeService } from "../../services/financeService";
import type { Invoice, InvoiceItem } from "../../types/finance";
import AddPaymentModal from "../../components/modals/AddPaymentModal";
import { numberToWords } from "../../utils/numberToWords";

export default function InvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const isClient = user?.role === "CLIENT";

    const fetchInvoice = async () => {
        if (!id) return;
            try {
                setIsLoading(true);
                const data: any = await financeService.getInvoice(id);

                if (data && data.invoice) {
                    const inv = data.invoice;
                    const items = (data.items || []).map((it: any) => ({
                        id: it.id,
                        description: it.description,
                        quantity: it.quantity,
                        unitPrice: it.unit_price,
                        amount: it.total,
                        code: it.code
                    }));

                    const mappedInvoice: Invoice = {
                        id: inv.id,
                        invoiceNo: inv.invoice_number,
                        client: inv.client_name || inv.client,
                        customerCode: inv.customer_code,
                        clientId: inv.client_id,
                        status: inv.status,
                        date: inv.invoice_date,
                        dueDate: inv.due_date,
                        amount: inv.total_amount,
                        total: inv.total_amount,
                        taxRate: inv.tax_rate,
                        taxAmount: inv.tax_amount,
                        discount: inv.discount,
                        advance: Number(inv.amount_paid),
                        balance: Number(inv.balance_amount),
                        items: items,
                        division: inv.division,
                        branch: inv.division,
                        notes: inv.notes,
                        lpoNo: inv.lpo_no,
                        salesman: inv.salesman,
                        qid: inv.qid,
                        address: inv.address,
                        refType: inv.ref_type,
                        refNo: inv.reference_number,
                        paymentTerms: inv.payment_terms,
                        invoiceType: inv.invoice_type || "Credit",
                        approvalStatus: inv.approval_status
                    };
                    setInvoice(mappedInvoice);
                } else {
                    setError("Invoice data not found");
                }
            } catch (err: any) {
                console.error("Error fetching invoice:", err);
                setError(err.message || "Failed to load invoice");
            } finally {
                setIsLoading(false);
            }
        };

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 size={40} className="animate-spin text-brand-600" />
                <p className="text-slate-500 font-medium">Loading invoice details...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="p-6 text-center space-y-4">
                <div className="text-red-500 font-bold">{error || "Invoice not found."}</div>
                <button onClick={() => navigate(-1)} className="text-brand-600 hover:underline flex items-center gap-2 justify-center">
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    const handlePrint = () => {
        if (!invoiceRef.current) return;

        const element = invoiceRef.current;
        const opt = {
            margin: 0,
            filename: `Invoice_${invoice.invoiceNo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // New Promise-based usage:
        html2pdf().set(opt).from(element).save();
    };


    const items = invoice.items || [];
    const totalAmount = invoice.total || 0;
    const advance = invoice.advance || 0;
    const discount = invoice.discount || 0;
    const balance = invoice.balance || (totalAmount - advance);

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Invoice: {invoice.invoiceNo}</h1>
                    <StatusBadge status={invoice.status} />
                </div>
                <div className="flex gap-3">
                    {!isClient && invoice.status !== "PAID" && (
                        <button onClick={() => setIsPaymentModalOpen(true)} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition shadow-sm font-bold text-xs uppercase">
                            <CreditCard size={16} />
                            Record Payment
                        </button>
                    )}
                    {!isClient && (
                        <button onClick={() => navigate(`/edit-invoice/${id}`)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition shadow-sm font-bold text-xs uppercase">
                            <Edit size={16} />
                            Edit
                        </button>
                    )}
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm font-bold text-xs uppercase">
                        <Printer size={16} />
                        Download
                    </button>
                </div>
            </div>

            {/* OFFICIAL INVOICE DESIGN (Matches Image) */}
            <div ref={invoiceRef} className="max-w-[950px] mx-auto bg-white shadow-2xl p-6 print:p-0 print:shadow-none print:max-w-full font-serif text-black min-h-0 flex flex-col">

                {/* 1. Header (Names & Logo) */}
                <div className="flex justify-between items-center mb-2">
                    {/* Left: English Name */}
                    <div className="w-[35%] text-[18px] font-bold leading-tight">
                        {invoice.division?.toLowerCase() === 'mep' ? (
                            <>
                                Al Maha MEP Trading<br />
                                & Contracting W.L.L.
                            </>
                        ) : (
                            <>
                                Al Maha Maintenance<br />
                                & Electrical Equipment
                            </>
                        )}
                    </div>

                    {/* Center: Logo */}
                    <div className="w-[20%] flex flex-col items-center">
                        <img
                            src={invoice.division?.toLowerCase() === 'mep' ? "/logo_mep.png" : "/logo.png"}
                            alt="Logo"
                            className={`h-24 w-auto object-contain ${invoice.division?.toLowerCase() === 'mep' ? "bg-black p-1 rounded" : ""}`}
                        />
                    </div>

                    {/* Right: Arabic Name */}
                    <div className="w-[35%] text-right text-[22px] font-bold leading-tight" dir="rtl">
                        {invoice.division?.toLowerCase() === 'mep' ? (
                            <>
                                المها للتجارة<br />
                                والمقاولات ذ.م.م
                            </>
                        ) : (
                            <>
                                المها لبيع وصيانة<br />
                                الادوات والتمديدات الكهربائية
                            </>
                        )}
                    </div>
                </div>

                {/* 2. Sub-Header (License) */}
                <div className="text-center border-t border-b border-black py-1 mb-4">
                    <p className="text-[10px] font-black tracking-widest uppercase">
                        <span className="text-sky-500">KAHRAMAA</span> APPROVED MEP CONTRACTOR | GRADE B | <span className="text-rose-500">KM</span> LICENSE NO 1492
                    </p>
                </div>

                {/* 3. Title Bar */}
                <div className="bg-black text-white text-center py-1.5 mb-6">
                    <h2 className="text-xl font-black tracking-[0.3em] uppercase">INVOICE</h2>
                </div>

                {/* 4. Metadata Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm px-4">
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <span className="font-bold min-w-[70px]">Client:</span>
                            <span className="font-medium border-b border-dotted border-black flex-1">{invoice.client}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold min-w-[70px]">Project:</span>
                            <span className="font-medium border-b border-dotted border-black flex-1">{invoice.refNo || "General Maintenance"}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold min-w-[70px]">Location:</span>
                            <span className="font-medium border-b border-dotted border-black flex-1">{invoice.address || "Doha, Qatar"}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold min-w-[70px]">Pin No:</span>
                            <span className="font-medium border-b border-dotted border-black flex-1">{invoice.qid || "91210828"}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <span className="font-bold min-w-[70px]">Date:</span>
                            <span className="font-medium border-b border-dotted border-black flex-1">
                                {new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold min-w-[70px]">Ref No:</span>
                            <span className="font-medium border-b border-dotted border-black flex-1">{invoice.invoiceNo.split('-').pop()}</span>
                        </div>
                    </div>
                </div>

                {/* 5. Items Table */}
                <div className="border border-black mb-8 flex-1">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-black">
                                <th className="border-r border-black p-3 w-16 text-center text-xs font-black uppercase">S/N</th>
                                <th className="border-r border-black p-3 text-center text-xs font-black uppercase">Description</th>
                                <th className="p-3 w-32 text-center text-xs font-black uppercase">Total (QR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} className="border-b border-black">
                                    <td className="border-r border-black p-1 text-center text-[12px] font-medium align-middle">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td className="border-r border-black p-1 text-[12px] font-medium leading-tight align-middle italic uppercase">
                                        {item.description}
                                    </td>
                                    <td className="p-1 text-center text-[12px] font-bold align-middle">
                                        {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })} QR
                                    </td>
                                </tr>
                            ))}
                            {/* Empty rows to maintain size */}
                            {items.length < 2 && Array.from({ length: 2 - items.length }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-black h-8">
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-black bg-white">
                                <td colSpan={2} className="border-r border-black p-4 text-center text-base font-black uppercase tracking-wider">
                                    TOTAL IN QRS ({numberToWords(totalAmount)})
                                </td>
                                <td className="p-4 text-center text-lg font-black bg-slate-50">
                                    {Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 0 })} QR
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 7. Bank Details & Signature Section */}
                <div className="px-4 mb-4 space-y-4">
                    <div>
                        <h4 className="font-black text-[12px] border-b border-black pb-0.5 mb-2 uppercase tracking-widest">General Note:</h4>
                        <div className="space-y-2 text-[11px] font-bold">
                            <div className="flex items-start gap-2">
                                <span className="text-[10px] mt-0.5">◆</span>
                                <div>
                                    <p>Bank Transfer :</p>
                                    <div className="pl-6 mt-1 space-y-1">
                                        <p>Account Name: {invoice.division?.toLowerCase() === 'mep' ? "Al Maha MEP Trading & Contracting W.L.L." : "Al Maha Maintenance & Electrical Equipment"}</p>
                                        <p>IBAN: QA09 QIIB 0000 0000 1112 0931 6300 1</p>
                                        <p>Account No: 1112-093163-001</p>
                                    </div>
                                </div>
                            </div>
                            <p className="flex items-start gap-2">
                                <span className="text-[10px] mt-0.5">◆</span>
                                <span>Fawran No: 7444 5969 , Name: Sajidur Rahman</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-[10px] mt-0.5">◆</span>
                                <span>Cash or Cheque</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Signature & Stamp Area */}
                <div style={{ display: 'block', width: '100%', marginTop: '40px', pageBreakInside: 'avoid' }}>
                    
                    {/* RIGHT SIDE: Stamp and Details */}
                    <div style={{ position: 'relative', width: '180px', height: '180px', marginLeft: 'auto', marginRight: '30px', background: 'transparent' }}>
                        {/* Stamp */}
                        <img 
                            src="/stamp.png" 
                            alt="Company Stamp" 
                            style={{ width: '100%', height: 'auto', display: 'block', mixBlendMode: 'multiply' }}
                            onError={(e) => (e.currentTarget.style.display = 'none')} 
                        />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '8px', marginLeft: 'auto', marginRight: '30px', width: '180px' }}>
                        <p style={{ fontWeight: 900, fontSize: '14px', margin: 0 }}>Sajidur Rahman</p>
                        <p style={{ fontWeight: 700, fontSize: '11px', color: '#334155', margin: 0 }}>General Manager</p>
                    </div>
                </div>

                {/* 8. Bottom Footer (Contacts) */}
                <div className="border-t-2 border-black pt-4 pb-1">
                    <div className="flex justify-center gap-x-2 text-[10px] font-black text-center uppercase tracking-tighter">
                        <span>C.R NO: 83684</span>
                        <span>-</span>
                        <span>Tel: +974 4001 9555</span>
                        <span>-</span>
                        <span>Mob No: +974 7444 5969</span>
                        <span>-</span>
                        <span>P.O BOX: 9592</span>
                    </div>
                    <div className="flex justify-center gap-x-2 text-[10px] font-black text-center mt-1">
                        <span className="lowercase">Instagram: @almahacontracting.qa</span>
                        <span className="mx-1">|</span>
                        <span className="lowercase">E-mail: almaha263@gmail.com</span>
                    </div>
                </div>

                {/* Bottom Decorative Bar */}
                <div className="h-8 bg-gradient-to-r from-black via-slate-800 to-black mt-4" />

            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
                
                @media print {
                    .no-print { display: none !important; }
                    @page { 
                        size: A4; 
                        margin: 10mm; 
                    }
                    body { 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        -webkit-print-color-adjust: exact !important;
                    }
                    .p-6 { padding: 0 !important; }
                    .min-h-screen { min-height: auto !important; }
                    .max-w-\\[950px\\] { 
                        max-width: 100% !important; 
                        margin: 0 !important;
                        box-shadow: none !important;
                    }
                    @page { 
                        size: A4; 
                        margin: 15mm; 
                    }
                }
                
                .font-serif { font-family: 'Times New Roman', Times, serif; }
                [dir="rtl"] { font-family: 'Noto Sans Arabic', sans-serif; }
            `}</style>

            {/* Payment Modal */}
            {invoice && (
                <AddPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    invoice={invoice}
                    onSuccess={() => {
                        fetchInvoice();
                        setIsPaymentModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
