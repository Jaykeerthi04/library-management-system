import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Library, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        const result = await register(name, email, password);
        if (result.success) {
          toast.success("Account created successfully!");
          navigate("/");
        } else {
          toast.error(result.error || "Registration failed. Please try again.");
        }
      } else {
        const success = await login(email, password);
        if (success) {
          toast.success("Welcome back!");
          navigate("/");
        } else {
          toast.error("Invalid email or password");
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md animate-fade-in rounded-2xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Library className="h-10 w-10 text-primary" />
          <h1 className="font-display text-3xl font-bold gradient-text">LibraryOS</h1>
        </div>

        <p className="text-center text-muted-foreground mb-8">
          {isSignUp ? "Create your account" : "Sign in to your dashboard"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200 text-sm"
                placeholder="John Doe"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200 text-sm"
              placeholder={isSignUp ? "you@example.com" : "admin@library.com"}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200 text-sm pr-10"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 mt-2"
          >
            {loading ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setName("");
              setEmail("");
              setPassword("");
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <span className="font-medium text-primary">
              {isSignUp ? "Sign In" : "Sign Up"}
            </span>
          </button>
        </div>

        {!isSignUp && (
          <div className="text-xs text-muted-foreground text-center mt-8 space-y-1.5 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <p className="font-medium text-foreground/70 text-xs uppercase tracking-wider">Demo Credentials</p>
            <p>Admin: admin@library.com / admin123</p>
            <p>Student: rahul@student.com / pass123</p>
          </div>
        )}
      </div>
    </div>
  );
}
