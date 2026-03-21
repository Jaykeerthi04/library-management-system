const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Book = require("./models/Book");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding");

    // Clear existing data
    await User.deleteMany();
    await Book.deleteMany();

    // Seed users
    const users = await User.create([
      { name: "Admin User", email: "admin@library.com", password: "admin123", role: "admin" },
      { name: "Rahul Sharma", email: "rahul@student.com", password: "pass123", role: "student" },
      { name: "Priya Patel", email: "priya@student.com", password: "pass123", role: "student" },
      { name: "Amit Kumar", email: "amit@student.com", password: "pass123", role: "student" },
      { name: "Sneha Gupta", email: "sneha@student.com", password: "pass123", role: "student" },
      { name: "Vikram Singh", email: "vikram@student.com", password: "pass123", role: "student" },
    ]);
    console.log(`${users.length} users seeded`);

    // Seed books
    const books = await Book.create([
      { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", isbn: "978-0743273565", quantity: 5, available: 3 },
      { title: "Clean Code", author: "Robert C. Martin", category: "Technology", isbn: "978-0132350884", quantity: 8, available: 5 },
      { title: "Sapiens", author: "Yuval Noah Harari", category: "History", isbn: "978-0062316097", quantity: 4, available: 0 },
      { title: "Atomic Habits", author: "James Clear", category: "Self-Help", isbn: "978-0735211292", quantity: 10, available: 7 },
      { title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", isbn: "978-0062315007", quantity: 6, available: 2 },
      { title: "Design Patterns", author: "Gang of Four", category: "Technology", isbn: "978-0201633610", quantity: 3, available: 1 },
      { title: "1984", author: "George Orwell", category: "Fiction", isbn: "978-0451524935", quantity: 7, available: 4 },
      { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", isbn: "978-0374533557", quantity: 5, available: 3 },
      { title: "The Pragmatic Programmer", author: "David Thomas", category: "Technology", isbn: "978-0135957059", quantity: 4, available: 2 },
      { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", isbn: "978-0061120084", quantity: 6, available: 6 },
    ]);
    console.log(`${books.length} books seeded`);

    console.log("Seeding complete!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
