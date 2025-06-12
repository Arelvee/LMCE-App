import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET() {
  const predictionDbPath = 'C:/Users/sayav/OneDrive/Documents/PlatformIO/Projects/LettuceLSTM_RTOS/prediction_data.db';

  // Optional: filter start date
  const today = new Date().toISOString().split('T')[0];

  try {
    const db = await open({
      filename: predictionDbPath,
      driver: sqlite3.Database,
    });

    // Fetch all forecasts ordered by date
    const rows = await db.all(`
      SELECT * FROM forecast_batches
      WHERE DATE(stage_date) >= DATE(?)
      ORDER BY DATE(stage_date) ASC
    `, [today]);

    const harvestEnd = await db.get(`
  SELECT stage_date FROM forecast_batches
  WHERE stage_name = 'Harvesting'
  ORDER BY DATE(stage_date) DESC
  LIMIT 1
`);

    // Transform rows into desired structure
    const forecasts = rows.map(row => ({
      stage_name: row.stage_name || 'Unknown', // FIX: Use actual column
      stage_date: row.stage_date,
      yield_predicted: row.yield_predicted ?? row.yield_count ?? null,
      yield_date: row.stage_date,
      prediction_date: today,
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
