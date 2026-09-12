import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, BookOpen, Users, ArrowLeftRight,
  BadgeDollarSign, BarChart3, LogOut, ChevronLeft, ChevronRight, Library, UserCircle,
} from "lucide-react";

const allNavItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Student"] },
  { to: "/books", label: "Books", icon: BookOpen, roles: ["Admin", "Student"] },
  { to: "/users", label: "Users", icon: Users, roles: ["Admin"] },
  { to: "/issues", label: "Issue / Return", icon: ArrowLeftRight, roles: ["Admin", "Student"] },
  { to: "/fines", label: "Fines", icon: BadgeDollarSign, roles: ["Admin", "Student"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["Admin"] },
  { to: "/profile", label: "My Profile", icon: UserCircle, roles: ["Student"] },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navItems = allNavItems.filter((item) => item.roles.includes(user?.role ?? "Student"));

  return (
    <aside
      className={`sidebar-gradient border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-[68px]" : "w-[250px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <Library className="h-7 w-7 text-primary shrink-0 transition-transform duration-200 hover:scale-110" />
        <span className={`font-display font-bold text-lg gradient-text whitespace-nowrap transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
          LibraryOS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "nav-item-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className={`transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-1 border-t border-border/50 pt-2">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full group"
        >
          <LogOut className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span className={`transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            Logout
          </span>
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 w-full group"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
          ) : (
            <ChevronLeft className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
          )}
          <span className={`transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
