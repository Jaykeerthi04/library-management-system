const express = require("express");
const { getFines } = require("../controllers/fineController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getFines);

module.exports = router;
