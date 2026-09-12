import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { dashboardApi } from "@/services/api";

interface MonthlyPoint {
  month: string;
  issued: number;
  returned: number;
}

interface CategoryPoint {
  name: string;
  value: number;
}

interface DashboardStatsResponse {
  monthlyIssued: Array<{ _id: string; issued: number }>;
  monthlyReturned: Array<{ _id: string; returned: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
}

const chartColors = [
  "hsl(250,80%,65%)",
  "hsl(200,90%,55%)",
  "hsl(145,70%,45%)",
  "hsl(35,90%,55%)",
  "hsl(5,85%,58%)",
  "hsl(280,70%,65%)",
  "hsl(330,75%,60%)",
];

const toMonthLabel = (monthKey: string) => {
  const date = new Date(`${monthKey}-01`);
  return Number.isNaN(date.getTime())
    ? monthKey
    : date.toLocaleString("en-US", { month: "short" });
};

const mergeMonthlyStats = (
  monthlyIssued: DashboardStatsResponse["monthlyIssued"] = [],
  monthlyReturned: DashboardStatsResponse["monthlyReturned"] = []
): MonthlyPoint[] => {
  const statsMap = new Map<string, MonthlyPoint & { sortKey: string }>();

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

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyPoint[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryPoint[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchReportData = async () => {
      try {
        const response = await dashboardApi.getStats();
        if (!isMounted) return;

        const data = response.data as DashboardStatsResponse;
        setMonthlyStats(mergeMonthlyStats(data.monthlyIssued, data.monthlyReturned));
        setCategoryDistribution(data.categoryDistribution || []);
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load reports");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReportData();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryDataWithColors = useMemo(
    () => categoryDistribution.map((entry, index) => ({ ...entry, fill: chartColors[index % chartColors.length] })),
    [categoryDistribution]
  );

  const handleExport = () => {
    if (monthlyStats.length === 0 && categoryDistribution.length === 0) {
      toast.error("No report data to export");
      return;
    }

    const monthlyRows = [
      "Month,Issued,Returned",
      ...monthlyStats.map((row) => `${row.month},${row.issued},${row.returned}`),
    ];

    const categoryRows = [
      "Category,Count",
      ...categoryDistribution.map((row) => `${row.name},${row.value}`),
    ];

    const csv = [
      "Books Issued Per Month",
      ...monthlyRows,
      "",
      "Category Distribution",
      ...categoryRows,
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `library-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reports"
        description={loading ? "Loading report data..." : "Library analytics and insights"}
        action={
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20">
            <Download className="h-4 w-4" /> Export Report
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="glass-card-hover p-6 rounded-2xl">
          <h2 className="font-display text-lg font-semibold text-foreground mb-6">Books Issued Per Month</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(230,15%,25%,0.5)" />
              <XAxis dataKey="month" stroke="hsl(220,10%,55%)" fontSize={12} />
              <YAxis stroke="hsl(220,10%,55%)" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsla(230,25%,12%,0.95)", border: "1px solid hsla(230,15%,25%,0.5)", borderRadius: "12px", color: "hsl(220,20%,95%)" }} />
              <Bar dataKey="issued" fill="hsl(250,80%,65%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="returned" fill="hsl(200,90%,55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="glass-card-hover p-6 rounded-2xl">
          <h2 className="font-display text-lg font-semibold text-foreground mb-6">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryDataWithColors} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {categoryDataWithColors.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsla(230,25%,12%,0.95)", border: "1px solid hsla(230,15%,25%,0.5)", borderRadius: "12px", color: "hsl(220,20%,95%)" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
