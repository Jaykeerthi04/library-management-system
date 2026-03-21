export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  quantity: number;
  available: number;
  coverImage: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Student";
  createdAt: string;
}

export interface Issue {
  id: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  issueDate: string;
  returnDate: string;
  actualReturnDate: string | null;
  fine: number;
  status: "Issued" | "Returned" | "Overdue";
}

export interface MonthlyStats {
  month: string;
  issued: number;
  returned: number;
}
