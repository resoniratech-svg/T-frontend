import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Zap, Search, Plus, User, FileText, AlertTriangle, 
  CheckCircle2, XCircle, Clock, Droplets, ArrowRight, 
  Upload, ExternalLink, Trash2, DollarSign, Building 
} from "lucide-react";
import { kahramaaService } from "../../services/kahramaaService";
import { clientService } from "../../services/clientService";
import { useAuth } from "../../context/AuthContext";
import FileUploader from "../../components/FileUploader";
import PageLoader from "../../components/PageLoader";
import { getUploadUrl } from "../../services/api";
import { message } from "antd";
import dayjs from "dayjs";

const InputField = ({ label, name, value, onChange, type = "text" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
    />
  </div>
);

export default function KahramaaServices() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchPin, setSearchPin] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [pendingFiles, setPendingFiles] = useState<{name: string; url: string}[]>([]);

  const [formData, setFormData] = useState<any>({
    pinNumber: "",
    ownerName: "",
    bpNumber: "",
    cmNumber: "",
    area: "",
    enNumber: "",
    lvn: "",
    referenceNumber: "",
    totalContractValue: 0,
    paidAmount: 0,
    inspectionStatus: "Pending"
  });

  // Queries
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getClients()
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["kahramaa-projects", selectedClient?.id, searchPin],
    queryFn: () => kahramaaService.getProjects(selectedClient?.id, searchPin),
    enabled: !!selectedClient
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const companyId = localStorage.getItem("selectedCompanyId");
      const payload = { ...data, customerId: selectedClient.id, companyId };
      return kahramaaService.createProject(payload);
    },
    onSuccess: async (createdProject: any) => {
      // Upload any pending files after project is created
      if (pendingFiles.length > 0 && createdProject?.id) {
        for (const file of pendingFiles) {
          try {
            await kahramaaService.uploadDocument(createdProject.id, {
              name: file.name,
              url: file.url,
              fileType: file.name.split('.').pop() || 'document'
            });
          } catch (e) {
            console.error("Failed to upload document:", e);
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ["kahramaa-projects"] });
      setIsAdding(false);
      resetForm();
      message.success("Project registered successfully");
    },
    onError: (err: any) => {
      message.error(err.message || "Failed to create project");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => kahramaaService.updateProject(selectedProject.id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["kahramaa-projects"] });
      setSelectedProject(data);
      message.success("Project updated successfully");
    },
    onError: (err: any) => {
      message.error(err.message || "Failed to update project");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => kahramaaService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kahramaa-projects"] });
      setSelectedProject(null);
      message.success("Project deleted");
    }
  });

  // Helpers
  const resetForm = () => {
    setFormData({
      pinNumber: "",
      ownerName: "",
      bpNumber: "",
      cmNumber: "",
      area: "",
      enNumber: "",
      lvn: "",
      referenceNumber: "",
      totalContractValue: 0,
      paidAmount: 0,
      inspectionStatus: "Pending"
    });
    setPendingFiles([]);
  };

  const balance = selectedProject ? (Number(selectedProject.total_value) - Number(selectedProject.paid_amount)) : (Number(formData.totalContractValue) - Number(formData.paidAmount));
  const balanceAlert = balance > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveProject = () => {
    if (isAdding) {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const selectProject = (project: any) => {
    setSelectedProject(project);
    setFormData({
      pinNumber: project.pin_no || "",
      ownerName: project.owner_name || "",
      bpNumber: project.bp_no || "",
      cmNumber: project.cm_no || "",
      area: project.area || "",
      enNumber: project.en_number || "",
      lvn: project.lvn || "",
      referenceNumber: project.ref_no || "",
      totalContractValue: project.total_value || 0,
      paidAmount: project.paid_amount || 0,
      inspectionStatus: project.inspection_status || "Pending"
    });
    setIsAdding(false);
  };

  if (clientsLoading) return <PageLoader message="Loading Customer Profiles..." />;

  return (
    <div className="h-[calc(100vh-140px)] flex gap-4 overflow-hidden animate-in fade-in duration-500">
      
      {/* LEFT PANEL: Customers */}
      <div className="w-80 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User size={14} /> Customer Profiles
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {clients.map((client: any) => (
            <button
              key={client.id}
              onClick={() => {
                setSelectedClient(client);
                setSelectedProject(null);
              }}
              className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group ${
                selectedClient?.id === client.id 
                  ? "bg-brand-900 text-white shadow-lg shadow-brand-900/20" 
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <div className="truncate pr-4">
                <p className="text-sm font-black truncate">{client.name}</p>
                <p className={`text-[10px] font-bold uppercase tracking-tighter ${selectedClient?.id === client.id ? "text-white/60" : "text-slate-400"}`}>
                  {client.company_name || "Private Customer"}
                </p>
              </div>
              <ArrowRight size={16} className={`shrink-0 transition-transform ${selectedClient?.id === client.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* MIDDLE PANEL: PIN Numbers */}
      <div className="w-80 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} /> PIN Number List
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search PIN / Owner..."
              value={searchPin}
              onChange={(e) => setSearchPin(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500/10 outline-none transition-all"
            />
          </div>
          {selectedClient && (
            <button 
              onClick={() => {
                setIsAdding(true);
                setSelectedProject(null);
                resetForm();
              }}
              className="w-full py-2.5 bg-brand-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-800 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} /> New PIN Project
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {!selectedClient ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
              <User size={40} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Select a Customer</p>
            </div>
          ) : projectsLoading ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400">Loading PINs...</div>
          ) : projects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
              <FileText size={40} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">No Projects Found</p>
            </div>
          ) : (
            projects.map((project: any) => (
              <button
                key={project.id}
                onClick={() => selectProject(project)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  selectedProject?.id === project.id 
                    ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                    : "bg-white border-slate-100 hover:border-slate-300 text-slate-600 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-black tracking-widest">{project.pin_no}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                    project.inspection_status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    project.inspection_status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {project.inspection_status}
                  </span>
                </div>
                <p className="text-[10px] font-bold truncate opacity-80">{project.owner_name}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Details Form */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        {!selectedProject && !isAdding ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Zap size={48} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Project Workspace</h3>
            <p className="text-sm font-bold text-slate-500 max-w-xs leading-relaxed">
              Select a PIN number from the middle panel to view full technical specifications, financial tracking, and inspection status.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Form Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                  <Building className="text-brand-900" size={28} />
                  {isAdding ? "Register New PIN Project" : `PIN: ${selectedProject?.pin_no}`}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Customer: <span className="text-slate-900">{selectedClient?.name}</span>
                </p>
              </div>
              <div className="flex gap-3">
                {!isAdding && (
                  <button 
                    onClick={() => {
                      if (confirm("Delete this project permanently?")) {
                        deleteMutation.mutate(selectedProject.id);
                      }
                    }}
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button 
                  onClick={saveProject}
                  className="px-8 py-3 bg-brand-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-900/20 hover:bg-brand-800 transition-all"
                >
                  {isAdding ? "Create Project" : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              
              {/* 1. Basic Details */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText size={16} className="text-slate-400" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Specifications</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleInputChange} />
                  <InputField label="PIN Number" name="pinNumber" value={formData.pinNumber} onChange={handleInputChange} />
                  <InputField label="BP Number" name="bpNumber" value={formData.bpNumber} onChange={handleInputChange} />
                  <InputField label="CM Number" name="cmNumber" value={formData.cmNumber} onChange={handleInputChange} />
                  <InputField label="Area" name="area" value={formData.area} onChange={handleInputChange} />
                  <InputField label="EN Number" name="enNumber" value={formData.enNumber} onChange={handleInputChange} />
                  <InputField label="LVN" name="lvn" value={formData.lvn} onChange={handleInputChange} />
                  <InputField label="Reference Number" name="referenceNumber" value={formData.referenceNumber} onChange={handleInputChange} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inspection Status</label>
                    <select 
                      name="inspectionStatus"
                      value={formData.inspectionStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Water Inspection">Water Inspection</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* 2. Financial Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <DollarSign size={16} className="text-slate-400" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Oversight</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Contract Value</label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm font-black">QAR</span>
                      <input 
                        type="number"
                        name="totalContractValue"
                        value={formData.totalContractValue}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-2xl font-black text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Paid Amount</label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm font-black">QAR</span>
                      <input 
                        type="number"
                        name="paidAmount"
                        value={formData.paidAmount}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-2xl font-black text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl border transition-all ${balanceAlert ? "bg-rose-50 border-rose-100 shadow-lg shadow-rose-500/5" : "bg-emerald-50 border-emerald-100"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${balanceAlert ? "text-rose-400" : "text-emerald-400"}`}>Outstanding Balance</label>
                      {balanceAlert && <AlertTriangle size={14} className="text-rose-500 animate-pulse" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${balanceAlert ? "text-rose-300" : "text-emerald-300"}`}>QAR</span>
                      <span className={`text-2xl font-black ${balanceAlert ? "text-rose-600" : "text-emerald-600"}`}>
                        {balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Documents */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Upload size={16} className="text-slate-400" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Repository</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">
                    <FileUploader 
                      module="kahramaa"
                      onUpload={(files, urls) => {
                        if (urls.length > 0) {
                          if (isAdding) {
                            // Queue files for upload after project creation
                            setPendingFiles(prev => [...prev, { name: files[0].name, url: urls[0] }]);
                            message.success(`${files[0].name} queued for upload`);
                          } else {
                            // Upload immediately for existing projects
                            kahramaaService.uploadDocument(selectedProject.id, {
                              name: files[0].name,
                              url: urls[0],
                              fileType: files[0].name.split('.').pop() || 'document'
                            }).then(() => {
                              queryClient.invalidateQueries({ queryKey: ["kahramaa-projects"] });
                              message.success("Document uploaded");
                            });
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Show pending files during creation */}
                    {isAdding && pendingFiles.map((file, i) => (
                      <div key={`pending-${i}`} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                            <Upload size={20} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-black truncate">{file.name}</p>
                            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">Pending upload</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {/* Show existing documents for saved projects */}
                    {!isAdding && (selectedProject?.documents || []).map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-brand-900 group-hover:bg-brand-900 group-hover:text-white transition-all">
                            <FileText size={20} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-black truncate">{doc.file_name || doc.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{dayjs(doc.uploaded_at || doc.date).format("DD MMM, YYYY")}</p>
                          </div>
                        </div>
                        <a 
                          href={getUploadUrl(doc.file_url || doc.url)} 
                          target="_blank" 
                          className="p-2 text-slate-400 hover:text-brand-900 transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
