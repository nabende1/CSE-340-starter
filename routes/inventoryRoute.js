// routes/inventoryRoute.js
// Needed Resources 
const express = require("express");
const router = new express.Router(); 
const invController = require("../controllers/invController");
const utilities = require("../utilities/"); 
const invValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view 👈 ADD THIS
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetail));

// Intentional 500 error route (for testing)
router.get("/crash", utilities.handleErrors((req, res, next) => {
  throw new Error("Intentional 500 crash for testing");
}));

// Management views
router.get("/", utilities.handleErrors(invController.buildManagement));
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

// POST handlers
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventoryItem)
);

module.exports = router;