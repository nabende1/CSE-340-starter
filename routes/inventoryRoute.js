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

// Management views (protected - employee or admin only)
router.get("/", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement));
router.get("/add-classification", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification));
router.get("/add-inventory", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory));

// Get inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Build edit inventory view (protected)
router.get("/edit/:inv_id", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.editInventoryView));

// Process inventory update (protected)
router.post(
  "/update",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Build delete confirmation view (protected)
router.get("/delete/:inv_id", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildDeleteConfirm));

// Process inventory deletion (protected)
router.post(
  "/delete",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventory)
);

// POST handlers (protected)
router.post(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

router.post(
  "/add-inventory",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventoryItem)
);

module.exports = router;