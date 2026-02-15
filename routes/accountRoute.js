// routes/accountRoute.js
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation');

// Deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Deliver registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Deliver account management view
router.get(
  "/", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Process registration
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process login
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Build account update view (protected)
router.get(
  "/update/:account_id", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
);

// Process account update (protected)
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
);

// Process password change (protected)
router.post(
  "/change-password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkUpdatePasswordData,
  utilities.handleErrors(accountController.changePassword)
);

// Logout route - FIXED: using correct method name
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

module.exports = router;