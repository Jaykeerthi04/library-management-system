import { Book, User, Issue, MonthlyStats } from "@/types/library";

export const mockBooks: Book[] = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", isbn: "978-0743273565", quantity: 5, available: 3, coverImage: "", createdAt: "2024-01-15" },
  { id: "2", title: "Clean Code", author: "Robert C. Martin", category: "Technology", isbn: "978-0132350884", quantity: 8, available: 5, coverImage: "", createdAt: "2024-02-10" },
  { id: "3", title: "Sapiens", author: "Yuval Noah Harari", category: "History", isbn: "978-0062316097", quantity: 4, available: 0, coverImage: "", createdAt: "2024-01-20" },
  { id: "4", title: "Atomic Habits", author: "James Clear", category: "Self-Help", isbn: "978-0735211292", quantity: 10, available: 7, coverImage: "", createdAt: "2024-03-05" },
  { id: "5", title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", isbn: "978-0062315007", quantity: 6, available: 2, coverImage: "", createdAt: "2024-02-28" },
  { id: "6", title: "Design Patterns", author: "Gang of Four", category: "Technology", isbn: "978-0201633610", quantity: 3, available: 1, coverImage: "", createdAt: "2024-04-12" },
  { id: "7", title: "1984", author: "George Orwell", category: "Fiction", isbn: "978-0451524935", quantity: 7, available: 4, coverImage: "", createdAt: "2024-03-18" },
  { id: "8", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", isbn: "978-0374533557", quantity: 5, available: 3, coverImage: "", createdAt: "2024-05-01" },
  { id: "9", title: "The Pragmatic Programmer", author: "David Thomas", category: "Technology", isbn: "978-0135957059", quantity: 4, available: 2, coverImage: "", createdAt: "2024-04-22" },
  { id: "10", title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", isbn: "978-0061120084", quantity: 6, available: 6, coverImage: "", createdAt: "2024-01-30" },
];

export const mockUsers: User[] = [
  { id: "1", name: "Admin User", email: "admin@library.com", password: "admin123", role: "Admin", createdAt: "2024-01-01" },
  { id: "2", name: "Rahul Sharma", email: "rahul@student.com", password: "pass123", role: "Student", createdAt: "2024-01-10" },
  { id: "3", name: "Priya Patel", email: "priya@student.com", password: "pass123", role: "Student", createdAt: "2024-02-15" },
  { id: "4", name: "Amit Kumar", email: "amit@student.com", password: "pass123", role: "Student", createdAt: "2024-03-01" },
  { id: "5", name: "Sneha Gupta", email: "sneha@student.com", password: "pass123", role: "Student", createdAt: "2024-03-20" },
  { id: "6", name: "Vikram Singh", email: "vikram@student.com", password: "pass123", role: "Student", createdAt: "2024-04-05" },
];

export const mockIssues: Issue[] = [
  { id: "1", userId: "2", userName: "Rahul Sharma", bookId: "1", bookTitle: "The Great Gatsby", issueDate: "2024-11-01", returnDate: "2024-11-15", actualReturnDate: "2024-11-18", fine: 30, status: "Returned" },
  { id: "2", userId: "3", userName: "Priya Patel", bookId: "3", bookTitle: "Sapiens", issueDate: "2024-12-10", returnDate: "2024-12-24", actualReturnDate: null, fine: 680, status: "Overdue" },
  { id: "3", userId: "4", userName: "Amit Kumar", bookId: "5", bookTitle: "The Alchemist", issueDate: "2025-01-05", returnDate: "2025-01-19", actualReturnDate: "2025-01-17", fine: 0, status: "Returned" },
  { id: "4", userId: "5", userName: "Sneha Gupta", bookId: "2", bookTitle: "Clean Code", issueDate: "2025-02-01", returnDate: "2025-02-15", actualReturnDate: null, fine: 140, status: "Overdue" },
  { id: "5", userId: "6", userName: "Vikram Singh", bookId: "6", bookTitle: "Design Patterns", issueDate: "2025-02-20", returnDate: "2025-03-06", actualReturnDate: null, fine: 0, status: "Issued" },
  { id: "6", userId: "2", userName: "Rahul Sharma", bookId: "9", bookTitle: "The Pragmatic Programmer", issueDate: "2025-02-25", returnDate: "2025-03-11", actualReturnDate: null, fine: 0, status: "Issued" },
  { id: "7", userId: "3", userName: "Priya Patel", bookId: "7", bookTitle: "1984", issueDate: "2024-10-15", returnDate: "2024-10-29", actualReturnDate: "2024-10-28", fine: 0, status: "Returned" },
  { id: "8", userId: "4", userName: "Amit Kumar", bookId: "8", bookTitle: "Thinking, Fast and Slow", issueDate: "2025-01-20", returnDate: "2025-02-03", actualReturnDate: null, fine: 260, status: "Overdue" },
];

export const monthlyStats: MonthlyStats[] = [
  { month: "Sep", issued: 12, returned: 10 },
  { month: "Oct", issued: 18, returned: 15 },
  { month: "Nov", issued: 22, returned: 19 },
  { month: "Dec", issued: 15, returned: 12 },
  { month: "Jan", issued: 25, returned: 20 },
  { month: "Feb", issued: 20, returned: 14 },
];

export const categoryDistribution = [
  { name: "Fiction", value: 4, fill: "hsl(250, 80%, 65%)" },
  { name: "Technology", value: 3, fill: "hsl(200, 90%, 55%)" },
  { name: "History", value: 1, fill: "hsl(150, 70%, 45%)" },
  { name: "Self-Help", value: 1, fill: "hsl(38, 92%, 55%)" },
  { name: "Psychology", value: 1, fill: "hsl(0, 72%, 55%)" },
];

export const bookCategories = ["All", "Fiction", "Technology", "History", "Self-Help", "Psychology"];
