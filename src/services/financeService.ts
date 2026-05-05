import api from "./api";
import type { Invoice, Payment } from "../types/finance";

export const financeService = {
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get("/invoices");
    return response.data?.data || response.data || [];
  },

  getInvoicesByClient: async (clientId: string): Promise<Invoice[]> => {
    const response = await api.get(`/invoices?clientId=${clientId}`);
    return response.data?.data || response.data || [];
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data?.data || response.data;
  },

  createInvoice: async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.post("/invoices", invoiceData);
    return response.data?.data || response.data;
  },

  updateInvoice: async (id: string, invoiceData: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  deleteInvoice: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

  updatePaymentStatus: async (id: string, status: Invoice["status"]): Promise<Invoice> => {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },
  
  getPayments: async (): Promise<any[]> => {
    const response = await api.get("/payments");
    // Extract data from paginated backend response
    const rawData = response.data?.data?.data || response.data?.data || response.data || [];
    return Array.isArray(rawData) ? rawData.map((p: any) => ({
       id: `PAY-${p.id}`,
       dbId: p.id,
       client: p.explicit_client_name || p.user_client_name || "N/A",
       invoice: p.invoice_number || `INV-${p.invoice_id}`,
       amount: p.amount || 0,
       date: p.payment_date || p.created_at?.split('T')[0] || '',
       division: p.division || "SERVICE",
       status: "Paid"
    })) : [];
  },

  recordPayment: async (paymentData: Partial<Payment>): Promise<Payment> => {
    const response = await api.post("/payments", paymentData);
    return response.data;
  },

  // Expenses
  getExpenses: async (): Promise<any[]> => {
    const response = await api.get("/v1/expenses");
    return response.data?.data || response.data || [];
  },

  getExpense: async (id: string): Promise<any> => {
    const response = await api.get(`/v1/expenses/${id}`);
    return response.data?.data || response.data;
  },

  createExpense: async (expenseData: any): Promise<any> => {
    const response = await api.post("/v1/expenses", expenseData);
    return response.data?.data || response.data;
  },

  updateExpense: async (id: string, expenseData: any): Promise<any> => {
    const response = await api.put(`/v1/expenses/${id}`, expenseData);
    return response.data?.data || response.data;
  },

  deleteExpense: async (id: string): Promise<any> => {
    const response = await api.delete(`/v1/expenses/${id}`);
    return response.data?.data || response.data;
  },

  approveExpense: async (id: string, allocations: any[] = []): Promise<any> => {
    const response = await api.put(`/v1/expenses/${id}/approve`, { allocations });
    return response.data?.data || response.data;
  },

  rejectExpense: async (id: string): Promise<any> => {
    const response = await api.put(`/v1/expenses/${id}/reject`);
    return response.data?.data || response.data;
  }
};
