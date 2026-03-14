/**
 * Data Fetcher for UK Wind Power Generation (January 2024)
 * Fetches actual wind generation (FUELHH) and wind forecasts (WINDFOR) from BMRS API
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'public', 'data');

const BASE_URL = 'https://data.elexon.co.uk/bmrs/api/v1/datasets';

// January 2024 date range
const START_DATE = '2024-01-01T00:00:00Z';
const END_DATE = '2024-02-01T00:00:00Z';

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      return await resp.json();
    } catch (err) {
      console.warn(`  Attempt ${i + 1} failed: ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

async function fetchActuals() {
  console.log('📊 Fetching actual wind generation data (FUELHH)...');
  
  // Fetch in weekly chunks to avoid overwhelming the API
  const actuals = [];
  const chunkDays = 7;
  let current = new Date(START_DATE);
  const end = new Date(END_DATE);

  while (current < end) {
    const chunkEnd = new Date(Math.min(current.getTime() + chunkDays * 86400000, end.getTime()));
    const url = `${BASE_URL}/FUELHH/stream?publishDateTimeFrom=${current.toISOString()}&publishDateTimeTo=${chunkEnd.toISOString()}`;
    
    console.log(`  Fetching ${current.toISOString().slice(0, 10)} to ${chunkEnd.toISOString().slice(0, 10)}...`);
    const data = await fetchWithRetry(url);
    
    // Filter for WIND only
    const windData = data.filter(d => d.fuelType === 'WIND');
    actuals.push(...windData);
    
    current = chunkEnd;
  }

  // Transform to simpler format
  const result = actuals.map(d => ({
    startTime: d.startTime,
    generation: d.generation
  }));

  // Sort by startTime and deduplicate
  result.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const unique = [];
  const seen = new Set();
  for (const item of result) {
    if (!seen.has(item.startTime)) {
      seen.add(item.startTime);
      unique.push(item);
    }
  }

  console.log(`  ✅ Got ${unique.length} actual data points`);
  return unique;
}

async function fetchForecasts() {
  console.log('🔮 Fetching wind forecast data (WINDFOR)...');
  
  const forecasts = [];
  const chunkDays = 3; // Smaller chunks since forecast data is larger
  let current = new Date(START_DATE);
  const end = new Date(END_DATE);

  while (current < end) {
    const chunkEnd = new Date(Math.min(current.getTime() + chunkDays * 86400000, end.getTime()));
    const url = `${BASE_URL}/WINDFOR/stream?publishDateTimeFrom=${current.toISOString()}&publishDateTimeTo=${chunkEnd.toISOString()}`;
    
    console.log(`  Fetching ${current.toISOString().slice(0, 10)} to ${chunkEnd.toISOString().slice(0, 10)}...`);
    const data = await fetchWithRetry(url);
    
    // Filter: forecast horizon between 0-48 hours
    const filtered = data.filter(d => {
      const publishTime = new Date(d.publishTime);
      const startTime = new Date(d.startTime);
      const horizonHours = (startTime - publishTime) / (1000 * 60 * 60);
      return horizonHours >= 0 && horizonHours <= 48;
    });
    
    forecasts.push(...filtered);
    current = chunkEnd;
  }

  // Transform
  const result = forecasts.map(d => ({
    startTime: d.startTime,
    publishTime: d.publishTime,
    generation: d.generation
  }));

  // Sort by startTime then publishTime
  result.sort((a, b) => {
    const timeDiff = new Date(a.startTime) - new Date(b.startTime);
    if (timeDiff !== 0) return timeDiff;
    return new Date(a.publishTime) - new Date(b.publishTime);
  });

  console.log(`  ✅ Got ${result.length} forecast data points`);
  return result;
}

async function main() {
  console.log('🌬️  Wind Power Data Fetcher - January 2024\n');
  
  mkdirSync(DATA_DIR, { recursive: true });
  
  const actuals = await fetchActuals();
  writeFileSync(join(DATA_DIR, 'actuals.json'), JSON.stringify(actuals, null, 2));
  console.log(`  📁 Saved to public/data/actuals.json\n`);
  
  const forecasts = await fetchForecasts();
  writeFileSync(join(DATA_DIR, 'forecasts.json'), JSON.stringify(forecasts, null, 2));
  console.log(`  📁 Saved to public/data/forecasts.json\n`);
  
  console.log('✨ Done! Run `npm run dev` to start the app.');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
