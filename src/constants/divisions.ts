export const DIVISIONS = [
  {
    id: "SERVICE",
    label: "Service Sector",
    icon: "⚙️",
    color: "#000000",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-900",
    taxRate: 0,
  },
  {
    id: "TRADING",
    label: "Trading Sector",
    icon: "📦",
    color: "#000000",
    bg: "bg-gray-100",
    border: "border-gray-300",
    text: "text-gray-900",
    taxRate: 0,
  },
  {
    id: "CONTRACTING",
    label: "Contracting Sector",
    icon: "🏗️",
    color: "#000000",
    bg: "bg-gray-200",
    border: "border-gray-400",
    text: "text-gray-900",
    taxRate: 5,
  },
] as const;

export type DivisionId = (typeof DIVISIONS)[number]["id"];

export interface Division {
  id: DivisionId;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  taxRate: number;
}

export const getDivisionById = (id: string) => DIVISIONS.find((d) => d.id === id?.toUpperCase()) || DIVISIONS[0];
