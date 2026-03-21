import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  as?: "input" | "select";
  children?: React.ReactNode;
}

export default function FormInput({ label, as = "input", children, className, ...props }: FormInputProps) {
  const baseClass = "w-full mt-1.5 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 placeholder:text-muted-foreground";

  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {as === "select" ? (
        <select className={baseClass} {...(props as any)}>
          {children}
        </select>
      ) : (
        <input className={baseClass} {...(props as InputHTMLAttributes<HTMLInputElement>)} />
      )}
    </div>
  );
}
