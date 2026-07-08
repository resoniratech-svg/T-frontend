import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Edit, Loader2, FileText } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { financeService } from "../../services/financeService";
import { printDocument, downloadDocx } from "../../utils/exportUtils";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign, ImageRun } from "docx";
import converter from 'number-to-words';
import type { Invoice, InvoiceItem } from "../../types/finance";

export default function InvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isClient = user?.role === "CLIENT";

    useEffect(() => {
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
                        client: inv.client_company || inv.client_name || inv.client,
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
        const currentDate = new Date().toISOString().split('T')[0];
        const safeClientName = (invoice.client || "Client").replace(/[^a-zA-Z0-9 -]/g, '').trim();
        printDocument(`${safeClientName}_${currentDate}`);
    };

    const handleWordExport = async () => {
        const currentDate = new Date().toISOString().split('T')[0];
        const safeClientName = (invoice.client || "Client").replace(/[^a-zA-Z0-9 -]/g, '').trim();
        const blob = await generateDocx(invoice);
        downloadDocx(blob, `${safeClientName}_${currentDate}`);
    };

    const generateDocx = async (invoice: Invoice): Promise<Blob> => {
        const items = invoice.items || [];
        const totalAmount = invoice.total || 0;
        const advance = invoice.advance || 0;
        const discount = invoice.discount || 0;
        const balance = invoice.balance || (totalAmount - advance);

        let sectorName = "Contracting Sector";
        if (invoice.branch?.toLowerCase() === "service" || invoice.branch?.toLowerCase() === "business") {
            sectorName = "Service Sector";
        } else if (invoice.branch?.toLowerCase() === "trading") {
            sectorName = "Trading Sector";
        }

        const createCell = (text: string, bold: boolean = false, align: AlignmentType = AlignmentType.LEFT, colspan: number = 1, borders: any = {}, fill?: string) => {
            return new TableCell({
                columnSpan: colspan,
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                borders: borders,
                verticalAlign: VerticalAlign.CENTER,
                shading: fill ? { fill: fill } : undefined,
                children: [new Paragraph({
                    alignment: align,
                    children: [new TextRun({ text: text, bold: bold, size: 20 })]
                })]
            });
        };

        let logoImage: ArrayBuffer | null = null;
        try {
            const response = await fetch('/logo.png');
            if (response.ok) {
                logoImage = await response.arrayBuffer();
            }
        } catch (e) {
            console.error("Failed to load logo", e);
        }

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
                    },
                },
                children: [
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                            bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                            left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                            right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                            insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "000000" }
                        },
                        rows: [
                            // Header Row
                            new TableRow({
                                children: [
                                    new TableCell({
                                        columnSpan: 6,
                                        margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                        borders: { bottom: { style: BorderStyle.NONE } },
                                        children: [
                                            new Table({
                                                width: { size: 100, type: WidthType.PERCENTAGE },
                                                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
                                                rows: [
                                                    new TableRow({
                                                        children: [
                                                            new TableCell({
                                                                width: { size: 30, type: WidthType.PERCENTAGE },
                                                                children: [
                                                                    new Paragraph({
                                                                        children: logoImage ? [
                                                                            new ImageRun({
                                                                                data: logoImage,
                                                                                transformation: { width: 120, height: 80 }
                                                                            })
                                                                        ] : [new TextRun({ text: "TREK GROUP", bold: true, size: 28 })]
                                                                    })
                                                                ]
                                                            }),
                                                            new TableCell({
                                                                width: { size: 40, type: WidthType.PERCENTAGE },
                                                                children: [
                                                                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "INVOICE", bold: true, size: 48 })] })
                                                                ],
                                                                verticalAlign: VerticalAlign.CENTER
                                                            }),
                                                            new TableCell({
                                                                width: { size: 30, type: WidthType.PERCENTAGE },
                                                                children: [
                                                                    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "TREK GROUP TRADING CONTRACTING AND SERVICES", bold: true, color: "64748b", size: 16 })] })
                                                                ],
                                                                verticalAlign: VerticalAlign.TOP
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            // Info Row
                            new TableRow({
                                children: [
                                    new TableCell({
                                        columnSpan: 3,
                                        margins: { top: 150, bottom: 150, left: 150, right: 150 },
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: "Invoice Type:\t", bold: true, size: 18 }), new TextRun({ text: invoice.invoiceType || "Credit", size: 18 })] }),
                                            new Paragraph({ children: [new TextRun({ text: "Company Name:\t", bold: true, size: 18 }), new TextRun({ text: invoice.client, bold: true, size: 18 })] }),
                                            new Paragraph({ children: [new TextRun({ text: "PROJECT:\t\t", bold: true, size: 18 }), new TextRun({ text: invoice.refNo ? invoice.refNo : (invoice.project || ""), bold: true, size: 18 })] }),
                                            new Paragraph({ children: [new TextRun({ text: "Address:\t\t", bold: true, size: 18 }), new TextRun({ text: invoice.address || "", size: 18 })] }),
                                            new Paragraph({ children: [new TextRun({ text: "QID:\t\t", bold: true, size: 18 }), new TextRun({ text: invoice.qid || "", size: 18 })] }),
                                        ]
                                    }),
                                    new TableCell({
                                        columnSpan: 3,
                                        margins: { top: 150, bottom: 150, left: 150, right: 150 },
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: "Invoice No.:\t", bold: true, size: 18 }), new TextRun({ text: invoice.invoiceNo.split('-').pop() || "", bold: true, size: 18 })] }),
                                            new Paragraph({ children: [new TextRun({ text: "Date:\t\t", bold: true, size: 18 }), new TextRun({ text: new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'), size: 18 })] }),
                                            new Paragraph({ children: [new TextRun({ text: "LPO No.:\t\t", bold: true, size: 18 }), new TextRun({ text: invoice.lpoNo || "", bold: true, size: 18 })] }),
                                            new Paragraph({ children: [new TextRun({ text: "Salesman:\t", bold: true, size: 18 }), new TextRun({ text: invoice.salesman || "", size: 18 })] }),
                                        ]
                                    })
                                ]
                            }),
                            // Table Headers
                            new TableRow({
                                children: [
                                    createCell("NO.", true, AlignmentType.CENTER),
                                    createCell("ITEM DESCRIPTION", true, AlignmentType.LEFT),
                                    createCell("QTY", true, AlignmentType.CENTER),
                                    createCell("UNIT PRICE", true, AlignmentType.RIGHT),
                                    createCell("DISCOUNT", true, AlignmentType.RIGHT),
                                    createCell("AMOUNT", true, AlignmentType.RIGHT),
                                ]
                            }),
                            // Items
                            ...items.map((item, idx) => new TableRow({
                                children: [
                                    createCell((idx + 1).toString(), false, AlignmentType.CENTER),
                                    createCell(item.description, false, AlignmentType.LEFT),
                                    createCell(item.quantity.toString(), false, AlignmentType.CENTER),
                                    createCell(Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), false, AlignmentType.RIGHT),
                                    createCell(item.discount ? item.discount.toString() : "-", false, AlignmentType.RIGHT),
                                    createCell(Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), false, AlignmentType.RIGHT),
                                ]
                            })),
                            // Totals Row
                            new TableRow({
                                children: [
                                    createCell("TOTAL", true, AlignmentType.RIGHT, 2),
                                    createCell("-", true, AlignmentType.CENTER),
                                    createCell("", false, AlignmentType.RIGHT),
                                    createCell("", false, AlignmentType.RIGHT),
                                    createCell(Number(items.reduce((sum, i) => sum + Number(i.amount), 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), true, AlignmentType.RIGHT),
                                ]
                            }),
                            // Remarks and Notes (Left) / Advance, Discount, Balance (Right)
                            new TableRow({
                                children: [
                                    new TableCell({
                                        columnSpan: 4,
                                        margins: { top: 150, bottom: 150, left: 150, right: 150 },
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: "REMARKS:", bold: true, size: 18 })] }),
                                            new Paragraph({ children: [new TextRun({ text: "AMOUNT IN WORDS: ", bold: true, size: 16 }), new TextRun({ text: `${converter.toWords(totalAmount).toUpperCase()} ONLY`, size: 16 })] }),
                                        ]
                                    }),
                                    createCell("ADVANCE:", true, AlignmentType.LEFT),
                                    createCell(Number(advance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), false, AlignmentType.RIGHT),
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        columnSpan: 4,
                                        margins: { top: 150, bottom: 150, left: 150, right: 150 },
                                        rowSpan: 2,
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: "NOTES:", bold: true, size: 18 })] }),
                                            new Paragraph({ children: [new TextRun({ text: invoice.notes || "", size: 18 })] })
                                        ]
                                    }),
                                    createCell("DISCOUNT", true, AlignmentType.LEFT),
                                    createCell(Number(discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), false, AlignmentType.RIGHT),
                                ]
                            }),
                            new TableRow({
                                children: [
                                    createCell("BALANCE\nPAYABLE", true, AlignmentType.LEFT),
                                    createCell(Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), true, AlignmentType.RIGHT),
                                ]
                            }),
                            // Footer Row
                            new TableRow({
                                children: [
                                    new TableCell({
                                        columnSpan: 6,
                                        margins: { top: 150, bottom: 150, left: 150, right: 150 },
                                        borders: { top: { style: BorderStyle.NONE } },
                                        children: [
                                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Thanks for your business! Please Visit Again.", bold: true, italics: true, size: 18 })] })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }]
        });

        return Packer.toBlob(doc);
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
                    {!isClient && (
                        <button onClick={() => navigate(`/edit-invoice/${id}`)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition">
                            <Edit size={16} />
                            Edit
                        </button>
                    )}
                    <button onClick={handleWordExport} className="flex items-center gap-2 bg-[#2a2bb5] text-white px-4 py-2 rounded-lg hover:bg-[#1a1a85] transition shadow-sm font-medium">
                        <FileText size={16} /> Download Word
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm">
                        <Printer size={16} />
                        Print / Download PDF
                    </button>
                </div>
            </div>

            {/* NEW CONTRACTING INVOICE DESIGN (Visual Match) */}
            <div id="invoice-content" className="max-w-[900px] mx-auto bg-white shadow-xl border border-black overflow-hidden print:shadow-none print:border-none print:m-0 print:w-full font-sans text-black">

                {/* Header Section */}
                <div className="p-8 pb-4 flex justify-between items-start border-b border-black">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="TrekGroup Logo" className="w-28 h-28 object-contain" />
                        <h1 className="text-4xl font-black tracking-tight self-center uppercase">INVOICE</h1>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <div className="text-brand-600 font-bold text-xl flex flex-col items-end leading-tight max-w-[400px] text-right">
                            <span className="text-black text-xs font-bold opacity-60">TREK GROUP TRADING CONTRACTING AND SERVICES</span>
                        </div>
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 border-b border-black text-[13px]">
                    <div className="border-r border-black p-4 space-y-2">
                        <div className="grid grid-cols-[130px_1fr]">
                            <span className="font-bold">Invoice Type:</span>
                            <span>{invoice.invoiceType || "Credit"}</span>
                        </div>
                        <div className="grid grid-cols-[130px_1fr]">
                            <span className="font-bold">Company Name:</span>
                            <span className="font-black">{invoice.client}</span>
                        </div>
                        <div className="grid grid-cols-[130px_1fr]">
                            <span className="font-bold uppercase">PROJECT:</span>
                            <span className="font-black uppercase">{invoice.refNo ? invoice.refNo : (invoice.project || "")}</span>
                        </div>
                        <div className="grid grid-cols-[130px_1fr]">
                            <span className="font-bold">Address:</span>
                            <span className="whitespace-pre-wrap">{invoice.address || ""}</span>
                        </div>

                        <div className="grid grid-cols-[130px_1fr]">
                            <span className="font-bold">QID:</span>
                            <span>{invoice.qid || ""}</span>
                        </div>
                    </div>

                    <div className="p-4 space-y-2 text-left">
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-bold">Invoice No.:</span>
                            <span className="font-black">{invoice.invoiceNo.split('-').pop()}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-bold">Date:</span>
                            <span>{new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] mt-4">
                            <span className="font-bold uppercase">LPO No.:</span>
                            <span className="font-black">{invoice.lpoNo || ""}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] mt-2">
                            <span className="font-bold">Salesman:</span>
                            <span>{invoice.salesman || ""}</span>
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-black text-sm font-black">
                                <th className="border-r border-black p-2 w-12 text-center uppercase">No.</th>
                                <th className="border-r border-black p-2 text-left uppercase">Item Description</th>
                                <th className="border-r border-black p-2 w-20 text-center uppercase">Qty</th>
                                <th className="border-r border-black p-2 w-28 text-center uppercase">Unit Price</th>
                                <th className="border-r border-black p-2 w-24 text-center uppercase">Discount</th>
                                <th className="p-2 w-32 text-center uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((item, idx: number) => (
                                <tr key={idx} className="border-b border-black leading-tight min-h-[40px]">
                                    <td className="border-r border-black p-2 text-center align-top">{idx + 1}</td>
                                    <td className="border-r border-black p-2 text-[12px] align-top whitespace-pre-wrap font-medium">
                                        {item.description}
                                    </td>
                                    <td className="border-r border-black p-2 text-center align-top">{item.quantity}</td>
                                    <td className="border-r border-black p-2 text-center align-top">{Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="border-r border-black p-2 text-center align-top">{item.discount || ""}</td>
                                    <td className="p-2 text-right font-medium align-top">{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 italic border-b border-black">No items found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Sub-Total Row */}
                <div className="flex border-b border-black h-10 font-black text-sm">
                    <div className="flex-1 flex items-center justify-end px-4 border-r border-black uppercase">Total</div>
                    <div className="w-20 flex items-center justify-center border-r border-black text-lg">-</div>
                    <div className="w-28 border-r border-black"></div>
                    <div className="w-24 border-r border-black"></div>
                    <div className="w-32 flex items-center justify-end px-4 border-l border-black">{Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                </div>

                {/* Bottom Section: Remarks & Summary */}
                <div className="flex text-[13px] border-b border-black">
                    <div className="flex-1 border-r border-black flex flex-col min-h-[160px]">
                        <div className="p-4 h-24 border-b border-black">
                            <span className="font-extrabold uppercase text-[14px]">Remarks:</span>
                            <div className="mt-1 text-[13px]">
                                <span className="font-bold uppercase">Amount in Words: </span>
                                <span className="font-medium uppercase">{converter.toWords(totalAmount).toUpperCase()} ONLY</span>
                            </div>
                        </div>
                        <div className="p-4 flex-1 relative">
                            <span className="font-extrabold uppercase text-[14px]">Notes:</span>
                            <div className="absolute bottom-8 right-16 text-center leading-tight">
                            </div>
                        </div>
                    </div>

                    <div className="w-[305px] flex flex-col">
                        <div className="flex border-b border-black h-12">
                            <div className="w-[120px] p-2 font-black flex items-center border-r border-black uppercase text-xs">Advance:</div>
                            <div className="flex-1 p-2 flex items-center justify-end font-bold">{Number(advance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="flex border-b border-black h-12">
                            <div className="w-[120px] p-2 font-black flex items-center border-r border-black uppercase text-xs">Discount</div>
                            <div className="flex-1 p-2 flex items-center justify-end font-bold">{discount > 0 ? Number(discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}</div>
                        </div>
                        <div className="flex h-16 border-b border-black">
                            <div className="w-[120px] p-2 font-black flex items-center border-r border-black leading-tight uppercase text-xs">Balance<br />Payable</div>
                            <div className="flex-1 p-2 flex items-center justify-end font-black text-xl">{Number(balance).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                        </div>
                        <div className="flex-1"></div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="p-4 text-center text-[15px] font-black italic">
                    Thanks for your business! Please Visit Again.
                </div>

            </div>

            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-slate-50 { background: white !important; }
          .p-6 { padding: 0 !important; }
          .max-w-\\[900px\\] { 
            max-width: 100% !important; 
            width: 210mm !important;
            border: 1px solid black !important; 
            box-shadow: none !important; 
            margin: 0 auto !important;
            display: block !important;
          }
          .font-black { font-weight: 900 !important; }
          .font-bold { font-weight: 700 !important; }
          @page { 
            size: A4 portrait; 
            margin: 10mm; 
          }
        }
      `}</style>
        </div>
    );
}
