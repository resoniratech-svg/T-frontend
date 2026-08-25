import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart3, Users, FileText, CreditCard, Briefcase, ShoppingBag,
  Building2, Shield, Globe, Phone, Mail, MapPin,
  ChevronRight, ArrowRight, Layers, PieChart, ClipboardList, Receipt,
  Facebook, Twitter, Linkedin, Instagram
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const }
  })
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ─── NAVBAR ───────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#e7f1ff] border border-blue-200/70 flex items-center justify-center shadow-sm">
              <Layers size={18} className="text-slate-700" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Qubexe <span className="text-slate-600">ERP</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#home" className="hover:text-slate-900 transition-colors">Home</a>
            <a href="#modules" className="hover:text-slate-900 transition-colors">ERP Features</a>
            <a href="#services" className="hover:text-slate-900 transition-colors">Services</a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>

          <Link
            to="/login"
            className="bg-[#e7f1ff] hover:bg-[#d5e5fa] text-slate-800 border border-blue-200/80 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow"
          >
            Login to ERP
          </Link>
        </div>
      </nav>

      {/* ─── HERO SECTION ─────────────────────────────────── */}
      <section id="home" className="relative pt-28 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-slate-100/80 blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#e7f1ff]/60 blur-3xl opacity-60 translate-y-1/2 -translate-x-1/4"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 bg-[#e7f1ff] border border-blue-200/60 text-slate-700 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
              Enterprise Resource Planning
            </span>

            <h1 className="text-5xl lg:text-6xl font-black leading-tight text-slate-900 mb-6">
              Streamline Your Business with{" "}
              <span className="text-slate-600">
                Qubexe ERP
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg mb-8 leading-relaxed">
              All-in-One Solution for Contracting, Trading, and Business Services.
              Manage projects, finances, clients, and teams in one powerful platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group flex items-center gap-2 bg-[#e7f1ff] hover:bg-[#d5e5fa] text-slate-800 border border-blue-200/80 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow"
              >
                Login to ERP
                <ArrowRight size={16} className="text-slate-700 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#modules"
                className="flex items-center gap-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm"
              >
                Learn More
                <ChevronRight size={16} className="text-slate-400" />
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">50+</p>
                <p className="text-xs text-slate-400 font-medium">Projects</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">100+</p>
                <p className="text-xs text-slate-400 font-medium">Clients</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">3</p>
                <p className="text-xs text-slate-400 font-medium">Divisions</p>
              </div>
            </div>
          </motion.div>

          {/* Right — Dashboard Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white rounded-xl shadow-xl shadow-slate-100 border border-slate-200/80 p-5 overflow-hidden">
              {/* Fake dashboard header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-1.5 text-xs text-slate-500 font-medium">erp.qubexe.com</div>
                <div></div>
              </div>

              {/* Dashboard grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <DashboardCard icon={<BarChart3 size={16} />} label="Revenue" value="QAR 150K" color="blue" />
                <DashboardCard icon={<Users size={16} />} label="Clients" value="127" color="emerald" />
                <DashboardCard icon={<FileText size={16} />} label="Invoices" value="89" color="violet" />
              </div>

              {/* Chart placeholder */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700">Monthly Analytics</span>
                  <span className="text-[10px] text-slate-400 font-medium">Jan - Mar 2026</span>
                </div>
                <div className="flex items-end gap-2 h-20">
                  {[45, 65, 55, 80, 70, 90, 60, 75, 85, 95, 70, 88].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                      className={`flex-1 rounded-t-sm ${i % 2 === 0 ? "bg-blue-400/80" : "bg-blue-300/60"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DashboardMiniCard icon={<Briefcase size={14} />} label="Active Projects" value="12" />
                <DashboardMiniCard icon={<CreditCard size={14} />} label="Payments" value="34" />
                <DashboardMiniCard icon={<PieChart size={14} />} label="Reports" value="8" />
                <DashboardMiniCard icon={<ClipboardList size={14} />} label="Quotations" value="21" />
              </div>
            </div>

            {/* Floating decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#e7f1ff] rounded-lg opacity-60 blur-xl"></div>
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-slate-100 rounded-xl opacity-80 blur-xl"></div>
          </motion.div>
        </div>
      </section>

      {/* ─── ERP MODULES ──────────────────────────────────── */}
      <section id="modules" className="py-20 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-[#e7f1ff] border border-blue-200/60 px-3 py-1 rounded-full">
              Powerful Modules
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-black text-slate-900 mt-4 mb-4">
              Our ERP Modules
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 max-w-xl mx-auto">
              Comprehensive tools tailored for every department in your organization
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Building2 size={24} />, title: "Contract Services", desc: "Manage construction projects, quotations, invoices, and project milestones end-to-end.", color: "blue" },
              { icon: <ShoppingBag size={24} />, title: "Trading Management", desc: "Track inventory, purchase orders, sales orders, and trading profits seamlessly.", color: "emerald" },
              { icon: <FileText size={24} />, title: "Business Proposals", desc: "Create stunning proposals with premium templates for all your business services.", color: "amber" },
              { icon: <Receipt size={24} />, title: "Accounting & Finance", desc: "Expenses, payments, financial reports, and profit & loss — all in real time.", color: "violet" },
            ].map((mod, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="bg-white rounded-xl p-6 border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {mod.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{mod.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{mod.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────── */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-[#e7f1ff] border border-blue-200/60 px-3 py-1 rounded-full">
              What We Offer
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-black text-slate-900 mt-4 mb-4">
              Our Services
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 max-w-xl mx-auto">
              End-to-end business solutions from formation to operations
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Globe size={24} />, title: "Company Formation", desc: "Complete company setup, registration, and licensing services in Qatar." },
              { icon: <Shield size={24} />, title: "PRO Services", desc: "Public Relations Officer services for visa processing, permits, and government liaisons." },
              { icon: <Building2 size={24} />, title: "Contracting Services", desc: "Interior fit-out, glass works, steel fabrication, and construction project management." },
              { icon: <ShoppingBag size={24} />, title: "Trading Services", desc: "Import/export, product sourcing, inventory management, and distribution." },
            ].map((svc, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="group relative bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-1.5 bg-[#e7f1ff]"></div>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#e7f1ff] border border-blue-200/60 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {svc.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{svc.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{svc.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────── */}
      <section className="py-16 bg-[#e7f1ff] border-y border-blue-200/70">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-900">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-3xl lg:text-4xl font-black mb-4 text-slate-900"
          >
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-slate-600 mb-8 max-w-xl mx-auto font-medium"
          >
            Join Qubexe ERP and manage your entire business from one unified platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Link
              to="/login"
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all"
            >
              Get Started Now
            </Link>
            <a
              href="#contact"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer id="contact" className="bg-slate-900 text-slate-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">

            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Layers size={18} className="text-blue-400" />
                </div>
                <span className="text-lg font-bold text-white">Qubexe</span>
              </div>
              <p className="text-sm leading-relaxed mb-4 text-slate-400">
                QUBEXE TRADING CONTRACTING AND SERVICES — Your trusted partner for business formation, contracting, and trading in Qatar.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin size={14} className="text-blue-400 flex-shrink-0" />
                  <span>Doha, Qatar</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone size={14} className="text-blue-400 flex-shrink-0" />
                  <span>+974 7171 6449</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail size={14} className="text-blue-400 flex-shrink-0" />
                  <span>info@qubexe.qa</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                {["Home", "ERP Features", "Services", "Contact Us"].map((link, i) => (
                  <li key={i}>
                    <a href={`#${["home", "modules", "services", "contact"][i]}`} className="text-sm hover:text-white transition-colors flex items-center gap-1">
                      <ChevronRight size={12} /> {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ERP Modules */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">ERP Modules</h4>
              <ul className="space-y-2.5">
                {["Contract Management", "Trading Platform", "Business Proposals", "Accounting & Reports", "Inventory System", "Client Portal"].map((mod, i) => (
                  <li key={i}>
                    <span className="text-sm flex items-center gap-1 text-slate-400">
                      <ChevronRight size={12} /> {mod}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ERP Visual */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Powered by Qubexe ERP</h4>
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <BarChart3 size={14} />, label: "Analytics" },
                    { icon: <Users size={14} />, label: "Clients" },
                    { icon: <FileText size={14} />, label: "Invoices" },
                    { icon: <Receipt size={14} />, label: "Expenses" },
                    { icon: <Briefcase size={14} />, label: "Projects" },
                    { icon: <PieChart size={14} />, label: "Reports" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                      <span className="text-blue-400">{item.icon}</span>
                      <span className="text-xs text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-3 mt-5">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 border border-slate-700/50">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">© 2026 Qubexe Trading Contracting and Services. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Helper Components ─────────────────────────────── */
function DashboardCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={`bg-${color}-50/80 border border-${color}-100 rounded-xl p-3 text-center`}>
      <div className={`text-${color}-500 flex justify-center mb-1`}>{icon}</div>
      <p className={`text-sm font-black text-${color}-700`}>{value}</p>
      <p className="text-[10px] text-slate-400 font-medium">{label}</p>
    </div>
  );
}

function DashboardMiniCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-2">
      <div className="text-slate-400">{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-800">{value}</p>
        <p className="text-[10px] text-slate-400">{label}</p>
      </div>
    </div>
  );
}