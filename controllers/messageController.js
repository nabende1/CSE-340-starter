// controllers/messageController.js
const messageModel = require("../models/messageModel");
const utilities = require("../utilities/");

const messageCont = {};

// Display contact form
messageCont.buildContact = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("contact/contact", {
    title: "Contact Us",
    nav,
    errors: null
  });
};

// Process contact form
messageCont.submitMessage = async function (req, res, next) {
  const { message_name, message_email, message_subject, message_body } = req.body;
  
  // Basic validation
  if (!message_name || !message_email || !message_subject || !message_body) {
    req.flash("error", "All fields are required.");
    return res.redirect("/contact");
  }

  const result = await messageModel.addMessage(message_name, message_email, message_subject, message_body);
  
  if (result.rows && result.rows.length > 0) {
    req.flash("notice", "Thank you! We'll respond soon.");
  } else {
    req.flash("error", "Failed to send message. Please try again.");
  }
  
  res.redirect("/contact");
};

// View messages (Admin/Employee only)
messageCont.viewMessages = async function (req, res, next) {
  const nav = await utilities.getNav();
  const messages = await messageModel.getMessages();
  
  res.render("contact/messages", {
  title: "Customer Messages",
  nav,
  customerMessages: messages.rows || [], // ✅ NEW NAME
  errors: null
});
};

module.exports = messageCont;