import axios from "axios";

const API_URL = "http://localhost:5000/api";

const STUDENTS = [
  { email: "rahul@student.com", password: "pass123", label: "Rahul" },
  { email: "priya@student.com", password: "pass123", label: "Priya" },
];

async function loginStudent(credentials) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: credentials.email,
    password: credentials.password,
  });

  return {
    id: response.data._id,
    name: response.data.name,
    role: response.data.role,
    token: response.data.token,
  };
}

async function getIssues(token) {
  const response = await axios.get(`${API_URL}/issues`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

async function getFines(token) {
  const response = await axios.get(`${API_URL}/fines`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

function assertOnlyOwnData(label, ownerId, issues, fineRecords) {
  const leakedIssues = issues.filter((issue) => issue.user?._id !== ownerId);
  const leakedFines = fineRecords.filter((record) => record.user?._id !== ownerId);

  if (leakedIssues.length > 0) {
    throw new Error(`${label}: issues endpoint leaked ${leakedIssues.length} record(s) from other users`);
  }

  if (leakedFines.length > 0) {
    throw new Error(`${label}: fines endpoint leaked ${leakedFines.length} record(s) from other users`);
  }
}

async function run() {
  try {
    console.log("\n=== Student Data Isolation Check ===");

    const sessions = [];
    for (const student of STUDENTS) {
      const session = await loginStudent(student);
      sessions.push({ ...student, ...session });
      console.log(`Logged in: ${session.name} (${session.role})`);
    }

    for (const session of sessions) {
      const [issues, fines] = await Promise.all([
        getIssues(session.token),
        getFines(session.token),
      ]);

      assertOnlyOwnData(session.label, session.id, issues, fines.records || []);

      console.log(
        `${session.label}: issues=${issues.length}, fineRecords=${(fines.records || []).length}, totalFines=₹${fines.totalFines || 0}`
      );
    }

    console.log("✅ Isolation confirmed: each student only receives their own data from /issues and /fines.");
  } catch (error) {
    console.error("❌ Isolation test failed:");
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
