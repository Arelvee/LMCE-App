// /app/api/sensor-data/route.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET() {
  const sensorDbPath = 'C:/Users/sayav/OneDrive/Documents/PlatformIO/Projects/LettuceLSTM_RTOS/lettuce_data.db';

  try {
    const db = await open({
      filename: sensorDbPath,
      driver: sqlite3.Database,
    });

    const readings = await db.all(`
      SELECT * FROM lettuce_wavelet
      ORDER BY timestamp DESC
      LIMIT 50
    `);

    await db.close();

    return new Response(JSON.stringify(readings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sensor API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
