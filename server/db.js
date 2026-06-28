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
    if (cols.length && !cols.find(c => c.name === 'nextEpisodeDate')) {
      this.db.exec(`ALTER TABLE shows ADD COLUMN nextEpisodeDate TEXT`);
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
    // Migrate: add participant5-8 columns for larger matches
    if (matchCols.length && !matchCols.find(c => c.name === 'participant5')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN participant5 TEXT`);
    }
    if (matchCols.length && !matchCols.find(c => c.name === 'participant6')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN participant6 TEXT`);
    }
    if (matchCols.length && !matchCols.find(c => c.name === 'participant7')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN participant7 TEXT`);
    }
    if (matchCols.length && !matchCols.find(c => c.name === 'participant8')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN participant8 TEXT`);
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

    // Migrate: add events table
    const evtCols = this.db.prepare(`PRAGMA table_info(events)`).all();
    if (!evtCols.length) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        show TEXT NOT NULL,
        date TEXT NOT NULL,
        pools TEXT,
        notes TEXT,
        status TEXT DEFAULT 'Upcoming',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    }

    // Migrate: add teams table
    const teamCols = this.db.prepare(`PRAGMA table_info(teams)`).all();
    if (!teamCols.length) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        show TEXT,
        members TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    } else if (teamCols.length && !teamCols.find(c => c.name === 'show')) {
      this.db.exec(`ALTER TABLE teams ADD COLUMN show TEXT`);
    }

    // Migrate: remove NOT NULL constraint from wrestlers.show if it exists
    const wrestlerColDefs = this.db.prepare(`PRAGMA table_info(wrestlers)`).all();
    const showCol = wrestlerColDefs.find(c => c.name === 'show');
    if (showCol && showCol.notnull === 1) {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS wrestlers_new (
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
        INSERT INTO wrestlers_new SELECT id,name,show,division,status,imageUrl,gender,overall,alignment,titles,createdAt FROM wrestlers;
        DROP TABLE wrestlers;
        ALTER TABLE wrestlers_new RENAME TO wrestlers;
      `);
      console.log('✅ Migrated wrestlers.show to nullable');
    }

    // Migrate: add wrestler_shows junction table
    const junctionCols = this.db.prepare(`PRAGMA table_info(wrestler_shows)`).all();
    if (!junctionCols.length) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS wrestler_shows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wrestlerId INTEGER NOT NULL,
        showName TEXT NOT NULL,
        isPrimary INTEGER DEFAULT 0,
        FOREIGN KEY (wrestlerId) REFERENCES wrestlers(id) ON DELETE CASCADE,
        UNIQUE(wrestlerId, showName)
      )`);
      console.log('✅ Created wrestler_shows junction table');
      
      // Migrate existing wrestlers to junction table
      const existingWrestlers = this.db.prepare('SELECT id, show FROM wrestlers WHERE show IS NOT NULL AND show != ""').all();
      if (existingWrestlers.length > 0) {
        console.log(`📦 Migrating ${existingWrestlers.length} existing wrestlers to junction table...`);
        const insertJunction = this.db.prepare('INSERT OR IGNORE INTO wrestler_shows (wrestlerId, showName, isPrimary) VALUES (?, ?, 1)');
        for (const w of existingWrestlers) {
          try {
            insertJunction.run(w.id, w.show);
          } catch (e) {
            console.error(`⚠️ Error migrating wrestler ${w.id}:`, e.message);
          }
        }
        console.log('✅ Migration complete');
      }
    }

    // Migrate: add storylines table
    const storylineCols = this.db.prepare(`PRAGMA table_info(storylines)`).all();
    if (!storylineCols.length) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS storylines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        show TEXT,
        status TEXT DEFAULT 'Active',
        startDate TEXT,
        endDate TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      console.log('✅ Created storylines table');
    }

    // Migrate: add storyline_participants table
    const storylinePartsCols = this.db.prepare(`PRAGMA table_info(storyline_participants)`).all();
    if (!storylinePartsCols.length) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS storyline_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        storylineId INTEGER NOT NULL,
        wrestlerName TEXT NOT NULL,
        role TEXT,
        FOREIGN KEY (storylineId) REFERENCES storylines(id) ON DELETE CASCADE
      )`);
      console.log('✅ Created storyline_participants table');
    }

    // Migrate: add rivalries table
    const rivalryCols = this.db.prepare(`PRAGMA table_info(rivalries)`).all();
    if (!rivalryCols.length) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS rivalries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wrestler1 TEXT NOT NULL,
        wrestler2 TEXT NOT NULL,
        show TEXT,
        status TEXT DEFAULT 'Active',
        startDate TEXT,
        endDate TEXT,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      console.log('✅ Created rivalries table');
    }

    // Migrate: add storylineId to matches
    if (matchCols.length && !matchCols.find(c => c.name === 'storylineId')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN storylineId INTEGER`);
    }
    if (matchCols.length && !matchCols.find(c => c.name === 'rivalryId')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN rivalryId INTEGER`);
    }

    this.db.exec(`
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
      { name: 'RAW',          abbr: 'RAW', day: 'Monday', matchLimit: 7 },
      { name: 'SmackDown',    abbr: 'SMA', day: 'Friday', matchLimit: 7 },
      { name: 'NXT',          abbr: 'NXT', day: 'Thursday', matchLimit: 6 },
      { name: 'TNA',          abbr: 'TNA', day: 'Tuesday', matchLimit: 6 },
      { name: 'AAA',          abbr: 'AAA', day: 'Wednesday', matchLimit: 5 },
      { name: 'AEW',          abbr: 'AEW', day: 'Thursday', matchLimit: 7 },
      { name: 'Legends',      abbr: 'LEG', day: null, matchLimit: null },
      { name: 'Ultra Legends',abbr: 'ULT', day: null, matchLimit: null },
      { name: 'Unassigned',   abbr: 'UNA', day: null, matchLimit: null },
      { name: 'DLC/AAA',      abbr: 'DLC', day: null, matchLimit: null },
      { name: 'Other WWE',    abbr: 'OTH', day: null, matchLimit: null },
    ];
    for (const show of shows) {
      const id = show.name.toLowerCase().replace(/\s/g, '').replace(/\//g, '');
      try {
        this.db.prepare(`INSERT INTO shows (id, name, abbreviation, day, matchLimit) VALUES (?, ?, ?, ?, ?)`)
          .run(id, show.name, show.abbr, show.day, show.matchLimit);
      } catch (e) {
        // Already exists — update day and matchLimit in case columns were just added
        this.db.prepare(`UPDATE shows SET day = ?, matchLimit = ? WHERE name = ?`)
          .run(show.day, show.matchLimit, show.name);
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

  getMatchesCountByShowAndDate(show, date) {
    const dateOnly = date.split('T')[0];
    return this.db.prepare(
      'SELECT COUNT(*) as count FROM matches WHERE show = ? AND DATE(date) = DATE(?)'
    ).get(show, dateOnly).count;
  }

  canAddMatch(show, date, excludeMatchId = null) {
    const showData = this.getShowByName(show);
    if (!showData || !showData.matchLimit) return { canAdd: true };
    
    const dateOnly = date.split('T')[0];
    let count;
    if (excludeMatchId) {
      count = this.db.prepare(
        'SELECT COUNT(*) as count FROM matches WHERE show = ? AND DATE(date) = DATE(?) AND id != ?'
      ).get(show, dateOnly, excludeMatchId).count;
    } else {
      count = this.db.prepare(
        'SELECT COUNT(*) as count FROM matches WHERE show = ? AND DATE(date) = DATE(?)'
      ).get(show, dateOnly).count;
    }
    
    return {
      canAdd: count < showData.matchLimit,
      current: count,
      limit: showData.matchLimit
    };
  }

  getWrestlerShowsByNames(names) {
    if (!names || names.length === 0) return [];
    const placeholders = names.map(() => '?').join(',');
    return this.db.prepare(`SELECT name, show FROM wrestlers WHERE name IN (${placeholders})`).all(...names);
  }

  addShow(name, abbreviation, day, showType = 'Weekly', eligibleShows = null, matchLimit = null, nextEpisodeDate = null) {
    const id = name.toLowerCase().replace(/\s/g, '').replace(/\//g, '');
    this.db.prepare(`INSERT INTO shows (id, name, abbreviation, day, showType, eligibleShows, matchLimit, nextEpisodeDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, name, abbreviation, day, showType, eligibleShows, matchLimit, nextEpisodeDate);
    return id;
  }

  updateShow(id, name, abbreviation, day, showType = 'Weekly', eligibleShows = null, matchLimit = null, nextEpisodeDate = null) {
    this.db.prepare(`UPDATE shows SET name = ?, abbreviation = ?, day = ?, showType = ?, eligibleShows = ?, matchLimit = ?, nextEpisodeDate = ? WHERE id = ?`)
      .run(name, abbreviation, day, showType, eligibleShows, matchLimit, nextEpisodeDate, id);
  }

  updateShowNextEpisodeDate(id, nextEpisodeDate) {
    this.db.prepare(`UPDATE shows SET nextEpisodeDate = ? WHERE id = ?`).run(nextEpisodeDate, id);
  }

  deleteShow(id) {
    this.db.prepare('DELETE FROM shows WHERE id = ?').run(id);
  }

  // ==================== WRESTLERS ====================
  getAllWrestlers() {
    const wrestlers = this.db.prepare('SELECT * FROM wrestlers ORDER BY name').all();
    // Attach shows for each wrestler
    return wrestlers.map(w => {
      const shows = this.db.prepare(
        'SELECT showName, isPrimary FROM wrestler_shows WHERE wrestlerId = ? ORDER BY isPrimary DESC, showName'
      ).all(w.id);
      return { ...w, shows: shows.map(s => s.showName), primaryShow: shows.find(s => s.isPrimary)?.showName || shows[0]?.showName };
    });
  }

  getWrestlersByShow(show) {
    const wrestlerIds = this.db.prepare(
      'SELECT wrestlerId FROM wrestler_shows WHERE showName = ?'
    ).all(show).map(r => r.wrestlerId);
    if (wrestlerIds.length === 0) return [];
    const placeholders = wrestlerIds.map(() => '?').join(',');
    const wrestlers = this.db.prepare(`SELECT * FROM wrestlers WHERE id IN (${placeholders}) ORDER BY name`).all(...wrestlerIds);
    return wrestlers.map(w => {
      const shows = this.db.prepare(
        'SELECT showName, isPrimary FROM wrestler_shows WHERE wrestlerId = ? ORDER BY isPrimary DESC, showName'
      ).all(w.id);
      return { ...w, shows: shows.map(s => s.showName), primaryShow: shows.find(s => s.isPrimary)?.showName || shows[0]?.showName };
    });
  }

  getWrestlerById(id) {
    const wrestler = this.db.prepare('SELECT * FROM wrestlers WHERE id = ?').get(id);
    if (!wrestler) return null;
    const shows = this.db.prepare(
      'SELECT showName, isPrimary FROM wrestler_shows WHERE wrestlerId = ? ORDER BY isPrimary DESC, showName'
    ).all(id);
    return { ...wrestler, shows: shows.map(s => s.showName), primaryShow: shows.find(s => s.isPrimary)?.showName || shows[0]?.showName };
  }

  addWrestler(name, shows, division, status, imageUrl, gender, overall, alignment, titles) {
    const showList = Array.isArray(shows) ? shows : [shows];
    const primaryShow = showList[0] || null;
    const result = this.db.prepare(
      `INSERT INTO wrestlers (name, show, division, status, imageUrl, gender, overall, alignment, titles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(name, primaryShow, division, status, imageUrl, gender, overall, alignment, titles);
    const wrestlerId = result.lastInsertRowid;
    // Add show associations
    showList.forEach((show, idx) => {
      this.db.prepare(
        'INSERT INTO wrestler_shows (wrestlerId, showName, isPrimary) VALUES (?, ?, ?)'
      ).run(wrestlerId, show, idx === 0 ? 1 : 0);
    });
    return wrestlerId;
  }

  updateWrestler(id, name, shows, division, status, imageUrl, gender, overall, alignment, titles) {
    const showList = Array.isArray(shows) ? shows : [shows];
    const primaryShow = showList[0] || null;
    this.db.prepare(
      `UPDATE wrestlers SET name = ?, show = ?, division = ?, status = ?, imageUrl = ?, gender = ?, overall = ?, alignment = ?, titles = ? WHERE id = ?`
    ).run(name, primaryShow, division, status, imageUrl, gender, overall, alignment, titles, id);
    // Update show associations
    this.db.prepare('DELETE FROM wrestler_shows WHERE wrestlerId = ?').run(id);
    showList.forEach((show, idx) => {
      this.db.prepare(
        'INSERT INTO wrestler_shows (wrestlerId, showName, isPrimary) VALUES (?, ?, ?)'
      ).run(id, show, idx === 0 ? 1 : 0);
    });
  }

  deleteWrestler(id) {
    this.db.prepare('DELETE FROM wrestlers WHERE id = ?').run(id);
  }

  getTotalWrestlers() {
    return this.db.prepare('SELECT COUNT(DISTINCT id) as count FROM wrestlers').get().count;
  }

  getShowBreakdown() {
    return this.db.prepare(
      `SELECT ws.showName as show, COUNT(DISTINCT ws.wrestlerId) as count,
       SUM(CASE WHEN w.gender = 'Male' THEN 1 ELSE 0 END) as maleCount,
       SUM(CASE WHEN w.gender = 'Female' THEN 1 ELSE 0 END) as femaleCount
       FROM wrestler_shows ws 
       INNER JOIN wrestlers w ON ws.wrestlerId = w.id
       GROUP BY ws.showName 
       ORDER BY ws.showName`
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

  addMatch(show, type, category, participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date, result, winner, notes, championshipId, isImportant, storylineId, rivalryId) {
    const limitCheck = this.canAddMatch(show, date);
    if (!limitCheck.canAdd) {
      throw new Error(`Match limit reached for ${show} on ${date.split('T')[0]}. Limit: ${limitCheck.limit}, Current: ${limitCheck.current}`);
    }
    const result_res = this.db.prepare(
      `INSERT INTO matches (show, type, category, participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date, result, winner, notes, championshipId, isImportant, storylineId, rivalryId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(show, type, category, participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date, result, winner, notes, championshipId || null, isImportant ? 1 : 0, storylineId || null, rivalryId || null);
    return result_res.lastInsertRowid;
  }

  updateMatch(id, show, type, category, participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date, result, winner, notes, championshipId, isImportant, storylineId, rivalryId) {
    const limitCheck = this.canAddMatch(show, date, id);
    if (!limitCheck.canAdd) {
      throw new Error(`Match limit reached for ${show} on ${date.split('T')[0]}. Limit: ${limitCheck.limit}, Current: ${limitCheck.current}`);
    }
    this.db.prepare(
      `UPDATE matches SET show = ?, type = ?, category = ?, participant1 = ?, participant2 = ?, participant3 = ?, participant4 = ?, participant5 = ?, participant6 = ?, participant7 = ?, participant8 = ?, date = ?, result = ?, winner = ?, notes = ?, championshipId = ?, isImportant = ?, storylineId = ?, rivalryId = ? WHERE id = ?`
    ).run(show, type, category, participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date, result, winner, notes, championshipId || null, isImportant ? 1 : 0, storylineId || null, rivalryId || null, id);
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

  // ==================== EVENTS ====================
  getAllEvents() {
    return this.db.prepare('SELECT * FROM events ORDER BY date DESC').all();
  }

  getEventById(id) {
    return this.db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  }

  addEvent(name, show, date, pools, notes) {
    const result = this.db.prepare(
      `INSERT INTO events (name, show, date, pools, notes) VALUES (?, ?, ?, ?, ?)`
    ).run(name, show, date, pools || '', notes || '');
    return result.lastInsertRowid;
  }

  updateEvent(id, name, show, date, pools, notes, status) {
    this.db.prepare(
      `UPDATE events SET name=?, show=?, date=?, pools=?, notes=?, status=? WHERE id=?`
    ).run(name, show, date, pools || '', notes || '', status || 'Upcoming', id);
  }

  deleteEvent(id) {
    this.db.prepare('DELETE FROM events WHERE id = ?').run(id);
  }

  // ==================== TEAMS ====================
  getAllTeams() {
    return this.db.prepare('SELECT * FROM teams ORDER BY show, name').all();
  }

  addTeam(name, show, members) {
    const result = this.db.prepare(
      `INSERT INTO teams (name, show, members) VALUES (?, ?, ?)`
    ).run(name, show || null, Array.isArray(members) ? members.join(',') : members);
    return result.lastInsertRowid;
  }

  updateTeam(id, name, show, members) {
    this.db.prepare(`UPDATE teams SET name=?, show=?, members=? WHERE id=?`)
      .run(name, show || null, Array.isArray(members) ? members.join(',') : members, id);
  }

  deleteTeam(id) {
    this.db.prepare('DELETE FROM teams WHERE id = ?').run(id);
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

  // ==================== STORYLINES ====================
  getAllStorylines() {
    const storylines = this.db.prepare('SELECT * FROM storylines ORDER BY startDate DESC').all();
    return storylines.map(s => {
      const participants = this.db.prepare('SELECT wrestlerName, role FROM storyline_participants WHERE storylineId = ?').all(s.id);
      return { ...s, participants };
    });
  }

  getStorylineById(id) {
    const storyline = this.db.prepare('SELECT * FROM storylines WHERE id = ?').get(id);
    if (!storyline) return null;
    const participants = this.db.prepare('SELECT wrestlerName, role FROM storyline_participants WHERE storylineId = ?').all(id);
    return { ...storyline, participants };
  }

  addStoryline(title, description, show, status, startDate, endDate, participants) {
    const result = this.db.prepare(
      `INSERT INTO storylines (title, description, show, status, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(title, description, show, status || 'Active', startDate, endDate || null);
    const storylineId = result.lastInsertRowid;
    if (participants && participants.length > 0) {
      participants.forEach(p => {
        this.db.prepare('INSERT INTO storyline_participants (storylineId, wrestlerName, role) VALUES (?, ?, ?)').run(storylineId, p.name, p.role || null);
      });
    }
    return storylineId;
  }

  updateStoryline(id, title, description, show, status, startDate, endDate, participants) {
    this.db.prepare(
      `UPDATE storylines SET title = ?, description = ?, show = ?, status = ?, startDate = ?, endDate = ? WHERE id = ?`
    ).run(title, description, show, status, startDate, endDate || null, id);
    this.db.prepare('DELETE FROM storyline_participants WHERE storylineId = ?').run(id);
    if (participants && participants.length > 0) {
      participants.forEach(p => {
        this.db.prepare('INSERT INTO storyline_participants (storylineId, wrestlerName, role) VALUES (?, ?, ?)').run(id, p.name, p.role || null);
      });
    }
  }

  deleteStoryline(id) {
    this.db.prepare('DELETE FROM storylines WHERE id = ?').run(id);
  }

  // ==================== RIVALRIES ====================
  getAllRivalries() {
    return this.db.prepare('SELECT * FROM rivalries ORDER BY startDate DESC').all();
  }

  getRivalryById(id) {
    return this.db.prepare('SELECT * FROM rivalries WHERE id = ?').get(id);
  }

  addRivalry(wrestler1, wrestler2, show, status, startDate, endDate, description) {
    const result = this.db.prepare(
      `INSERT INTO rivalries (wrestler1, wrestler2, show, status, startDate, endDate, description) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(wrestler1, wrestler2, show, status || 'Active', startDate, endDate || null, description || '');
    return result.lastInsertRowid;
  }

  updateRivalry(id, wrestler1, wrestler2, show, status, startDate, endDate, description) {
    this.db.prepare(
      `UPDATE rivalries SET wrestler1 = ?, wrestler2 = ?, show = ?, status = ?, startDate = ?, endDate = ?, description = ? WHERE id = ?`
    ).run(wrestler1, wrestler2, show, status, startDate, endDate || null, description || '', id);
  }

  deleteRivalry(id) {
    this.db.prepare('DELETE FROM rivalries WHERE id = ?').run(id);
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
