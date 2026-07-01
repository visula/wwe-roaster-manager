import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import Database from './db.js';
import BetterSqlite3 from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

app.use(cors({ origin: 'http://localhost:5000' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

let db = new Database();
db.init();

// Middleware to ensure DB is using active account
function ensureActiveAccountDb(req, res, next) {
  const activeAccount = db.getActiveAccount();
  if (activeAccount && activeAccount.dbFileName) {
    // Check if we need to switch DB
    const currentDbFile = path.basename(db.db.name);
    if (currentDbFile !== activeAccount.dbFileName) {
      console.log(`Switching to account: ${activeAccount.name} (${activeAccount.dbFileName})`);
      db.close();
      db = new Database(activeAccount.dbFileName);
      db.init();
    }
  }
  next();
}

app.use('/api', ensureActiveAccountDb);

// ==================== SHOWS ====================
app.get('/api/shows', (req, res) => {
  res.json(db.getAllShows());
});

app.post('/api/shows', (req, res) => {
  const { name, abbreviation, day, showType, eligibleShows, matchLimit, nextEpisodeDate } = req.body;
  if (!name || !abbreviation) return res.status(400).json({ error: 'Name and abbreviation are required' });
  try {
    const id = db.addShow(name, abbreviation, day || null, showType || 'Weekly', Array.isArray(eligibleShows) ? eligibleShows.join(',') : (eligibleShows || null), matchLimit || null, nextEpisodeDate || null);
    res.json({ id, name, abbreviation, day, showType, eligibleShows, matchLimit, nextEpisodeDate });
  } catch (e) {
    res.status(400).json({ error: 'Show name already exists' });
  }
});

app.put('/api/shows/:id', (req, res) => {
  const { name, abbreviation, day, showType, eligibleShows, matchLimit, nextEpisodeDate } = req.body;
  if (!name || !abbreviation) return res.status(400).json({ error: 'Name and abbreviation are required' });
  try {
    db.updateShow(req.params.id, name, abbreviation, day || null, showType || 'Weekly', Array.isArray(eligibleShows) ? eligibleShows.join(',') : (eligibleShows || null), matchLimit || null, nextEpisodeDate || null);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/shows/:id', (req, res) => {
  db.deleteShow(req.params.id);
  res.json({ success: true });
});

app.post('/api/shows/apply-season-start', (req, res) => {
  const { startDate } = req.body;
  if (!startDate) return res.status(400).json({ error: 'Start date required' });
  
  try {
    const DAY_INDEX = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
    const base = new Date(startDate);
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    
    const shows = db.getAllShows();
    const updated = [];
    
    shows.forEach(show => {
      if (show.day && DAY_INDEX[show.day] !== undefined) {
        const offset = DAY_INDEX[show.day];
        const nextDate = new Date(monday);
        nextDate.setDate(monday.getDate() + (offset === 0 ? 7 : offset) - 1);
        const nextEpisodeDate = nextDate.toISOString().split('T')[0];
        
        db.updateShowNextEpisodeDate(show.id, nextEpisodeDate);
        updated.push({ show: show.name, date: nextEpisodeDate });
      }
    });
    
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shows/advance-week', (req, res) => {
  try {
    const shows = db.getAllShows();
    const updated = [];
    
    shows.forEach(show => {
      if (show.nextEpisodeDate) {
        const currentDate = new Date(show.nextEpisodeDate);
        currentDate.setDate(currentDate.getDate() + 7);
        const nextEpisodeDate = currentDate.toISOString().split('T')[0];
        
        db.updateShowNextEpisodeDate(show.id, nextEpisodeDate);
        updated.push({ show: show.name, date: nextEpisodeDate });
      }
    });
    
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== WRESTLERS ====================
app.get('/api/wrestlers', (req, res) => {
  const { show } = req.query;
  const wrestlers = show ? db.getWrestlersByShow(show) : db.getAllWrestlers();
  // Enrich with shows array from junction table
  const enriched = wrestlers.map(w => {
    const showsData = db.db.prepare('SELECT showName FROM wrestler_shows WHERE wrestlerId = ?').all(w.id);
    return {
      ...w,
      shows: showsData.length > 0 ? showsData.map(s => s.showName) : (w.show ? [w.show] : [])
    };
  });
  res.json(enriched);
});

app.post('/api/wrestlers', (req, res) => {
  try {
    const { name, shows, division, status, imageUrl, gender, overall, alignment, titles } = req.body;
    if (!name || !shows || shows.length === 0) return res.status(400).json({ error: 'Name and at least one show are required' });
    
    const primaryShow = shows[0];
    const id = db.addWrestler(name, primaryShow, division || 'Unassigned', status || 'Active', imageUrl || '', gender || '', overall || null, alignment || '', titles || '');
    
    // Add all shows to junction table
    const insertJunction = db.db.prepare('INSERT OR IGNORE INTO wrestler_shows (wrestlerId, showName, isPrimary) VALUES (?, ?, ?)');
    shows.forEach((show, index) => {
      insertJunction.run(id, show, index === 0 ? 1 : 0);
    });
    
    const wrestler = db.getWrestlerById(id);
    const showsData = db.db.prepare('SELECT showName FROM wrestler_shows WHERE wrestlerId = ?').all(id);
    res.json({ ...wrestler, shows: showsData.map(s => s.showName) });
  } catch (err) {
    console.error('Error adding wrestler:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/wrestlers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, shows, division, status, imageUrl, gender, overall, alignment, titles } = req.body;
    
    if (!shows || shows.length === 0) return res.status(400).json({ error: 'At least one show is required' });
    
    const primaryShow = shows[0];
    db.updateWrestler(id, name, primaryShow, division, status, imageUrl, gender, overall, alignment, titles);
    
    // Update junction table
    db.db.prepare('DELETE FROM wrestler_shows WHERE wrestlerId = ?').run(id);
    const insertJunction = db.db.prepare('INSERT INTO wrestler_shows (wrestlerId, showName, isPrimary) VALUES (?, ?, ?)');
    shows.forEach((show, index) => {
      insertJunction.run(id, show, index === 0 ? 1 : 0);
    });
    
    const wrestler = db.getWrestlerById(id);
    const showsData = db.db.prepare('SELECT showName FROM wrestler_shows WHERE wrestlerId = ?').all(id);
    res.json({ ...wrestler, shows: showsData.map(s => s.showName) });
  } catch (err) {
    console.error('Error updating wrestler:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/wrestlers/:id', (req, res) => {
  db.deleteWrestler(req.params.id);
  res.json({ success: true });
});

// ==================== MATCHES ====================
app.get('/api/matches', (req, res) => {
  const { show } = req.query;
  res.json(show ? db.getMatchesByShow(show) : db.getAllMatches());
});

app.get('/api/matches/check-limit', (req, res) => {
  const { show, date, excludeId } = req.query;
  if (!show || !date) return res.status(400).json({ error: 'Show and date are required' });
  res.json(db.canAddMatch(show, date, excludeId ? parseInt(excludeId) : null));
});

app.post('/api/matches', (req, res) => {
  const { show, type, category, participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date, result, winner, notes, championshipId, isImportant, storylineId, rivalryId } = req.body;
  if (!show || !participant1) return res.status(400).json({ error: 'Show and at least one participant required' });
  try {
    const id = db.addMatch(show, type || 'Singles', category || '', participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date || new Date().toISOString(), result || 'Pending', winner || null, notes || '', championshipId || null, isImportant || 0, storylineId || null, rivalryId || null);
    res.json({ id, show, type, category, participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date, result, winner, notes, championshipId, isImportant, storylineId, rivalryId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/matches/:id', (req, res) => {
  const { id } = req.params;
  const { show, type, category, participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date, result, winner, notes, championshipId, isImportant, storylineId, rivalryId } = req.body;
  try {
    db.updateMatch(id, show, type, category, participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date, result, winner, notes, championshipId || null, isImportant || 0, storylineId || null, rivalryId || null);
    res.json({ id, show, type, category, participant1, participant2, participant3, participant4, participant5, participant6, participant7, participant8, date, result, winner, notes, championshipId, isImportant, storylineId, rivalryId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/matches/:id', (req, res) => {
  db.deleteMatch(req.params.id);
  res.json({ success: true });
});

// ==================== CHAMPIONSHIPS ====================
app.get('/api/championships', (req, res) => {
  const { show } = req.query;
  res.json(show ? db.getChampionshipsByShow(show) : db.getAllChampionships());
});

app.post('/api/championships', (req, res) => {
  const { name, show, holder, holder2, debutDate, notes, type } = req.body;
  if (!name || !show) return res.status(400).json({ error: 'Name and show are required' });
  const id = db.addChampionship(name, show, holder || 'Vacant', holder2 || null, debutDate || new Date().toISOString(), notes || '', type || 'Single');
  res.json({ id, name, show, holder, holder2, debutDate, notes, type });
});

app.put('/api/championships/:id', (req, res) => {
  const { id } = req.params;
  const { name, show, holder, holder2, debutDate, notes, type } = req.body;
  db.updateChampionship(id, name, show, holder, holder2 || null, debutDate, notes, type || 'Single');
  res.json({ id, name, show, holder, holder2, debutDate, notes, type });
});

app.delete('/api/championships/:id', (req, res) => {
  db.deleteChampionship(req.params.id);
  res.json({ success: true });
});

app.get('/api/championship-history/:championshipId', (req, res) => {
  res.json(db.getChampionshipHistory(req.params.championshipId));
});

app.post('/api/championship-history', (req, res) => {
  const { championshipId, holder, dateCaptured, notes } = req.body;
  if (!championshipId || !holder) return res.status(400).json({ error: 'Championship ID and holder are required' });
  const id = db.addChampionshipHistory(championshipId, holder, dateCaptured || new Date().toISOString(), notes || '');
  res.json({ id, championshipId, holder, dateCaptured, notes });
});

// ==================== EVENTS ====================
app.get('/api/events', (req, res) => {
  res.json(db.getAllEvents());
});

app.post('/api/events', (req, res) => {
  const { name, show, date, pools, notes } = req.body;
  if (!name || !show) return res.status(400).json({ error: 'Name and show required' });
  const id = db.addEvent(name, show, date || new Date().toISOString(), pools || '', notes || '');
  res.json({ id, name, show, date, pools, notes, status: 'Upcoming' });
});

app.put('/api/events/:id', (req, res) => {
  const { name, show, date, pools, notes, status } = req.body;
  db.updateEvent(req.params.id, name, show, date, pools || '', notes || '', status || 'Upcoming');
  res.json({ success: true });
});

app.delete('/api/events/:id', (req, res) => {
  db.deleteEvent(req.params.id);
  res.json({ success: true });
});

// ==================== TEAMS ====================
app.get('/api/teams', (req, res) => {
  const rows = db.getAllTeams();
  const enriched = rows.map(t => {
    const memberNames = t.members ? t.members.split(',').map(m => m.trim()).filter(Boolean) : [];
    
    // Auto-calculate shows from members
    const calculatedShows = new Set();
    memberNames.forEach(memberName => {
      const wrestler = db.db.prepare('SELECT id FROM wrestlers WHERE name = ?').get(memberName);
      if (wrestler) {
        const showsData = db.db.prepare('SELECT showName FROM wrestler_shows WHERE wrestlerId = ?').all(wrestler.id);
        if (showsData.length > 0) {
          showsData.forEach(s => calculatedShows.add(s.showName));
        } else {
          // Fallback to legacy show field
          const wrestlerData = db.db.prepare('SELECT show FROM wrestlers WHERE id = ?').get(wrestler.id);
          if (wrestlerData && wrestlerData.show) calculatedShows.add(wrestlerData.show);
        }
      }
    });
    
    return { 
      ...t, 
      members: memberNames,
      tagTeamPairs: t.tagTeamPairs ? JSON.parse(t.tagTeamPairs) : [],
      shows: Array.from(calculatedShows)
    };
  });
  res.json(enriched);
});

app.post('/api/teams', (req, res) => {
  const { name, show, members, tagTeamPairs, shows } = req.body;
  if (!name) return res.status(400).json({ error: 'Team name required' });
  try {
    const tagTeamPairsStr = tagTeamPairs && tagTeamPairs.length > 0 ? JSON.stringify(tagTeamPairs) : null;
    const id = db.addTeam(name, show || null, members || [], tagTeamPairsStr, shows || []);
    res.json({ id, name, show, members: members || [], tagTeamPairs: tagTeamPairs || [], shows: shows || [] });
  } catch(e) { res.status(400).json({ error: 'Team name already exists' }); }
});

app.put('/api/teams/:id', (req, res) => {
  const { name, show, members, tagTeamPairs, shows } = req.body;
  try {
    const tagTeamPairsStr = tagTeamPairs && tagTeamPairs.length > 0 ? JSON.stringify(tagTeamPairs) : null;
    db.updateTeam(req.params.id, name, show || null, members || [], tagTeamPairsStr, shows || []);
    res.json({ success: true });
  } catch(e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/teams/:id', (req, res) => {
  db.deleteTeam(req.params.id);
  res.json({ success: true });
});

// ==================== ROSTER TRANSFERS ====================
app.get('/api/transfers', (req, res) => {
  res.json(db.getAllTransfers());
});

app.post('/api/transfers', (req, res) => {
  const { wrestlerId, fromShow, toShow, date, reason } = req.body;
  if (!wrestlerId || !fromShow || !toShow) return res.status(400).json({ error: 'Wrestler ID, from show, and to show are required' });
  const id = db.addTransfer(wrestlerId, fromShow, toShow, date || new Date().toISOString(), reason || '');
  const wrestler = db.getWrestlerById(wrestlerId);
  if (wrestler) {
    db.updateWrestler(wrestlerId, wrestler.name, toShow, wrestler.division, wrestler.status, wrestler.imageUrl, wrestler.gender, wrestler.overall, wrestler.alignment, wrestler.titles);
  }
  res.json({ id, wrestlerId, fromShow, toShow, date, reason });
});

app.delete('/api/transfers/:id', (req, res) => {
  db.deleteTransfer(req.params.id);
  res.json({ success: true });
});

// ==================== STORYLINES ====================
app.get('/api/storylines', (req, res) => {
  res.json(db.getAllStorylines());
});

app.get('/api/storylines/:id', (req, res) => {
  const storyline = db.getStorylineById(req.params.id);
  if (!storyline) return res.status(404).json({ error: 'Storyline not found' });
  res.json(storyline);
});

app.post('/api/storylines', (req, res) => {
  const { title, description, show, status, startDate, endDate, participants } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const id = db.addStoryline(title, description || '', show || null, status || 'Active', startDate || new Date().toISOString().split('T')[0], endDate || null, participants || []);
    res.json({ id, title, description, show, status, startDate, endDate, participants });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/storylines/:id', (req, res) => {
  const { title, description, show, status, startDate, endDate, participants } = req.body;
  try {
    db.updateStoryline(req.params.id, title, description || '', show || null, status, startDate, endDate || null, participants || []);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/storylines/:id', (req, res) => {
  db.deleteStoryline(req.params.id);
  res.json({ success: true });
});

// ==================== RIVALRIES ====================
app.get('/api/rivalries', (req, res) => {
  res.json(db.getAllRivalries());
});

app.get('/api/rivalries/:id', (req, res) => {
  const rivalry = db.getRivalryById(req.params.id);
  if (!rivalry) return res.status(404).json({ error: 'Rivalry not found' });
  res.json(rivalry);
});

app.post('/api/rivalries', (req, res) => {
  const { wrestler1, wrestler2, show, status, startDate, endDate, description } = req.body;
  if (!wrestler1 || !wrestler2) return res.status(400).json({ error: 'Both wrestlers are required' });
  try {
    const id = db.addRivalry(wrestler1, wrestler2, show || null, status || 'Active', startDate || new Date().toISOString().split('T')[0], endDate || null, description || '');
    res.json({ id, wrestler1, wrestler2, show, status, startDate, endDate, description });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/rivalries/:id', (req, res) => {
  const { wrestler1, wrestler2, show, status, startDate, endDate, description } = req.body;
  try {
    db.updateRivalry(req.params.id, wrestler1, wrestler2, show || null, status, startDate, endDate || null, description || '');
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/rivalries/:id', (req, res) => {
  db.deleteRivalry(req.params.id);
  res.json({ success: true });
});

// ==================== ACCOUNTS ====================
app.get('/api/accounts', (req, res) => {
  res.json(db.getAllAccounts());
});

app.get('/api/accounts/active', (req, res) => {
  res.json(db.getActiveAccount());
});

app.post('/api/accounts', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Account name is required' });
  try {
    const dbFileName = `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.db`;
    const id = db.addAccount(name, dbFileName);
    
    // Copy template database to new account database
    const templatePath = path.join(__dirname, '../data/template.db');
    const newAccountPath = path.join(__dirname, '../data', dbFileName);
    
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, newAccountPath);
      console.log(`✅ Created new account database from template: ${dbFileName}`);
    } else {
      // If template doesn't exist, copy from default.db
      const defaultPath = path.join(__dirname, '../data/default.db');
      if (fs.existsSync(defaultPath)) {
        fs.copyFileSync(defaultPath, newAccountPath);
        console.log(`✅ Created new account database from default.db: ${dbFileName}`);
      } else {
        // Last resort: create empty database
        const tempDb = new Database(dbFileName);
        tempDb.init();
        tempDb.close();
        console.log(`⚠️ No template found, created empty database: ${dbFileName}`);
      }
    }
    // Seed default teams into the new account DB if table is empty
    const newAccountDb = new Database(dbFileName);
    const teamCount = newAccountDb.db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
    if (teamCount === 0) newAccountDb.insertDefaultTeams();
    newAccountDb.close();
    
    res.json({ id, name, dbFileName, isActive: 0 });
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(400).json({ error: 'Account name already exists or error occurred' });
  }
});

app.post('/api/accounts/:id/activate', (req, res) => {
  const { id } = req.params;
  try {
    const account = db.getAllAccounts().find(a => a.id === parseInt(id));
    if (!account) return res.status(404).json({ error: 'Account not found' });
    
    db.setActiveAccount(id);
    
    // Reinitialize DB with new account
    db.close();
    db = new Database(account.dbFileName);
    db.init();
    
    res.json({ success: true, message: 'Account activated successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/accounts/:id', (req, res) => {
  try {
    const account = db.deleteAccount(req.params.id);
    if (account && account.dbFileName) {
      const dbPath = path.join(__dirname, '../data', account.dbFileName);
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== DASHBOARD ====================
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalWrestlers: db.getTotalWrestlers(),
    showBreakdown: db.getShowBreakdown(),
    upcomingMatches: db.getUpcomingMatches(5),
    championships: db.getAllChampionships()
  });
});

// ==================== IMPORT/EXPORT ====================
app.post('/api/import/wrestlers', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const uploadsDir = path.join(__dirname, '../uploads/');
    const rawPath = req.file.path;
    const safePath = path.normalize(rawPath);
    if (!safePath.startsWith(path.normalize(uploadsDir))) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    const fileContent = fs.readFileSync(safePath, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });
    let imported = 0;
    const errors = [];
    records.forEach((record, index) => {
      try {
        const { name, show, division, status, gender, overall, alignment, titles } = record;
        if (!name || !show) { errors.push(`Row ${index + 2}: Missing name or show`); return; }
        db.addWrestler(name.trim(), show.trim(), division?.trim() || 'Unassigned', status?.trim() || 'Active', '', gender?.trim() || '', overall ? parseInt(overall) : null, alignment?.trim() || '', titles?.trim() || '');
        imported++;
      } catch (err) {
        errors.push(`Row ${index + 2}: ${err.message}`);
      }
    });
    fs.unlinkSync(safePath);
    res.json({ success: true, imported, errors, message: `Successfully imported ${imported} wrestlers` });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/import/sample', (req, res) => {
  res.set('Content-Type', 'text/csv');
  res.send(`name,show,division,status,gender,overall,alignment,titles\nRoman Reigns,RAW,Heavyweight,Active,Male,95,Face,\nCody Rhodes,RAW,Heavyweight,Active,Male,95,Face,\nRhea Ripley,RAW,Women's,Active,Female,96,Face,\nGunther,RAW,Heavyweight,Active,Male,93,Tweener,`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🎭 WWE Universe Mode Manager running on http://localhost:${PORT}`);
  console.log(`📊 Database initialized at ./data/wwe-universe.db`);
});
