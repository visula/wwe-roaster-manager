import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const DB_PATH = path.join(dataDir, 'wwe-universe.db');

class DatabaseManager {
  constructor() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.db = new Database(DB_PATH);
  }

  init() {
    this.db.pragma('foreign_keys = ON');

    // Migrate: add day / special show columns if they don't exist yet
    const cols = this.db.prepare(`PRAGMA table_info(shows)`).all();
    if (cols.length && !cols.find(c => c.name === 'day')) {
      this.db.exec(`ALTER TABLE shows ADD COLUMN day TEXT`);
    }
    if (cols.length && !cols.find(c => c.name === 'showType')) {
      this.db.exec(`ALTER TABLE shows ADD COLUMN showType TEXT DEFAULT 'Weekly'`);
    }
    if (cols.length && !cols.find(c => c.name === 'eligibleShows')) {
      this.db.exec(`ALTER TABLE shows ADD COLUMN eligibleShows TEXT`);
    }
    if (cols.length && !cols.find(c => c.name === 'matchLimit')) {
      this.db.exec(`ALTER TABLE shows ADD COLUMN matchLimit INTEGER`);
    }

    // Migrate: add championshipId to matches if missing
    const matchCols = this.db.prepare(`PRAGMA table_info(matches)`).all();
    if (matchCols.length && !matchCols.find(c => c.name === 'championshipId')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN championshipId INTEGER`);
    }
    if (matchCols.length && !matchCols.find(c => c.name === 'isImportant')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN isImportant INTEGER DEFAULT 0`);
    }
    if (matchCols.length && !matchCols.find(c => c.name === 'category')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN category TEXT`);
    }

    // Migrate: add new roster fields if missing
    const wrestlerCols = this.db.prepare(`PRAGMA table_info(wrestlers)`).all();
    if (wrestlerCols.length && !wrestlerCols.find(c => c.name === 'gender')) {
      this.db.exec(`ALTER TABLE wrestlers ADD COLUMN gender TEXT`);
    }
    if (wrestlerCols.length && !wrestlerCols.find(c => c.name === 'overall')) {
      this.db.exec(`ALTER TABLE wrestlers ADD COLUMN overall INTEGER`);
    }
    if (wrestlerCols.length && !wrestlerCols.find(c => c.name === 'alignment')) {
      this.db.exec(`ALTER TABLE wrestlers ADD COLUMN alignment TEXT`);
    }
    if (wrestlerCols.length && !wrestlerCols.find(c => c.name === 'titles')) {
      this.db.exec(`ALTER TABLE wrestlers ADD COLUMN titles TEXT`);
    }

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS shows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        abbreviation TEXT NOT NULL,
        day TEXT,
        showType TEXT DEFAULT 'Weekly',
        eligibleShows TEXT,
        matchLimit INTEGER
      );

      CREATE TABLE IF NOT EXISTS wrestlers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        show TEXT NOT NULL,
        division TEXT DEFAULT 'Unassigned',
        status TEXT DEFAULT 'Active',
        imageUrl TEXT,
        gender TEXT,
        overall INTEGER,
        alignment TEXT,
        titles TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (show) REFERENCES shows(name)
      );

      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        show TEXT NOT NULL,
        type TEXT DEFAULT 'Singles',
        participant1 TEXT NOT NULL,
        participant2 TEXT,
        participant3 TEXT,
        participant4 TEXT,
        date DATETIME NOT NULL,
        result TEXT DEFAULT 'Pending',
        winner TEXT,
        notes TEXT,
        championshipId INTEGER,
        isImportant INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (show) REFERENCES shows(name),
        FOREIGN KEY (championshipId) REFERENCES championships(id)
      );

      CREATE TABLE IF NOT EXISTS championships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        show TEXT NOT NULL,
        holder TEXT,
        debutDate DATETIME NOT NULL,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, show),
        FOREIGN KEY (show) REFERENCES shows(name)
      );

      CREATE TABLE IF NOT EXISTS championship_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        championshipId INTEGER NOT NULL,
        holder TEXT NOT NULL,
        dateCaptured DATETIME NOT NULL,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (championshipId) REFERENCES championships(id)
      );

      CREATE TABLE IF NOT EXISTS roster_transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wrestlerId INTEGER NOT NULL,
        fromShow TEXT NOT NULL,
        toShow TEXT NOT NULL,
        date DATETIME NOT NULL,
        reason TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wrestlerId) REFERENCES wrestlers(id),
        FOREIGN KEY (fromShow) REFERENCES shows(name),
        FOREIGN KEY (toShow) REFERENCES shows(name)
      );

      CREATE TABLE IF NOT EXISTS match_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matchId INTEGER NOT NULL,
        wrestler TEXT NOT NULL,
        result TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (matchId) REFERENCES matches(id)
      );
    `);

    const shows = [
      { name: 'RAW',          abbr: 'RAW', day: 'Monday' },
      { name: 'SmackDown',    abbr: 'SMA', day: 'Friday' },
      { name: 'NXT',          abbr: 'NXT', day: 'Thursday' },
      { name: 'TNA',          abbr: 'TNA', day: 'Tuesday' },
      { name: 'AAA',          abbr: 'AAA', day: 'Wednesday' },
      { name: 'AEW',          abbr: 'AEW', day: 'Thursday' },
      { name: 'Legends',      abbr: 'LEG', day: null },
      { name: 'Ultra Legends',abbr: 'ULT', day: null },
      { name: 'Unassigned',   abbr: 'UNA', day: null },
      { name: 'DLC/AAA',      abbr: 'DLC', day: null },
      { name: 'Other WWE',    abbr: 'OTH', day: null },
    ];
    for (const show of shows) {
      const id = show.name.toLowerCase().replace(/\s/g, '').replace(/\//g, '');
      try {
        this.db.prepare(`INSERT INTO shows (id, name, abbreviation, day) VALUES (?, ?, ?, ?)`)
          .run(id, show.name, show.abbr, show.day);
      } catch (e) {
        // Already exists — update day in case column was just added
        this.db.prepare(`UPDATE shows SET day = ? WHERE name = ?`).run(show.day, show.name);
      }
    }

    console.log('✅ Database initialized');
  }

  // ==================== SHOWS ====================
  getAllShows() {
    return this.db.prepare('SELECT * FROM shows ORDER BY name').all();
  }

  getShowByName(name) {
    return this.db.prepare('SELECT * FROM shows WHERE name = ?').get(name);
  }

  getShowById(id) {
    return this.db.prepare('SELECT * FROM shows WHERE id = ?').get(id);
  }

  getMatchesCountByShow(show, excludeMatchId = null) {
    if (excludeMatchId) {
      return this.db.prepare('SELECT COUNT(*) as count FROM matches WHERE show = ? AND id != ?').get(show, excludeMatchId).count;
    }
    return this.db.prepare('SELECT COUNT(*) as count FROM matches WHERE show = ?').get(show).count;
  }

  getWrestlerShowsByNames(names) {
    if (!names || names.length === 0) return [];
    const placeholders = names.map(() => '?').join(',');
    return this.db.prepare(`SELECT name, show FROM wrestlers WHERE name IN (${placeholders})`).all(...names);
  }

  addShow(name, abbreviation, day, showType = 'Weekly', eligibleShows = null, matchLimit = null) {
    const id = name.toLowerCase().replace(/\s/g, '').replace(/\//g, '');
    this.db.prepare(`INSERT INTO shows (id, name, abbreviation, day, showType, eligibleShows, matchLimit) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(id, name, abbreviation, day, showType, eligibleShows, matchLimit);
    return id;
  }

  updateShow(id, name, abbreviation, day, showType = 'Weekly', eligibleShows = null, matchLimit = null) {
    this.db.prepare(`UPDATE shows SET name = ?, abbreviation = ?, day = ?, showType = ?, eligibleShows = ?, matchLimit = ? WHERE id = ?`)
      .run(name, abbreviation, day, showType, eligibleShows, matchLimit, id);
  }

  deleteShow(id) {
    this.db.prepare('DELETE FROM shows WHERE id = ?').run(id);
  }

  // ==================== WRESTLERS ====================
  getAllWrestlers() {
    return this.db.prepare('SELECT * FROM wrestlers ORDER BY name').all();
  }

  getWrestlersByShow(show) {
    return this.db.prepare('SELECT * FROM wrestlers WHERE show = ? ORDER BY name').all(show);
  }

  getWrestlerById(id) {
    return this.db.prepare('SELECT * FROM wrestlers WHERE id = ?').get(id);
  }

  addWrestler(name, show, division, status, imageUrl, gender, overall, alignment, titles) {
    const result = this.db.prepare(
      `INSERT INTO wrestlers (name, show, division, status, imageUrl, gender, overall, alignment, titles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(name, show, division, status, imageUrl, gender, overall, alignment, titles);
    return result.lastInsertRowid;
  }

  updateWrestler(id, name, show, division, status, imageUrl, gender, overall, alignment, titles) {
    this.db.prepare(
      `UPDATE wrestlers SET name = ?, show = ?, division = ?, status = ?, imageUrl = ?, gender = ?, overall = ?, alignment = ?, titles = ? WHERE id = ?`
    ).run(name, show, division, status, imageUrl, gender, overall, alignment, titles, id);
  }

  deleteWrestler(id) {
    this.db.prepare('DELETE FROM wrestlers WHERE id = ?').run(id);
  }

  getTotalWrestlers() {
    return this.db.prepare('SELECT COUNT(*) as count FROM wrestlers').get().count;
  }

  getShowBreakdown() {
    return this.db.prepare(
      `SELECT show, COUNT(*) as count FROM wrestlers GROUP BY show ORDER BY show`
    ).all();
  }

  // ==================== MATCHES ====================
  getAllMatches() {
    return this.db.prepare('SELECT * FROM matches ORDER BY date DESC LIMIT 100').all();
  }

  getMatchesByShow(show) {
    return this.db.prepare('SELECT * FROM matches WHERE show = ? ORDER BY date DESC LIMIT 100').all(show);
  }

  getUpcomingMatches(limit = 5) {
    return this.db.prepare(
      `SELECT * FROM matches WHERE result = 'Pending' ORDER BY date ASC LIMIT ?`
    ).all(limit);
  }

  addMatch(show, type, category, participant1, participant2, participant3, participant4, date, result, winner, notes, championshipId, isImportant) {
    const result_res = this.db.prepare(
      `INSERT INTO matches (show, type, category, participant1, participant2, participant3, participant4, date, result, winner, notes, championshipId, isImportant)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(show, type, category, participant1, participant2, participant3, participant4, date, result, winner, notes, championshipId || null, isImportant ? 1 : 0);
    return result_res.lastInsertRowid;
  }

  updateMatch(id, show, type, category, participant1, participant2, participant3, participant4, date, result, winner, notes, championshipId, isImportant) {
    this.db.prepare(
      `UPDATE matches SET show = ?, type = ?, category = ?, participant1 = ?, participant2 = ?, participant3 = ?, participant4 = ?, date = ?, result = ?, winner = ?, notes = ?, championshipId = ?, isImportant = ? WHERE id = ?`
    ).run(show, type, category, participant1, participant2, participant3, participant4, date, result, winner, notes, championshipId || null, isImportant ? 1 : 0, id);
  }

  deleteMatch(id) {
    this.db.prepare('DELETE FROM matches WHERE id = ?').run(id);
  }

  // ==================== CHAMPIONSHIPS ====================
  getAllChampionships() {
    return this.db.prepare('SELECT * FROM championships ORDER BY show, name').all();
  }

  getChampionshipsByShow(show) {
    return this.db.prepare('SELECT * FROM championships WHERE show = ? ORDER BY name').all(show);
  }

  addChampionship(name, show, holder, debutDate, notes) {
    const result = this.db.prepare(
      `INSERT INTO championships (name, show, holder, debutDate, notes) VALUES (?, ?, ?, ?, ?)`
    ).run(name, show, holder, debutDate, notes);
    return result.lastInsertRowid;
  }

  updateChampionship(id, name, show, holder, debutDate, notes) {
    this.db.prepare(
      `UPDATE championships SET name = ?, show = ?, holder = ?, debutDate = ?, notes = ? WHERE id = ?`
    ).run(name, show, holder, debutDate, notes, id);
  }

  deleteChampionship(id) {
    this.db.prepare('DELETE FROM championships WHERE id = ?').run(id);
  }

  getChampionshipHistory(championshipId) {
    return this.db.prepare(
      'SELECT * FROM championship_history WHERE championshipId = ? ORDER BY dateCaptured DESC'
    ).all(championshipId);
  }

  addChampionshipHistory(championshipId, holder, dateCaptured, notes) {
    const result = this.db.prepare(
      `INSERT INTO championship_history (championshipId, holder, dateCaptured, notes) VALUES (?, ?, ?, ?)`
    ).run(championshipId, holder, dateCaptured, notes);
    return result.lastInsertRowid;
  }

  // ==================== TRANSFERS ====================
  getAllTransfers() {
    return this.db.prepare('SELECT * FROM roster_transfers ORDER BY date DESC LIMIT 100').all();
  }

  addTransfer(wrestlerId, fromShow, toShow, date, reason) {
    const result = this.db.prepare(
      `INSERT INTO roster_transfers (wrestlerId, fromShow, toShow, date, reason) VALUES (?, ?, ?, ?, ?)`
    ).run(wrestlerId, fromShow, toShow, date, reason);
    return result.lastInsertRowid;
  }

  deleteTransfer(id) {
    this.db.prepare('DELETE FROM roster_transfers WHERE id = ?').run(id);
  }

  close() {
    try {
      this.db.exec('PRAGMA optimize');
      this.db.close();
    } catch (e) {
      // Already closed
    }
  }
}

export default DatabaseManager;
