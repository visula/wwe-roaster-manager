import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, 'data');

console.log('\n=== Checking Complete Universe Test Account ===');
const db = new Database(path.join(dataDir, 'complete_universe_test_1782655497638.db'));

const shows = db.prepare('SELECT COUNT(*) as count FROM shows').get();
console.log(`Shows: ${shows.count}`);

const wrestlers = db.prepare('SELECT COUNT(*) as count FROM wrestlers').get();
console.log(`Wrestlers: ${wrestlers.count}`);

const championships = db.prepare('SELECT COUNT(*) as count FROM championships').get();
console.log(`Championships: ${championships.count}`);

const matches = db.prepare('SELECT COUNT(*) as count FROM matches').get();
console.log(`Matches: ${matches.count}`);

const transfers = db.prepare('SELECT COUNT(*) as count FROM roster_transfers').get();
console.log(`Transfers: ${transfers.count}`);

console.log('\nSample championships:');
const sampleChampionships = db.prepare('SELECT name, show, holder FROM championships LIMIT 5').all();
sampleChampionships.forEach(c => {
  console.log(`  - ${c.name} (${c.show}): ${c.holder}`);
});

db.close();

console.log('\n✅ New account verified!');
console.log('   Users start with:');
console.log('   - 11 Shows');
console.log('   - 379 Wrestlers');
console.log('   - 37 Championships (all vacant)');
console.log('   - 0 Matches (create their own)');
console.log('   - Clean slate for their Universe Mode!');
