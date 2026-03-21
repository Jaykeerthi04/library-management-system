const Issue = require("../models/Issue");

// GET /api/fines
const getFines = async (req, res) => {
  try {
    const filter = {
      $or: [{ status: "overdue" }, { fine: { $gt: 0 } }],
    };

    // Students are always restricted to their own fine records.
    if (req.user.role === "student") {
      filter.user = req.user._id;
    } else if (req.query.userId) {
      filter.user = req.query.userId;
    }

    const fineRecords = await Issue.find(filter)
      .populate("user", "name email")
      .populate("book", "title")
      .sort({ dueDate: -1 });

    const totalFines = fineRecords.reduce((sum, r) => sum + r.fine, 0);
    const paidFines = fineRecords.filter((r) => r.status === "returned").reduce((sum, r) => sum + r.fine, 0);
    const unpaidFines = totalFines - paidFines;

    res.json({ records: fineRecords, totalFines, paidFines, unpaidFines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFines };
