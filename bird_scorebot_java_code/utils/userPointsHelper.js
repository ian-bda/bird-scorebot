// utils/userPointsHelper.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/user_points.db');
const db = new Database(dbPath);

// Initialize table if it doesn't exist
function initDB() {
  console.log('Initializing database at:', dbPath);
  try {
    db.prepare(`CREATE TABLE IF NOT EXISTS user_points (
      user_id TEXT PRIMARY KEY,
      total INTEGER NOT NULL,
      birds TEXT NOT NULL -- JSON array of bird names
    )`).run();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDB();

function getAllUserPoints() {
  console.log('Getting all user points...');
  try {
    const rows = db.prepare('SELECT * FROM user_points').all();
    console.log('Found rows:', rows.length);
    const result = {};
    for (const row of rows) {
      result[row.user_id] = {
        total: row.total,
        birds: JSON.parse(row.birds)
      };
    }
    console.log('Returning result:', result);
    return result;
  } catch (error) {
    console.error('Error getting user points:', error);
    return {};
  }
}

function getUserPoints(userId) {
  const row = db.prepare('SELECT * FROM user_points WHERE user_id = ?').get(userId);
  if (!row) return { total: 0, birds: [] };
  return { total: row.total, birds: JSON.parse(row.birds) };
}

function setUserPoints(userId, total, birds) {
  console.log(`Setting points for user ${userId}: total=${total}, birds=${JSON.stringify(birds)}`);
  try {
    db.prepare(`INSERT INTO user_points (user_id, total, birds) VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET total=excluded.total, birds=excluded.birds`
    ).run(userId, total, JSON.stringify(birds));
    console.log(`Successfully set points for user ${userId}`);
  } catch (error) {
    console.error('Error setting user points:', error);
    throw error;
  }
}

function removeUserPoints(userId) {
  db.prepare('DELETE FROM user_points WHERE user_id = ?').run(userId);
}

function resetAllUserPoints() {
  db.prepare('DELETE FROM user_points').run();
}

module.exports = {
  getAllUserPoints,
  getUserPoints,
  setUserPoints,
  removeUserPoints,
  resetAllUserPoints
};
