import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const TEMPLATE_PATH = path.join(dataDir, 'template.db');
const SOURCE_PATH = path.join(dataDir, 'wwe-universe.db');

console.log('Creating template with shows, wrestlers, and championships...');

// Open source database
const sourceDb = new Database(SOURCE_PATH);

// Delete old template
const fs = await import('fs');
if (fs.existsSync(TEMPLATE_PATH)) {
  fs.unlinkSync(TEMPLATE_PATH);
  console.log('✅ Deleted old template.db');
}

// Create new template database
const templateDb = new Database(TEMPLATE_PATH);

templateDb.pragma('foreign_keys = ON');

// Create all table structures
templateDb.exec(`
  CREATE TABLE IF NOT EXISTS shows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    abbreviation TEXT NOT NULL,
    day TEXT,
    showType TEXT DEFAULT 'Weekly',
    eligibleShows TEXT,
    matchLimit INTEGER,
    nextEpisodeDate TEXT
  );

  CREATE TABLE IF NOT EXISTS wrestlers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    show TEXT,
    division TEXT DEFAULT 'Unassigned',
    status TEXT DEFAULT 'Active',
    imageUrl TEXT,
    gender TEXT,
    overall INTEGER,
    alignment TEXT,
    titles TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show TEXT NOT NULL,
    type TEXT DEFAULT 'Singles',
    participant1 TEXT NOT NULL,
    participant2 TEXT,
    participant3 TEXT,
    participant4 TEXT,
    participant5 TEXT,
    participant6 TEXT,
    participant7 TEXT,
    participant8 TEXT,
    date DATETIME NOT NULL,
    result TEXT DEFAULT 'Pending',
    winner TEXT,
    notes TEXT,
    championshipId INTEGER,
    isImportant INTEGER DEFAULT 0,
    storylineId INTEGER,
    rivalryId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS championships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    show TEXT NOT NULL,
    holder TEXT,
    debutDate DATETIME NOT NULL,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, show)
  );

  CREATE TABLE IF NOT EXISTS championship_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    championshipId INTEGER NOT NULL,
    holder TEXT NOT NULL,
    dateCaptured DATETIME NOT NULL,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS roster_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wrestlerId INTEGER NOT NULL,
    fromShow TEXT NOT NULL,
    toShow TEXT NOT NULL,
    date DATETIME NOT NULL,
    reason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS match_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matchId INTEGER NOT NULL,
    wrestler TEXT NOT NULL,
    result TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    show TEXT NOT NULL,
    date TEXT NOT NULL,
    pools TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Upcoming',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    show TEXT,
    members TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS storylines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    show TEXT,
    status TEXT DEFAULT 'Active',
    startDate TEXT,
    endDate TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS storyline_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storylineId INTEGER NOT NULL,
    wrestlerName TEXT NOT NULL,
    role TEXT,
    FOREIGN KEY (storylineId) REFERENCES storylines(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS rivalries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wrestler1 TEXT NOT NULL,
    wrestler2 TEXT NOT NULL,
    show TEXT,
    status TEXT DEFAULT 'Active',
    startDate TEXT,
    endDate TEXT,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Created table structures');

// Copy shows from source
const shows = sourceDb.prepare('SELECT * FROM shows').all();
const insertShow = templateDb.prepare('INSERT INTO shows (id, name, abbreviation, day, showType, eligibleShows, matchLimit, nextEpisodeDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
for (const show of shows) {
  insertShow.run(show.id, show.name, show.abbreviation, show.day, show.showType, show.eligibleShows, show.matchLimit, show.nextEpisodeDate);
}
console.log(`✅ Copied ${shows.length} shows`);

// Copy wrestlers from source
const wrestlers = sourceDb.prepare('SELECT * FROM wrestlers').all();
const insertWrestler = templateDb.prepare('INSERT INTO wrestlers (id, name, show, division, status, imageUrl, gender, overall, alignment, titles, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
for (const wrestler of wrestlers) {
  insertWrestler.run(wrestler.id, wrestler.name, wrestler.show, wrestler.division, wrestler.status, wrestler.imageUrl, wrestler.gender, wrestler.overall, wrestler.alignment, wrestler.titles, wrestler.createdAt);
}
console.log(`✅ Copied ${wrestlers.length} wrestlers`);

// Copy championships from source (set holder to 'Vacant' for new accounts)
const championships = sourceDb.prepare('SELECT * FROM championships').all();
const insertChampionship = templateDb.prepare('INSERT INTO championships (id, name, show, holder, debutDate, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
for (const championship of championships) {
  // Set holder to 'Vacant' for fresh accounts
  insertChampionship.run(championship.id, championship.name, championship.show, 'Vacant', championship.debutDate, championship.notes, championship.createdAt);
}
console.log(`✅ Copied ${championships.length} championships (all set to Vacant)`);

// DO NOT copy: matches, championship_history, transfers, storylines, rivalries, events, teams

sourceDb.close();
templateDb.close();

console.log('\n✅ Template database created successfully!');
console.log('   - Shows: Included (11)');
console.log('   - Wrestlers: Included (379)');
console.log('   - Championships: Included (all vacant)');
console.log('   - Matches: Empty (users create their own)');
console.log('   - Championship History: Empty');
console.log('   - Transfers: Empty');
console.log('   - Storylines: Empty');
console.log('   - Other data: Empty');
