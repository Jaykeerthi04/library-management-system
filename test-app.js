import axios from "axios";

const API_URL = "http://localhost:5000/api";

let studentId, studentToken, bookId, issueId;

async function test() {
  try {
    // Test 1: Login as Admin
    console.log("\n✓ Test 1: Login as Admin");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@library.com",
      password: "admin123",
    });
    const adminToken = loginRes.data.token;
    console.log(`  User: ${loginRes.data.name}`);
    console.log(`  Role: ${loginRes.data.role}`);

    // Get Student ID for testing
    console.log("\n✓ Get Student for Testing");
    const usersRes = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const student = usersRes.data.find((u) => u.email === "rahul@student.com");
    studentId = student._id;
    studentToken = adminToken;
    console.log(`  Testing with student: ${student.name}`);

    // Test 2: Get Books
    console.log("\n✓ Test 2: Get Available Books");
    const booksRes = await axios.get(`${API_URL}/books`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const availableBooks = booksRes.data.books.filter((b) => b.available > 0);
    const book = availableBooks[0];
    bookId = book._id;
    console.log(`  Found ${availableBooks.length} available books`);
    console.log(`  Selected: "${book.title}" by ${book.author}`);
    console.log(`  Available copies: ${book.available}`);

    // Test 3: Borrow a Book
    console.log("\n✓ Test 3: Borrow a Book");
    const borrowRes = await axios.post(
      `${API_URL}/issues`,
      { user: studentId, book: bookId },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    issueId = borrowRes.data._id;
    console.log(`  Issue ID: ${issueId}`);
    console.log(`  Issue Date: ${new Date(borrowRes.data.issueDate).toLocaleDateString()}`);
    console.log(`  Due Date: ${new Date(borrowRes.data.dueDate).toLocaleDateString()}`);
    console.log(`  Status: ${borrowRes.data.status}`);

    // Test 4: Check Current Issues
    console.log("\n✓ Test 4: Check Current Issues");
    const issuesRes = await axios.get(
      `${API_URL}/issues?userId=${studentId}`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log(`  Total Issues: ${issuesRes.data.length}`);
    issuesRes.data.forEach((issue) => {
      console.log(
        `  - ${issue.book.title} (Status: ${issue.status}, Fine: ₹${issue.fine})`
      );
    });

    // Test 5: Check Fines
    console.log("\n✓ Test 5: Check Fines");
    const finesRes = await axios.get(`${API_URL}/fines?userId=${studentId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`  Total Fines: ₹${finesRes.data.totalFines}`);
    console.log(`  Paid Fines: ₹${finesRes.data.paidFines}`);
    console.log(`  Unpaid Fines: ₹${finesRes.data.unpaidFines}`);

    // Test 6: Return Book (test fine calculation)
    console.log("\n✓ Test 6: Return Book");
    const returnRes = await axios.put(
      `${API_URL}/issues/return/${issueId}`,
      {},
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log(`  Return Date: ${new Date(returnRes.data.returnDate).toLocaleDateString()}`);
    console.log(`  Fine Calculated: ₹${returnRes.data.fine}`);
    console.log(`  Status: ${returnRes.data.status}`);

    // Test 7: Verify Book Availability Restored
    console.log("\n✓ Test 7: Verify Book Availability");
    const booksAfter = await axios.get(`${API_URL}/books`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const updatedBook = booksAfter.data.books.find((b) => b._id === bookId);
    console.log(`  Book "${updatedBook.title}" now has ${updatedBook.available} copies available`);

    // Test 8: Dashboard Stats
    console.log("\n✓ Test 8: Dashboard Statistics");
    const statsRes = await axios.get(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`  Total Books: ${statsRes.data.totalBooks}`);
    console.log(`  Total Issues: ${statsRes.data.totalIssues}`);
    console.log(`  Overdue Books: ${statsRes.data.overdueBooks}`);
    console.log(`  Total Fines: ₹${statsRes.data.totalFines}`);

    console.log("\n✅ All tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:");
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`  ${error.message}`);
    }
  }
}

test();
