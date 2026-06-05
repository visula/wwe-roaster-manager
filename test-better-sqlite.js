import Database from 'better-sqlite3';
import fs from 'fs';

const dbPath = './data/test.db';

// Remove if exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

console.log('Creating database...');
const db = new Database(dbPath);

console.log('Creating table...');
db.exec(`
  CREATE TABLE test (
    id INTEGER PRIMARY KEY,
    name TEXT
  )
`);

console.log('Inserting data...');
const insert = db.prepare('INSERT INTO test (name) VALUES (?)');
insert.run('Alice');
insert.run('Bob');

console.log('Reading data...');
const select = db.prepare('SELECT * FROM test');
const rows = select.all();
console.log(`Found ${rows.length} rows:`);
rows.forEach(r => console.log(`  ${r.id}: ${r.name}`));

console.log('Closing database...');
db.close();

console.log('Checking file size...');
const stats = fs.statSync(dbPath);
console.log(`File size: ${stats.size} bytes`);

process.exit(0);
