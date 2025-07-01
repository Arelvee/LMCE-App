// lib/initDB.js
import { initDB } from '@/db/database';

let initialized = false;

export async function initializeDatabase() {
  if (initialized) return;
  
  try {
    console.log('Initializing database...');
    const db = await initDB();
    console.log('Database initialized successfully');
    await db.close();
    initialized = true;
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}