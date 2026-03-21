import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

export default function EmptyState({ icon: Icon = Inbox, title = "No data", description = "Nothing to show here yet." }: EmptyStateProps) {
  return (
    <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
