import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/PageHeader";
import TableContainer from "@/components/TableContainer";
import StatusBadge from "@/components/StatusBadge";
import { User, Mail, Calendar, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";
import { issuesApi } from "@/services/api";
import { Issue } from "@/types/library";
import { toast } from "sonner";

const toDisplayStatus = (status: string): Issue["status"] =>
  status === "issued" ? "Issued" : status === "returned" ? "Returned" : "Overdue";

export default function Profile() {
  const { user } = useAuth();
  const [myIssues, setMyIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const fetchMyIssues = async () => {
      try {
        const response = await issuesApi.getAll({ userId: user.id });
        if (!isMounted) return;

        const mappedIssues: Issue[] = (response.data || []).map((i: any) => ({
          id: i._id,
          userId: i.user._id,
          userName: i.user.name,
          bookId: i.book._id,
          bookTitle: i.book.title,
          issueDate: new Date(i.issueDate).toISOString().split("T")[0],
          returnDate: new Date(i.dueDate).toISOString().split("T")[0],
          actualReturnDate: i.returnDate ? new Date(i.returnDate).toISOString().split("T")[0] : null,
          fine: i.fine || 0,
          status: toDisplayStatus(i.status),
        }));

        setMyIssues(mappedIssues);
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load borrowing history");
        }
      }
    };

    fetchMyIssues();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const totalBorrowed = myIssues.length;
  const currentlyBorrowed = myIssues.filter((i) => i.status !== "Returned").length;
  const overdue = myIssues.filter((i) => i.status === "Overdue").length;
  const totalFines = myIssues.reduce((sum, i) => sum + i.fine, 0);

  const stats = useMemo(() => [
    { label: "Total Borrowed", value: totalBorrowed, icon: BookOpen, color: "text-primary" },
    { label: "Currently Borrowed", value: currentlyBorrowed, icon: BookOpen, color: "text-accent-foreground" },
    { label: "Overdue", value: overdue, icon: AlertTriangle, color: "text-destructive" },
    { label: "Total Fines", value: `₹${totalFines}`, icon: CheckCircle, color: "text-warning" },
  ], [totalBorrowed, currentlyBorrowed, overdue, totalFines]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="My Profile" description="View your account details and borrowing history" />

      {/* Account Details */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Account Details</h2>
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <p className="text-foreground font-semibold text-lg">{user?.name}</p>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5" />
              Role: {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card glass-card-hover rounded-2xl p-4 relative overflow-hidden">
            <s.icon className={`absolute top-3 right-3 h-8 w-8 opacity-20 ${s.color}`} />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Borrowing History */}
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">Borrowing History</h2>
        <TableContainer
          headers={["Book", "Issued", "Due", "Returned", "Fine", "Status"]}
          isEmpty={myIssues.length === 0}
          emptyMessage="No borrowing history yet"
        >
          {myIssues.map((issue) => (
            <tr key={issue.id} className="table-row-hover">
              <td className="py-3.5 px-4 text-foreground font-medium">{issue.bookTitle}</td>
              <td className="py-3.5 px-4 text-muted-foreground">{issue.issueDate}</td>
              <td className="py-3.5 px-4 text-muted-foreground">{issue.returnDate}</td>
              <td className="py-3.5 px-4 text-muted-foreground">{issue.actualReturnDate ?? "—"}</td>
              <td className="py-3.5 px-4 text-foreground">{issue.fine > 0 ? `₹${issue.fine}` : "—"}</td>
              <td className="py-3.5 px-4"><StatusBadge status={issue.status} /></td>
            </tr>
          ))}
        </TableContainer>
      </div>
    </div>
  );
}
