import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign, ImageRun } from "docx";
import type { Quotation } from "../../types/pm";

export const generateQuotationFormat2Docx = async (quotation: Quotation): Promise<Blob> => {
    const items = quotation.items || [];
    const qDate = new Date(quotation.date || new Date().toISOString());
    const dateStr = qDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const client = quotation.client || "Client";
    const quoteId = quotation["Quote ID"] || quotation.id || "N/A";
    const project = quotation.project || "N/A";
    
    const tncRaw = quotation.financialTerms || "";
    const termsList = tncRaw.split('\\n').filter((t: string) => t.trim() !== "");

    let logoImage: ArrayBuffer | null = null;
    try {
        const response = await fetch('/logo.png');
        if (response.ok) {
            logoImage = await response.arrayBuffer();
        }
    } catch (e) {
        console.error("Failed to load logo", e);
    }

    const greenBorders = {
        top: { style: BorderStyle.SINGLE, size: 12, color: "16a34a" },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: "16a34a" },
        left: { style: BorderStyle.SINGLE, size: 12, color: "16a34a" },
        right: { style: BorderStyle.SINGLE, size: 12, color: "16a34a" },
    };

    const emptyBorders = {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
    };

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
                },
            },
            children: [
                // Header Table: Logo (Left), Contact Info (Right)
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: emptyBorders,
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    borders: emptyBorders,
                                    children: [
                                        new Paragraph({
                                            children: logoImage ? [
                                                new ImageRun({
                                                    data: logoImage,
                                                    transformation: { width: 120, height: 60 }
                                                })
                                            ] : [new TextRun({ text: "TREK GROUP", bold: true, size: 24 })]
                                        })
                                    ]
                                }),
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    borders: emptyBorders,
                                    children: [
                                        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "PO Box: 96347, Doha - Qatar", size: 18 })] }),
                                        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Mob: +974 71716559", size: 18 })] }),
                                        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Email: info@trekgroup.com", size: 18 })] }),
                                        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Web: www.trekgroup.com", size: 18 })] }),
                                        new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 100 }, children: [new TextRun({ text: "TREK GROUP W.L.L", bold: true, size: 22 })] }),
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                
                new Paragraph({ spacing: { before: 400, after: 400 }, alignment: AlignmentType.CENTER, children: [
                    new TextRun({ text: "QUOTATION", bold: true, size: 36, underline: {} })
                ]}),

                // Project Info Table (Green Border)
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: greenBorders,
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    columnSpan: 2,
                                    margins: { top: 100, bottom: 100, left: 150, right: 150 },
                                    borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.LEFT,
                                            children: [
                                                new TextRun({ text: "CLIENT: ", bold: true, color: "16a34a", size: 24 }),
                                                new TextRun({ text: client, bold: true, color: "16a34a", size: 24 }),
                                            ]
                                        })
                                    ]
                                }),
                                new TableCell({
                                    margins: { top: 100, bottom: 100, left: 150, right: 150 },
                                    borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.RIGHT,
                                            children: [
                                                new TextRun({ text: "QTN# EXO: ", bold: true, color: "dc2626", size: 24 }),
                                                new TextRun({ text: quoteId, bold: true, color: "dc2626", size: 24 }),
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    columnSpan: 2,
                                    margins: { top: 100, bottom: 100, left: 150, right: 150 },
                                    borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Doha, Qatar", size: 20 })] })]
                                }),
                                new TableCell({
                                    margins: { top: 100, bottom: 100, left: 150, right: 150 },
                                    borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
                                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Date: ${dateStr}`, bold: true, color: "dc2626", size: 20 })] })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    columnSpan: 3,
                                    margins: { top: 100, bottom: 100, left: 150, right: 150 },
                                    borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Project : ", bold: true, size: 20 }), new TextRun({ text: project, size: 20 })] })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    columnSpan: 2,
                                    margins: { top: 100, bottom: 100, left: 150, right: 150 },
                                    borders: { bottom: { style: BorderStyle.NONE } },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Attention: ", bold: true, size: 20 }), new TextRun({ text: "To Whom It May Concern", size: 20 })] })]
                                }),
                                new TableCell({
                                    margins: { top: 100, bottom: 100, left: 150, right: 150 },
                                    borders: { bottom: { style: BorderStyle.NONE } },
                                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Mob: ", bold: true, size: 20 }), new TextRun({ text: quotation.phone || "N/A", size: 20 })] })]
                                })
                            ]
                        })
                    ]
                }),

                new Paragraph({ spacing: { before: 400, after: 200 }, children: [new TextRun({ text: `Sale Quotation For ${project}`, bold: true, size: 24 })] }),
                new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Dear Sir,", bold: true, size: 24 })] }),
                
                ...((quotation.proposalIntro ?? "This has reference to your inquiry for the above mentioned project. Further, we give below the details for your approval:").split('\n').map((line: string) => 
                    new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: line, size: 22 })] })
                )),

                new Paragraph({ spacing: { before: 200, after: 200 } }),

                // Items Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            tableHeader: true,
                            children: [
                                new TableCell({ margins: { top: 100, bottom: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "SL.no", bold: true, size: 22 })] })] }),
                                new TableCell({ margins: { top: 100, bottom: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Item", bold: true, size: 22 })] })] }),
                                new TableCell({ margins: { top: 100, bottom: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "QTY", bold: true, size: 22 })] })] }),
                                new TableCell({ margins: { top: 100, bottom: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: items[0]?.unit ? `${items[0].unit.toLowerCase()} price` : "Unit price", bold: true, size: 22 })] })] }),
                                new TableCell({ margins: { top: 100, bottom: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Disc (%)", bold: true, size: 22 })] })] }),
                                new TableCell({ margins: { top: 100, bottom: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Total QR.", bold: true, size: 22 })] })] })
                            ]
                        }),
                        ...items.map((item: any, idx: number) => {
                            const descriptionLines = item.description.split('\n');
                            
                            return new TableRow({
                                children: [
                                    new TableCell({ margins: { top: 150, bottom: 150 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${idx + 1}.`, bold: true, size: 22 })] })] }),
                                    new TableCell({ 
                                        margins: { top: 150, bottom: 150, left: 100 }, 
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: `OPTION: ${idx + 1}`, bold: true, underline: {}, size: 22 })], spacing: { after: 100 } }),
                                            ...descriptionLines.map((line: string) => new Paragraph({ children: [new TextRun({ text: line, size: 22 })] }))
                                        ] 
                                    }),
                                    new TableCell({ margins: { top: 150, bottom: 150 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.quantity?.toString() || "", bold: true, size: 22 })] })] }),
                                    new TableCell({ margins: { top: 150, bottom: 150 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), bold: true, size: 22 })] })] }),
                                    new TableCell({ margins: { top: 150, bottom: 150 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.discount ? `${item.discount}%` : "-", bold: true, size: 22 })] })] }),
                                    new TableCell({ margins: { top: 150, bottom: 150 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: Number(item.amount || (Number(item.quantity) * Number(item.unitPrice) * (1 - (Number(item.discount || 0)/100)))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), bold: true, size: 22 })] })] })
                                ]
                            });
                        })
                    ]
                }),

                new Paragraph({ spacing: { before: 400, after: 200 } }),

                // Terms and Conditions
                ...(termsList.length > 0 ? [
                    new Paragraph({ children: [new TextRun({ text: "Terms and Conditions", bold: true, size: 24 })], spacing: { after: 100 } }),
                    ...termsList.map((term: string) => 
                        new Paragraph({ 
                            bullet: { level: 0 },
                            children: [new TextRun({ text: term.replace(/^[-•\d\.]\s*/, ''), size: 22 })] 
                        })
                    )
                ] : []),

                new Paragraph({ spacing: { before: 400, after: 200 } }),
                
                new Paragraph({ children: [new TextRun({ text: "We hope that the above quotation is submitted in line with your requirements. If you need any further information for Approval, please do not hesitate to contact us.", italics: true, size: 22 })], spacing: { after: 400 } }),

                new Paragraph({ children: [new TextRun({ text: "Best Regards,", bold: true, size: 22 })] }),
                new Paragraph({ children: [new TextRun({ text: "TREK GROUP", bold: true, size: 22 })] }),
                new Paragraph({ children: [new TextRun({ text: "General Manager", bold: true, size: 22 })] }),
                new Paragraph({ children: [new TextRun({ text: "Doha, Qatar", bold: true, size: 22 })] }),
            ]
        }]
    });

    return Packer.toBlob(doc);
};
