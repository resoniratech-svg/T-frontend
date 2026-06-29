import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { inventoryService } from "../../services/inventoryService";
import { clientService } from "../../services/clientService";
import { Loader2 } from "lucide-react";
import type { InventoryProduct, SalesOrder } from "../../types/inventory";
import api from "../../services/api";

function CreateSalesOrder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const queryClient = useQueryClient();

  // 1. Fetch Products for selection
  const { data: products = [], isLoading: productsLoading } = useQuery<InventoryProduct[]>({
    queryKey: ["inventory-products"],
    queryFn: inventoryService.getProducts
  });

  // Fetch Clients
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getClients()
  });

  const [form, setForm] = useState({
    productId: "",
    clientId: "",
    quantity: 0,
    unitPrice: 0,
    status: "Pending" as SalesOrder["status"],
    customer: "Unknown Customer"
  });
  const [numericError, setNumericError] = useState<Record<string, string>>({});
  const numericFields = ['quantity', 'unitPrice'];

  // Fetch existing SO if editing
  useEffect(() => {
    if (isEditing) {
      api.get('/inventory/sales-orders').then(res => {
        const data = res.data?.data || [];
        const existing = data.find((so: any) => String(so.id) === id);
        if (existing) {
          setForm({
            productId: String(existing.productId || existing.product_id || ""),
            clientId: String(existing.clientId || existing.client_id || ""),
            quantity: existing.quantity || 0,
            unitPrice: existing.unitPrice || existing.unit_price || 0,
            status: existing.status || "Pending",
            customer: existing.customer || "Unknown Customer"
          });
        }
      }).catch(console.error);
    }
  }, [id, isEditing]);

  // 2. Mutation for creating/updating SO
  const mutation = useMutation({
    mutationFn: async (data: Partial<SalesOrder>) => {
      if (isEditing) {
        // First update the order details
        await api.put(`/inventory/sales-orders/${id}`, data);
        
        // If they changed the status from Pending, we need to call the status update endpoint to handle stock changes
        if (data.status && data.status !== 'Pending') {
            await api.patch(`/inventory/sales-orders/${id}/status`, { status: data.status });
        }
        return { data: { success: true } };
      }
      return inventoryService.createSalesOrder(data as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      navigate("/inventory/sales-orders");
    },
    onError: (error: any) => {
      alert(`Sales order submission failed: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    }
  });

  if (productsLoading || clientsLoading) {
    return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse text-gray-400">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-bold">Loading Data...</p>
        </div>
    );
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Numeric-only validation
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

  const productOptions = products.map((p) => ({ label: p.name, value: p.id }));
  const clientOptions = clients.map((c: any) => ({ 
    label: c.contact_person || c.contactPerson || c.name, 
    value: c.id 
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => String(p.id) === String(form.productId));
    if (!product) return alert("Please select a product");

    if (form.quantity > product.stockQuantity && !isEditing) {
        if (!window.confirm("Quantity exceeds current stock. Proceed anyway?")) return;
    }

    const selectedClient = clients.find((c: any) => String(c.id) === String(form.clientId));
    if (!selectedClient && !isEditing) return alert("Please select a client");

    mutation.mutate({
        ...form,
        customer: selectedClient ? (selectedClient.name || "Unknown Client") : form.customer,
        client_id: form.clientId,
        totalAmount: form.quantity * form.unitPrice,
        date: dayjs().format("YYYY-MM-DD")
    } as any);
  };

  const selectedProductData = products.find((p) => String(p.id) === String(form.productId));
  const purchasePrice = selectedProductData ? Number(selectedProductData.purchasePrice) || 0 : 0;
  const currentStock = selectedProductData ? Number(selectedProductData.stockQuantity) || 0 : 0;

  return (
    <div className="p-6">
      <PageHeader showBack title={isEditing ? "Edit Sales Order" : "Create Sales Order"} subtitle={isEditing ? "Update customer order" : "Record a new customer sale"} />

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <FormSelect
          label="Select Client"
          name="clientId"
          value={form.clientId}
          onChange={handleChange}
          options={clientOptions}
          required
          disabled={isEditing}
        />

        <FormSelect
          label="Select Product"
          name="productId"
          value={form.productId}
          onChange={handleChange}
          options={productOptions}
          required
          disabled={isEditing}
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
                <p className={`text-[11px] mt-1.5 font-bold ${Number(form.quantity) > currentStock ? 'text-rose-600' : 'text-slate-500'}`}>
                    Available Stock: {currentStock}
                    {Number(form.quantity) > currentStock && " (Warning: Exceeds available stock!)"}
                </p>
            )}
        </div>

        <div>
            <FormInput
                label="Unit Selling Price (QAR)"
                type="text"
                name="unitPrice"
                value={form.unitPrice || ''}
                onChange={handleChange}
                required
            />
            {numericError.unitPrice && <p className="text-red-500 text-xs mt-1 font-medium">{numericError.unitPrice}</p>}
            {(purchasePrice > 0 && Number(form.unitPrice) > 0) && (
               <p className={`text-[11px] font-bold mt-1.5 ${Number(form.unitPrice) - purchasePrice >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {Number(form.unitPrice) - purchasePrice >= 0 ? 'Unit Profit' : 'Unit Loss'}: QAR {Math.abs(Number(form.unitPrice) - purchasePrice).toLocaleString()} 
                  <span className="text-slate-400 font-medium ml-1">
                    ({(((Number(form.unitPrice) - purchasePrice) / Number(form.unitPrice)) * 100).toFixed(1)}% margin)
                  </span>
               </p>
            )}
        </div>

        <FormSelect
            label="Delivery Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
                { label: "Pending Shipment", value: "Pending" },
                { label: "Shipped (Reduce Stock)", value: "Shipped" },
                { label: "Delivered", value: "Delivered" },
                { label: "Cancelled", value: "Cancelled" }
            ]}
            required
            disabled={isEditing && form.status !== 'Pending'}
        />

        <div className="md:col-span-2 p-4 bg-brand-50 rounded-xl border border-brand-100">
            <p className="text-sm font-bold text-brand-900">Projected Revenue</p>
            <p className="text-2xl font-black text-brand-600">QAR {(form.quantity * form.unitPrice).toLocaleString()}</p>
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-70">
            {mutation.isPending ? "Saving..." : (isEditing ? "Update Order" : "Create Order")}
          </button>
          <button type="button" onClick={() => navigate("/inventory/sales-orders")} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-bold">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default CreateSalesOrder;
