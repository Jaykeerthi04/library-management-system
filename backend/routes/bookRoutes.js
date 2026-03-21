const express = require("express");
const { getBooks, createBook, updateBook, deleteBook } = require("../controllers/bookController");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getBooks);
router.post("/", protect, authorizeRoles("admin"), createBook);
router.put("/:id", protect, authorizeRoles("admin"), updateBook);
router.delete("/:id", protect, authorizeRoles("admin"), deleteBook);

module.exports = router;
