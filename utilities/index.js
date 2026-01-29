// utilities/index.js
const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    let data = await invModel.getClassifications();
    
    // Safely handle null/empty/undefined
    if (!data || !Array.isArray(data.rows)) {
      console.warn("No classifications returned from DB");
      return '<ul><li><a href="/">Home</a></li></ul>';
    }

    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => {
      list += `<li><a href="/inv/type/${row.classification_id}" title="See ${row.classification_name} vehicles">${row.classification_name}</a></li>`;
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("getNav error:", error);
    return '<ul><li><a href="/">Home</a></li><li class="error">Navigation Unavailable</li></ul>';
  }
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      grid += '<li>';
      grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`;
      grid += `<img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />`;
      grid += '</a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += `<h2><a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`;
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`;
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
* Build the vehicle detail HTML
* ************************************ */
Util.buildDetailGrid = async function(vehicle) {
  const formatPrice = (price) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  
  const formatMileage = (mileage) => 
    new Intl.NumberFormat('en-US').format(mileage);

  let html = `
    <div class="detail-container">
      <div class="detail-image">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
      </div>
      <div class="detail-info">
        <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
        <p class="subtitle">${vehicle.classification_name} • ${vehicle.inv_year}</p>

        <div class="spec-grid">
          <div class="spec-item">
            <span class="label">Price:</span>
            <span class="value">${formatPrice(vehicle.inv_price)}</span>
          </div>
          <div class="spec-item">
            <span class="label">Mileage:</span>
            <span class="value">${formatMileage(vehicle.inv_miles)} miles</span>
          </div>
          <div class="spec-item">
            <span class="label">VIN:</span>
            <span class="value">${vehicle.inv_vin}</span>
          </div>
          <div class="spec-item">
            <span class="label">Color:</span>
            <span class="value">${vehicle.inv_color}</span>
          </div>
          <div class="spec-item">
            <span class="label">Transmission:</span>
            <span class="value">${vehicle.inv_transmission}</span>
          </div>
          <div class="spec-item">
            <span class="label">Fuel Type:</span>
            <span class="value">${vehicle.invFuelType}</span>
          </div>
          <div class="spec-item">
            <span class="label">Drive Type:</span>
            <span class="value">${vehicle.inv_drive}</span>
          </div>
          <div class="spec-item">
            <span class="label">MPG:</span>
            <span class="value">${vehicle.inv_mpg_city}/${vehicle.inv_mpg_highway} (City/Hwy)</span>
          </div>
        </div>

        <div class="description">
          <h3>Description</h3>
          <p>${vehicle.inv_description}</p>
        </div>

        <div class="cta-buttons">
          <a href="#" class="btn primary">START MY PURCHASE</a>
          <a href="#" class="btn secondary">CONTACT US</a>
          <a href="#" class="btn outline">SCHEDULE TEST DRIVE</a>
          <a href="#" class="btn outline">APPLY FOR FINANCING</a>
        </div>
      </div>
    </div>
  `;
  return html;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;