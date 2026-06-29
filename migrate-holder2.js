import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');

// Get all .db files in data directory
const dbFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.db'));

console.log(`Found ${dbFiles.length} database files to migrate...\n`);

dbFiles.forEach(file => {
  const dbPath = path.join(dataDir, file);
  console.log(`Migrating ${file}...`);
  
  try {
    const db = new Database(dbPath);
    
    // Check if holder2 column exists
    const cols = db.prepare('PRAGMA table_info(championships)').all();
    const hasHolder2 = cols.find(c => c.name === 'holder2');
    
    if (!hasHolder2) {
      db.exec('ALTER TABLE championships ADD COLUMN holder2 TEXT');
      console.log(`  ✅ Added holder2 column`);
    } else {
      console.log(`  ℹ️  holder2 column already exists`);
    }
    
    db.close();
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
  }
});

console.log('\n✅ Migration complete!');
