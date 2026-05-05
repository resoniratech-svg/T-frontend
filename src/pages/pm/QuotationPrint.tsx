import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import ElectricalQuotationView from './ElectricalQuotationView';
import type { Quotation } from '../../types/pm';

const QuotationPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuotation = async () => {
            try {
                if (!id) return;
                const data = await quotationService.getQuotation(id);
                // Explicit Mapping for compatibility with the view
                const q: any = data;
                const mappedQuotation: Quotation = {
                    ...q,
                    id: q.id,
                    refNo: q.qtn_number || q.id,
                    project: q.project_name || q.project || "N/A",
                    client: q.client_name || q.client_company || q.client || "N/A",
                    totalAmount: Number(q.total_amount || 0),
                    branch: q.division || "Contracting",
                    date: q.created_at || q.date || new Date().toISOString(),
                    items: q.items || [],
                    docTitle: q.doc_title || q.docTitle || "FIRE ALARM AND FIGHTING QUOTATION"
                };
                setQuotation(mappedQuotation);
            } catch (err) {
                console.error("Error fetching quotation for print:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotation();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white font-sans">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium tracking-wide">Preparing Document...</p>
            </div>
        </div>
    );

    if (!quotation) return (
        <div className="min-h-screen flex items-center justify-center bg-white font-sans">
            <p className="text-red-500 font-bold text-xl">Quotation Not Found</p>
        </div>
    );

    return (
        <div className="print-container">
            <ElectricalQuotationView quotation={quotation} />
            
            <style>{`
                /* STRICT A4 CALIBRATION */
                @page {
                    size: A4;
                    margin: 0 !important;
                }

                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 210mm;
                    height: auto;
                    background: white !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                .print-container {
                    width: 210mm;
                    height: auto;
                    min-height: 297mm;
                    margin: 0 auto;
                    padding: 8mm;
                    background: white;
                    box-sizing: border-box;
                    overflow: hidden;
                    display: block;
                    position: relative;
                }

                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    .print-container, 
                    .print-container * {
                        visibility: visible !important;
                    }

                    .print-container {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 8mm !important;
                        box-shadow: none !important;
                    }
                }

                /* PREVENT OVERFLOW GHOST PAGES */
                * {
                    page-break-inside: avoid;
                }

                table {
                    page-break-inside: auto !important;
                    width: 100% !important;
                    border-collapse: collapse !important;
                }

                tr, td, th {
                    page-break-inside: avoid !important;
                }

                /* Ensure the child view matches the 210mm width exactly */
                .print-container > div {
                    padding: 0 !important;
                    margin: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    min-height: 0 !important;
                    height: auto !important;
                }
            `}</style>
        </div>
    );
};

export default QuotationPrint;
