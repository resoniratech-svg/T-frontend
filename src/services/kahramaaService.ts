import api from "./api";

export const kahramaaService = {
  getProjects: async (customerId?: string, search?: string) => {
    const response = await api.get("/kahramaa/projects", { params: { customerId, search } });
    return response.data?.data || response.data || [];
  },

  createProject: async (data: any) => {
    const response = await api.post("/kahramaa/projects", data);
    return response.data?.data || response.data;
  },

  updateProject: async (id: number, data: any) => {
    const response = await api.put(`/kahramaa/projects/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteProject: async (id: number) => {
    const response = await api.delete(`/kahramaa/projects/${id}`);
    return response.data;
  },

  uploadDocument: async (id: number, document: any) => {
    const response = await api.post(`/kahramaa/projects/${id}/documents`, document);
    return response.data?.data || response.data;
  }
};
