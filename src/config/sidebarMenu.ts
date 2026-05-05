import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  FileText,
  CreditCard,
  Folder,
  Briefcase,
  Package,
  BarChart3,
  ClipboardList,
  Receipt,
  AlertTriangle,
  BarChart2,
  CheckSquare,
  BookOpen,
  ShieldCheck,
  MessageSquare,
  Zap
} from "lucide-react";
import type { Role } from "../types/user";
import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: Role[];
}

export interface SidebarSection {
  section: string;
  roles: Role[];
  items: SidebarItem[];
}

export const sidebarMenu: SidebarSection[] = [
  //  Overview
  {
    section: "Overview",
    roles: ["SUPER_ADMIN", "ACCOUNTS", "PROJECT_MANAGER", "CLIENT"],
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ],
  },

  //  Projects (Core Operations)
  {
    section: "Projects",
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER"],
    items: [
      { label: "Projects", path: "/projects", icon: Folder },
    ],
  },

  // Kahramaa Services
  {
    section: "Kahramaa Services",
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "ACCOUNTS"],
    items: [
      { label: "Kahramaa Services", path: "/kahramaa-services", icon: Zap },
    ],
  },

  //  Estimations & Sales
  {
    section: "Estimations",
    roles: ["SUPER_ADMIN", "ACCOUNTS", "PROJECT_MANAGER"],
    items: [
      { label: "Quotations", path: "/quotations", icon: FileText },
      { label: "Invoices", path: "/invoices", icon: Receipt },
    ],
  },

  //  Accounting (Finance)
  {
    section: "Accounting",
    roles: ["SUPER_ADMIN", "ACCOUNTS", "PROJECT_MANAGER"],
    items: [
      { label: "Credit Control", path: "/credit-control", icon: CreditCard },

      { label: "Payments", path: "/payments", icon: CreditCard },
      { label: "Expenses", path: "/expenses", icon: Receipt },
      { label: "General Ledger", path: "/ledger", icon: BookOpen },
    ],
  },

  //  Employee Management (HR/Staffing)
  {
    section: "Employee Management",
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "ACCOUNTS"],
    items: [
      {
        label: "PRO Services",
        path: "/pro-services",
        icon: ShieldCheck,
        roles: ["SUPER_ADMIN", "ACCOUNTS", "PROJECT_MANAGER"]
      },
    ],
  },
  {
    section: "Reports",
    roles: ["SUPER_ADMIN", "ACCOUNTS"],
    items: [
      { label: "Financial Reports", path: "/financial-reports", icon: BarChart2 },
    ],
  },

  //  Client Portal (Portal Management)
  {
    section: "Client Portal",
    roles: ["PROJECT_MANAGER", "CLIENT"],
    items: [
      {
        label: "Client List",
        path: "/clients",
        icon: Users,
        roles: ["SUPER_ADMIN", "ACCOUNTS", "PROJECT_MANAGER"]
      },
      {
        label: "Create Client",
        path: "/create-client",
        icon: CheckSquare,
        roles: ["SUPER_ADMIN"]
      },
      {
        label: "My Projects",
        path: "/client/projects",
        icon: Briefcase,
        roles: ["CLIENT"]
      },
      {
        label: "Quotations",
        path: "/client/quotations",
        icon: FileText,
        roles: ["CLIENT"]
      },
      {
        label: "Billing&Payments",
        path: "/client/billing",
        icon: Receipt,
        roles: ["CLIENT"]
      },
      {
        label: "PRO Services",
        path: "/client/pro-services",
        icon: ShieldCheck,
        roles: ["CLIENT"]
      },


    ],
  },

  //  User Management (System Maintenance)
  {
    section: "User Management",
    roles: ["SUPER_ADMIN"],
    items: [
      { label: "Users", path: "/users", icon: Users },

      { label: "Permissions", path: "/permissions", icon: ShieldCheck },
      { label: "System Settings", path: "/admin/settings", icon: Settings },
    ],
  },
];
