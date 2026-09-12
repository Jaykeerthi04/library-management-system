import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("library_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post("/auth/register", data),
};

// Books
export const booksApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; search?: string }) =>
    api.get("/books", { params }),
  create: (data: { title: string; author: string; category: string; isbn: string; quantity: number }) =>
    api.post("/books", data),
  update: (id: string, data: Partial<{ title: string; author: string; category: string; isbn: string; quantity: number }>) =>
    api.put(`/books/${id}`, data),
  delete: (id: string) =>
    api.delete(`/books/${id}`),
};

// Users
export const usersApi = {
  getAll: () => api.get("/users"),
  create: (data: { name: string; email: string; password: string; role: string }) =>
    api.post("/users", data),
  update: (id: string, data: Partial<{ name: string; email: string; role: string; password: string }>) =>
    api.put(`/users/${id}`, data),
  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

// Issues
export const issuesApi = {
  getAll: (params?: { userId?: string; status?: string }) =>
    api.get("/issues", { params }),
  issue: (data: { user: string; book: string }) =>
    api.post("/issues", data),
  return: (id: string) =>
    api.put(`/issues/return/${id}`),
};

// Fines
export const finesApi = {
  getAll: (params?: { userId?: string }) =>
    api.get("/fines", { params }),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get("/dashboard"),
};

export default api;
