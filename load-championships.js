import DatabaseManager from './db.js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const db = new DatabaseManager();
db.init();

const dataDir = './data';

// Load championships
console.log('📥 Loading championships...');
const championshipsFile = path.join(dataDir, 'championships-import.csv');

if (fs.existsSync(championshipsFile)) {
  const content = fs.readFileSync(championshipsFile, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  });
  
  let count = 0;
  let skipped = 0;
  
  for (const record of records) {
    try {
      const name = record.name?.trim() || '';
      const show = record.show?.trim() || '';
      const holder = record.holder?.trim() || 'Vacant';
      const debutDate = record.debutDate?.trim() || new Date().toISOString();
      
      if (!name || !show) {
        skipped++;
        continue;
      }
      
      // Verify show exists
      const showExists = db.db.prepare('SELECT name FROM shows WHERE name = ?').get(show);
      if (!showExists) {
        console.log(`  ⚠️  Show "${show}" not found, skipping "${name}"`);
        skipped++;
        continue;
      }
      
      db.addChampionship(name, show, holder, debutDate, null);
      count++;
    } catch (e) {
      if (!e.message.includes('UNIQUE constraint')) {
        console.log(`  ⚠️  Error: ${e.message}`);
      }
      skipped++;
    }
  }
  console.log(`✅ Loaded ${count} championships (${skipped} skipped)`);
} else {
  console.log('❌ championships-import.csv not found');
}

// Display summary
console.log('\n📊 DATABASE SUMMARY:');
const championships = db.getAllChampionships();
console.log(`Total championships: ${championships.length}`);

console.log('\n✅ Done!');
db.close();
process.exit(0);
