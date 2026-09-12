import axios from "axios";

const API_URL = "http://localhost:5000/api";

async function run() {
  try {
    console.log("\n=== Role Permission Validation ===");

    const studentLogin = await axios.post(`${API_URL}/auth/login`, {
      email: "priya@student.com",
      password: "pass123",
    });

    const headers = { Authorization: `Bearer ${studentLogin.data.token}` };
    console.log(`Logged in as: ${studentLogin.data.name} (${studentLogin.data.role})`);

    let blockedCreateBook = false;
    try {
      await axios.post(
        `${API_URL}/books`,
        { title: "Nope", author: "Nope", category: "Fiction", isbn: "NOPE-1", quantity: 1 },
        { headers }
      );
    } catch (err) {
      blockedCreateBook = err.response?.status === 403;
    }

    let blockedCreateUser = false;
    try {
      await axios.post(
        `${API_URL}/users`,
        { name: "Nope", email: `nope_${Date.now()}@x.com`, password: "pass123", role: "student" },
        { headers }
      );
    } catch (err) {
      blockedCreateUser = err.response?.status === 403;
    }

    if (!blockedCreateBook || !blockedCreateUser) {
      throw new Error("Student was not blocked from an admin-only endpoint");
    }

    console.log("✅ Student is blocked from admin-only book/user creation (403 as expected)");
    console.log("✅ Permission boundaries are correct");
  } catch (error) {
    console.error("❌ Permission test failed:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Body: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    process.exitCode = 1;
  }
}

run();
