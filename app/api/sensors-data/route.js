import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET() {
  const sensorDbPath = 'C:/Users/sayav/OneDrive/Documents/PlatformIO/Projects/LettuceLSTM_RTOS/hydroponic_growth_data.db';

  try {
    const db = await open({
      filename: sensorDbPath,
      driver: sqlite3.Database,
    });

    // Fetch all readings from May 31 onward
    const startDate = new Date('2025-05-31T00:00:00Z'); // Change this as needed
    const manilaOffset = 8 * 60 * 60 * 1000; // UTC+8 in milliseconds

    const formatDateForSQL = (date) => {
      return new Date(date.getTime())
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
    };

    const readings = await db.all(`
      SELECT * FROM lettuce_wavelet
      WHERE timestamp >= ?
      ORDER BY timestamp ASC
    `, [formatDateForSQL(startDate)]);

    await db.close();

    const readingsWithManilaTime = readings.map(reading => ({
      ...reading,
      manilaTimestamp: new Date(new Date(reading.timestamp).getTime() + manilaOffset).toISOString()
    }));

    return new Response(JSON.stringify(readingsWithManilaTime), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      },
    });

  } catch (error) {
    console.error('Sensor API error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
