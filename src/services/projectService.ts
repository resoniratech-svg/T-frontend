import api from "./api";
import type { Project } from "../types/project";

// Helper to ensure date is YYYY-MM-DD for inputs
function formatDateForInput(dateStr: any) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split('T')[0];
  } catch (e) {
    return "";
  }
}

// Map a PostgreSQL row (snake_case) to the frontend Project shape (camelCase)
function mapProject(row: any): Project {
  return {
    id: String(row.id),
    projectName: row.project_name || row.projectName || "",
    name: row.project_name || row.name || row.projectName || "",
    client: row.client_name || row.client || "",
    clientName: row.client_name || row.clientName || "",
    division: row.division || row.branch || "service",
    branch: row.division || row.branch || "",
    status: row.status || "Pending",
    startDate: formatDateForInput(row.start_date || row.startDate),
    endDate: formatDateForInput(row.end_date || row.endDate || row.deadline),
    deadline: formatDateForInput(row.end_date || row.deadline || row.endDate),
    budget: row.contract_value || row.budget || "",
    value: Number(row.contract_value) || row.value || 0,
    manager: row.manager || "",
    description: row.description || "",
    createdAt: row.created_at || row.createdAt || "",
    documents: row.documents || [],
    uploadedDocument: row.uploaded_document || row.uploadedDocument || null,
  };
}

export const projectService = {
  getProjects: async (division?: string): Promise<Project[]> => {
    const response = await api.get("/projects", { params: { division } });
    // Backend wraps in { success, message, data }
    const body = response.data;
    const rows = body?.data ?? (Array.isArray(body) ? body : []);
    return Array.isArray(rows) ? rows.map(mapProject) : [];
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    const body = response.data;
    const row = body?.data ?? body;
    return mapProject(row);
  },

  createProject: async (projectData: any): Promise<any> => {
    const response = await api.post("/projects", projectData);
    const body = response.data;
    const row = body?.data ?? body;
    return mapProject(row);
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, projectData);
    const body = response.data;
    const row = body?.data ?? body;
    return mapProject(row);
  },

  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
};
