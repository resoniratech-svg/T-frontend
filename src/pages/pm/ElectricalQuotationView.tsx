import React from 'react';
import type { Quotation, QuotationItem } from '../../types/pm';

interface ElectricalQuotationViewProps {
    quotation: Quotation;
}

const ElectricalQuotationView: React.FC<ElectricalQuotationViewProps> = ({ quotation }) => {
    // Format Date
    const qDate = new Date(quotation.date || new Date().toISOString());
    const day = qDate.toLocaleDateString('en-GB', { day: '2-digit' });
    const month = qDate.toLocaleDateString('en-GB', { month: '2-digit' });
    const year = qDate.getFullYear();
    const formattedDate = `${day} / ${month} / ${year}`;

    const items = quotation.items || [];
    const totalAmount = quotation.totalAmount || 0;
    const isMEP = quotation.branch?.toLowerCase() === 'mep' || quotation.division?.toLowerCase() === 'mep';

    // Dynamic Title handling (mapping backend snake_case to frontend camelCase)
    const docTitle = (quotation as any).doc_title || (quotation as any).docTitle || "FIRE ALARM AND FIGHTING QUOTATION";

    return (
        <div className="flex flex-col items-center bg-slate-100 p-8 min-h-screen font-serif text-black">
            <div className="w-[850px] bg-white shadow-2xl p-8 flex flex-col relative print:shadow-none print:w-full print:p-0 print-page min-h-0">

                {/* 1. Official Header (Standardized) */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <div className="w-[35%] text-[22px] font-bold leading-tight text-red-600">
                            {isMEP ? (
                                <>Al Maha MEP Trading<br />& Contracting W.L.L.</>
                            ) : (
                                <>Al Maha & Maintenance<br />Electrical Equipment W.L.L</>
                            )}
                        </div>
                        <div className="w-[20%] flex flex-col items-center">
                            <img
                                src={isMEP ? "/logo_mep.png" : "/logo.png"}
                                alt="Logo"
                                className="h-28 w-auto object-contain"
                            />
                        </div>
                        <div className="w-[35%] text-right text-[26px] font-bold leading-tight text-red-600" dir="rtl">
                            {isMEP ? (
                                <>المها للتجارة<br />والمقاولات ذ.م.م</>
                            ) : (
                                <>المها لبيع وصيانة الادوات<br />والتمديدات الكهربائية</>
                            )}
                        </div>
                    </div>

                    {/* Kahramaa Text - Centered */}
                    <div className="text-center text-[11px] font-black mb-2 tracking-wide uppercase">
                        <span className="text-[#00aeef]">KAHRAMAA</span>
                        <span className="text-black ml-1">APPROVED MEP CONTRACTOR | GRADE B | KM LICENSE NO 1492</span>
                    </div>

                    {/* RED TITLE BAR */}
                    <div className="bg-red-600 text-white text-center py-2 px-4 shadow-sm mb-6">
                        <h2 className="text-xl font-black tracking-[0.2em] uppercase">
                            {docTitle}
                        </h2>
                    </div>
                </div>

                {/* 2. Client & Project Info Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm px-4">
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
                            <span className="font-bold min-w-[100px] uppercase">Our Ref No:</span>
                            <span className="font-medium border-b border-dotted border-black flex-1 uppercase">{quotation.refNo}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Items Table - FULL WIDTH */}
                <div className="flex-1 mb-8 overflow-x-hidden">
                    <table className="w-full border-collapse border border-black text-[12px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-black font-black uppercase text-center">
                                <th className="border-r border-black p-2 w-12">S/N</th>
                                <th className="border-r border-black p-2">Description</th>
                                <th className="p-2 w-32">Total (QR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} className="border-b border-black min-h-[50px]">
                                    <td className="border-r border-black p-2 text-center align-middle font-medium">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td className="border-r border-black p-2 align-middle font-medium leading-relaxed italic uppercase">
                                        {item.description}
                                    </td>
                                    <td className="p-2 text-center align-middle font-bold">
                                        {Number(item.amount || (item.quantity * item.unitPrice)).toLocaleString()} QR
                                    </td>
                                </tr>
                            ))}
                            {/* Fill empty rows to maintain professional length */}
                            {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-black h-10">
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-black bg-slate-50 font-black uppercase">
                                <td colSpan={2} className="border-r border-black p-3 text-right pr-10 text-sm tracking-widest">
                                    Total Amount In QRS
                                </td>
                                <td className="p-3 text-center text-base">
                                    {totalAmount.toLocaleString()} QR
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* 4. Terms & Conditions - FLOWS NATURALLY */}
                <div className="px-4 mb-8">
                    <h3 className="font-black text-sm border-b border-black pb-1 mb-3 uppercase tracking-widest">Terms & Conditions:</h3>
                    <ul className="list-decimal pl-6 space-y-1 text-[11px] font-bold">
                        <li className="no-break">Validity of the quotation is 30 days from the date of issue.</li>
                        <li className="no-break">Payment terms: 50% advance, 50% upon completion.</li>
                        <li className="no-break">The price is inclusive of all materials and labor mentioned in the scope.</li>
                        <li className="no-break">In case of any modification in proposed QCD approved FA or FF dwgs, revision of the quotation is required.</li>
                        <li className="no-break">All works will be done as per the QCD regulations.</li>
                        <li className="no-break">Any additional works will be charged extra.</li>
                        <li className="no-break">Supply and installation of duct work and machine for Fire damper is excluded in our scope of work.</li>
                        <li className="no-break">Supply and installation of fire rated doors is not under our scope of works.</li>
                        <li className="no-break">The project has no dry riser as per the QCD approved dwgs.</li>
                    </ul>

                    <p className="text-[11px] font-bold leading-relaxed mb-6 mt-4 no-break">
                        We hope we have given you the best offer with the supply of best quality materials. We look forward to do business with you. If you have any queries, please do not hesitate to contact us.
                    </p>

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
                </div>

                {/* 5. Footer - Standard Contact Info */}
                <div className="border-t border-black pt-4 pb-2 mx-8 text-black no-break">
                    <div className="flex justify-center gap-x-3 text-[10px] font-black text-center uppercase tracking-tighter">
                        <span>C.R NO: 83684</span>
                        <span className="text-red-600">|</span>
                        <span>Tel: +974 4001 9555</span>
                        <span className="text-red-600">|</span>
                        <span>Mob No: +974 7444 5969</span>
                        <span className="text-red-600">|</span>
                        <span>P.O BOX: 9592</span>
                    </div>
                    <div className="flex justify-center gap-x-2 text-[10px] font-black text-center mt-1">
                        <span className="lowercase">Instagram: @almahacontracting.qa</span>
                        <span className="mx-1 text-red-600">|</span>
                        <span className="lowercase">E-mail: almaha263@gmail.com</span>
                    </div>
                </div>

                {/* Decorative Bottom Bar */}
                <div className="h-4 bg-red-600 mt-2 mx-8 shadow-inner" />
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
                
                @media print {
                    .no-print { display: none !important; }
                    @page { size: A4; margin: 0; }
                    .print-page { 
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 auto !important;
                        padding: 10mm !important;
                        box-sizing: border-box !important;
                        break-after: page;
                    }
                    body { margin: 0; padding: 0; background: white !important; }
                }
                
                .font-serif { font-family: 'Times New Roman', Times, serif; }
                [dir="rtl"] { font-family: 'Noto Sans Arabic', sans-serif; }
                .no-break { break-inside: avoid; }
            `}</style>
        </div>
    );
};

export default ElectricalQuotationView;
