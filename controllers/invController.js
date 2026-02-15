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
  const classificationSelect = await utilities.buildClassificationList(); // 👈 ADD THIS
  
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect, // 👈 PASS TO VIEW
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
/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  
  if (invData && invData.length > 0 && invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  
  if (!itemData) {
    req.flash("error", "Vehicle not found.");
    return res.redirect("/inv");
  }

  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  
  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  });
};
/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("error", "Sorry, the update failed.");
    res.status(500).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
};
/* ***************************
/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirm = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  
  if (!itemData) {
    req.flash("error", "Vehicle not found.");
    return res.redirect("/inv");
  }

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  
  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  });
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id);
  let nav = await utilities.getNav();

  const deleteResult = await invModel.deleteInventoryItem(inv_id);

  if (deleteResult && deleteResult.rowCount > 0) {
    req.flash("notice", "Vehicle successfully deleted.");
    res.redirect("/inv/");
  } else {
    // Rebuild confirmation view on error
    const itemData = await invModel.getInventoryById(inv_id);
    if (itemData) {
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
      req.flash("error", "Failed to delete vehicle.");
      res.status(500).render("inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price
      });
    } else {
      req.flash("error", "Vehicle not found.");
      res.redirect("/inv");
    }
  }
};

module.exports = invCont;