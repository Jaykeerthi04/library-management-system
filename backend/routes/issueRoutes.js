const express = require("express");
const { issueBook, returnBook, getIssues } = require("../controllers/issueController");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getIssues);
router.post("/", protect, authorizeRoles("admin", "student"), issueBook);
router.put("/return/:id", protect, authorizeRoles("admin", "student"), returnBook);

module.exports = router;
