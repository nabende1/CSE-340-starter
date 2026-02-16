const { body, validationResult } = require("express-validator");

const validate = {};

validate.reviewRules = () => {
  return [
    body("review_text").trim().escape().notEmpty().isLength({ min: 10 }),
    body("review_rating").isInt({ min: 1, max: 5 })
  ];
};

validate.checkReviewData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await require("./index").getNav();
    const vehicle = await require("../models/inventory-model").getInventoryById(req.body.inv_id);
    const reviews = await require("../models/reviewModel").getReviewsByInventoryId(req.body.inv_id);
    const avgRating = await require("../models/reviewModel").getAverageRating(req.body.inv_id);
    
    return res.render("reviews/reviews", {
      errors,
      title: `Reviews for ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
      reviews: reviews.rows || [],
      avgRating: avgRating.rows[0],
      loggedin: res.locals.loggedin,
      accountData: res.locals.accountData
    });
  }
  next();
};

module.exports = validate;