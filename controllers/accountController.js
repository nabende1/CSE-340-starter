// controllers/accountController.js
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken"); 
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null, // 👈 REQUIRED
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null, 
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // Regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("error", 'Sorry, there was an error processing the registration.');
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword // 👈 USE HASHED PASSWORD
  );

  if (regResult.rows && regResult.rows.length > 0) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("error", "Sorry, the registration failed. " + (regResult || ""));
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  
  const accountData = await accountModel.getAccountByEmail(account_email);
  
  if (!accountData) {
    req.flash("error", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      // Remove password from payload
      const accountWithoutPassword = { ...accountData };
      delete accountWithoutPassword.account_password;

      // Create JWT
      const accessToken = jwt.sign(
        accountWithoutPassword, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '1h' }
      );

      // Set cookie based on environment
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { 
          httpOnly: true, 
          maxAge: 3600000 // 1 hour in ms
        });
      } else {
        res.cookie("jwt", accessToken, { 
          httpOnly: true, 
          secure: true, 
          maxAge: 3600000 
        });
      }

      return res.redirect("/account/");
    } else {
      req.flash("error", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    next(error); // Pass to error handler
  }
}

/* ****************************************
 *  Deliver account management view
 * ************************************ */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null
  });
}

/* ****************************************
 *  Build account update view
 * ************************************ */
async function buildUpdateAccount(req, res, next) {
  const account_id = parseInt(req.params.account_id);
  let nav = await utilities.getNav();
  
  // Verify user can only edit their own account
  if (res.locals.loggedin && res.locals.accountData.account_id === account_id) {
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData,
      errors: null
    });
  } else {
    req.flash("error", "Access denied.");
    res.redirect("/account/");
  }
}

/* ****************************************
 *  Update account information
 * ************************************ */
async function updateAccount(req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  let nav = await utilities.getNav();
  
  // Verify ownership
  if (!res.locals.loggedin || res.locals.accountData.account_id != account_id) {
    req.flash("error", "Access denied.");
    return res.redirect("/account/");
  }

  // Check if email is being changed and already exists
  const currentAccount = await accountModel.getAccountById(account_id);
  if (currentAccount.account_email !== account_email) {
    const emailExists = await accountModel.checkExistingEmail(account_email);
    if (emailExists) {
      req.flash("error", "Email already exists.");
      return res.status(400).render("account/update-account", {
        title: "Update Account",
        nav,
        accountData: { account_id, account_firstname, account_lastname, account_email },
        errors: null
      });
    }
  }

  const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
  if (result) {
    req.flash("notice", "Account updated successfully!");
    res.redirect("/account/");
  } else {
    req.flash("error", "Failed to update account.");
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      accountData: { account_id, account_firstname, account_lastname, account_email },
      errors: null
    });
  }
}

/* ****************************************
 *  Change password
 * ************************************ */
async function changePassword(req, res, next) {
  const { account_id, account_password } = req.body;
  let nav = await utilities.getNav();
  
  // Verify ownership
  if (!res.locals.loggedin || res.locals.accountData.account_id != account_id) {
    req.flash("error", "Access denied.");
    return res.redirect("/account/");
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updatePassword(account_id, hashedPassword);
    
    if (result) {
      req.flash("notice", "Password changed successfully!");
      res.redirect("/account/");
    } else {
      req.flash("error", "Failed to change password.");
      res.status(500).render("account/update-account", {
        title: "Update Account",
        nav,
        accountData: await accountModel.getAccountById(account_id),
        errors: null
      });
    }
  } catch (error) {
    req.flash("error", "Password does not meet requirements.");
    res.status(400).render("account/update-account", {
      title: "Update Account",
      nav,
      accountData: await accountModel.getAccountById(account_id),
      errors: null
    });
  }
}



/* ****************************************
 *  Process logout
 * ************************************ */
async function accountLogout(req, res, next) {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt");
    
    // Set success message
    req.flash("notice", "You have been successfully logged out.");
    
    // Redirect to home page
    res.redirect("/");
  } catch (error) {
    req.flash("error", "Error during logout. Please try again.");
    res.redirect("/");
  }
}

console.log("Exporting functions:", Object.keys(module.exports));

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccountManagement,
  buildUpdateAccount,    // ← Should be here
  updateAccount,        // ← MUST be here
  changePassword,       // ← And this
  accountLogout               // ← And this
};