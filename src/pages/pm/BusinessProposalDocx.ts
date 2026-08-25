import { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, HeadingLevel } from "docx";
import type { Quotation } from "../../types/pm";

export const generateBusinessProposalDocx = async (quotation: Quotation): Promise<Blob> => {
    const clientName = quotation.client || "Client Name";
    const year = new Date().getFullYear().toString();

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // PAGE 1: COVER
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 2000, after: 400 },
                        children: [
                            new TextRun({ text: "QUBEXE TRADING CONTRACTING AND SERVICES", color: "666666", size: 24, allCaps: true })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 2000 },
                        children: [
                            new TextRun({ text: "QUBEXE BUSINESS SERVICES", bold: true, size: 28, allCaps: true })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 2000 },
                        children: [
                            new TextRun({ text: "BUSINESS", bold: true, size: 96 })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 4000 },
                        children: [
                            new TextRun({ text: "PROPOSAL", bold: true, size: 96 })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 2000 },
                        children: [
                            new TextRun({ text: "Prepared for:", color: "666666", size: 24 })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 2000 },
                        children: [
                            new TextRun({ text: clientName, bold: true, size: 36, allCaps: true })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: year, color: "CCCCCC", size: 72 })
                        ]
                    }),
                    new Paragraph({ children: [new PageBreak()] }),

                    // PAGE 2: ABOUT US
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 1000, after: 1000 },
                        children: [new TextRun({ text: "About Us", size: 56, italics: true })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { line: 360 },
                        children: [
                            new TextRun({ text: quotation.aboutUs ?? "Qubexe Business Services is a trusted provider of comprehensive corporate and industrial setup solutions in Qatar. We specialize in guiding investors and entrepreneurs through every stage of company formation, licensing, and operational setup, ensuring compliance with all local laws and regulations. Our expertise extends to supporting industrial projects with end-to-end documentation, approvals, and advisory services.", size: 28 })
                        ]
                    }),
                    new Paragraph({ children: [new PageBreak()] }),

                    // PAGE 3: WHAT WE DO?
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 1000, after: 1000 },
                        children: [new TextRun({ text: "What We Do?", size: 56, italics: true })]
                    }),
                    new Paragraph({
                        spacing: { after: 600, line: 360 },
                        children: [
                            new TextRun({ text: "We provide professional services for the establishment and licensing of businesses in Qatar, including:", bold: true, size: 28 })
                        ]
                    }),
                    ...((quotation.whatWeDo ?? "Company formation and trade license registration\nIndustrial license applications and approvals\nGovernment liaison and PRO services\nSpecial approval coordination for industrial projects\nComprehensive project documentation and compliance")
                        .split('\n')
                        .filter(l => l.trim())
                        .map(item => new Paragraph({
                            bullet: { level: 0 },
                            spacing: { after: 200 },
                            children: [new TextRun({ text: item.trim(), size: 28 })]
                        }))),
                    new Paragraph({ children: [new PageBreak()] }),

                    // PAGE 4: OUR PROPOSAL
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 1000, after: 1000 },
                        children: [new TextRun({ text: "Our Proposal", size: 56, italics: true })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { line: 360 },
                        children: [
                            new TextRun({ text: quotation.proposalIntro || "Trek Group Business Services proposes to manage the complete setup of a new company in Qatar.", size: 28, italics: true })
                        ]
                    }),
                    new Paragraph({ children: [new PageBreak()] }),

                    // PAGE 5: FINANCIAL TERMS
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 1000, after: 1000 },
                        children: [new TextRun({ text: "Financial & Commercial Terms", size: 56, italics: true })]
                    }),
                    new Paragraph({
                        spacing: { after: 400 },
                        children: [
                            new TextRun({ text: "Company Formation Package", bold: true, size: 28 })
                        ]
                    }),
                    new Paragraph({
                        spacing: { after: 400 },
                        children: [
                            new TextRun({ text: `QAR ${parseFloat(String(quotation.netTotal || 11000)).toLocaleString()}`, bold: true, size: 48 })
                        ]
                    }),
                    new Paragraph({
                        spacing: { after: 600 },
                        children: [
                            new TextRun({ text: "(Service Fees + Government Charges | All-inclusive)", italics: true, size: 24, color: "666666" })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { line: 360 },
                        children: [
                            new TextRun({ text: quotation.financialTerms ?? "Total Package Cost: QAR 11,000 (all-inclusive)...", size: 28 })
                        ]
                    }),
                    new Paragraph({ children: [new PageBreak()] }),

                    // PAGE 6: DUTIES & PAYMENTS
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 1000, after: 1000 },
                        children: [new TextRun({ text: "Client Duties", size: 48 })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { line: 360, after: 1000 },
                        children: [
                            new TextRun({ text: quotation.clientDuties ?? "1. Provide required documents...", size: 24 })
                        ]
                    }),
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        spacing: { after: 1000 },
                        children: [new TextRun({ text: "Payment Terms", size: 48 })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { line: 360 },
                        children: [
                            new TextRun({ text: quotation.paymentTerms ?? "50% advance payment...", size: 24 })
                        ]
                    })
                ]
            }
        ]
    });

    return Packer.toBlob(doc);
};
