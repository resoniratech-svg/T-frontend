import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, BookOpen, Download } from "lucide-react";
import { useDivision } from "../../context/DivisionContext";
import { exportToCSV } from "../../utils/exportUtils";
import { DIVISIONS } from "../../constants/divisions";
import { financeService } from "../../services/financeService";

function ProfitLoss() {
  const { activeDivision } = useDivision();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [invRes, expRes] = await Promise.all([
          financeService.getInvoices(),
          financeService.getExpenses()
        ]);
        setInvoices(invRes || []);
        
        // Flatten expenses for accurate division-wise reporting
        const flattenedExpenses: any[] = [];
        (expRes || []).forEach((e: any) => {
          if (e.allocations && e.allocations.length > 0) {
            e.allocations.forEach((alloc: any) => {
              flattenedExpenses.push({
                ...e,
                division: (alloc.division || "general").toLowerCase(),
                amount: parseFloat(alloc.amount || 0)
              });
            });
          } else {
            flattenedExpenses.push({
              ...e,
              division: (e.division || e.branch || "general").toLowerCase(),
              amount: parseFloat(e.total_amount || e.amount || 0)
            });
          }
        });
        setExpenses(flattenedExpenses);
      } catch (err) {
        console.error("Failed to fetch P&L data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeLower = activeDivision.toLowerCase();
  const mappedDivision = activeLower === "service" ? "business" : activeLower;
  const filteredInvoices = useMemo(() => {
    return activeDivision === "all" 
      ? invoices 
      : invoices.filter((i: any) => {
          const iDiv = (i.branch || i.division || "").toLowerCase();
          return iDiv === mappedDivision || iDiv === activeLower;
        });
  }, [invoices, activeDivision, activeLower, mappedDivision]);

  const filteredExpenses = useMemo(() => {
    return activeDivision === "all" 
      ? expenses 
      : expenses.filter((e: any) => {
          const eDiv = (e.referenceType || e.division || "general").toLowerCase();
          return eDiv === mappedDivision || eDiv === activeLower;
        });
  }, [expenses, activeDivision, activeLower, mappedDivision]);

  const isStatusValid = (stat: string) => {
    const s = stat.toLowerCase();
    return s !== "draft" && s !== "cancelled" && s !== "pending" && s !== "pending_approval";
  };

  const isStatusPending = (stat: string) => {
    const s = stat.toLowerCase();
    return s === "pending" || s === "pending_approval";
  };

  const totalRevenue = useMemo(() => filteredInvoices.filter((i: any) => isStatusValid(i.approval_status || i.approvalStatus || i.status || "")).reduce((sum, inv) => sum + parseFloat(inv.total_amount || inv.total || inv.amount || 0), 0), [filteredInvoices]);
  const totalExpenses = useMemo(() => filteredExpenses.filter((e: any) => isStatusValid(e.approval_status || e.approvalStatus || e.status || "")).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0), [filteredExpenses]);
  const netProfit = totalRevenue - totalExpenses;

  const pendingRevenue = useMemo(() => filteredInvoices.filter((i: any) => isStatusPending(i.approval_status || i.approvalStatus || i.status || "")).reduce((sum, inv) => sum + parseFloat(inv.total_amount || inv.total || inv.amount || 0), 0), [filteredInvoices]);
  const pendingExpenses = useMemo(() => filteredExpenses.filter((e: any) => isStatusPending(e.approval_status || e.approvalStatus || e.status || "")).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0), [filteredExpenses]);

  // Taxation calculations
  const outputVAT = useMemo(() => filteredInvoices.filter((i: any) => isStatusValid(i.approval_status || i.approvalStatus || i.status || "")).reduce((sum, inv) => sum + parseFloat(inv.taxAmount || 0), 0), [filteredInvoices]);
  const inputVAT = useMemo(() => filteredExpenses.filter((e: any) => isStatusValid(e.approval_status || e.approvalStatus || e.status || "")).reduce((sum, exp) => sum + parseFloat(exp.taxAmount || 0), 0), [filteredExpenses]);
  const netVAT = outputVAT - inputVAT;

  const divisionBreakdown = useMemo(() => {
    return DIVISIONS.map(div => {
      const divIdLower = div.id.toLowerCase();
      const mappedDiv = divIdLower === "service" ? "business" : divIdLower;
      const divInvoices = invoices.filter(i => {
        const iDiv = (i.branch || i.division || "").toLowerCase();
        return (iDiv === mappedDiv || iDiv === divIdLower) && isStatusValid(i.approval_status || i.approvalStatus || i.status || "");
      });
      const divExpenses = expenses.filter(e => {
        const eDiv = (e.branch || e.division || "").toLowerCase();
        return (eDiv === mappedDiv || eDiv === divIdLower) && isStatusValid(e.approval_status || e.approvalStatus || e.status || "");
      });
      
      const revenue = divInvoices.reduce((s, i) => s + parseFloat(i.total_amount || i.total || i.amount || 0), 0);
      const exps = divExpenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
      
      return {
        name: div.label,
        revenue,
        expenses: exps,
        profit: revenue - exps
      };
    });
  }, [invoices, expenses]);

  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => {
      const monthIncome = filteredInvoices
        .filter(inv => {
          const itemDate = inv.invoice_date || inv.date || inv.created_at;
          const d = new Date(itemDate);
          return d.getMonth() === index && isStatusValid(inv.approval_status || inv.approvalStatus || inv.status || "");
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total_amount || inv.total || inv.amount || 0), 0);
      const monthExpense = filteredExpenses
        .filter(exp => {
          const itemDate = exp.date || exp.created_at;
          const d = new Date(itemDate);
          return d.getMonth() === index && isStatusValid(exp.approval_status || exp.approvalStatus || exp.status || "");
        })
        .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      return { name: month, Revenue: monthIncome, Expenses: monthExpense };
    });
  }, [filteredInvoices, filteredExpenses]);

  const currentDivision = DIVISIONS.find(d => d.id === activeDivision);

  if (isLoading) {
    return <div className="p-20 text-center font-bold text-gray-400 animate-pulse">Loading Profit & Loss Data...</div>;
  }

  return (
    <div className="space-y-6 pb-12 p-6">
      <PageHeader 
        showBack
        title={activeDivision === "all" ? "Profit & Loss Report" : `${currentDivision?.label} P&L Report`}
        subtitle={activeDivision === "all" ? "Track company revenue and expenses over time" : `Financial performance for the ${currentDivision?.label}`}
        action={
            <button 
                onClick={() => exportToCSV(chartData, 'profit_loss_report.csv')}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all"
            >
                <Download size={16} /> Export Report
            </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">QAR {totalRevenue.toLocaleString()}</p>
          {pendingRevenue > 0 && <p className="text-xs text-amber-600 mt-2 font-medium">+{pendingRevenue.toLocaleString()} pending</p>}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Expenses</p>
          <p className="text-3xl font-bold text-gray-900">QAR {totalExpenses.toLocaleString()}</p>
          {pendingExpenses > 0 && <p className="text-xs text-amber-600 mt-2 font-medium">+{pendingExpenses.toLocaleString()} pending</p>}
        </div>

        <div className={`p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow text-white ${netProfit >= 0 ? "bg-brand-600" : "bg-rose-600"}`}>
          <p className="text-sm font-medium opacity-80 mb-2 uppercase tracking-wider">Net {netProfit >= 0 ? "Profit" : "Loss"}</p>
          <p className="text-3xl font-bold">QAR {Math.abs(netProfit).toLocaleString()}</p>
          <div className="mt-2 text-[10px] font-medium opacity-70 uppercase">Approved only</div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow text-white">
          <p className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Projected Position</p>
          <p className="text-3xl font-bold text-emerald-400">QAR {(netProfit + pendingRevenue - pendingExpenses).toLocaleString()}</p>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Taxation Summary</p>
            <p className="text-xs font-medium text-slate-300">Net VAT: QAR {netVAT.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {activeDivision === "all" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-500"></span> Division Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Division</th>
                  <th className="px-6 py-4 font-semibold text-right">Revenue</th>
                  <th className="px-6 py-4 font-semibold text-right">Expenses</th>
                  <th className="px-6 py-4 font-semibold text-right text-emerald-600">Profit</th>
                  <th className="px-6 py-4 font-semibold text-right text-rose-600">Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {divisionBreakdown.map((div, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{div.name}</td>
                    <td className="px-6 py-4 text-sm text-right text-emerald-600 font-medium">QAR {div.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right text-rose-600 font-medium">QAR {div.expenses.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right font-black text-emerald-700">
                        {div.profit >= 0 ? `QAR ${div.profit.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-black text-rose-700">
                        {div.profit < 0 ? `QAR ${Math.abs(div.profit).toLocaleString()}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6 font-mono tracking-tight uppercase flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-500" /> Financial Momentum (2026)
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={(value) => `QAR ${value.toLocaleString()}`} />
              <Tooltip
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table Link */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-center p-12">
           <h3 className="text-lg font-bold text-gray-800 mb-2">Detailed Financial Breakdown</h3>
           <p className="text-slate-500 mb-6">Full ledger breakdown for the selected sector is available in the General Ledger system.</p>
           <Link to="/ledger" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all">
             <BookOpen size={18} /> View General Ledger
           </Link>
      </div>
    </div>
  );
}

export default ProfitLoss;