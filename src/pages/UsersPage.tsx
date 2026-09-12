import { useEffect, useState } from "react";
import { User } from "@/types/library";
import { Plus, Edit, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TableContainer from "@/components/TableContainer";
import FormInput from "@/components/FormInput";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usersApi } from "@/services/api";

type UserForm = {
  name: string;
  email: string;
  role: "Admin" | "Student";
  password: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<UserForm>({ name: "", email: "", role: "Student", password: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getAll();
      const mappedUsers: User[] = (response.data || []).map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        password: "",
        role: u.role === "admin" ? "Admin" : "Student",
        createdAt: new Date(u.createdAt).toISOString().split("T")[0],
      }));
      setUsers(mappedUsers);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: "", email: "", role: "Student", password: "" });
    setIsOpen(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, password: "" });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and email required");
      return;
    }

    if (!editUser && !form.password) {
      toast.error("Password is required for new user");
      return;
    }

    try {
      setIsSaving(true);

      if (editUser) {
        await usersApi.update(editUser.id, {
          name: form.name,
          email: form.email,
          role: form.role.toLowerCase(),
          ...(form.password ? { password: form.password } : {}),
        });
        toast.success("User updated");
      } else {
        await usersApi.create({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role.toLowerCase(),
        });
        toast.success("User added");
      }

      await fetchUsers();
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usersApi.delete(id);
      toast.success("User deleted");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Users"
        description={loading ? "Loading users..." : `${users.length} registered users`}
        action={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20">
                <Plus className="h-4 w-4" /> Add User
              </button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-foreground">{editUser ? "Edit User" : "Add User"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <FormInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })} />
                <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: (e.target as HTMLInputElement).value })} />
                <FormInput
                  label={editUser ? "Password (optional)" : "Password"}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: (e.target as HTMLInputElement).value })}
                />
                <FormInput label="Role" as="select" value={form.role} onChange={(e) => setForm({ ...form, role: (e.target as HTMLSelectElement).value as "Admin" | "Student" })}>
                  <option value="Student">Student</option>
                  <option value="Admin">Admin</option>
                </FormInput>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : `${editUser ? "Update" : "Add"} User`}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <TableContainer
        headers={["Name", "Email", "Role", "Joined", "Actions"]}
        isEmpty={users.length === 0}
        emptyMessage="No users found"
      >
        {users.map((u) => (
          <tr key={u.id} className="table-row-hover">
            <td className="py-3.5 px-4 text-foreground font-medium">{u.name}</td>
            <td className="py-3.5 px-4 text-muted-foreground">{u.email}</td>
            <td className="py-3.5 px-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${u.role === "Admin" ? "bg-primary/15 text-primary" : "bg-info/15 text-info"}`}>
                {u.role}
              </span>
            </td>
            <td className="py-3.5 px-4 text-muted-foreground">{u.createdAt}</td>
            <td className="py-3.5 px-4">
              <div className="flex gap-1">
                <button onClick={() => openEdit(u)} className="action-btn"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(u.id)} className="action-btn action-btn-danger"><Trash2 className="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </TableContainer>
    </div>
  );
}
