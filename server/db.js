import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const MAIN_DB_PATH = path.join(dataDir, 'accounts.db');

class DatabaseManager {
  constructor(accountDbFile = null) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Main DB for accounts management only
    this.mainDb = new Database(MAIN_DB_PATH);
    
    // Active account database
    if (accountDbFile) {
      const accountDbPath = path.join(dataDir, accountDbFile);
      this.db = new Database(accountDbPath);
    } else {
      // Initialize with default account DB
      this.db = new Database(path.join(dataDir, 'default.db'));
    }
  }

  init() {
    // Initialize accounts table in main DB
    this.mainDb.pragma('foreign_keys = ON');
    this.mainDb.exec(`CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      dbFileName TEXT NOT NULL UNIQUE,
      isActive INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Check if default account exists
    const defaultAccount = this.mainDb.prepare('SELECT * FROM accounts WHERE name = ?').get('Default Account');
    if (!defaultAccount) {
      this.mainDb.prepare('INSERT INTO accounts (name, dbFileName, isActive) VALUES (?, ?, ?)').run('Default Account', 'default.db', 1);
      console.log('✅ Created default account');
    }
    
    // Initialize active account database
    this.db.pragma('foreign_keys = ON');

    // Create base tables first
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
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS championships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        show TEXT NOT NULL,
        holder TEXT,
        holder2 TEXT,
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
    `);

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
      this.insertDefaultTeams();
    } else if (teamCols.length && !teamCols.find(c => c.name === 'show')) {
      this.db.exec(`ALTER TABLE teams ADD COLUMN show TEXT`);
    }
    // Add tagTeamPairs column for designating specific tag team pairs
    if (teamCols.length && !teamCols.find(c => c.name === 'tagTeamPairs')) {
      this.db.exec(`ALTER TABLE teams ADD COLUMN tagTeamPairs TEXT`);
      console.log('✅ Added tagTeamPairs column to teams');
    }
    // Add shows column for multiple show assignments
    if (teamCols.length && !teamCols.find(c => c.name === 'shows')) {
      this.db.exec(`ALTER TABLE teams ADD COLUMN shows TEXT`);
      // Migrate existing show data to shows array
      const existingTeams = this.db.prepare('SELECT id, show FROM teams WHERE show IS NOT NULL').all();
      if (existingTeams.length > 0) {
        const updateShows = this.db.prepare('UPDATE teams SET shows = ? WHERE id = ?');
        for (const team of existingTeams) {
          updateShows.run(JSON.stringify([team.show]), team.id);
        }
      }
      console.log('✅ Added shows column to teams and migrated data');
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

    // Migrate: add accounts table
    const accountCols = this.db.prepare(`PRAGMA table_info(accounts)`).all();
    if (!accountCols.length) {
      // Accounts are now in mainDb, skip this migration
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

    // Migrate: add storylineId to matches (re-read cols in case table was rebuilt above)
    const matchColsFresh = this.db.prepare(`PRAGMA table_info(matches)`).all();
    if (matchColsFresh.length && !matchColsFresh.find(c => c.name === 'storylineId')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN storylineId INTEGER`);
    }
    if (matchColsFresh.length && !matchColsFresh.find(c => c.name === 'rivalryId')) {
      this.db.exec(`ALTER TABLE matches ADD COLUMN rivalryId INTEGER`);
    }

    // Migrate: add holder2 to championships
    const champCols = this.db.prepare(`PRAGMA table_info(championships)`).all();
    if (champCols.length && !champCols.find(c => c.name === 'holder2')) {
      this.db.exec(`ALTER TABLE championships ADD COLUMN holder2 TEXT`);
      console.log('✅ Added holder2 column to championships');
    }
    if (champCols.length && !champCols.find(c => c.name === 'type')) {
      this.db.exec(`ALTER TABLE championships ADD COLUMN type TEXT DEFAULT 'Single'`);
      console.log('✅ Added type column to championships');
    }

    // Insert default shows
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

    // Migrate: add settings table
    const settingsCols = this.db.prepare(`PRAGMA table_info(settings)`).all();
    if (!settingsCols.length) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )`);
      console.log('✅ Created settings table');
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
    return this.db.prepare('SELECT COUNT(DISTINCT id) as count FROM wrestlers').get().count;
  }

  getShowBreakdown() {
    // Get counts from junction table (new multi-show wrestlers)
    const junctionCounts = this.db.prepare(
      `SELECT ws.showName as show, COUNT(DISTINCT ws.wrestlerId) as count,
       SUM(CASE WHEN w.gender = 'Male' THEN 1 ELSE 0 END) as maleCount,
       SUM(CASE WHEN w.gender = 'Female' THEN 1 ELSE 0 END) as femaleCount
       FROM wrestler_shows ws
       LEFT JOIN wrestlers w ON ws.wrestlerId = w.id
       GROUP BY ws.showName`
    ).all();
    
    // Get counts from wrestlers without junction entries (legacy single-show wrestlers)
    const legacyCounts = this.db.prepare(
      `SELECT w.show, COUNT(*) as count,
       SUM(CASE WHEN w.gender = 'Male' THEN 1 ELSE 0 END) as maleCount,
       SUM(CASE WHEN w.gender = 'Female' THEN 1 ELSE 0 END) as femaleCount
       FROM wrestlers w
       WHERE w.show IS NOT NULL 
       AND w.id NOT IN (SELECT wrestlerId FROM wrestler_shows)
       GROUP BY w.show`
    ).all();
    
    // Merge the counts
    const merged = {};
    [...junctionCounts, ...legacyCounts].forEach(row => {
      const showName = row.show || row.showName;
      if (!merged[showName]) {
        merged[showName] = { show: showName, count: 0, maleCount: 0, femaleCount: 0 };
      }
      merged[showName].count += row.count;
      merged[showName].maleCount += (row.maleCount || 0);
      merged[showName].femaleCount += (row.femaleCount || 0);
    });
    
    return Object.values(merged).sort((a, b) => a.show.localeCompare(b.show));
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

  addChampionship(name, show, holder, holder2, debutDate, notes, type) {
    const result = this.db.prepare(
      `INSERT INTO championships (name, show, holder, holder2, debutDate, notes, type) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(name, show, holder, holder2 || null, debutDate, notes, type || 'Single');
    return result.lastInsertRowid;
  }

  updateChampionship(id, name, show, holder, holder2, debutDate, notes, type) {
    this.db.prepare(
      `UPDATE championships SET name = ?, show = ?, holder = ?, holder2 = ?, debutDate = ?, notes = ?, type = ? WHERE id = ?`
    ).run(name, show, holder, holder2 || null, debutDate, notes, type || 'Single', id);
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

  insertDefaultTeams() {
    const defaultTeams = [
      { name: '#DIY', show: 'NXT', members: 'Johnny Gargano,Candice LeRae' },
      { name: '3 Minute Warning', show: null, members: 'Jamal,Rosey' },
      { name: 'AJ Lee & CM Punk', show: null, members: 'AJ Lee,CM Punk' },
      { name: 'Alexa Bliss & Charlotte Flair', show: null, members: 'Alexa Bliss,Charlotte Flair' },
      { name: 'Alpha Academy', show: 'RAW', members: 'Akira Tozawa,Maxxine Dupri,Otis' },
      { name: 'American Made', show: 'NXT', members: 'Brutus Creed,Ivy Nile,Julius Creed' },
      { name: 'Birth Right', show: 'NXT', members: 'Channing Lorenzo,Charlie Dempsey,Lexis King' },
      { name: 'Brothers of Destruction', show: null, members: 'Kane,Undertaker' },
      { name: 'Chelsea Green & The Secret Service', show: 'SmackDown', members: 'Chelsea Green,Piper Niven,Alba Fyre' },
      { name: 'D-Generation X', show: null, members: 'Shawn Michaels,Triple H' },
      { name: 'Damian Priest & R-Truth', show: 'RAW', members: 'Damian Priest,R-Truth' },
      { name: 'Death Riders', show: 'AEW', members: 'Claudio Castagnoli,Jon Moxley,Pac,Wheeler Yuta' },
      { name: 'FTR', show: 'AEW', members: 'Cash Wheeler,Dax Harwood' },
      { name: 'Fraxiom', show: 'NXT', members: 'Axiom,Nathan Frazer' },
      { name: 'Giulia & Kiana James', show: null, members: 'Giulia,Kiana James' },
      { name: 'Hank & Tank', show: 'NXT', members: 'Hank Walker,Tank Ledger' },
      { name: 'House of Black', show: 'AEW', members: 'Aleister Black,Brody King,Buddy Matthews,Julia Hart,Zelina Vega' },
      { name: 'LWO - Latino World Order', show: null, members: 'Cruz Del Toro,Dragon Lee,Joaquin Wilde,Rey Mysterio' },
      { name: 'Las Toxicas', show: 'AAA', members: 'Flammer,La Hiedra' },
      { name: "LA Park's", show: 'AAA', members: 'La Park,La Parka' },
      { name: 'Local Rift', show: 'NXT', members: 'LJ,Odyssey Rift' },
      { name: 'Los Americanos', show: 'AAA', members: 'Bravo Americano,El Grande Americano' },
      { name: 'Los Garza', show: 'AAA', members: 'Angel,Berto' },
      { name: 'Lucha House Party', show: null, members: 'Kalisto,Lince Dorado,Sin Cara' },
      { name: 'MFT', show: null, members: 'JC Mateo,Solo Sikoa,Talla Tonga,Tama Tonga,Tonga Loa' },
      { name: 'MJF and stable', show: 'AEW', members: 'Adam Cole,Buzz,Lock,MJF,Ryback' },
      { name: 'Motor City Machine Guns', show: 'TNA', members: 'Alex Shelley,Chris Sabin' },
      { name: 'Old Buddies', show: null, members: 'Chris Jericho,Christian Cage,Edge' },
      { name: 'Pretty Deadly', show: null, members: 'Elton Prince,Kit Wilson' },
      { name: 'Red Eternal', show: null, members: 'Hope Eternal,Red' },
      { name: 'Rhiyo', show: 'RAW', members: 'Iyo Sky,Rhea Ripley' },
      { name: 'Role Model & Valkyria', show: null, members: 'Bayley,Lyra Valkyria' },
      { name: 'Sting & Darby', show: 'AEW', members: 'Darby Allin,Sting' },
      { name: 'The Culling', show: null, members: 'Izzi Dame,Shawn Spears' },
      { name: 'The Dudley Boyz', show: null, members: 'Bubba Ray Dudley,D-Von Dudley' },
      { name: 'The Fatal Influence', show: 'NXT', members: 'Fallon Henley,Jacy Jayne,Jazmyn Nyx' },
      { name: 'The Flock', show: null, members: 'Perry Saturn,Raven' },
      { name: 'The Head Bangers', show: null, members: 'Mosh,Thrasher' },
      { name: 'The Irresistible Forces', show: 'RAW', members: 'Lash Legend,Nia Jax' },
      { name: 'The Judgment Day', show: 'RAW', members: 'Dirty Dominik Mysterio,JD McDonagh,Liv Morgan,Raquel Rodriguez,Roxanne Perez' },
      { name: 'The Kabuki Warriors', show: null, members: 'Asuka,Kairi Sane' },
      { name: 'The Miz & Maryse', show: null, members: 'Maryse,Miz' },
      { name: 'The New Day', show: 'RAW', members: 'Grayson Waller,Kofi Kingston,Xavier Woods' },
      { name: 'The Street Profits', show: null, members: 'Angelo Dawkins,Montez Ford' },
      { name: 'The Takeover', show: null, members: 'B-Fab,Jade Cargill,Michin' },
      { name: 'The Usos', show: null, members: 'Jey Uso,Jimmy Uso' },
      { name: 'The Vision', show: 'RAW', members: 'Austin Theory,Bron Breakker,Bronson Reed,Logan Paul' },
      { name: 'The War Raiders', show: 'RAW', members: 'Erik,Ivar' },
      { name: 'The Wyatt Sicks', show: 'RAW', members: 'Dexter Lumis,Erick Rowan,Joe Gacy,Nikki Cross,Uncle Howdy' },
      { name: 'Tre & Chase', show: 'NXT', members: 'Chase,TRE' },
      { name: 'Young Bucks', show: 'AEW', members: 'Matt Jackson,Nick Jackson' },
    ];
    const insert = this.db.prepare(`INSERT OR IGNORE INTO teams (name, show, members) VALUES (?, ?, ?)`);
    for (const team of defaultTeams) {
      insert.run(team.name, team.show, team.members);
    }
    console.log('✅ Inserted default teams');
  }

  // ==================== TEAMS ====================
  getAllTeams() {
    return this.db.prepare('SELECT * FROM teams ORDER BY show, name').all();
  }

  addTeam(name, show, members, tagTeamPairs, shows) {
    const showsJson = shows && Array.isArray(shows) && shows.length > 0 ? JSON.stringify(shows) : null;
    const result = this.db.prepare(
      `INSERT INTO teams (name, show, members, tagTeamPairs, shows) VALUES (?, ?, ?, ?, ?)`
    ).run(name, show || null, Array.isArray(members) ? members.join(',') : members, tagTeamPairs || null, showsJson);
    return result.lastInsertRowid;
  }

  updateTeam(id, name, show, members, tagTeamPairs, shows) {
    const showsJson = shows && Array.isArray(shows) && shows.length > 0 ? JSON.stringify(shows) : null;
    this.db.prepare(`UPDATE teams SET name=?, show=?, members=?, tagTeamPairs=?, shows=? WHERE id=?`)
      .run(name, show || null, Array.isArray(members) ? members.join(',') : members, tagTeamPairs || null, showsJson, id);
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

  getSetting(key) {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : null;
  }

  setSetting(key, value) {
    this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  }

  // ==================== ACCOUNTS ====================
  getAllAccounts() {
    return this.mainDb.prepare('SELECT * FROM accounts ORDER BY name').all();
  }

  getActiveAccount() {
    return this.mainDb.prepare('SELECT * FROM accounts WHERE isActive = 1').get();
  }

  addAccount(name, dbFileName) {
    const result = this.mainDb.prepare(
      `INSERT INTO accounts (name, dbFileName, isActive) VALUES (?, ?, 0)`
    ).run(name, dbFileName);
    return result.lastInsertRowid;
  }

  setActiveAccount(id) {
    this.mainDb.prepare('UPDATE accounts SET isActive = 0').run();
    this.mainDb.prepare('UPDATE accounts SET isActive = 1 WHERE id = ?').run(id);
  }

  deleteAccount(id) {
    const account = this.mainDb.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
    if (account && account.isActive) {
      throw new Error('Cannot delete active account');
    }
    this.mainDb.prepare('DELETE FROM accounts WHERE id = ?').run(id);
    return account;
  }

  close() {
    try {
      this.db.exec('PRAGMA optimize');
      this.db.close();
    } catch (e) {
      // Already closed
    }
    try {
      this.mainDb.close();
    } catch (e) {
      // Already closed
    }
  }
}

export default DatabaseManager;
