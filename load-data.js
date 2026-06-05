import DatabaseManager from './db.js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const db = new DatabaseManager();
db.init();

const dataDir = './data';

// Register all shows (with proper casing)
console.log('📥 Registering shows...');
const allShows = new Map([
  ['RAW', 'RAW'],
  ['SmackDown', 'SmackDown'],
  ['NXT', 'NXT'],
  ['Legends', 'Legends'],
  ['DLC/AAA', 'DLC/AAA'],
  ['Other WWE', 'Other WWE'],
  ['TNA', 'TNA'],
  ['AAA', 'AAA'],
  ['AEW', 'AEW']
]);

for (const [id, name] of allShows) {
  try {
    db.db.prepare(`INSERT INTO shows (id, name, abbreviation) VALUES (?, ?, ?)`).run(
      id.toLowerCase().replace(/\s/g, '').replace(/\//g, ''),
      name,
      name.substring(0, 3).toUpperCase()
    );
    console.log(`  ✓ Registered: ${name}`);
  } catch (e) {
    // Show might already exist, ignore
  }
}

// Load wrestlers with proper show normalization
console.log('📥 Loading wrestlers...');
const wrestlersFile = path.join(dataDir, 'wrestlers-import.csv');
if (fs.existsSync(wrestlersFile)) {
  const content = fs.readFileSync(wrestlersFile, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  });
  
  let count = 0;
  let skipped = 0;
  
  for (const record of records) {
    try {
      // Normalize show name from CSV
      let showName = record.show?.trim() || 'Legends';
      
      // Verify show exists in database
      const showExists = db.db.prepare('SELECT name FROM shows WHERE name = ?').get(showName);
      if (!showExists) {
        console.log(`  ⚠️  Show "${showName}" not found, skipping wrestler "${record.name}"`);
        skipped++;
        continue;
      }
      
      db.addWrestler(
        record.name.trim(),
        showName,
        record.division?.trim() || 'Unassigned',
        record.status?.trim() || 'Active',
        null
      );
      count++;
    } catch (e) {
      console.log(`  ⚠️  Error: ${record.name} - ${e.message}`);
      skipped++;
    }
  }
  console.log(`✅ Loaded ${count} wrestlers (${skipped} skipped)`);
} else {
  console.log('❌ wrestlers-import.csv not found');
}

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
      const showName = record.show?.trim() || 'RAW';
      
      // Verify show exists
      const showExists = db.db.prepare('SELECT name FROM shows WHERE name = ?').get(showName);
      if (!showExists) {
        skipped++;
        continue;
      }
      
      db.addChampionship(
        record.name?.trim() || '',
        showName,
        record.holder?.trim() || 'Vacant',
        record.debutDate?.trim() || new Date().toISOString(),
        null
      );
      count++;
    } catch (e) {
      if (!e.message.includes('UNIQUE constraint failed')) {
        skipped++;
      }
    }
  }
  console.log(`✅ Loaded ${count} championships (${skipped} skipped)`);
} else {
  console.log('❌ championships-import.csv not found');
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

const championships = db.getAllChampionships();
console.log(`\nTotal championships: ${championships.length}`);

const shows = db.getAllShows();
console.log(`\nRegistered shows:`);
for (const show of shows) {
  console.log(`  • ${show.name}`);
}

console.log('\n✅ Data loading complete!');
db.close();
process.exit(0);
