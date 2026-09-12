import axios from "axios";

const API_URL = "http://localhost:5000/api";

async function run() {
  let token;
  let tempUserId;
  let tempBookId;

  try {
    console.log("\n=== Admin Sanity Validation ===");

    const login = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@library.com",
      password: "admin123",
    });

    token = login.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log(`Logged in as: ${login.data.name} (${login.data.role})`);

    const stamp = Date.now();

    console.log("\n1) Create temp user");
    const createUser = await axios.post(
      `${API_URL}/users`,
      {
        name: "Temp Student",
        email: `temp_${stamp}@student.com`,
        password: "pass123",
        role: "student",
      },
      { headers }
    );
    tempUserId = createUser.data._id;
    console.log(`✅ User created: ${tempUserId}`);

    console.log("\n2) Update temp user");
    const updateUser = await axios.put(
      `${API_URL}/users/${tempUserId}`,
      { name: "Temp Student Updated" },
      { headers }
    );
    console.log(`✅ User updated: ${updateUser.data.name}`);

    console.log("\n3) Create temp book");
    const createBook = await axios.post(
      `${API_URL}/books`,
      {
        title: `Temp Book ${stamp}`,
        author: "QA Bot",
        category: "Technology",
        isbn: `TMP-${stamp}`,
        quantity: 3,
      },
      { headers }
    );
    tempBookId = createBook.data._id;
    console.log(`✅ Book created: ${tempBookId}`);

    console.log("\n4) Update temp book");
    const updateBook = await axios.put(
      `${API_URL}/books/${tempBookId}`,
      { quantity: 5 },
      { headers }
    );
    console.log(`✅ Book updated quantity: ${updateBook.data.quantity}`);

    console.log("\n5) Fetch dashboard stats");
    const dashboard = await axios.get(`${API_URL}/dashboard`, { headers });
    const requiredFields = ["totalBooks", "totalUsers", "activeIssues", "overdueIssues", "totalFines"];
    const missing = requiredFields.filter((f) => typeof dashboard.data[f] === "undefined");
    if (missing.length) {
      throw new Error(`Dashboard missing fields: ${missing.join(", ")}`);
    }
    console.log(
      `✅ Dashboard fields present (books=${dashboard.data.totalBooks}, users=${dashboard.data.totalUsers}, activeIssues=${dashboard.data.activeIssues}, overdue=${dashboard.data.overdueIssues}, fines=₹${dashboard.data.totalFines})`
    );

    console.log("\n6) Fetch fines summary");
    const fines = await axios.get(`${API_URL}/fines`, { headers });
    if (
      typeof fines.data.totalFines === "undefined" ||
      typeof fines.data.paidFines === "undefined" ||
      typeof fines.data.unpaidFines === "undefined" ||
      !Array.isArray(fines.data.records)
    ) {
      throw new Error("Fines response shape invalid");
    }
    console.log(
      `✅ Fines summary valid (records=${fines.data.records.length}, total=₹${fines.data.totalFines}, paid=₹${fines.data.paidFines}, unpaid=₹${fines.data.unpaidFines})`
    );

    console.log("\n7) Cleanup temp book and user");
    await axios.delete(`${API_URL}/books/${tempBookId}`, { headers });
    await axios.delete(`${API_URL}/users/${tempUserId}`, { headers });
    tempBookId = null;
    tempUserId = null;
    console.log("✅ Cleanup complete");

    console.log("\n✅ ADMIN SANITY TEST PASSED");
  } catch (error) {
    console.error("\n❌ Admin sanity test failed:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Body: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    process.exitCode = 1;
  } finally {
    try {
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        if (tempBookId) await axios.delete(`${API_URL}/books/${tempBookId}`, { headers });
        if (tempUserId) await axios.delete(`${API_URL}/users/${tempUserId}`, { headers });
      }
    } catch {
      // ignore cleanup errors
    }
  }
}

run();
