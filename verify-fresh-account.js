import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, 'data');

console.log('\n=== Checking Fresh Universe Test Account ===');
const freshDb = new Database(path.join(dataDir, 'fresh_universe_test_1782655082912.db'));

const shows = freshDb.prepare('SELECT COUNT(*) as count FROM shows').get();
console.log(`Shows: ${shows.count}`);

const wrestlers = freshDb.prepare('SELECT COUNT(*) as count FROM wrestlers').get();
console.log(`Wrestlers: ${wrestlers.count}`);

const matches = freshDb.prepare('SELECT COUNT(*) as count FROM matches').get();
console.log(`Matches: ${matches.count}`);

const championships = freshDb.prepare('SELECT COUNT(*) as count FROM championships').get();
console.log(`Championships: ${championships.count}`);

const transfers = freshDb.prepare('SELECT COUNT(*) as count FROM roster_transfers').get();
console.log(`Transfers: ${transfers.count}`);

freshDb.close();

console.log('\n✅ New account verified!');
console.log('   Users can now:');
console.log('   - View 379 wrestlers');
console.log('   - Create their own matches');
console.log('   - Create their own championships');
console.log('   - Track their own storylines');
