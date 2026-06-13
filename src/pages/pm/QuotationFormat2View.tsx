import React from "react";
import type { Quotation } from "../../types/pm";

interface Props {
    quotation: Quotation;
}

export default function QuotationFormat2View({ quotation }: Props) {
    const items = quotation.items || [];
    const qDate = new Date(quotation.date || new Date().toISOString());
    const dateStr = qDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Ensure safe default values
    const client = quotation.client || "Client";
    const quoteId = quotation["Quote ID"] || quotation.id || "N/A";
    const project = quotation.project || "N/A";
    
    // Parse terms and conditions into an array if separated by newlines
    const tncRaw = quotation.financialTerms || "";
    const termsList = tncRaw.split('\\n').filter(t => t.trim() !== "");

    return (
        <div className="w-[850px] mx-auto bg-white border border-slate-200 overflow-hidden font-['Times_New_Roman',_Times,_serif] text-black leading-snug print:shadow-none print:border-none print:m-0 print-page" id="quotation-content">
            
            {/* Header section similar to the Exodus one */}
            <div className="flex justify-between items-start pt-12 px-12 pb-6">
                {/* We use the Trek Group Logo, but with Exodus-style placement */}
                <div className="w-[120px]">
                    <img src="/logo.png" alt="Logo" className="w-full object-contain" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/120?text=LOGO')} />
                </div>
                
                <div className="text-right text-[11px] font-sans text-slate-800 space-y-0.5">
                    <p>PO Box: 96347, Doha - Qatar</p>
                    <p>Mob: +974 71716559</p>
                    <p>Email: info@trekgroup.com</p>
                    <p>Web: www.trekgroup.com</p>
                    <p className="font-bold text-sm mt-1 uppercase">TREK GROUP W.L.L</p>
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
                <h1 className="text-xl font-bold tracking-widest inline-block border-b-2 border-green-600 pb-1">QUOTATION</h1>
            </div>

            {/* Info Box with Green Border */}
            <div className="mx-12 border-2 border-green-600 p-3 text-[14px] font-bold space-y-2">
                <div className="flex justify-between">
                    <div className="text-green-700 uppercase">CLIENT: {client}</div>
                    <div className="text-red-600 uppercase">QTN# EXO: {quoteId}</div>
                </div>
                <div className="border-t border-black my-2"></div>
                <div className="flex justify-between text-[12px] font-normal text-black">
                    <div>Doha, Qatar</div>
                    <div className="text-red-600 font-bold">Date: {dateStr}</div>
                </div>
                <div className="border-t border-black my-2"></div>
                <div className="flex justify-between text-[13px] font-normal text-black">
                    <div><span className="font-bold">Project : </span>{project}</div>
                </div>
                <div className="border-t border-black my-2"></div>
                <div className="flex justify-between text-[13px] font-normal text-black">
                    <div><span className="font-bold">Attention: </span>To Whom It May Concern</div>
                    <div><span className="font-bold">Mob: </span>{quotation.phone || "N/A"}</div>
                </div>
            </div>

            {/* Introduction */}
            <div className="mx-12 mt-6 text-[13px] leading-relaxed">
                <p className="font-bold mb-2">Sale Quotation For {project}</p>
                <p className="font-bold mb-1">Dear Sir,</p>
                <div className="whitespace-pre-wrap">
                    {quotation.proposalIntro ?? "This has reference to your inquiry for the above mentioned project. Further, we give below the details for your approval:"}
                </div>
            </div>

            {/* Items Table */}
            <div className="mx-12 mt-4 text-[13px]">
                <table className="w-full border-collapse border border-black">
                    <thead>
                        <tr className="font-bold">
                            <th className="border border-black p-2 w-[8%] text-center">SL.no</th>
                            <th className="border border-black p-2 w-[52%] text-center">Item</th>
                            <th className="border border-black p-2 w-[12%] text-center">QTY</th>
                            <th className="border border-black p-2 w-[13%] text-center">
                                {items[0]?.unit ? `${items[0].unit.toLowerCase()} price` : "Unit price"}
                            </th>
                            <th className="border border-black p-2 w-[15%] text-center">Total QR.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} className="align-top">
                                <td className="border border-black p-2 text-center font-bold">{idx + 1}.</td>
                                <td className="border border-black p-3">
                                    {/* The reference format has "OPTION 1" underlined, but we'll use the description */}
                                    <div className="font-bold underline mb-1 uppercase">OPTION: {idx + 1}</div>
                                    <div className="whitespace-pre-wrap pl-1">{item.description}</div>
                                </td>
                                <td className="border border-black p-2 text-center whitespace-pre-wrap font-bold">
                                    {item.quantity}
                                </td>
                                <td className="border border-black p-2 text-center font-bold">
                                    {Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="border border-black p-2 text-center font-bold">
                                    {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Terms and Conditions */}
            {termsList.length > 0 && (
                <div className="mx-12 mt-6 text-[12px] font-bold leading-relaxed pb-8">
                    <h3 className="mb-2">Terms and Conditions</h3>
                    <ul className="list-disc pl-5 space-y-1 font-normal">
                        {termsList.map((term, idx) => (
                            <li key={idx}>{term.replace(/^[-•\d\.]\s*/, '')}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Outro & Signoff */}
            <div className="mx-12 mt-8 text-[13px] leading-relaxed pb-24 break-inside-avoid">
                <p className="italic mb-8">
                    We hope that the above quotation is submitted in line with your requirements. If you need any further information for Approval, please do not hesitate to contact us.
                </p>
                <div className="space-y-0.5 font-bold">
                    <p>Best Regards,</p>
                    <p>TREK GROUP</p>
                    <p>General Manager</p>
                    <p>Doha, Qatar</p>
                </div>
            </div>
        </div>
    );
}
