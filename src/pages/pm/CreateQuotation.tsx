import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import { Plus, Trash2, Save } from "lucide-react";
import DivisionTiles from "../../components/forms/DivisionTiles";
import { useDivision } from "../../context/DivisionContext";
import { useApprovals } from "../../context/ApprovalContext";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../context/ActivityContext";
import type { DivisionId } from "../../constants/divisions";
import ClientAutocomplete from "../../components/forms/ClientAutocomplete";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { quotationService } from "../../services/quotationService";
import type { QuotationItem } from "../../types/pm";

export default function CreateQuotation() {
    const navigate = useNavigate();
    const params = useParams();
    const editId = params.id;
    const isEditing = !!editId;
    const { activeDivision } = useDivision();
    const { requestApproval } = useApprovals();
    const { user } = useAuth();
    const { logActivity } = useActivity();
    const queryClient = useQueryClient();

    const isPM = user?.role === "PROJECT_MANAGER";
    const userDivision = (user?.division || "CONTRACTING").toUpperCase() as DivisionId;

    const DEFAULTS = {
        service: {
            // ... (keeping same as before)
            aboutUs: "Qubexe Business Services is a trusted provider of comprehensive corporate and industrial setup solutions in Qatar. We specialize in guiding investors and entrepreneurs through every stage of company formation, licensing, and operational setup, ensuring compliance with all local laws and regulations. Our expertise extends to supporting industrial projects with end-to-end documentation, approvals, and advisory services.",
            whatWeDo: "Company formation and trade license registration\nIndustrial license applications and approvals\nGovernment liaison and PRO services\nSpecial approval coordination for industrial projects\nComprehensive project documentation and compliance",
            proposalIntro: "Qubexe Business Services proposes to manage the complete setup of a new company in Qatar.\n\nThe company’s commercial activities will be as follows:\n\nActivity 1 – Provision of advertising services and advertising materials production\nProviding advertising and promotional services, including design, development, printing, and production of advertising materials such as banners, signboards, brochures, digital advertisements, promotional items, and related marketing materials in accordance with applicable regulations\n\nActivity 2 - Wholesale of stationery\nEngaging in the wholesale trading and distribution of stationery items including office supplies, paper products, writing instruments, school materials, filing products, and related accessories to retailers, institutions, and commercial establishments in accordance with applicable regulations.",
            financialTerms: "Total Package Cost: QAR 11,000 (all-inclusive)\n\nThis charge includes:\n• Trade name registration\n• Commercial Registration (CR) issuance\n• Trade licence registration\n• All documentation and necessary approvals for company setup\n• Establishment ID issuance\n• Tax registration\n• Ministry of Labour (MOL) registration\n• Ministry of Interior (MOI) update\n\nNote: This activity is subject to obtaining prior approval from the Ministry of Culture – Department of Press and Publication for registration of press and publishing activities. This charge excludes all deposits and other government related charges.",
            clientDuties: "1. Provide required documents for CR approval (QID, Passport, Police Clearance, National Address, Mobile/Email)\n2. Provide office/building space documents for trade licence registration\n3. Responsible for providing and paying all bank-related deposits, requirements, and charges\n4. Submit signatures and info in a timely manner\n5. Arrange and cover all office-related services and costs\n6. Attend any ministry or authority appointments\n7. Ensure accuracy of all submitted documents",
            paymentTerms: "50% advance payment upon acceptance of this proposal.\nRemaining 50% payable upon completion and signing of company formation documentation.\n\nPrices are subject to revision in case of changes to client requirements or government fee structures. All government approval fees shall be paid directly by the client."
        },
        standard: {
            aboutUs: "",
            whatWeDo: "",
            proposalIntro: "With reference to the above-mentioned subject and your inquiry, please find below our final\nrock bottom prices: -",
            financialTerms: "1. Payment: 50% advance, 30% upon delivery, and 20% upon completion\n2. Delivery: with 15 days from the advance payment.\n3. Above prices are subjected to change against the significant market prices fluctuation.\n4. Offer is valid for 15 Days\n5. This quotation is prepared on the basis of the specifications provided in the scope of works and limited to the same.\n6. All scaffolding, electrical connections, and manlift provisions shall be provided by the Client\n7. The above pricing is based on the specifications provided and limited to the quantities stated above. Any variation on the above specifications or quantities will result in change of price and also effect the delivery period. For any changes required to be made other than the scope of works stated, should be made in writing and need written confirmation in order to carry out the same.\n8. We will not be responsible for delivery arising out of delays in approvals of drawings, samples, payments, any natural calamities or pandemics or any situation that is beyond our control.",
            clientDuties: "",
            paymentTerms: ""
        }
    };

    const initialDivision = isPM ? userDivision : (activeDivision === "all" ? "CONTRACTING" : activeDivision.toUpperCase()) as DivisionId;
    const initialDefaults = initialDivision === "SERVICE" ? DEFAULTS.service : DEFAULTS.standard;

    const [form, setForm] = useState({
        division: initialDivision,
        project: "",
        client: "",
        customerCode: "",
        quoteId: "",
        status: "PENDING_APPROVAL",
        date: new Date().toISOString().split('T')[0],
        discount: 0,
        formatVersion: 1 as 1 | 2,
        phone: "",
        ...initialDefaults
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const todayStr = new Date().toISOString().split('T')[0];
    const [isManualClient, setIsManualClient] = useState(false);

    const allowedSectors = useMemo(() => {
        return isPM && user?.division ? [user.division.toUpperCase()] : [];
    }, [isPM, user]);

    // Document number is now handled by the backend
    useEffect(() => {
        if (!isEditing) {
            setForm(prev => ({ ...prev, quoteId: "" }));
        }
    }, [form.division, isEditing]);

    useEffect(() => {
        if (!isPM && activeDivision !== "all") {
            const division = activeDivision.toUpperCase() as DivisionId;
            const defaults = division === "SERVICE" ? DEFAULTS.service : DEFAULTS.standard;
            setForm(prev => ({
                ...prev,
                division,
                ...defaults
            }));
        }
    }, [activeDivision, isPM]);

    // Handle division change in creation mode
    const handleDivisionChange = (newDivision: DivisionId | "all") => {
        const divisionToSet = (newDivision === "all" ? "CONTRACTING" : newDivision) as DivisionId;
        if (!isEditing) {
            const defaults = divisionToSet === "SERVICE" ? DEFAULTS.service : DEFAULTS.standard;
            setForm(prev => ({
                ...prev,
                division: divisionToSet,
                client: "",
                customerCode: "",
                ...defaults
            }));
        } else {
            setForm(prev => ({ ...prev, division: divisionToSet }));
        }
    };

    const FORMAT_2_TERMS = "Order to be confirmed by LPO/contract.\nPayment: 60% in advance and 40% upon completion\nMaterial: Available\nScaffolding to be provided by client.\nIf any removal of existing film that cost will be added separately.\nVariation: If any additional items or variation in sizes, technical specifications or material specifications will attract cost variation.";

    const handleFormatChange = (version: 1 | 2) => {
        setForm(prev => {
            let newFinancialTerms = prev.financialTerms;
            const isStandardDefault = prev.financialTerms === DEFAULTS.standard.financialTerms || prev.financialTerms === DEFAULTS.service.financialTerms || !prev.financialTerms;
            
            if (version === 2 && isStandardDefault && !isEditing) {
                newFinancialTerms = FORMAT_2_TERMS;
            } else if (version === 1 && prev.financialTerms === FORMAT_2_TERMS && !isEditing) {
                const defaults = prev.division === "SERVICE" ? DEFAULTS.service : DEFAULTS.standard;
                newFinancialTerms = defaults.financialTerms;
            }

            return {
                ...prev,
                formatVersion: version,
                financialTerms: newFinancialTerms
            };
        });
    };

    const [items, setItems] = useState<QuotationItem[]>([
        { description: "", quantity: 1, unit: "pcs", unitPrice: 0, amount: 0 }
    ]);

    // Fetch existing quotation from database if editing
    const { data: existingQuotation } = useQuery({
        queryKey: ["quotation", editId],
        queryFn: () => quotationService.getQuotation(editId!),
        enabled: isEditing && !!editId
    });

    useEffect(() => {
        if (isEditing && existingQuotation) {
            const found = existingQuotation;
            setForm(prev => ({
                ...prev,
                division: (found.division || "CONTRACTING") as DivisionId,
                project: found.project_name || found.project || "",
                client: found.client_name || found.client || "",
                customerCode: found.client_id?.toString() || "",
                quoteId: found.qtn_number || "",
                status: found.status || found.Status || prev.status,
                date: found.start_date || (found.created_at ? new Date(found.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
                discount: found.discount != null ? Number(found.discount) : 0,
                aboutUs: found.aboutUs ?? prev.aboutUs,
                whatWeDo: found.whatWeDo ?? prev.whatWeDo,
                proposalIntro: found.proposalIntro ?? prev.proposalIntro,
                financialTerms: found.financialTerms ?? prev.financialTerms,
                clientDuties: found.clientDuties ?? prev.clientDuties,
                paymentTerms: found.paymentTerms ?? prev.paymentTerms,
                formatVersion: (found.formatVersion === 2 ? 2 : 1) as 1 | 2,
                phone: found.phone || "",
            }));

            if (found.items && found.items.length > 0) {
                setItems(found.items);
            }
            setIsManualClient(!found.client_id);
        }
    }, [isEditing, existingQuotation]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Discount validation
        if (name === "discount") {
            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                setFieldErrors(prev => ({ ...prev, discount: "" }));
                setForm({ ...form, [name]: value === "" ? 0 : Number(value) });
            } else {
                setFieldErrors(prev => ({ ...prev, discount: "Only numbers allowed" }));
            }
            return;
        }

        setForm({
            ...form,
            [name]: value
        });
    };

    const handleItemChange = (index: number, field: keyof QuotationItem, value: string) => {
        const newItems = [...items];
        
        // Block non-numeric for Qty, Price, and Discount
        if (field === "quantity" || field === "unitPrice" || field === "discount") {
            if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
        }

        const updatedItem = { ...newItems[index], [field]: value };
        
        // Recalculate item amount
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
            const qty = Number(updatedItem.quantity);
            const price = Number(updatedItem.unitPrice);
            const disc = Number(updatedItem.discount || 0);
            updatedItem.amount = qty * price * (1 - (disc / 100));
        }
        
        newItems[index] = updatedItem;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, unit: "pcs", unitPrice: 0, discount: 0, amount: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleClientChange = (name: string, clientId?: string, phone?: string) => {
        setForm(prev => ({ 
            ...prev, 
            client: name, 
            customerCode: clientId || "",
            ...(phone ? { phone } : {})
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Basic Validation
        if (!form.project.trim()) {
            alert("Project Name is required.");
            return;
        }

        if (!form.client) {
            alert("Please select a client.");
            return;
        }

        if (items.some(item => !item.description?.trim())) {
            alert("Please provide a description for all line items.");
            return;
        }

        const validItems = items.filter(item => item.description.trim() !== "");
        if (validItems.length === 0) {
            alert("At least one product/service with a description is required.");
            return;
        }

        // Calculate totals
        const calculatedItems = items.map(item => {
            const qty = Number(item.quantity);
            const price = Number(item.unitPrice);
            const disc = Number(item.discount || 0);
            return {
                ...item,
                quantity: qty,
                unitPrice: price,
                discount: disc,
                amount: qty * price * (1 - (disc / 100))
            };
        });

        const totalAmount = calculatedItems.reduce((sum, item) => sum + item.amount, 0);
        const discountAmount = totalAmount * (Number(form.discount) / 100);
        const netTotal = totalAmount - discountAmount;
        const isApproved = user?.role === "SUPER_ADMIN";

        const submissionData: any = {
            quotation_number: isEditing ? form.quoteId : "",
            client_id: Number(form.customerCode) || 0, 
            division: form.division.toUpperCase(),
            total_amount: netTotal,
            status: form.status,
            items: calculatedItems,
            client_name: form.client,
            project_name: form.project,
            discount: Number(form.discount),
            start_date: form.date,
            valid_until: new Date(new Date(form.date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            terms: form.financialTerms + "\n" + form.paymentTerms,
            proposalIntro: form.proposalIntro,
            financialTerms: form.financialTerms,
            clientDuties: form.clientDuties,
            paymentTerms: form.paymentTerms,
            aboutUs: form.aboutUs,
            whatWeDo: form.whatWeDo,
            formatVersion: form.formatVersion,
            phone: form.phone
        };

        try {
            if (isEditing && editId) {
                await quotationService.updateQuotation(editId, submissionData);
            } else {
                await quotationService.createQuotation(submissionData);
                
                // If not admin, request approval
                if (!isApproved) {
                    requestApproval({
                        type: "quotation",
                        itemId: form.quoteId,
                        itemNumber: form.quoteId,
                        division: form.division,
                        amount: netTotal,
                        notes: form.proposalIntro
                    });
                }
            }

            queryClient.invalidateQueries({ queryKey: ["quotations"] });
            queryClient.invalidateQueries({ queryKey: ["client-quotations"] });
            queryClient.invalidateQueries({ queryKey: ["client-quotations-list"] });

            const activityMessage = isApproved 
                ? `${isEditing ? "Updated" : "Created"} Quotation ${form.quoteId}`
                : `${isEditing ? "Updated" : "Created"} Quotation ${form.quoteId} (Pending Approval)`;

            logActivity(activityMessage, "project", "/quotations", form.quoteId);
            navigate(`/quotations/${activeDivision}`);
        } catch (err: any) {
            console.error("ERROR SAVING QUOTATION:", err);
            const errorMsg = err.response?.data?.message || "Failed to save quotation to database.";
            alert(`${errorMsg}\nPlease ensure you have selected a valid client from the dropdown.`);
        }
    };

    return (
        <div className="p-6">
            <PageHeader showBack
                title={isEditing ? "Edit Quotation" : "Create Quotation"}
                subtitle="Generate a detailed cost estimate for Business, Contracting or Trading"
            />

            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm max-w-4xl mt-6">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Sector Selection (Visual Tiles) */}
                    <DivisionTiles
                        label="Select Division / Sector"
                        selectedId={form.division}
                        onChange={handleDivisionChange}
                        allowedIds={allowedSectors}
                        showAll={false}
                        disabled={isEditing}
                    />

                    {/* Format Selection */}
                    <div className="pt-6 border-t border-slate-50">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-3 block px-1">Select Quotation Format</label>
                        <div className="flex gap-4">
                            <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer flex-1 transition-all duration-200 ${form.formatVersion === 1 ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" name="formatVersion" className="accent-brand-600 w-4 h-4 cursor-pointer" checked={form.formatVersion === 1} onChange={() => handleFormatChange(1)} />
                                <div>
                                    <p className={`font-bold text-sm ${form.formatVersion === 1 ? 'text-brand-700' : 'text-slate-700'}`}>Format 1 (Standard)</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Classic detailed proposal layout.</p>
                                </div>
                            </label>
                            <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer flex-1 transition-all duration-200 ${form.formatVersion === 2 ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" name="formatVersion" className="accent-brand-600 w-4 h-4 cursor-pointer" checked={form.formatVersion === 2} onChange={() => handleFormatChange(2)} />
                                <div>
                                    <p className={`font-bold text-sm ${form.formatVersion === 2 ? 'text-brand-700' : 'text-slate-700'}`}>Format 2 (Alternative)</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Clean table-focused layout.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Header Details */}
                    <div className="pt-6 border-t border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <FormInput 
                                label="Quote ID" 
                                name="quoteId" 
                                value={form.quoteId || "AUTO-GENERATED BY BACKEND"} 
                                disabled 
                                className={!form.quoteId ? "text-emerald-600 font-bold italic" : ""} 
                            />
                            <FormInput label="Date" type="date" name="date" value={form.date} onChange={handleChange} required />
                            
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 px-1">Client Selection <span className="text-rose-500">*</span></label>
                                    {!isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsManualClient(!isManualClient);
                                                setForm(prev => ({ ...prev, client: "", customerCode: "" }));
                                            }}
                                            className="text-xs text-brand-600 hover:text-brand-700 font-semibold underline"
                                        >
                                            {isManualClient ? "Select from List" : "Enter Manually"}
                                        </button>
                                    )}
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={form.client}
                                        disabled
                                        className="w-full border border-slate-200 px-3 py-2 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed text-sm font-semibold h-[38px] disabled:border-slate-200"
                                    />
                                ) : isManualClient ? (
                                    <input
                                        type="text"
                                        name="client"
                                        value={form.client}
                                        onChange={(e) => setForm({ ...form, client: e.target.value, customerCode: "" })}
                                        className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                        placeholder="Enter client/company name manually"
                                        required
                                    />
                                ) : (
                                    <ClientAutocomplete
                                        value={form.client}
                                        onChange={handleClientChange}
                                        division={form.division}
                                        placeholder="Search client..."
                                    />
                                )}
                            </div>



                            <FormInput 
                                label="Customer Code" 
                                name="customerCode" 
                                value={isManualClient ? "Manual Entry" : form.customerCode} 
                                disabled 
                                placeholder="Auto-generated"
                            />

                            <FormInput 
                                label="Project Name" 
                                name="project" 
                                value={form.project} 
                                placeholder="e.g. ALWAAAB RESIDENCY MAIN ENTRANCE" 
                                onChange={handleChange} 
                                required 
                                disabled={isEditing}
                            />

                            <FormInput 
                                label="Phone Number / Mobile" 
                                name="phone" 
                                value={form.phone} 
                                placeholder="e.g. +974 1234 5678" 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <div className="flex justify-between items-end mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold text-slate-800">Products / Services</h3>
                            <button type="button" onClick={addItem} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description (Product Type) <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md"
                                            placeholder="Supply and installation of..."
                                            required
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">QTY</label>
                                        <input
                                            type="text"
                                            value={item.quantity || ''}
                                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500"
                                            required
                                        />
                                    </div>
                                    <div className="w-28">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unit</label>
                                        {item.unit !== undefined && !["pcs", "sqm", "meter", "cm", "nos"].includes(item.unit) ? (
                                            <div className="flex gap-1 items-center">
                                                <input
                                                    type="text"
                                                    value={item.unit || ""}
                                                    onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                                                    placeholder="Enter unit"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleItemChange(index, "unit", "pcs")}
                                                    className="text-slate-400 hover:text-red-500 text-lg font-bold px-1"
                                                    title="Reset to list"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <select
                                                value={item.unit || "pcs"}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "other") {
                                                        handleItemChange(index, "unit", "");
                                                    } else {
                                                        handleItemChange(index, "unit", val);
                                                    }
                                                }}
                                                className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                                            >
                                                <option value="pcs">pcs</option>
                                                <option value="sqm">sqm</option>
                                                <option value="meter">meter</option>
                                                <option value="cm">cm</option>
                                                <option value="nos">nos</option>
                                                <option value="other">Other...</option>
                                            </select>
                                        )}
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            {item.unit ? `${item.unit} Price` : "Unit Price"}
                                        </label>
                                        <input
                                            type="text"
                                            value={item.unitPrice || ''}
                                            onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500 text-right"
                                            required
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Disc (%)</label>
                                        <input
                                            type="text"
                                            value={item.discount || ''}
                                            onChange={(e) => handleItemChange(index, "discount", e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500 text-right"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total</label>
                                        <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-slate-600 font-medium text-right">
                                            {(Number(item.quantity) * Number(item.unitPrice) * (1 - (Number(item.discount || 0) / 100))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals & Discount */}
                    <div className="flex justify-end pt-4">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                <span>Subtotal</span>
                                <span>{items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) * (1 - (Number(item.discount || 0) / 100))), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                             <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                 <span>Discount (%)</span>
                                 <div className="flex flex-col items-end">
                                    <input
                                        type="text"
                                        name="discount"
                                        value={form.discount ?? 0}
                                        onChange={handleChange}
                                        className={`w-24 px-2 py-1 text-right bg-slate-50 border rounded-md outline-none focus:ring-1 focus:ring-brand-500 ${fieldErrors.discount ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                                    />
                                    {fieldErrors.discount && <span className="text-[9px] text-red-500 font-bold">{fieldErrors.discount}</span>}
                                 </div>
                             </div>
                            <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-2 border-t">
                                <span>Net Total</span>
                                <span>{(items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) * (1 - (Number(item.discount || 0) / 100))), 0) * (1 - (form.discount / 100))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} QAR</span>
                            </div>
                        </div>
                    </div>

                    {/* Proposal Content Customization */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-slate-800 border-b-2 border-brand-500 pb-2">Proposal Content (Customizable)</h3>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">About Us</label>
                            <textarea
                                name="aboutUs"
                                value={form.aboutUs}
                                onChange={(e) => setForm({ ...form, aboutUs: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">What We Do (One item per line)</label>
                            <textarea
                                name="whatWeDo"
                                value={form.whatWeDo}
                                onChange={(e) => setForm({ ...form, whatWeDo: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Proposal Introduction & Activities</label>
                            <textarea
                                name="proposalIntro"
                                value={form.proposalIntro}
                                onChange={(e) => setForm({ ...form, proposalIntro: e.target.value })}
                                rows={10}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Financial & Commercial Terms</label>
                                <textarea
                                    name="financialTerms"
                                    value={form.financialTerms}
                                    onChange={(e) => setForm({ ...form, financialTerms: e.target.value })}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Client Duties</label>
                                <textarea
                                    name="clientDuties"
                                    value={form.clientDuties}
                                    onChange={(e) => setForm({ ...form, clientDuties: e.target.value })}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Payment Terms & Notes</label>
                            <textarea
                                name="paymentTerms"
                                value={form.paymentTerms}
                                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t flex justify-end">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 font-bold"
                        >
                            <Save size={18} />
                            {editId ? "Update Quotation" : "Generate Quotation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
