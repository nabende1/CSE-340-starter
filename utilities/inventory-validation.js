// utilities/inventory-validation.js
const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");

const validate = {};

/* **********************************
 *  Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Classification name must contain only letters and numbers (no spaces or special characters).")
      .custom(async (classification_name) => {
         const exists = await invModel.checkClassificationExists(classification_name);
        if (exists) {
          throw new Error("Classification already exists.");
        }
      })
  ];
};

/* **********************************
 *  Inventory Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [
    body("inv_make").trim().escape().notEmpty(),
    body("inv_model").trim().escape().notEmpty(),
    body("inv_year").trim().escape().notEmpty().isLength({ min: 4, max: 4 }),
    body("inv_description").trim().escape().notEmpty(),
    body("inv_image").trim().escape().notEmpty(),
    body("inv_thumbnail").trim().escape().notEmpty(),
    body("inv_price").trim().escape().notEmpty().isNumeric(),
    body("inv_miles").trim().escape().notEmpty().isNumeric(),
    body("inv_color").trim().escape().notEmpty(),
    body("classification_id").trim().escape().notEmpty().isNumeric()
  ];
};

/* ****************************** 
 * Check classification data
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav();
    return res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name: req.body.classification_name
    });
  }
  next();
};

/* ****************************** 
 * Check inventory data
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav();
    const classificationList = await require("./index").buildClassificationList(req.body.classification_id);
    return res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationList,
      // Stickiness for all fields
      ...req.body
    });
  }
  next();
};

module.exports = validate;