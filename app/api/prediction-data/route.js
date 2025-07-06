import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET() {
  const predictionDbPath = 'C:/Users/sayav/OneDrive/Documents/PlatformIO/Projects/LettuceLSTM_RTOS/prediction_data.db';

  try {
    const db = await open({
      filename: predictionDbPath,
      driver: sqlite3.Database,
    });

    const rows = await db.all(`
      SELECT 
        batch_start,
        stage_name,
        stage_date,
        yield_predicted,
        status,
        notes
      FROM forecast_batches
      ORDER BY DATE(stage_date) ASC
    `);

    const forecasts = rows.map(row => ({
      batch_start: row.batch_start,
      stage_name: row.stage_name,
      stage_date: row.stage_date,
      yield_predicted: row.yield_predicted,
      status: row.status || 'normal',
      notes: row.notes || '',
      yield_date: row.stage_date, // Optional: consider removing if redundant
    }));

    await db.close(); // ✅ Clean up

    return new Response(JSON.stringify(forecasts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Prediction API error:', error.stack);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
