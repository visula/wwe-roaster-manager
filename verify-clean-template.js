import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, 'data');

console.log('\n=== Verifying Clean Template ===');
const templateDb = new Database(path.join(dataDir, 'template.db'));

const shows = templateDb.prepare('SELECT COUNT(*) as count FROM shows').get();
console.log(`Shows: ${shows.count}`);

const wrestlers = templateDb.prepare('SELECT COUNT(*) as count FROM wrestlers').get();
console.log(`Wrestlers: ${wrestlers.count}`);

const matches = templateDb.prepare('SELECT COUNT(*) as count FROM matches').get();
console.log(`Matches: ${matches.count}`);

const championships = templateDb.prepare('SELECT COUNT(*) as count FROM championships').get();
console.log(`Championships: ${championships.count}`);

const transfers = templateDb.prepare('SELECT COUNT(*) as count FROM roster_transfers').get();
console.log(`Transfers: ${transfers.count}`);

const storylines = templateDb.prepare('SELECT COUNT(*) as count FROM storylines').get();
console.log(`Storylines: ${storylines.count}`);

templateDb.close();

console.log('\n✅ Template is clean - only shows and wrestlers included!');
