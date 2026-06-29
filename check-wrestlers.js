import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, 'data');

console.log('\n=== Checking wwe-universe.db ===');
const oldDb = new Database(path.join(dataDir, 'wwe-universe.db'));
const wrestlers = oldDb.prepare('SELECT COUNT(*) as count FROM wrestlers').get();
console.log(`Wrestlers in wwe-universe.db: ${wrestlers.count}`);
if (wrestlers.count > 0) {
  const sample = oldDb.prepare('SELECT * FROM wrestlers LIMIT 5').all();
  console.log('Sample wrestlers:', sample);
}
oldDb.close();

console.log('\n=== Checking default.db ===');
const defaultDb = new Database(path.join(dataDir, 'default.db'));
const defaultWrestlers = defaultDb.prepare('SELECT COUNT(*) as count FROM wrestlers').get();
console.log(`Wrestlers in default.db: ${defaultWrestlers.count}`);
if (defaultWrestlers.count > 0) {
  const sample = defaultDb.prepare('SELECT * FROM wrestlers LIMIT 5').all();
  console.log('Sample wrestlers:', sample);
}
defaultDb.close();

console.log('\n=== Checking template.db ===');
const templateDb = new Database(path.join(dataDir, 'template.db'));
const templateWrestlers = templateDb.prepare('SELECT COUNT(*) as count FROM wrestlers').get();
console.log(`Wrestlers in template.db: ${templateWrestlers.count}`);
if (templateWrestlers.count > 0) {
  const sample = templateDb.prepare('SELECT * FROM wrestlers LIMIT 5').all();
  console.log('Sample wrestlers:', sample);
}
templateDb.close();
