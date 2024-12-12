const bcrypt = require("bcrypt");
const db = require("../database");

class UserModel {
  static async findByUsernameOrEmail(identifier) {
    const query = `
      SELECT * FROM users 
      WHERE username = $1 OR email = $1
    `;
    const result = await db.query(query, [identifier]);
    return result.rows[0];
  }

  static async create(username, email, password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (username, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, username, created_at
    `;
    const result = await db.query(query, [username, email, hashedPassword]);
    return result.rows[0];
  }

  static async checkExistingUser(username, email) {
    const query = `
      SELECT * FROM users 
      WHERE username = $1 OR email = $2
    `;
    const result = await db.query(query, [username, email]);
    return result.rows.length > 0;
  }

  static async findProfileById(userId) {
    const query = `
      SELECT id, username, email, created_at 
      FROM users 
      WHERE id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = UserModel;
