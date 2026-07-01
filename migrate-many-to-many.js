import Database from './server/db.js';

const db = new Database();
db.init();

console.log('🔄 Migrating to Many-to-Many Wrestler-Show Relationship\n');

// Step 1: Create junction table
console.log('Step 1: Creating wrestler_shows junction table...');
try {
  db.db.exec(`
    CREATE TABLE IF NOT EXISTS wrestler_shows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wrestlerId INTEGER NOT NULL,
      showName TEXT NOT NULL,
      isPrimary INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (wrestlerId) REFERENCES wrestlers(id) ON DELETE CASCADE,
      FOREIGN KEY (showName) REFERENCES shows(name) ON DELETE CASCADE,
      UNIQUE(wrestlerId, showName)
    )
  `);
  console.log('✅ Junction table created\n');
} catch (err) {
  console.log('⚠️  Junction table already exists\n');
}

// Step 2: Get all wrestlers and identify duplicates
console.log('Step 2: Analyzing current roster...');
const wrestlers = db.getAllWrestlers();
const wrestlerMap = new Map();

wrestlers.forEach(w => {
  const key = w.name.toLowerCase().trim();
  if (!wrestlerMap.has(key)) {
    wrestlerMap.set(key, []);
  }
  wrestlerMap.get(key).push(w);
});

const duplicates = [];
const unique = [];

wrestlerMap.forEach((records, name) => {
  if (records.length > 1) {
    duplicates.push({ name, records });
  } else {
    unique.push(records[0]);
  }
});

console.log(`   Found ${unique.length} unique wrestlers`);
console.log(`   Found ${duplicates.length} wrestlers with duplicates\n`);

// Step 3: Migrate data - deduplicate and create junction records
console.log('Step 3: Deduplicating and creating many-to-many relationships...\n');

let keptRecords = 0;
let deletedRecords = 0;
let junctionRecords = 0;

// Process unique wrestlers (no duplicates)
unique.forEach(w => {
  try {
    db.db.prepare('INSERT OR IGNORE INTO wrestler_shows (wrestlerId, showName, isPrimary) VALUES (?, ?, 1)')
      .run(w.id, w.show);
    junctionRecords++;
  } catch (err) {
    console.log(`⚠️  Error adding junction for ${w.name}: ${err.message}`);
  }
});

// Process duplicates - keep the most complete record
duplicates.forEach(({ name, records }) => {
  // Sort by: 1) has team info, 2) has gender, 3) has overall, 4) lowest ID (original)
  records.sort((a, b) => {
    const aScore = (a.titles ? 100 : 0) + (a.gender ? 10 : 0) + (a.overall ? 1 : 0);
    const bScore = (b.titles ? 100 : 0) + (b.gender ? 10 : 0) + (b.overall ? 1 : 0);
    if (aScore !== bScore) return bScore - aScore; // Higher score first
    return a.id - b.id; // Lower ID first (original)
  });

  const primary = records[0];
  const duplicateRecords = records.slice(1);

  console.log(`   ${name}:`);
  console.log(`      ✅ Keeping ID ${primary.id} (${primary.show}${primary.titles ? ' - has team' : ''})`);

  // Create junction records for all shows
  records.forEach((w, idx) => {
    try {
      db.db.prepare('INSERT OR IGNORE INTO wrestler_shows (wrestlerId, showName, isPrimary) VALUES (?, ?, ?)')
        .run(primary.id, w.show, idx === 0 ? 1 : 0);
      junctionRecords++;
    } catch (err) {
      console.log(`      ⚠️  Error adding junction: ${err.message}`);
    }
  });

  // Delete duplicate records
  duplicateRecords.forEach(dup => {
    console.log(`      🗑️  Deleting duplicate ID ${dup.id} (${dup.show})`);
    try {
      db.db.prepare('DELETE FROM wrestlers WHERE id = ?').run(dup.id);
      deletedRecords++;
    } catch (err) {
      console.log(`      ⚠️  Error deleting: ${err.message}`);
    }
  });

  keptRecords++;
});

console.log(`\n✅ Migration Summary:`);
console.log(`   Total unique wrestlers: ${unique.length + keptRecords}`);
console.log(`   Duplicate records deleted: ${deletedRecords}`);
console.log(`   Junction records created: ${junctionRecords}`);

// Step 4: Verify migration
console.log(`\n🔍 Verification:`);
const remainingWrestlers = db.getAllWrestlers();
const remainingMap = new Map();
remainingWrestlers.forEach(w => {
  const key = w.name.toLowerCase().trim();
  remainingMap.set(key, (remainingMap.get(key) || 0) + 1);
});

const stillDuplicated = Array.from(remainingMap.entries()).filter(([_, count]) => count > 1);
if (stillDuplicated.length > 0) {
  console.log(`   ⚠️  Still have ${stillDuplicated.length} duplicated wrestlers:`);
  stillDuplicated.forEach(([name, count]) => console.log(`      - ${name}: ${count} records`));
} else {
  console.log(`   ✅ No duplicates remaining!`);
}

const junctionCount = db.db.prepare('SELECT COUNT(*) as count FROM wrestler_shows').get().count;
console.log(`   ✅ Total wrestler-show relationships: ${junctionCount}`);

console.log('\n✨ Migration complete!');
console.log('\n⚠️  NEXT STEPS:');
console.log('   1. Update db.js to use junction table queries');
console.log('   2. Update API endpoints to handle multiple shows per wrestler');
console.log('   3. Update frontend to display multiple show badges per wrestler');
console.log('   4. Test thoroughly before removing the show column from wrestlers table\n');

db.close();
