import { useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import { Eye, Edit, Trash2, ChevronDown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boqService } from "../../services/boqService";
import { useAuth } from "../../context/AuthContext";
import { useDivision } from "../../context/DivisionContext";
import { getDivisionById, type DivisionId, DIVISIONS } from "../../constants/divisions";

const columns = ["ID", "Project", "Sector", "Client", "Total Amount", "Status", "Date", "Actions"];

interface BOQTableData {
  ID: string;
  Project: string;
  Sector: React.ReactNode;
  Client: string;
  "Total Amount": string | number;
  Status: React.ReactNode;
  Date: string;
  Actions: React.ReactNode;
}

function BOQ() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeDivision } = useDivision();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: boqs = [], isLoading } = useQuery({
    queryKey: ["boqs"],
    queryFn: boqService.getAllBOQs,
    select: (res) => res.data || []
  });

  const deleteMutation = useMutation({
    mutationFn: boqService.deleteBOQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boqs"] });
      alert("BOQ deleted successfully from database");
    },
    onError: (err: any) => {
      console.error("[BOQ_DELETE_ERROR]", err);
      alert("Failed to delete BOQ: " + (err.response?.data?.message || err.message));
    }
  });

  const handleDelete = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this BOQ?")) {
      deleteMutation.mutate(id);
    }
  };

  const tableData = useMemo<BOQTableData[]>(() => {
    let filtered = activeDivision === "all"
      ? boqs
      : boqs.filter((item: any) => (item.sector || item.division || "").toUpperCase() === activeDivision.toUpperCase());

    if (statusFilter !== "all") {
      filtered = filtered.filter((item: any) => (item.status || "").toLowerCase() === statusFilter.toLowerCase());
    }

    return filtered.map((item: any) => {
      const division = getDivisionById(item.sector || item.division);
      return {
        "ID": item.boq_number || item.id,
        "Project": item.project_name,
        "Sector": (
          <span className={`px-2 py-1 rounded text-[10px] font-bold ${division.bg} ${division.text} border ${division.border}`}>
            {division.label.replace(" Sector", "")}
          </span>
        ),
        "Client": item.client_name,
        "Total Amount": `QAR ${Number(item.total_amount).toLocaleString()}`,
        "Date": item.date ? (() => {
          // If the backend sends YYYY-MM-DD, we just format it to DD/MM/YYYY
          if (item.date.includes('-') && !item.date.includes('T')) {
            const [y, m, d] = item.date.split('-');
            return `${d}/${m}/${y}`;
          }
          // Fallback for full timestamps
          const d = new Date(item.date);
          return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
        })() : "N/A",
        "Status": <StatusBadge status={item.status} />,
        "Actions": (
          <div className="flex gap-2">
            <Link to={`/boq-details/${item.id}`} className="p-1 text-slate-400 hover:text-brand-600 transition-colors">
              <Eye size={16} />
            </Link>
            <Link to={`/edit-boq/${item.id}`} className="p-1 text-slate-400 hover:text-amber-600 transition-colors">
              <Edit size={16} />
            </Link>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      };
    });
  }, [boqs, activeDivision, statusFilter]);

  if (isLoading) return <div className="p-6">Loading BOQs...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Quantities (BOQ)"
        subtitle="Manage material estimations and project quantities"
        action={
          <button
            onClick={() => navigate("/create-boq")}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span> Create BOQ
          </button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <DataTable
          columns={columns}
          data={tableData}
          filters={
            <div className="relative w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full bg-white border border-slate-200 text-slate-600 pl-3 pr-9 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm font-bold text-xs uppercase outline-none cursor-pointer focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="due">Due</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

export default BOQ;
