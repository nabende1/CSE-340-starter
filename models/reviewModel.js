const pool = require("../database/");

/* ***************************
 *  Get reviews by inventory ID
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT 
        r.review_id,
        r.review_text,
        r.review_rating,
        r.review_date,
        a.account_firstname,
        a.account_lastname,
        a.account_id
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    console.error("getReviewsByInventoryId error:", error);
    return [];
  }
}

/* ***************************
 *  Get average rating for vehicle
 * ************************** */
async function getAverageRating(inv_id) {
  try {
    const sql = `
      SELECT 
        COALESCE(AVG(review_rating)::numeric(10,1), 0) as average_rating,
        COUNT(*) as total_reviews
      FROM review 
      WHERE inv_id = $1
    `;
    const result = await pool.query(sql, [inv_id]);
    return {
      average_rating: parseFloat(result.rows[0].average_rating) || 0,
      total_reviews: parseInt(result.rows[0].total_reviews) || 0
    };
  } catch (error) {
    console.error("getAverageRating error:", error);
    return { average_rating: 0, total_reviews: 0 };
  }
}

/* ***************************
 *  Add new review
 * ************************** */
async function addReview(inv_id, account_id, review_text, review_rating) {
  try {
    const sql = `
      INSERT INTO review (inv_id, account_id, review_text, review_rating)
      VALUES ($1, $2, $3, $4)
      RETURNING review_id
    `;
    const result = await pool.query(sql, [inv_id, account_id, review_text, review_rating]);
    return result.rows[0];
  } catch (error) {
    console.error("addReview error:", error);
    throw error;
  }
}

/* ***************************
 *  Check if user has already reviewed this vehicle
 * ************************** */
async function hasUserReviewed(inv_id, account_id) {
  try {
    const sql = `
      SELECT COUNT(*) as count 
      FROM review 
      WHERE inv_id = $1 AND account_id = $2
    `;
    const result = await pool.query(sql, [inv_id, account_id]);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error("hasUserReviewed error:", error);
    return false;
  }
}

module.exports = {
  getReviewsByInventoryId,
  getAverageRating,
  addReview,
  hasUserReviewed
};