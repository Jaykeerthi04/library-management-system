import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  onClick?: () => void;
}

export default function DashboardCard({ label, value, icon: Icon, gradient, iconColor, onClick }: DashboardCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`glass-card-hover relative overflow-hidden p-5 group w-full text-left ${gradient} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <Icon className={`absolute top-4 right-4 h-10 w-10 ${iconColor} opacity-[0.12] group-hover:opacity-[0.2] transition-opacity duration-300`} />
      <div className="relative z-10">
        <span className="text-sm text-muted-foreground">{label}</span>
        <p className="text-3xl font-display font-bold text-foreground mt-2">{value}</p>
      </div>
    </button>
  );
}
