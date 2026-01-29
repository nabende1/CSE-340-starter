// routes/inventoryRoute.js
// Needed Resources 
const express = require("express");
const router = new express.Router(); 
const invController = require("../controllers/invController");
const utilities = require("../utilities/"); 

// Route to build inventory by classification view 👈 ADD THIS
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetail));

// Intentional 500 error route (for testing)
router.get("/crash", utilities.handleErrors((req, res, next) => {
  throw new Error("Intentional 500 crash for testing");
}));

module.exports = router;