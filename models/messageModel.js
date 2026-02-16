// models/messageModel.js
const pool = require("../database/");

async function addMessage(name, email, subject, body) {
  try {
    const sql = `
      INSERT INTO messages (message_name, message_email, message_subject, message_body)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    return await pool.query(sql, [name, email, subject, body]);
  } catch (error) {
    return error.message;
  }
}

async function getMessages() {
  try {
    const sql = "SELECT * FROM messages ORDER BY message_date DESC";
    return await pool.query(sql);
  } catch (error) {
    return error.message;
  }
}

module.exports = { addMessage, getMessages };