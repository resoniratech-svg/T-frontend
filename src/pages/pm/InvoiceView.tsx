import React from 'react';
import type { Quotation, QuotationItem } from '../../types/pm';
import { numberToWords } from '../../utils/numberToWords';

interface InvoiceViewProps {
    quotation: Quotation;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ quotation }) => {
    // Format Date
    const qDate = new Date(quotation.date || new Date().toISOString());
    const day = qDate.toLocaleDateString('en-GB', { day: '2-digit' });
    const month = qDate.toLocaleDateString('en-GB', { month: '2-digit' });
    const year = qDate.getFullYear();
    const formattedDate = `${day} / ${month} / ${year}`;

    const items = quotation.items || [];
    const totalAmount = quotation.totalAmount || 0;
    const division = (quotation.branch || 'maintenance').toLowerCase();
    const isMEP = division === 'mep';

    return (
        <div className="flex flex-col items-center bg-slate-100 p-8 min-h-screen font-serif text-black">
            <div className="w-[850px] bg-white shadow-2xl p-6 flex flex-col relative print:shadow-none print:w-full print:p-0 print-page min-h-0">

                {/* 1. Header (Names & Logo) */}
                <div className="flex justify-between items-center mb-2 px-4">
                    {/* Left: English Name */}
                    <div className="w-[35%] text-[18px] font-bold leading-tight">
                        {isMEP ? (
                            <>
                                Al Maha MEP Trading<br />
                                & Contracting W.L.L.
                            </>
                        ) : (
                            <>
                                Al Maha & Maintenance<br />
                                Electrical Equipment
                            </>
                        )}
                    </div>

                    {/* Center: Logo */}
                    <div className="w-[20%] flex flex-col items-center">
                        <img
                            src={isMEP ? "/logo_mep.png" : "/logo.png"}
                            alt="Logo"
                            className={`h-24 w-auto object-contain ${isMEP ? "bg-black p-1 rounded" : ""}`}
                        />
                    </div>

                    {/* Right: Arabic Name */}
                    <div className="w-[35%] text-right text-[22px] font-bold leading-tight" dir="rtl">
                        {isMEP ? (
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
                <div className="text-center border-t border-b border-black py-1 mb-4 mx-4">
                    <p className="text-[10px] font-black tracking-widest uppercase">
                        <span className="text-sky-500">KAHRAMAA</span> APPROVED MEP CONTRACTOR | GRADE B | <span className="text-rose-500">KM</span> LICENSE NO 1492
                    </p>
                </div>

                {/* 3. Title Bar (Black for Invoice) */}
                <div className="bg-black text-white text-center py-1 mb-6 mx-4">
                    <h2 className="text-xl font-black tracking-[0.5em] uppercase">INVOICE</h2>
                </div>

                {/* 4. Info Grid */}
                <div className="px-4 mb-8">
                    <div className="grid grid-cols-2 gap-x-12 border border-black p-4 text-sm">
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <span className="font-bold min-w-[70px] uppercase">Client:</span>
                                <span className="font-medium border-b border-dotted border-black flex-1 uppercase">{(quotation as any).owner || quotation.client}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold min-w-[70px] uppercase">Project:</span>
                                <span className="font-medium border-b border-dotted border-black flex-1 uppercase">{quotation.project}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold min-w-[70px] uppercase">Location:</span>
                                <span className="font-medium border-b border-dotted border-black flex-1 uppercase">{(quotation as any).location || "Doha, Qatar"}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold min-w-[70px] uppercase">Pin No:</span>
                                <span className="font-medium border-b border-dotted border-black flex-1 uppercase">{(quotation as any).pinNo || "-"}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <span className="font-bold min-w-[100px] uppercase">Date:</span>
                                <span className="font-medium border-b border-dotted border-black flex-1 uppercase">{formattedDate}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold min-w-[100px] uppercase">Ref No:</span>
                                <span className="font-medium border-b border-dotted border-black flex-1 uppercase">{quotation.refNo}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Main Table */}
                <div className="px-4 mb-8 flex-1">
                    <table className="w-full border-collapse border border-black">
                        <thead>
                            <tr className="bg-white border-b border-black text-[10px] font-black uppercase">
                                <th className="border-r border-black p-2 w-12 text-center">S/N</th>
                                <th className="border-r border-black p-2 text-center">Description</th>
                                <th className="p-2 w-32 text-center">Total (QR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((item, idx) => (
                                <tr key={idx} className="border-b border-black text-[12px] min-h-[60px]">
                                    <td className="border-r border-black p-3 text-center align-middle font-medium">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td className="border-r border-black p-3 align-middle font-medium leading-relaxed italic uppercase">
                                        {item.description}
                                    </td>
                                    <td className="p-2 text-center align-middle font-bold">
                                        {(item.amount || (item.quantity * item.unitPrice)).toLocaleString()} QR
                                    </td>
                                </tr>
                            )) : null}
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
                                <td colSpan={2} className="border-r border-black p-3 text-center text-sm font-black uppercase tracking-wider">
                                    TOTAL IN QRS ({numberToWords(totalAmount)} QR Only)
                                </td>
                                <td className="p-3 text-center text-base font-black bg-slate-50">
                                    {totalAmount.toLocaleString()} QR
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Bank Details & Signature Section */}
                    <div className="mt-8 space-y-6">
                        <div>
                            <h3 className="font-black text-sm border-b border-black pb-1 mb-3 uppercase tracking-widest">General Note:</h3>
                            <div className="space-y-4 text-[12px] font-bold">
                                <div className="flex items-start gap-2">
                                    <span className="text-[10px] mt-0.5">◆</span>
                                    <div>
                                        <p>Bank Transfer :</p>
                                        <div className="pl-6 mt-1 space-y-1">
                                            <p>Account Name: {isMEP ? "Al Maha MEP Trading & Contracting W.L.L." : "Al Maha Maintenance & Electrical Equipment"}</p>
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

                        <div className="flex justify-end pt-4 pr-12 pb-8 relative">
                            <div className="text-center flex flex-col items-center">
                                {/* Stamp Image from user requirements */}
                                <div className="relative">
                                    <img src="/stamp.png" alt="" className="w-32 h-32 absolute -top-20 -left-16 opacity-80 rotate-[-15deg] pointer-events-none" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    <img src="/signature.png" alt="" className="h-12 w-auto mb-1 relative z-10" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                                <p className="font-black text-sm mt-2">Sajidur Rahman</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">General Manager</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer (Contacts) */}
                <div className="border-t-2 border-black pt-4 pb-1 mx-4">
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
                <div className="h-8 bg-black mt-4 mx-4" />
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
                
                @media print {
                    .no-print { display: none !important; }
                    @page { 
                        size: A4; 
                        margin: 10mm; 
                    }
                    .print-page { 
                        break-after: page; 
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    body { margin: 0; padding: 0; background: white !important; }
                }
                
                .font-serif { font-family: 'Times New Roman', Times, serif; }
                [dir="rtl"] { font-family: 'Noto Sans Arabic', sans-serif; }
            `}</style>
        </div>
    );
};

export default InvoiceView;
