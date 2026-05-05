import { useQuery } from "@tanstack/react-query";
import PageLoader from "../../components/PageLoader";
import StatCard from "../../components/StatCard";
import ChartCard from "../../components/ChartCard";
import StatusBadge from "../../components/StatusBadge";
import ActivityLog from "../../components/ActivityLog";
import { Banknote, Folder, TrendingUp, AlertTriangle, Target, ArrowRight, BarChart3, CreditCard, Briefcase, Clock, Eye, Edit, Trash2, Landmark, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";
import type { DivisionId } from "../../constants/divisions";
import { adminService } from "../../services/adminService";
import type { AdminDashboardData, RevenueTrend, DivisionPerformance, LeadFunnelStage, AdminProject } from "../../types/admin";
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    AreaChart,
    Area,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

const FUNNEL_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

export default function AdminDashboard() {
    const navigate = useNavigate();
    useAuth();
    const { activeDivision } = useDivision();




    // 1. Fetch all dashboard data from mock API
    const { data: dashboardData, isLoading, error, isError } = useQuery<AdminDashboardData>({
        queryKey: ["admin-dashboard", activeDivision],
        queryFn: () => adminService.getDashboardStats(activeDivision),
        retry: 1 // Only retry once to avoid infinite loading delays on critical failures
    });

    const currentDivision = DIVISIONS.find(d => d.id === activeDivision);

    if (isLoading) {
        return <PageLoader message="Aggregating Executive Analytics..." />;
    }

    if (isError || !dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-red-100 p-8 text-center">
                <AlertTriangle size={48} className="text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics Engine Offline</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                    We encountered a connection issue while fetching the dashboard statistics. 
                    {(error as any)?.message || "The server might be unreachable or returning an error."}
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-medium text-sm"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const stats = dashboardData.stats;
    const divisionPerformance: DivisionPerformance[] = dashboardData.divisionPerformance || [];
    const revenueTrends: RevenueTrend[] = dashboardData.revenueTrends || [];
    const activeProjects: AdminProject[] = dashboardData.activeProjects || [];
    const pendingPayments = dashboardData.pendingPayments || [];
    const recentInvoices = dashboardData.recentInvoices || [];
    const recentExpenses = dashboardData.recentExpenses || [];

    const maxDivRevenue = Math.max(...divisionPerformance.map((d) => d.revenue), 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                        {activeDivision === "all" ? "Super Admin Dashboard" : `${currentDivision?.label} Dashboard`}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                        {activeDivision === "all" ? "Full system overview — real-time analytics from all sectors." : `Overview for the ${currentDivision?.label} operations.`}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Link to="/create-invoice" className="flex-1 sm:flex-none text-center bg-brand-600 hover:bg-brand-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2">
                        <Banknote size={14} /> New Invoice
                    </Link>
                    <Link to="/create-project" className="flex-1 sm:flex-none text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm">
                        New Project
                    </Link>
                    <Link to="/clients" className="flex-1 sm:flex-none text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm">
                        View Clients
                    </Link>
                </div>
            </div>

            {/* === KPI Stat Cards === */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard
                    title="Total Receivables"
                    value={`QAR ${stats.totalReceivables.toLocaleString()}`}
                    icon={<Banknote size={20} className="text-emerald-500" />}
                    trend={{ value: "Unpaid invoices", positive: true }}
                    path="/invoices"
                    className="hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
                />
                <StatCard
                    title="Total Payables"
                    value={`QAR ${stats.totalPayables.toLocaleString()}`}
                    icon={<CreditCard size={20} className="text-rose-500" />}
                    trend={{ value: "Approved expenses", positive: false }}
                    path="/expenses"
                    className="hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300"
                />
                <StatCard
                    title="Active Projects"
                    value={stats.activeProjects.toString()}
                    icon={<Folder size={20} className="text-brand-500" />}
                    trend={{ value: activeDivision === 'all' ? "Across all sectors" : `In ${currentDivision?.label || 'this sector'}`, positive: true }}
                    path="/projects"
                    className="hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
                />
                <StatCard
                    title="Inactive Projects"
                    value={stats.inactiveProjects.toString()}
                    icon={<Briefcase size={20} className="text-gray-500" />}
                    trend={{ value: "Completed/Cancelled", positive: false }}
                    path="/projects"
                    className="hover:shadow-lg hover:shadow-gray-500/5 transition-all duration-300"
                />
                <StatCard
                    title="Completed Projects"
                    value={stats.completedProjects.toString()}
                    icon={<CheckCircle size={20} className="text-emerald-500" />}
                    trend={{ value: "Successfully delivered", positive: true }}
                    path="/projects"
                    className="hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
                />

            </div>

            {/* === Row 2: Revenue Trends + Division Performance === */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Revenue Trends Chart */}
                <ChartCard title="Revenue & Expense Trends" className="lg:col-span-2">
                    <div className="flex justify-end mb-2 -mt-8">
                        <Link to="/profit-loss" className="text-[10px] text-brand-600 font-bold hover:underline">Full Report →</Link>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueTrends}>
                            <defs>
                                <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpAdmin" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "none",
                                    borderRadius: "12px",
                                    boxShadow: "0 10px 20px -5px rgba(0,0,0,0.1)",
                                    fontSize: "13px",
                                    padding: "12px 16px"
                                }}
                                formatter={(value: number | undefined) => [`QAR ${Number(value || 0).toLocaleString()}`, undefined]}
                            />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#colorRevAdmin)" />
                            <Area type="monotone" dataKey="expense" name="Expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#colorExpAdmin)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Division-wise Performance */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center relative">
                                <BarChart3 size={16} />
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                            </div>
                            <h2 className="text-sm font-semibold text-gray-800">Sector Performance</h2>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        {divisionPerformance.map((div) => (
                            <div key={div.division} className="group">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-gray-700">{div.label}</span>
                                    <span className="text-xs font-bold text-gray-900">QAR {div.revenue.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                                        style={{
                                            width: `${Math.max((div.revenue / maxDivRevenue) * 100, 4)}%`,
                                            backgroundColor: div.color
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-gray-400">{div.projects} projects</span>
                                    <span className="text-[10px] text-gray-400">•</span>
                                    <span className={`text-[10px] font-bold ${div.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {div.profit >= 0 ? '+' : ''}QAR {div.profit.toLocaleString()} profit
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* === Row 3: Pending Payments + Lead Conversion Funnel === */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Pending Payments Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock size={16} />
                            </div>
                            <h2 className="text-sm font-semibold text-gray-800">Pending Payments</h2>
                        </div>
                        <Link to="/payments" className="text-xs text-brand-600 font-bold hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 text-left">
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoice</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Sector</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pendingPayments.length > 0 ? pendingPayments.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-brand-50/30 transition-colors group cursor-pointer" onClick={() => navigate(`/invoice-details/${inv.id}`)}>
                                        <td className="px-5 py-3 font-medium text-brand-600 group-hover:underline underline-offset-4">{inv.invoiceNo}</td>
                                        <td className="px-5 py-3 text-gray-700 font-medium">{inv.client}</td>
                                        <td className="px-5 py-3 hidden md:table-cell">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                inv.division?.toLowerCase() === 'service' ? 'bg-blue-100 text-blue-600' :
                                                inv.division?.toLowerCase() === 'trading' ? 'bg-amber-100 text-amber-600' :
                                                'bg-violet-100 text-violet-600'
                                            }`}>
                                                {inv.division}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-bold text-gray-900">QAR {inv.amount.toLocaleString()}</td>
                                        <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-gray-400 italic text-sm">No pending payments found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>

            {/* === Row 4: Active Projects + Recent Activity === */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Active Projects */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                                <Briefcase size={16} />
                            </div>
                            <h2 className="text-sm font-semibold text-gray-800">Active Projects</h2>
                        </div>
                        <Link to="/projects" className="text-xs text-brand-600 font-bold hover:underline">Manage All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 text-left">
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Sector</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Jobs</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activeProjects.length > 0 ? activeProjects.map((proj) => {
                                    const divKey = (proj.division?.toLowerCase() === "business" || proj.division?.toLowerCase() === "service") ? "service" : (proj.division?.toLowerCase() || "contracting") as DivisionId;
                                    const divMeta = DIVISIONS.find(d => d.id === divKey);
                                    return (
                                        <tr key={proj.id} className="hover:bg-brand-50/30 transition-colors group cursor-pointer" onClick={() => navigate(`/projects`)}>
                                            <td className="px-5 py-3">
                                                <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{proj.name}</p>
                                                {proj.deadline && <p className="text-[10px] text-gray-400 mt-0.5">Due: {proj.deadline}</p>}
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">{proj.client}</td>
                                            <td className="px-5 py-3 hidden md:table-cell">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${divMeta?.bg || 'bg-gray-100'} ${divMeta?.text || 'text-gray-600'}`}>
                                                    {divMeta?.label?.replace(' Sector', '') || proj.division}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 hidden lg:table-cell">
                                                <span className="text-xs font-bold text-gray-700">{proj.jobCount}</span>
                                                <span className="text-[10px] text-gray-400 ml-1">assigned</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    proj.status === "Active" || proj.status === "Ongoing" ? 'bg-emerald-100 text-emerald-600' :
                                                    proj.status === "Completed" ? 'bg-blue-100 text-blue-600' :
                                                    'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {proj.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-gray-400 italic text-sm">No active projects found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
                        <TrendingUp size={16} className="text-gray-400" />
                    </div>
                    <ActivityLog maxItems={6} divisionFilter={activeDivision} />
                </div>
            </div>

            {/* === Row 5: Recent Invoices (Full Width) === */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Banknote size={16} />
                        </div>
                        <h2 className="text-sm font-semibold text-gray-800">Recent Invoices</h2>
                    </div>
                    <Link to="/invoices" className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1">
                        Manage All <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50/50 text-left">
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoice</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Sector</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentInvoices.length > 0 ? recentInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-brand-50/30 transition-colors group cursor-pointer" onClick={() => navigate(`/invoice-details/${inv.id}`)}>
                                    <td className="px-5 py-3 font-medium text-brand-600 group-hover:underline underline-offset-4">{inv.id}</td>
                                    <td className="px-5 py-3 text-gray-700">{inv.client}</td>
                                    <td className="px-5 py-3 hidden md:table-cell">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            inv.division?.toLowerCase() === 'service' ? 'bg-blue-100 text-blue-600' :
                                            inv.division?.toLowerCase() === 'trading' ? 'bg-amber-100 text-amber-600' :
                                            'bg-violet-100 text-violet-600'
                                        }`}>
                                            {inv.division}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 font-bold text-gray-900">QAR {inv.amount.toLocaleString()}</td>
                                    <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-400 italic text-sm">No invoices recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* === Row 6: Recent Expenses (Full Width) === */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                            <CreditCard size={16} />
                        </div>
                        <h2 className="text-sm font-semibold text-gray-800">Recent Expenses</h2>
                    </div>
                    <Link to="/expenses" className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1">
                        Manage All <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50/50 text-left">
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expense ID</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Created By</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Sector</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentExpenses.length > 0 ? recentExpenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-brand-50/30 transition-colors group cursor-pointer" onClick={() => navigate(`/expenses`)}>
                                    <td className="px-5 py-3 font-medium text-brand-600 group-hover:underline underline-offset-4">{exp.id}</td>
                                    <td className="px-5 py-3 text-gray-700 font-medium">{exp.title}</td>
                                    <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{exp.createdBy}</td>
                                    <td className="px-5 py-3 hidden md:table-cell">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            exp.sector?.toLowerCase().includes('service') ? 'bg-blue-100 text-blue-600' :
                                            exp.sector?.toLowerCase().includes('trading') ? 'bg-amber-100 text-amber-600' :
                                            exp.sector?.toLowerCase().includes('pending') ? 'bg-gray-100 text-gray-600' :
                                            'bg-violet-100 text-violet-600'
                                        }`}>
                                            {exp.sector}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 font-bold text-gray-900">QAR {exp.amount.toLocaleString()}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                            exp.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            exp.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {exp.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500 text-xs hidden lg:table-cell">
                                        {exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-gray-400 italic text-sm">No expenses recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
