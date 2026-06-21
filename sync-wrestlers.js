import Database from 'better-sqlite3';

const db = new Database('./data/wwe-universe.db');

console.log('=== Syncing wrestler_shows junction table ===\n');

// Find all wrestlers with a show but missing from wrestler_shows
const missingSync = db.prepare(`
  SELECT w.id, w.name, w.show
  FROM wrestlers w
  WHERE w.show IS NOT NULL AND w.show != ''
  AND NOT EXISTS (
    SELECT 1 FROM wrestler_shows ws 
    WHERE ws.wrestlerId = w.id AND ws.showName = w.show
  )
`).all();

console.log(`Found ${missingSync.length} wrestlers missing from junction table`);

if (missingSync.length > 0) {
  const insertStmt = db.prepare(
    'INSERT OR IGNORE INTO wrestler_shows (wrestlerId, showName, isPrimary) VALUES (?, ?, 1)'
  );
  
  let synced = 0;
  missingSync.forEach(w => {
    try {
      insertStmt.run(w.id, w.show);
      console.log(`✓ Synced: ${w.name} -> ${w.show}`);
      synced++;
    } catch (e) {
      console.error(`✗ Error syncing ${w.name}:`, e.message);
    }
  });
  
  console.log(`\n✅ Synced ${synced} wrestlers`);
}

// Verify AAA count after sync
console.log('\n=== AAA Female Wrestlers After Sync ===');
const aaaFemales = db.prepare(`
  SELECT w.id, w.name, w.gender
  FROM wrestlers w 
  INNER JOIN wrestler_shows ws ON w.id = ws.wrestlerId 
  WHERE ws.showName = 'AAA' AND w.gender = 'Female'
  ORDER BY w.name
`).all();
console.log('Count:', aaaFemales.length);
aaaFemales.forEach(w => console.log(`  ${w.name}`));

db.close();
