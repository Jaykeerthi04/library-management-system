const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Issue = require("./models/Issue");

dotenv.config({ path: path.join(__dirname, ".env") });

const API_BASE = "http://localhost:5000/api";

async function api(method, url, body, token) {
  const response = await fetch(`${API_BASE}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function run() {
  let issueId;
  try {
    console.log("\n=== Overdue Fine Validation ===");

    const login = await api("POST", "/auth/login", {
      email: "priya@student.com",
      password: "pass123",
    });

    const token = login.token;
    const userId = login._id;
    console.log(`Logged in: ${login.name} (${login.role})`);

    const booksRes = await api("GET", "/books", null, token);
    const selectedBook = booksRes.books.find((b) => b.available > 0);
    if (!selectedBook) throw new Error("No available book found for test");

    console.log(`Borrowing: ${selectedBook.title}`);
    const issued = await api("POST", "/issues", { user: userId, book: selectedBook._id }, token);
    issueId = issued._id;
    console.log(`Issue created: ${issueId}`);

    await mongoose.connect(process.env.MONGO_URI);

    const overdueDate = new Date(Date.now() - ((4 * 24 + 1) * 60 * 60 * 1000));
    await Issue.findByIdAndUpdate(issueId, {
      dueDate: overdueDate,
      status: "issued",
      fine: 0,
      returnDate: null,
    });
    console.log(`Backdated due date to: ${overdueDate.toISOString()}`);

    const returned = await api("PUT", `/issues/return/${issueId}`, {}, token);
    const expectedMinimumFine = 40;

    console.log(`Returned status: ${returned.status}`);
    console.log(`Computed fine: ₹${returned.fine}`);

    if (returned.fine >= expectedMinimumFine) {
      console.log("✅ PASS: Non-zero overdue fine is calculated correctly");
    } else {
      console.log(`❌ FAIL: Expected fine >= ₹${expectedMinimumFine}, got ₹${returned.fine}`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("❌ Overdue fine test failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

run();
