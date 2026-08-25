import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthorizedSidebarSections, PERMISSIONS_CHANGED_EVENT } from "../utils/permissions";
import { X, ChevronRight } from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role;

  // Force re-render when permissions change
  const [, setPermVersion] = useState(0);
  useEffect(() => {
    const handler = () => setPermVersion(v => v + 1);
    window.addEventListener(PERMISSIONS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(PERMISSIONS_CHANGED_EVENT, handler);
  }, []);

  return (
    <aside className="print:hidden w-[260px] h-screen bg-slate-50 flex flex-col border-r border-slate-200 relative">
      {/* ─── Mobile Close Button ───────────────────────── */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 transition-colors"
      >
        <X size={20} />
      </button>
      {/* ─── Brand Header ──────────────────────────────── */}
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-sm border border-slate-200/80">
            <img src="/logo.png" alt="Qubexe Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-wide">
              Qubexe
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              ERP System
            </p>
          </div>
        </div>
      </div>

      {/* ─── Role Badge ────────────────────────────────── */}
      {userRole && (
        <div className="px-5 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#e7f1ff] border border-blue-200/60">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-700 tracking-wide">
              {userRole.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      )}

      {/* ─── Navigation Menu ───────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {getAuthorizedSidebarSections(userRole).map((section, i) => (
          <div key={i}>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-bold mb-2 px-3">
              {section.section}
            </p>

            <div className="space-y-0.5">
              {section.items
                .filter(item => !item.roles || (userRole && item.roles.includes(userRole)))
                .map((item, index) => {
                  const Icon = item.icon;
                  const active = item.path === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={onClose}
                      className={`group flex items-center gap-3 px-3 py-2 text-[13px] rounded-lg transition-all duration-150
                        ${active
                          ? "bg-[#e7f1ff] text-slate-900 border border-blue-200/80 font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                        }
                      `}
                    >
                      <Icon
                        size={17}
                        strokeWidth={active ? 2.2 : 1.7}
                        className={active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700"}
                      />
                      <span className="flex-1">{item.label}</span>
                      {active && (
                        <ChevronRight size={14} className="text-slate-400" />
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Footer ────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 text-center font-medium">
          © 2026 Qubexe. All rights reserved.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;