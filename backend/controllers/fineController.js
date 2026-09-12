const Issue = require("../models/Issue");

const DAILY_FINE = 10;

const calculateOverdueFine = (dueDate, today) => {
  const overdueDays = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
  return overdueDays * DAILY_FINE;
};

// GET /api/fines
const getFines = async (req, res) => {
  try {
    const today = new Date();

    // Keep loan status current even when the issues page has not been opened first.
    await Issue.updateMany(
      { status: "issued", dueDate: { $lt: today } },
      { $set: { status: "overdue" } }
    );

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

    const records = fineRecords.map((record) => {
      const fine = record.status === "overdue"
        ? calculateOverdueFine(record.dueDate, today)
        : record.fine;

      return { ...record.toObject(), fine };
    });

    const totalFines = records.reduce((sum, r) => sum + r.fine, 0);
    const paidFines = records.filter((r) => r.status === "returned").reduce((sum, r) => sum + r.fine, 0);
    const unpaidFines = totalFines - paidFines;

    res.json({ records, totalFines, paidFines, unpaidFines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFines };
