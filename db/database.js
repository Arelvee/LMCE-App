// db/database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';

// Get absolute path to database
const dbPath = path.resolve(process.cwd(), 'db/users.db');

// Initialize database
export async function initDB() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Create users table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        profilePic TEXT DEFAULT '/profilepic.jpg',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Create user - FIXED SYNTAX
export async function createUser(userData) {
  let db;
  try {
    db = await initDB();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await db.run(
      `INSERT INTO users (email, username, password, firstName, lastName) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        userData.email, 
        userData.username, 
        hashedPassword, 
        userData.firstName, 
        userData.lastName
      ]
    );
    
    return result.lastID;
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle unique constraint errors
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Username or email already exists');
    }
    
    throw new Error('Failed to create user');
  } finally {
    if (db) await db.close();
  }
}

// Find user by username
export async function findUserByUsername(username) {
  let db;
  try {
    db = await initDB();
    const user = await db.get('SELECT * FROM users WHERE username = ?', username);
    return user;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  } finally {
    if (db) await db.close();
  }
}

// Verify user credentials
export async function verifyUser(username, password) {
  try {
    const user = await findUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  } catch (error) {
    console.error('Error verifying user:', error);
    return null;
  }
}

// Find user by ID
export async function findUserById(userId) {
  let db;
  try {
    db = await initDB();
    const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
    return user;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  } finally {
    if (db) await db.close();
  }
}

// Update user password
export async function updateUserPassword(userId, newPassword) {
  let db;
  try {
    db = await initDB();
    await db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, userId]
    );
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  } finally {
    if (db) await db.close();
  }
}

// Verify user by ID (for password change)
export async function verifyUserById(userId, password) {
  const user = await findUserById(userId);
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  return isValid;
}