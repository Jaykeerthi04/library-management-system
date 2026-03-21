import { useState, useEffect } from "react";
import { Book } from "@/types/library";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import TableContainer from "@/components/TableContainer";
import TablePagination from "@/components/TablePagination";
import FormInput from "@/components/FormInput";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import { booksApi, issuesApi } from "@/services/api";

export default function Books() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [borrowingBookId, setBorrowingBookId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", author: "", category: "Fiction", isbn: "", quantity: 1 });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await booksApi.getAll({ page: 1, limit: 500 });
      const mappedBooks = response.data.books.map((b: any) => ({
        id: b._id,
        title: b.title,
        author: b.author,
        category: b.category,
        isbn: b.isbn,
        quantity: b.quantity,
        available: b.available,
        coverImage: "",
        createdAt: new Date(b.createdAt).toISOString().split("T")[0],
      }));
      setBooks(mappedBooks);
    } catch (error) {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const filtered = books.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || b.category === category;
    return matchSearch && matchCat;
  });

  const categories = ["All", ...Array.from(new Set(books.map((b) => b.category))).sort()];
  const formCategories = categories.filter((c) => c !== "All");

  const { page, pageSize, totalPages, totalItems, paginatedItems, setPage, setPageSize } = usePagination(filtered);

  const openAdd = () => {
    setEditBook(null);
    setForm({ title: "", author: "", category: "Fiction", isbn: "", quantity: 1 });
    setIsOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditBook(book);
    setForm({ title: book.title, author: book.author, category: book.category, isbn: book.isbn, quantity: book.quantity });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.author) { toast.error("Title and author required"); return; }
    try {
      if (editBook) {
        await booksApi.update(editBook.id, form);
        toast.success("Book updated");
      } else {
        await booksApi.create({ ...form, quantity: form.quantity });
        toast.success("Book added");
      }
      fetchBooks();
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save book");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await booksApi.delete(id);
      toast.success("Book deleted");
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete book");
    }
  };

  const handleBorrow = async (bookId: string) => {
    if (!user?.id) {
      toast.error("Please login to borrow books");
      return;
    }

    try {
      setBorrowingBookId(bookId);
      await issuesApi.issue({ user: user.id, book: bookId });
      toast.success("Book borrowed successfully");
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to borrow book");
    } finally {
      setBorrowingBookId(null);
    }
  };

  const showBorrowAction = !isAdmin && user?.role === "Student";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Books"
        description={loading ? "Loading..." : `${books.length} books in library`}
        action={isAdmin ? (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Book
              </button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-foreground">{editBook ? "Edit Book" : "Add Book"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                {(["title", "author", "isbn"] as const).map((field) => (
                  <FormInput
                    key={field}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: (e.target as HTMLInputElement).value })}
                  />
                ))}
                <FormInput label="Category" as="select" value={form.category} onChange={(e) => setForm({ ...form, category: (e.target as HTMLSelectElement).value })}>
                  {(formCategories.length > 0 ? formCategories : ["Fiction"]).map((c) => <option key={c} value={c}>{c}</option>)}
                </FormInput>
                <FormInput label="Quantity" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt((e.target as HTMLInputElement).value) || 1 })} />
                <button onClick={handleSave} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 mt-2">
                  {editBook ? "Update" : "Add"} Book
                </button>
              </div>
            </DialogContent>
          </Dialog>
        ) : undefined}
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search books..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                category === c ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <TableContainer
        headers={isAdmin
          ? ["Title", "Author", "Category", "ISBN", "Qty", "Status", "Actions"]
          : showBorrowAction
            ? ["Title", "Author", "Category", "ISBN", "Qty", "Status", "Action"]
            : ["Title", "Author", "Category", "ISBN", "Qty", "Status"]}
        isEmpty={filtered.length === 0}
        emptyMessage="No books found matching your search"
      >
        {paginatedItems.map((book) => (
          <tr key={book.id} className="table-row-hover">
            <td className="py-3.5 px-4 font-medium text-foreground">{book.title}</td>
            <td className="py-3.5 px-4 text-muted-foreground">{book.author}</td>
            <td className="py-3.5 px-4 text-muted-foreground">{book.category}</td>
            <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">{book.isbn}</td>
            <td className="py-3.5 px-4 text-foreground">{book.available}/{book.quantity}</td>
            <td className="py-3.5 px-4">
              <StatusBadge status={book.available > 0 ? "Available" : "Issued"} />
            </td>
            {isAdmin && (
              <td className="py-3.5 px-4">
                <div className="flex gap-1">
                  <button onClick={() => openEdit(book)} className="action-btn"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(book.id)} className="action-btn action-btn-danger"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            )}
            {showBorrowAction && (
              <td className="py-3.5 px-4">
                <button
                  onClick={() => handleBorrow(book.id)}
                  disabled={book.available <= 0 || borrowingBookId === book.id}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {borrowingBookId === book.id ? "Borrowing..." : "Borrow"}
                </button>
              </td>
            )}
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
