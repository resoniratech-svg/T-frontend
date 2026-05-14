import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart as RePieChart, Pie 
} from 'recharts';
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { TrendingUp, DollarSign, PieChart, ArrowDownRight } from "lucide-react";
import { useInventory } from "../../hooks/useInventory";

function ProfitReport() {
  const { profitStats, isLoadingProfitStats } = useInventory();
  const { 
    totalRevenue = 0, 
    totalCosts = 0, 
    totalProfit = 0, 
    profitMargin = 0,
    categoryBreakdown = [],
    monthlyProfit = []
  } = profitStats || {};

  if (isLoadingProfitStats) {
    return <div className="p-20 text-center font-bold text-gray-400 animate-pulse">Loading Profit Report...</div>;
  }

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-8 bg-[#F8FAFC]">
      <PageHeader showBack
        title="Profit Report"
        subtitle="Financial breakdown of inventory sales and procurement costs"
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`QAR ${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="text-blue-600" />}
          trend={{ value: "Gross Sales", positive: true }}
          path="/invoices"
        />
        <StatCard
          title="Total Costs"
          value={`QAR ${totalCosts.toLocaleString()}`}
          icon={<ArrowDownRight className="text-rose-600" />}
          trend={{ value: "Expenditure", positive: false }}
          path="/expenses"
        />
        <StatCard
          title="Net Profit"
          value={`QAR ${totalProfit.toLocaleString()}`}
          icon={<TrendingUp className="text-emerald-600" />}
          trend={{ value: `${profitMargin.toFixed(1)}% Margin`, positive: totalProfit > 0 }}
          path="/profit-loss"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <PieChart size={20} className="text-indigo-600" />
                Profit by Category
            </h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                            {categoryBreakdown.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-600" />
                Monthly Revenue Trend
            </h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyProfit}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                        <Tooltip 
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProfitReport;