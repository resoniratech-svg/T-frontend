import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import { inventoryService } from "../../services/inventoryService";
import { purchaseService } from "../../services/purchaseService";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import type { InventoryProduct, PurchaseOrder } from "../../types/inventory";
import api from "../../services/api";

function CreatePurchaseOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = !!id;
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams(location.search);
  const initialProductId = queryParams.get("productId") || "";

  // 1. Fetch products for selection
  const { data: products = [] } = useQuery<InventoryProduct[]>({
    queryKey: ["products"],
    queryFn: inventoryService.getProducts
  });
  
  const [form, setForm] = useState({
    productId: initialProductId,
    quantity: 0,
    unitPrice: 0,
    status: "Pending" as PurchaseOrder["status"],
    supplier: "Unknown Supplier"
  });
  const [numericError, setNumericError] = useState<Record<string, string>>({});
  const numericFields = ['quantity', 'unitPrice'];

  // Fetch existing PO if editing
  useEffect(() => {
    if (isEditing) {
      api.get('/purchase-orders').then(res => {
        const data = res.data?.data || [];
        const existing = data.find((po: any) => String(po.id) === id);
        if (existing) {
          setForm({
            productId: String(existing.productId || existing.product_id || ""),
            quantity: existing.quantity || 0,
            unitPrice: existing.unitPrice || existing.unit_price || 0,
            status: existing.status || "Pending",
            supplier: existing.supplier || "Unknown Supplier"
          });
        }
      }).catch(console.error);
    }
  }, [id, isEditing]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Numeric-only validation for quantity/price
    if (numericFields.includes(name)) {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setNumericError(prev => ({ ...prev, [name]: '' }));
        setForm({
          ...form,
          [name]: value === '' ? 0 : parseFloat(value)
        });
      } else {
        setNumericError(prev => ({ ...prev, [name]: 'Only numbers are allowed' }));
      }
      return;
    }

    setForm({
      ...form,
      [name]: value
    });
  };

  const productOptions = products.map(p => ({ label: p.name, value: p.id }));

  // 2. Mutation for PO creation/update
  const mutation = useMutation({
    mutationFn: async (data: Partial<PurchaseOrder>) => {
      if (isEditing) {
        // First update the order details
        await api.put(`/purchase-orders/${id}`, data);
        
        // If they changed the status to Received, we need to call the status update endpoint to handle stock changes
        if (data.status === 'Received') {
            await api.patch(`/purchase-orders/${id}/status`, { status: 'Received' });
        }
        return { data: { success: true } };
      }
      return purchaseService.createPurchaseOrder(data as any);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
        queryClient.invalidateQueries({ queryKey: ["products"] }); // Stock might have updated if status was 'Received'
        navigate("/inventory/purchase-orders");
    },
    onError: (error: any) => {
        alert(`Failed to save PO: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => String(p.id) === String(form.productId));
    if (!product) return alert("Please select a product");

    mutation.mutate({
        ...form,
        supplier: form.supplier || "Unknown Supplier", // Default for now
        totalAmount: form.quantity * form.unitPrice,
        date: dayjs().format("YYYY-MM-DD")
    } as any);
  };

  const selectedProductData = products.find(p => String(p.id) === String(form.productId));
  const currentStock = selectedProductData ? Number(selectedProductData.stockQuantity) || 0 : 0;

  return (
    <div className="p-6">
      <PageHeader showBack title={isEditing ? "Edit Purchase Order" : "Create Purchase Order"} subtitle={isEditing ? "Update order details" : "Initiate a new stock procurement"} />

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <FormSelect
          label="Select Product"
          name="productId"
          value={form.productId}
          onChange={handleChange}
          options={productOptions}
          required
          disabled={isEditing}
        />

        <FormInput
          label="Supplier"
          type="text"
          name="supplier"
          value={form.supplier}
          onChange={handleChange}
          required
        />

        <div>
            <FormInput
                label="Quantity"
                type="text"
                name="quantity"
                value={form.quantity || ''}
                onChange={handleChange}
                required
            />
            {numericError.quantity && <p className="text-red-500 text-xs mt-1 font-medium">{numericError.quantity}</p>}
            {selectedProductData && !isEditing && (
                <p className="text-[11px] mt-1.5 font-bold text-slate-500">
                    Current Stock: {currentStock}
                    {Number(form.quantity) > 0 && (
                        <span className="text-emerald-600 ml-1">
                            → New Stock Total: {currentStock + Number(form.quantity)}
                        </span>
                    )}
                </p>
            )}
        </div>

        <div>
            <FormInput
                label="Unit Price (QAR)"
                type="text"
                name="unitPrice"
                value={form.unitPrice || ''}
                onChange={handleChange}
                required
            />
            {numericError.unitPrice && <p className="text-red-500 text-xs mt-1 font-medium">{numericError.unitPrice}</p>}
        </div>

        <FormSelect
            label="Order Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
                { label: "Pending Approval", value: "Pending" },
                { label: "Received (Update Stock)", value: "Received" }
            ]}
            required
            disabled={isEditing && form.status !== 'Pending'}
        />

        <div className="md:col-span-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-bold text-blue-900">Total Calculation</p>
            <p className="text-2xl font-black text-blue-600">QAR {(form.quantity * form.unitPrice).toLocaleString()}</p>
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="bg-brand-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-brand-700 transition flex items-center gap-2 disabled:opacity-70"
          >
            {mutation.isPending ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                </>
            ) : isEditing ? "Update PO" : "Save PO"}
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/inventory/purchase-orders")} 
            className="bg-slate-100 text-slate-600 px-8 py-2.5 rounded-lg font-bold hover:bg-slate-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePurchaseOrder;
