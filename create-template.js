import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const TEMPLATE_DB_PATH = path.join(dataDir, 'template.db');

// Create template database
const db = new Database(TEMPLATE_DB_PATH);

db.pragma('foreign_keys = ON');

// Create all tables
db.exec(`
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

// Insert default shows
const shows = [
  { name: 'RAW', abbr: 'RAW', day: 'Monday', matchLimit: 7 },
  { name: 'SmackDown', abbr: 'SMA', day: 'Friday', matchLimit: 7 },
  { name: 'NXT', abbr: 'NXT', day: 'Thursday', matchLimit: 6 },
  { name: 'TNA', abbr: 'TNA', day: 'Tuesday', matchLimit: 6 },
  { name: 'AAA', abbr: 'AAA', day: 'Wednesday', matchLimit: 5 },
  { name: 'AEW', abbr: 'AEW', day: 'Thursday', matchLimit: 7 },
  { name: 'Legends', abbr: 'LEG', day: null, matchLimit: null },
  { name: 'Ultra Legends', abbr: 'ULT', day: null, matchLimit: null },
  { name: 'Unassigned', abbr: 'UNA', day: null, matchLimit: null },
  { name: 'DLC/AAA', abbr: 'DLC', day: null, matchLimit: null },
  { name: 'Other WWE', abbr: 'OTH', day: null, matchLimit: null },
];

for (const show of shows) {
  const id = show.name.toLowerCase().replace(/\s/g, '').replace(/\//g, '');
  db.prepare(`INSERT INTO shows (id, name, abbreviation, day, matchLimit) VALUES (?, ?, ?, ?, ?)`)
    .run(id, show.name, show.abbr, show.day, show.matchLimit);
}

console.log('✅ Template database created at:', TEMPLATE_DB_PATH);
console.log('✅ Default shows inserted');

db.close();
