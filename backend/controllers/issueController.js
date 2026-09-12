const Issue = require("../models/Issue");
const Book = require("../models/Book");

// POST /api/issues
const issueBook = async (req, res) => {
  try {
    const { user, book } = req.body;
    const userId = req.user.role === "student" ? req.user._id : user;

    if (!userId || !book) {
      return res.status(400).json({ message: "User and book are required" });
    }

    const existingIssue = await Issue.findOne({
      user: userId,
      book,
      status: { $in: ["issued", "overdue"] },
    });

    if (existingIssue) {
      return res.status(400).json({ message: "You already have this book issued" });
    }

    const bookDoc = await Book.findById(book);
    if (!bookDoc || bookDoc.available <= 0) {
      return res.status(400).json({ message: "Book not available" });
    }

    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const issue = await Issue.create({ user: userId, book, dueDate });

    bookDoc.available -= 1;
    await bookDoc.save();

    const populated = await Issue.findById(issue._id).populate("user", "name email").populate("book", "title author");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/issues/return/:id
const returnBook = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    if (issue.status === "returned") return res.status(400).json({ message: "Already returned" });

    if (req.user.role === "student" && issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to return this issue" });
    }

    const today = new Date();
    const overdueDays = Math.max(0, Math.floor((today - issue.dueDate) / (1000 * 60 * 60 * 24)));
    const fine = overdueDays * 10;

    issue.returnDate = today;
    issue.fine = fine;
    issue.status = "returned";
    await issue.save();

    const book = await Book.findById(issue.book);
    if (book) {
      book.available += 1;
      await book.save();
    }

    const populated = await Issue.findById(issue._id).populate("user", "name email").populate("book", "title author");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/issues
const getIssues = async (req, res) => {
  try {
    const filter = {};

    // Students are always restricted to their own issues.
    if (req.user.role === "student") {
      filter.user = req.user._id;
    } else if (req.query.userId) {
      filter.user = req.query.userId;
    }

    if (req.query.status) filter.status = req.query.status;

    const issues = await Issue.find(filter)
      .populate("user", "name email")
      .populate("book", "title author")
      .sort({ issueDate: -1 });

    // Auto-update overdue status
    const today = new Date();
    for (const issue of issues) {
      if (issue.status === "issued" && issue.dueDate < today) {
        issue.status = "overdue";
        await issue.save();
      }
    }

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { issueBook, returnBook, getIssues };
