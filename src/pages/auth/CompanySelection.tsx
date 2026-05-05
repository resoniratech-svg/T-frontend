import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function CompanySelection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelectCompany = (companyName: string, companyId: string) => {
    // Remember the selected company in localStorage
    localStorage.setItem("selectedCompany", companyName);
    localStorage.setItem("selectedCompanyId", companyId);
    
    // Navigate to the dashboard
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-24 px-4 font-sans">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-16"
      >
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Building2 size={32} />
        </div>
        <h1 className="text-4xl font-bold text-blue-600 tracking-tight mb-3">
          Select Your Company
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Welcome, {user?.name || "Super Admin"}. Please select a company to manage.
        </p>
      </motion.div>

      {/* Cards Section */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center">
        
        {/* Company Card 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleSelectCompany("Al Maha Maintenance & Electrical Equipment", "maintenance")}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex-1 relative group"
        >
          <div className="absolute top-6 right-6 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
            C1
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-6 shadow-md group-hover:shadow-blue-200 transition-shadow p-2 overflow-hidden">
            <img src="/logo.png" alt="Al Maha Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">
            Al Maha Maintenance<br />& Electrical Equipment
          </h2>
          <div className="flex items-center text-sm text-slate-400 mt-4">
            <Building2 size={14} className="mr-1" /> Doha, Qatar
          </div>
          
          <div className="mt-8 flex justify-between text-xs font-bold text-slate-400 border-t border-slate-50 pt-4">
            <span>◆ REVENUE</span>
            <span>◆ PROJECTS</span>
          </div>
        </motion.div>

        {/* Company Card 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleSelectCompany("Al Maha MEP Trading & Contracting W.L.L.", "mep")}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex-1 relative group"
        >
          <div className="absolute top-6 right-6 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
            C2
          </div>
          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 shadow-md overflow-hidden p-1.5">
            <img src="/logo_mep.png" alt="Al Maha MEP Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">
            Al Maha MEP Trading<br />& Contracting W.L.L.
          </h2>
          <div className="flex items-center text-sm text-slate-400 mt-4">
            <Building2 size={14} className="mr-1" /> Doha, Qatar
          </div>
          
          <div className="mt-8 flex justify-between text-xs font-bold text-slate-400 border-t border-slate-50 pt-4">
            <span>◆ REVENUE</span>
            <span>◆ PROJECTS</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
