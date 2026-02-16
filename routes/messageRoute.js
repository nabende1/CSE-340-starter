// routes/messageRoute.js
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const utilities = require("../utilities/");

// Public contact form
router.get("/", utilities.handleErrors(messageController.buildContact));
router.post("/", utilities.handleErrors(messageController.submitMessage));

// Admin-only: View messages
router.get("/admin", utilities.checkEmployeeOrAdmin, utilities.handleErrors(messageController.viewMessages));

module.exports = router;