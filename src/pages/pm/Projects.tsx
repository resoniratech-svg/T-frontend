import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { Plus, Edit, Trash2, Download, Loader2, Paperclip, FileText, ChevronDown } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { exportToCSV } from "../../utils/exportUtils";
import { useActivity } from "../../context/ActivityContext";
import { useDivision } from "../../context/DivisionContext";
import { DIVISIONS } from "../../constants/divisions";
import { projectService } from "../../services/projectService";
import type { Project } from "../../types/project";

function Projects() {
  const queryClient = useQueryClient();
  const { logActivity } = useActivity();
  const { activeDivision } = useDivision();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 1. Fetch data using React Query
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects", activeDivision],
    queryFn: () => projectService.getProjects(activeDivision),
  });

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === "all") return true;
    return p.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  // 2. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: (_, id) => {
      const project = projects.find((p) => p.id === id);
      logActivity("Deleted Project", "project", "/projects", project?.name || project?.projectName || id);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const handleExport = () => {
    const dataForExport = filteredProjects.map((p) => ({
      "Project Name": p.name || p.projectName,
      "Client": p.client,
      "Sector": p.division,
      "Budget": p.budget,
      "Manager": p.manager,
      "Status": p.status,
      "Deadline": p.deadline
    }));
    exportToCSV(dataForExport, "projects_export.csv");
  };

  const handleDelete = (id: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete project: ${projectName}?`)) {
      deleteMutation.mutate(id);
    }
  };


  const downloadFile = (doc: any) => {
    const link = document.createElement("a");
    link.href = doc.data;
    
    let fileName = doc.name;
    // Auto-detect extension from Data URL
    if (doc.data?.startsWith("data:")) {
      const mime = doc.data.split(";")[0].split(":")[1];
      let ext = ".pdf";
      if (mime.includes("wordprocessingml") || mime.includes("msword")) ext = ".docx";
      else if (mime.includes("spreadsheetml") || mime.includes("ms-excel")) ext = ".xlsx";
      else if (mime.includes("png")) ext = ".png";
      else if (mime.includes("jpeg")) ext = ".jpg";
      
      if (!fileName.toLowerCase().endsWith(ext)) {
        fileName = fileName.replace(/\.[^/.]+$/, "") + ext;
      }
    }

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tableData = filteredProjects.map((item) => ({
    ...item,
    "Project": item.name || item.projectName,
    "Client": item.client,
    "Sector": (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          DIVISIONS.find(d => d.id === (item.division || "CONTRACTING"))?.bg || 'bg-gray-100'
      } ${
          DIVISIONS.find(d => d.id === (item.division || "CONTRACTING"))?.text || 'text-gray-600'
      }`}>
          {DIVISIONS.find(d => d.id === (item.division || "CONTRACTING"))?.label?.replace(' Sector', '') || item.division}
      </span>
    ),
    "Budget": item.budget,
    "Manager": item.manager,
    "Status": <StatusBadge status={item.status || "Pending"} />,
    "Docs": (
      <div className="flex flex-wrap gap-1">
        {item.uploadedDocument && (
          <button
            onClick={() => {
              // Determine extension for the name
              let ext = ".pdf";
              if (item.uploadedDocument?.includes("wordprocessingml") || item.uploadedDocument?.includes("msword")) ext = ".docx";
              else if (item.uploadedDocument?.includes("spreadsheetml") || item.uploadedDocument?.includes("ms-excel")) ext = ".xlsx";
              else if (item.uploadedDocument?.includes("png")) ext = ".png";
              else if (item.uploadedDocument?.includes("jpeg")) ext = ".jpg";

              downloadFile({ 
                name: `${item.name || item.projectName || 'project'}_document${ext}`, 
                data: item.uploadedDocument 
              });
            }}
            className="p-1.5 bg-blue-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded border border-blue-100 transition-all flex items-center justify-center"
            title="Download Project Document"
          >
            <FileText size={12} />
          </button>
        )}
        {item.documents && item.documents.length > 0 ? (
          item.documents.map((doc: any, idx: number) => (
            <button
              key={doc.id || idx}
              onClick={() => downloadFile(doc)}
              className="p-1.5 bg-slate-50 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded border border-slate-100 transition-all flex items-center justify-center"
              title={`Download ${doc.name}`}
            >
              <Paperclip size={12} />
            </button>
          ))
        ) : !item.uploadedDocument && (
          <span className="text-[10px] text-slate-300 italic">None</span>
        )}
      </div>
    ),
    "Actions": (
      <div className="flex gap-2">
        <Link to={`/edit-project/${item.id}`} className="p-1 text-slate-400 hover:text-amber-600 transition-colors">
          <Edit size={16} />
        </Link>
        <button
          onClick={() => handleDelete(item.id, item.name || item.projectName)}
          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending && deleteMutation.variables === item.id ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    )
  }));

  const columns = ["Project", "Client", "Sector", "Budget", "Manager", "Status", "Docs", "Actions"];

  const currentDivision = DIVISIONS.find(d => d.id === activeDivision);

  return (
    <>
      <PageHeader showBack
        title={activeDivision === "all" ? "Projects" : `${currentDivision?.label} Projects`}
        subtitle={activeDivision === "all" ? "Manage your current and upcoming projects" : `Viewing projects for ${currentDivision?.label}`}
        action={
          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm font-bold text-xs uppercase"
            >
              <Download size={16} />
              Export
            </button>
            <Link to="/create-project">
              <button className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-sm font-bold text-xs uppercase">
                <Plus size={16} />
                Create Project
              </button>
            </Link>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
        {isLoading ? (
          <PageLoader message="Organizing Project Portfolios..." />
        ) : (
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
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            }
          />
        )}
      </div>
    </>
  );
}

export default Projects;