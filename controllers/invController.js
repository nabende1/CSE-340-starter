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

module.exports = invCont;