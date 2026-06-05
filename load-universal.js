import DatabaseManager from './db.js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const db = new DatabaseManager();
db.init();

const dataDir = './data';

// Load wrestlers with proper show handling
console.log('📥 Loading wrestlers...');
const wrestlersFile = path.join(dataDir, 'wrestlers-universal.csv');

if (fs.existsSync(wrestlersFile)) {
  const content = fs.readFileSync(wrestlersFile, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  });
  
  let count = 0;
  let skipped = 0;
  const seenCombos = new Set();
  
  for (const record of records) {
    try {
      const name = record.name?.trim() || '';
      const show = record.show?.trim() || 'Unassigned';
      
      // Skip exact duplicates
      const combo = `${name}|${show}`;
      if (seenCombos.has(combo)) {
        continue;
      }
      seenCombos.add(combo);
      
      // Verify show exists in database
      const showExists = db.db.prepare('SELECT name FROM shows WHERE name = ?').get(show);
      if (!showExists) {
        console.log(`  ⚠️  Show "${show}" not found, skipping "${name}"`);
        skipped++;
        continue;
      }
      
      // Try to insert
      db.addWrestler(
        name,
        show,
        record.division?.trim() || 'Unassigned',
        record.status?.trim() || 'Active',
        null
      );
      count++;
    } catch (e) {
      if (!e.message.includes('UNIQUE constraint')) {
        console.log(`  ⚠️  Error loading ${record.name}: ${e.message}`);
      }
      skipped++;
    }
  }
  console.log(`✅ Loaded ${count} wrestlers (${skipped} skipped or duplicates)`);
} else {
  console.log('❌ wrestlers-universal.csv not found');
}

// Display summary
console.log('\n📊 DATABASE SUMMARY:');
const totalWrestlers = db.getTotalWrestlers();
console.log(`Total wrestlers: ${totalWrestlers}`);

const showBreakdown = db.getShowBreakdown();
console.log('\nBreakdown by show:');
for (const show of showBreakdown) {
  console.log(`  • ${show.show}: ${show.count}`);
}

const shows = db.getAllShows();
console.log(`\nRegistered shows (${shows.length}):`);
for (const show of shows) {
  console.log(`  • ${show.name}`);
}

console.log('\n✅ Data loading complete!');
db.close();
process.exit(0);
