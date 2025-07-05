import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET() {
  const predictionDbPath = 'C:/Users/sayav/OneDrive/Documents/PlatformIO/Projects/LettuceLSTM_RTOS/prediction_data.db';

  try {
    const db = await open({
      filename: predictionDbPath,
      driver: sqlite3.Database,
    });

    // Fetch all forecasts
    const rows = await db.all(`
      SELECT 
        stage_name,
        stage_date,
        yield_predicted,
        status,
        notes
      FROM forecast_batches
      ORDER BY DATE(stage_date) ASC
    `);

    // Transform rows into desired structure
    const forecasts = rows.map(row => ({
      stage_name: row.stage_name,
      stage_date: row.stage_date,
      yield_predicted: row.yield_predicted,
      yield_status: row.yield_status || 'normal',
      notes: row.notes || '',
      yield_date: row.stage_date,  // Same as stage_date for simplicity
    }));

    return new Response(JSON.stringify(forecasts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Prediction API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}