import { useState, useEffect } from "react";
import { Issue } from "@/types/library";
import { Plus, RotateCcw } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import TableContainer from "@/components/TableContainer";
import TablePagination from "@/components/TablePagination";
import FormInput from "@/components/FormInput";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import { issuesApi, booksApi, usersApi } from "@/services/api";
import { useSearchParams } from "react-router-dom";

export default function Issues() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [searchParams] = useSearchParams();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ userId: "", bookId: "" });

  const statusParam = searchParams.get("status")?.toLowerCase();
  const statusFilter = ["issued", "overdue", "returned"].includes(statusParam || "")
    ? statusParam
    : undefined;

  useEffect(() => {
    fetchIssues();
    if (isAdmin) {
      fetchBooksAndUsers();
    }
  }, [isAdmin, statusFilter, user?.id]);

  const fetchIssues = async () => {
    try {
      const params: { userId?: string; status?: string } = {};

      if (!isAdmin && user?.id) {
        params.userId = user.id;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await issuesApi.getAll(Object.keys(params).length ? params : undefined);
      const mappedIssues = response.data.map((i: any) => ({
        id: i._id,
        userId: i.user._id,
        userName: i.user.name,
        bookId: i.book._id,
        bookTitle: i.book.title,
        issueDate: new Date(i.issueDate).toISOString().split("T")[0],
        returnDate: new Date(i.dueDate).toISOString().split("T")[0],
        actualReturnDate: i.returnDate ? new Date(i.returnDate).toISOString().split("T")[0] : null,
        fine: i.fine,
        status: i.status === "issued" ? "Issued" : i.status === "returned" ? "Returned" : "Overdue",
      }));
      setIssues(mappedIssues);
    } catch (error) {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooksAndUsers = async () => {
    try {
      const [booksRes, usersRes] = await Promise.all([
        booksApi.getAll({ page: 1, limit: 500 }),
        usersApi.getAll()
      ]);
      setBooks(booksRes.data.books || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error("Failed to load books/users", error);
    }
  };

  const filteredIssues = isAdmin ? issues : issues.filter((i) => i.userId === user?.id);
  const statusFilterLabel = statusFilter ? `${statusFilter.charAt(0).toUpperCase()}${statusFilter.slice(1)}` : null;
  const { page, pageSize, totalPages, totalItems, paginatedItems, setPage, setPageSize } = usePagination(filteredIssues);

  const handleIssue = async () => {
    if (!form.userId || !form.bookId) { toast.error("Select user and book"); return; }
    try {
      await issuesApi.issue({ user: form.userId, book: form.bookId });
      toast.success("Book issued successfully");
      setIsOpen(false);
      setForm({ userId: "", bookId: "" });
      fetchIssues();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to issue book");
    }
  };

  const handleReturn = async (id: string) => {
    try {
      await issuesApi.return(id);
      toast.success("Book returned successfully");
      fetchIssues();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to return book");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isAdmin ? "Issue / Return" : "My Books"}
        description={isAdmin
          ? statusFilterLabel ? `Showing ${statusFilterLabel.toLowerCase()} transactions` : "Manage book transactions"
          : statusFilterLabel ? `Showing your ${statusFilterLabel.toLowerCase()} books` : "View your issued books"}
        action={isAdmin ? (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20">
                <Plus className="h-4 w-4" /> Issue Book
              </button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-foreground">Issue a Book</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <FormInput label="Student" as="select" value={form.userId} onChange={(e) => setForm({ ...form, userId: (e.target as HTMLSelectElement).value })}>
                  <option value="">Select student</option>
                  {users.filter((u) => u.role === "student").map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                </FormInput>
                <FormInput label="Book" as="select" value={form.bookId} onChange={(e) => setForm({ ...form, bookId: (e.target as HTMLSelectElement).value })}>
                  <option value="">Select book</option>
                  {books.filter((b) => b.available > 0).map((b) => <option key={b._id} value={b._id}>{b.title} ({b.available} avail)</option>)}
                </FormInput>
                <button onClick={handleIssue} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 mt-2">
                  Issue Book
                </button>
              </div>
            </DialogContent>
          </Dialog>
        ) : undefined}
      />

      <TableContainer
        headers={isAdmin
          ? ["User", "Book", "Issued", "Due", "Returned", "Fine", "Status", "Action"]
          : ["Book", "Issued", "Due", "Returned", "Fine", "Status", "Action"]}
        isEmpty={filteredIssues.length === 0}
        emptyMessage={isAdmin ? "No transactions yet" : "You have no issued books"}
      >
        {paginatedItems.map((issue) => (
          <tr key={issue.id} className="table-row-hover">
            {isAdmin && <td className="py-3.5 px-4 text-foreground font-medium">{issue.userName}</td>}
            <td className="py-3.5 px-4 text-foreground">{issue.bookTitle}</td>
            <td className="py-3.5 px-4 text-muted-foreground">{issue.issueDate}</td>
            <td className="py-3.5 px-4 text-muted-foreground">{issue.returnDate}</td>
            <td className="py-3.5 px-4 text-muted-foreground">{issue.actualReturnDate ?? "—"}</td>
            <td className="py-3.5 px-4 text-foreground">{issue.fine > 0 ? `₹${issue.fine}` : "—"}</td>
            <td className="py-3.5 px-4"><StatusBadge status={issue.status} /></td>
            <td className="py-3.5 px-4">
              {issue.status !== "Returned" ? (
                <button onClick={() => handleReturn(issue.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    issue.status === "Overdue"
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      : "bg-success/10 text-success hover:bg-success/20"
                  }`}>
                  <RotateCcw className="h-3 w-3" /> Return
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </td>
          </tr>
        ))}
      </TableContainer>
      {totalItems > 0 && (
        <TablePagination
          page={page} totalPages={totalPages} pageSize={pageSize}
          totalItems={totalItems} onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
