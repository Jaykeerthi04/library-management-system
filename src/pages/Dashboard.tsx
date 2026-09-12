import { useEffect, useMemo, useState } from "react";
import { BookOpen, Users, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "@/components/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi, issuesApi } from "@/services/api";
import { Issue, MonthlyStats } from "@/types/library";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface DashboardApiStats {
  totalBooks: number;
  totalUsers: number;
  activeIssues: number;
  overdueIssues: number;
  totalFines: number;
  monthlyIssued: Array<{ _id: string; issued: number }>;
  monthlyReturned: Array<{ _id: string; returned: number }>;
}

const formatDate = (dateValue: string | Date) =>
  new Date(dateValue).toISOString().split("T")[0];

const toDisplayStatus = (status: string): Issue["status"] =>
  status === "issued" ? "Issued" : status === "returned" ? "Returned" : "Overdue";

const toMonthLabel = (monthKey: string) => {
  const date = new Date(`${monthKey}-01`);
  return Number.isNaN(date.getTime())
    ? monthKey
    : date.toLocaleString("en-US", { month: "short" });
};

const mergeMonthlyStats = (
  monthlyIssued: DashboardApiStats["monthlyIssued"] = [],
  monthlyReturned: DashboardApiStats["monthlyReturned"] = []
): MonthlyStats[] => {
  const statsMap = new Map<string, MonthlyStats & { sortKey: string }>();

  monthlyIssued.forEach((entry) => {
    statsMap.set(entry._id, {
      month: toMonthLabel(entry._id),
      issued: entry.issued,
      returned: 0,
      sortKey: entry._id,
    });
  });

  monthlyReturned.forEach((entry) => {
    const existing = statsMap.get(entry._id);
    if (existing) {
      existing.returned = entry.returned;
      return;
    }

    statsMap.set(entry._id, {
      month: toMonthLabel(entry._id),
      issued: 0,
      returned: entry.returned,
      sortKey: entry._id,
    });
  });

  return Array.from(statsMap.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-6)
    .map(({ sortKey: _sortKey, ...rest }) => rest);
};

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardApiStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const issuesPromise = issuesApi.getAll(isAdmin ? undefined : { userId: user.id });
        const dashboardPromise = isAdmin ? dashboardApi.getStats() : Promise.resolve(null);

        const [issuesResponse, dashboardResponse] = await Promise.all([issuesPromise, dashboardPromise]);

        if (!isMounted) return;

        const mappedIssues: Issue[] = (issuesResponse.data || []).map((i: any) => ({
          id: i._id,
          userId: i.user._id,
          userName: i.user.name,
          bookId: i.book._id,
          bookTitle: i.book.title,
          issueDate: formatDate(i.issueDate),
          returnDate: formatDate(i.dueDate),
          actualReturnDate: i.returnDate ? formatDate(i.returnDate) : null,
          fine: i.fine || 0,
          status: toDisplayStatus(i.status),
        }));

        setIssues(mappedIssues);

        if (dashboardResponse?.data) {
          setDashboardStats(dashboardResponse.data as DashboardApiStats);
          setMonthlyData(mergeMonthlyStats(dashboardResponse.data.monthlyIssued, dashboardResponse.data.monthlyReturned));
        }
      } catch (error) {
        if (isMounted) {
          const message = axios.isAxiosError(error)
            ? error.response?.data?.message || `Request failed (${error.response?.status ?? "network error"})`
            : error instanceof Error
              ? error.message
              : "Unknown error";
          console.error("Failed to load dashboard data:", error);
          toast.error(`Failed to load dashboard data: ${message}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    const intervalId = window.setInterval(fetchDashboardData, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [isAdmin, user?.id]);

  const userIssues = useMemo(() => (isAdmin ? issues : issues.filter((i) => i.userId === user?.id)), [isAdmin, issues, user?.id]);

  const stats = isAdmin
    ? [
        { label: "Total Books", value: dashboardStats?.totalBooks ?? 0, icon: BookOpen, gradient: "stat-gradient-1", iconColor: "text-primary", onClick: () => navigate("/books") },
        { label: "Total Users", value: dashboardStats?.totalUsers ?? 0, icon: Users, gradient: "stat-gradient-2", iconColor: "text-success", onClick: () => navigate("/users") },
        { label: "Issued Books", value: dashboardStats?.activeIssues ?? 0, icon: ArrowLeftRight, gradient: "stat-gradient-3", iconColor: "text-warning", onClick: () => navigate("/issues?status=issued") },
        { label: "Overdue Books", value: dashboardStats?.overdueIssues ?? 0, icon: AlertTriangle, gradient: "stat-gradient-4", iconColor: "text-destructive", onClick: () => navigate("/issues?status=overdue") },
      ]
    : [
        { label: "My Issued", value: userIssues.filter((i) => i.status === "Issued").length, icon: BookOpen, gradient: "stat-gradient-1", iconColor: "text-primary" },
        { label: "My Overdue", value: userIssues.filter((i) => i.status === "Overdue").length, icon: AlertTriangle, gradient: "stat-gradient-4", iconColor: "text-destructive" },
        { label: "My Returns", value: userIssues.filter((i) => i.status === "Returned").length, icon: ArrowLeftRight, gradient: "stat-gradient-2", iconColor: "text-success" },
        { label: "My Fines", value: `₹${userIssues.reduce((a, b) => a + b.fine, 0)}`, icon: Users, gradient: "stat-gradient-3", iconColor: "text-warning" },
      ];

  const recentIssues = userIssues.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description={loading ? "Loading dashboard data..." : isAdmin ? "Welcome back! Here's your library overview." : `Welcome, ${user?.name}! Here's your activity.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <DashboardCard key={stat.label} {...stat} />
        ))}
      </div>

      {isAdmin && (
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="font-display text-lg font-semibold text-foreground mb-6">Monthly Statistics</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(230,15%,25%,0.5)" />
              <XAxis dataKey="month" stroke="hsl(220,10%,55%)" fontSize={12} />
              <YAxis stroke="hsl(220,10%,55%)" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsla(230,25%,12%,0.95)", border: "1px solid hsla(230,15%,25%,0.5)", borderRadius: "12px", color: "hsl(220,20%,95%)" }} />
              <Legend />
              <Bar dataKey="issued" fill="hsl(250,80%,65%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="returned" fill="hsl(200,90%,55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="glass-card p-6 rounded-2xl">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">
          {isAdmin ? "Recent Transactions" : "My Transactions"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                {isAdmin && <th className="text-left py-3.5 px-4 font-medium text-xs uppercase tracking-wider">User</th>}
                <th className="text-left py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Book</th>
                <th className="text-left py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Issue Date</th>
                <th className="text-left py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Due Date</th>
                <th className="text-left py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Fine</th>
                <th className="text-left py-3.5 px-4 font-medium text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentIssues.map((issue) => (
                <tr key={issue.id} className="table-row-hover">
                  {isAdmin && <td className="py-3 px-4 text-foreground">{issue.userName}</td>}
                  <td className="py-3 px-4 text-foreground">{issue.bookTitle}</td>
                  <td className="py-3 px-4 text-muted-foreground">{issue.issueDate}</td>
                  <td className="py-3 px-4 text-muted-foreground">{issue.returnDate}</td>
                  <td className="py-3 px-4 text-foreground">{issue.fine > 0 ? `₹${issue.fine}` : "—"}</td>
                  <td className="py-3 px-4"><StatusBadge status={issue.status} /></td>
                </tr>
              ))}
              {recentIssues.length === 0 && (
                <tr><td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-muted-foreground">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
