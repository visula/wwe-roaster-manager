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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

app.use(cors({ origin: 'http://localhost:5000' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

const db = new Database();
db.init();

// ==================== SHOWS ====================
app.get('/api/shows', (req, res) => {
  res.json(db.getAllShows());
});

app.post('/api/shows', (req, res) => {
  const { name, abbreviation, day, showType, eligibleShows, matchLimit } = req.body;
  if (!name || !abbreviation) return res.status(400).json({ error: 'Name and abbreviation are required' });
  try {
    const id = db.addShow(name, abbreviation, day || null, showType || 'Weekly', Array.isArray(eligibleShows) ? eligibleShows.join(',') : (eligibleShows || null), matchLimit || null);
    res.json({ id, name, abbreviation, day, showType, eligibleShows, matchLimit });
  } catch (e) {
    res.status(400).json({ error: 'Show name already exists' });
  }
});

app.put('/api/shows/:id', (req, res) => {
  const { name, abbreviation, day, showType, eligibleShows, matchLimit } = req.body;
  if (!name || !abbreviation) return res.status(400).json({ error: 'Name and abbreviation are required' });
  try {
    db.updateShow(req.params.id, name, abbreviation, day || null, showType || 'Weekly', Array.isArray(eligibleShows) ? eligibleShows.join(',') : (eligibleShows || null), matchLimit || null);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/shows/:id', (req, res) => {
  db.deleteShow(req.params.id);
  res.json({ success: true });
});

// ==================== WRESTLERS ====================
app.get('/api/wrestlers', (req, res) => {
  const { show } = req.query;
  res.json(show ? db.getWrestlersByShow(show) : db.getAllWrestlers());
});

app.post('/api/wrestlers', (req, res) => {
  const { name, show, division, status, imageUrl, gender, overall, alignment, titles } = req.body;
  if (!name || !show) return res.status(400).json({ error: 'Name and show are required' });
  const id = db.addWrestler(name, show, division || 'Unassigned', status || 'Active', imageUrl || '', gender || '', overall || null, alignment || '', titles || '');
  res.json({ id, name, show, division, status, imageUrl, gender, overall, alignment, titles });
});

app.put('/api/wrestlers/:id', (req, res) => {
  const { id } = req.params;
  const { name, show, division, status, imageUrl, gender, overall, alignment, titles } = req.body;
  db.updateWrestler(id, name, show, division, status, imageUrl, gender, overall, alignment, titles);
  res.json({ id, name, show, division, status, imageUrl, gender, overall, alignment, titles });
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

app.post('/api/matches', (req, res) => {
  const { show, type, category, participant1, participant2, participant3, participant4, date, result, winner, notes, championshipId, isImportant } = req.body;
  if (!show || !participant1) return res.status(400).json({ error: 'Show and at least one participant required' });
  const id = db.addMatch(show, type || 'Singles', category || '', participant1, participant2, participant3, participant4, date || new Date().toISOString(), result || 'Pending', winner || null, notes || '', championshipId || null, isImportant || 0);
  res.json({ id, show, type, category, participant1, participant2, participant3, participant4, date, result, winner, notes, championshipId, isImportant });
});

app.put('/api/matches/:id', (req, res) => {
  const { id } = req.params;
  const { show, type, category, participant1, participant2, participant3, participant4, date, result, winner, notes, championshipId, isImportant } = req.body;
  db.updateMatch(id, show, type, category, participant1, participant2, participant3, participant4, date, result, winner, notes, championshipId || null, isImportant || 0);
  res.json({ id, show, type, category, participant1, participant2, participant3, participant4, date, result, winner, notes, championshipId, isImportant });
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
  const { name, show, holder, debutDate, notes } = req.body;
  if (!name || !show) return res.status(400).json({ error: 'Name and show are required' });
  const id = db.addChampionship(name, show, holder || 'Vacant', debutDate || new Date().toISOString(), notes || '');
  res.json({ id, name, show, holder, debutDate, notes });
});

app.put('/api/championships/:id', (req, res) => {
  const { id } = req.params;
  const { name, show, holder, debutDate, notes } = req.body;
  db.updateChampionship(id, name, show, holder, debutDate, notes);
  res.json({ id, name, show, holder, debutDate, notes });
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

// ==================== ROSTER TRANSFERS ====================
app.get('/api/transfers', (req, res) => {
  res.json(db.getAllTransfers());
});

app.post('/api/transfers', (req, res) => {
  const { wrestlerId, fromShow, toShow, date, reason } = req.body;
  if (!wrestlerId || !fromShow || !toShow) return res.status(400).json({ error: 'Wrestler ID, from show, and to show are required' });
  const id = db.addTransfer(wrestlerId, fromShow, toShow, date || new Date().toISOString(), reason || '');
  const wrestler = db.getWrestlerById(wrestlerId);
  if (wrestler) db.updateWrestler(wrestlerId, wrestler.name, toShow, wrestler.division, wrestler.status, wrestler.imageUrl, wrestler.gender, wrestler.overall, wrestler.alignment, wrestler.titles);
  res.json({ id, wrestlerId, fromShow, toShow, date, reason });
});

app.delete('/api/transfers/:id', (req, res) => {
  db.deleteTransfer(req.params.id);
  res.json({ success: true });
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
