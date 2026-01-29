// controllers/invController.js
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  
  if (data.length === 0) {
    // Handle case where no vehicles exist for this classification
    const nav = await utilities.getNav();
    return res.render("errors/not-found", { 
      title: "No Vehicles Found", 
      nav,
      message: "Sorry, no vehicles match this classification." 
    });
  }

  const grid = await utilities.buildClassificationGrid(data);
  const nav = await utilities.getNav();
  const className = data[0].classification_name;

  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildDetail = async function (req, res, next) {
  const inv_id = req.params.invId;
  const vehicle = await invModel.getInventoryById(inv_id);

  if (!vehicle) {
    return res.status(404).render("errors/error", {
      title: "Vehicle Not Found",
      message: "The requested vehicle could not be found.",
      nav: await utilities.getNav()
    });
  }

  const grid = await utilities.buildDetailGrid(vehicle);
  const nav = await utilities.getNav();
  const title = `${vehicle.inv_make} ${vehicle.inv_model}`;

  res.render("inventory/detail", {
    title,
    nav,
    grid,
    vehicle // pass full object for flexibility
  });
};

/* ***************************
 *  Deliver management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null
  });
};

/* ***************************
 *  Deliver add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  });
};

/* ***************************
 *  Process classification addition
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;
  const nav = await utilities.getNav();

   const result = await invModel.addClassification(classification_name);
  if (result.rows && result.rows.length > 0) {
    req.flash("notice", `New classification "${classification_name}" added successfully!`);
    res.redirect("/inv"); // Redirect to management
  } else {
    req.flash("error", "Failed to add classification. " + (result || ""));
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null
    });
  }
};

/* ***************************
 *  Deliver add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null
  });
};

/* ***************************
 *  Process inventory addition
 * ************************** */
invCont.addInventoryItem = async function (req, res, next) {
  const {
  inv_make, inv_model, inv_year, inv_description, 
  inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
} = req.body;

const result = await invModel.addInventoryItem(
  inv_make, inv_model, inv_year, inv_description,
  inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
);

  if (result.rows && result.rows.length > 0) {
    req.flash("notice", `${inv_make} ${inv_model} added to inventory!`);
    res.redirect("/inv");
  } else {
    req.flash("error", "Failed to add vehicle. " + (result || ""));
    const classificationList = await utilities.buildClassificationList(classification_id);
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      ...req.body
    });
  }
};

module.exports = invCont;