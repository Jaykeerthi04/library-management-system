import { useEffect, useMemo, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import TableContainer from "@/components/TableContainer";
import { BadgeDollarSign, TrendingUp, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { finesApi } from "@/services/api";
import { toast } from "sonner";

interface FineRecord {
  id: string;
  userId: string;
  userName: string;
  bookTitle: string;
  dueDate: string;
  fine: number;
  status: "Paid" | "Unpaid";
}

export default function Fines() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [records, setRecords] = useState<FineRecord[]>([]);
  const [totals, setTotals] = useState({ totalFines: 0, paidFines: 0, unpaidFines: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const fetchFines = async () => {
      try {
        const response = await finesApi.getAll(isAdmin ? undefined : { userId: user.id });
        if (!isMounted) return;

        const mapped: FineRecord[] = (response.data.records || []).map((r: any) => ({
          id: r._id,
          userId: r.user?._id,
          userName: r.user?.name || "Unknown",
          bookTitle: r.book?.title || "Unknown",
          dueDate: new Date(r.dueDate).toISOString().split("T")[0],
          fine: r.fine || 0,
          status: r.status === "returned" ? "Paid" : "Unpaid",
        }));

        setRecords(mapped);
        setTotals({
          totalFines: response.data.totalFines || 0,
          paidFines: response.data.paidFines || 0,
          unpaidFines: response.data.unpaidFines || 0,
        });
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load fines");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFines();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, user?.id]);

  const visibleRecords = useMemo(
    () => (isAdmin ? records : records.filter((r) => r.userId === user?.id)),
    [isAdmin, records, user?.id]
  );

  const fineStats = [
    { label: "Total Fines", value: loading ? "..." : `₹${totals.totalFines}`, icon: BadgeDollarSign, gradient: "stat-gradient-4", iconColor: "text-destructive" },
    { label: "Collected", value: loading ? "..." : `₹${totals.paidFines}`, icon: TrendingUp, gradient: "stat-gradient-2", iconColor: "text-success" },
    { label: "Pending", value: loading ? "..." : `₹${totals.unpaidFines}`, icon: Clock, gradient: "stat-gradient-3", iconColor: "text-warning" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={isAdmin ? "Fines Management" : "My Fines"} description={isAdmin ? "Track overdue fines and payments" : "View your fine details"} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {fineStats.map((s) => (
          <DashboardCard key={s.label} {...s} />
        ))}
      </div>

      <TableContainer
        headers={isAdmin ? ["User", "Book", "Due Date", "Fine (₹10/day)", "Payment"] : ["Book", "Due Date", "Fine (₹10/day)", "Payment"]}
        isEmpty={visibleRecords.length === 0}
        emptyMessage={isAdmin ? "No fines recorded" : "You have no fines — great job!"}
      >
        {visibleRecords.map((record) => (
          <tr key={record.id} className="table-row-hover">
            {isAdmin && <td className="py-3.5 px-4 text-foreground font-medium">{record.userName}</td>}
            <td className="py-3.5 px-4 text-foreground">{record.bookTitle}</td>
            <td className="py-3.5 px-4 text-muted-foreground">{record.dueDate}</td>
            <td className="py-3.5 px-4 text-foreground font-semibold">₹{record.fine}</td>
            <td className="py-3.5 px-4">
              <StatusBadge status={record.status} />
            </td>
          </tr>
        ))}
      </TableContainer>
    </div>
  );
}
