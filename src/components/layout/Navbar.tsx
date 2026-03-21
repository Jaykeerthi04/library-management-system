import { Search, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 glass-card rounded-none border-x-0 border-t-0">
      {/* Search */}
      <div className="relative w-80 max-w-[50%]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search books, users..."
          value={query}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-secondary/50 transition-all duration-200 text-muted-foreground hover:text-foreground group">
          <Bell className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          <span className="notification-dot" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-secondary/50 transition-all duration-200"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
              {user?.name?.charAt(0) ?? "A"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground hidden sm:block transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl border border-border p-1.5 animate-fade-in z-50">
              <div className="px-3 py-2 border-b border-border/50 mb-1">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setProfileOpen(false); logout(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
