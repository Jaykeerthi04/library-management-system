const Book = require("../models/Book");
const User = require("../models/User");
const Issue = require("../models/Issue");

// GET /api/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeIssues = await Issue.countDocuments({ status: "issued" });
    const overdueIssues = await Issue.countDocuments({ status: "overdue" });
    const totalFines = await Issue.aggregate([{ $group: { _id: null, total: { $sum: "$fine" } } }]);

    // Category distribution
    const categoryDistribution = await Book.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } },
    ]);

    // Monthly stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyIssued = await Issue.aggregate([
      { $match: { issueDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$issueDate" } },
          issued: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyReturned = await Issue.aggregate([
      { $match: { returnDate: { $gte: sixMonthsAgo, $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$returnDate" } },
          returned: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalBooks,
      totalUsers,
      activeIssues,
      overdueIssues,
      totalFines: totalFines[0]?.total || 0,
      categoryDistribution,
      monthlyIssued,
      monthlyReturned,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
