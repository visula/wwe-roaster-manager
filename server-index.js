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

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
const db = new Database();
db.init();

// ==================== SHOWS ====================
app.get('/api/shows', (req, res) => {
  const shows = db.getAllShows();
  res.json(shows);
});

// ==================== WRESTLERS ====================
app.get('/api/wrestlers', (req, res) => {
  const show = req.query.show;
  const wrestlers = show ? db.getWrestlersByShow(show) : db.getAllWrestlers();
  res.json(wrestlers);
});

app.post('/api/wrestlers', (req, res) => {
  const { name, show, division, status, imageUrl } = req.body;
  if (!name || !show) {
    return res.status(400).json({ error: 'Name and show are required' });
  }
  const id = db.addWrestler(name, show, division || 'Unassigned', status || 'Active', imageUrl || '');
  res.json({ id, name, show, division, status, imageUrl });
});

app.put('/api/wrestlers/:id', (req, res) => {
  const { id } = req.params;
  const { name, show, division, status, imageUrl } = req.body;
  db.updateWrestler(id, name, show, division, status, imageUrl);
  res.json({ id, name, show, division, status, imageUrl });
});

app.delete('/api/wrestlers/:id', (req, res) => {
  const { id } = req.params;
  db.deleteWrestler(id);
  res.json({ success: true });
});

// ==================== MATCHES ====================
app.get('/api/matches', (req, res) => {
  const show = req.query.show;
  const matches = show ? db.getMatchesByShow(show) : db.getAllMatches();
  res.json(matches);
});

app.post('/api/matches', (req, res) => {
  const { show, type, participant1, participant2, participant3, participant4, date, result, winner, notes } = req.body;
  if (!show || !participant1) {
    return res.status(400).json({ error: 'Show and at least one participant required' });
  }
  const id = db.addMatch(show, type || 'Singles', participant1, participant2, participant3, participant4, date || new Date().toISOString(), result || 'Pending', winner || null, notes || '');
  res.json({ id, show, type, participant1, participant2, participant3, participant4, date, result, winner, notes });
});

app.put('/api/matches/:id', (req, res) => {
  const { id } = req.params;
  const { show, type, participant1, participant2, participant3, participant4, date, result, winner, notes } = req.body;
  db.updateMatch(id, show, type, participant1, participant2, participant3, participant4, date, result, winner, notes);
  res.json({ id, show, type, participant1, participant2, participant3, participant4, date, result, winner, notes });
});

app.delete('/api/matches/:id', (req, res) => {
  const { id } = req.params;
  db.deleteMatch(id);
  res.json({ success: true });
});

// ==================== CHAMPIONSHIPS ====================
app.get('/api/championships', (req, res) => {
  const show = req.query.show;
  const championships = show ? db.getChampionshipsByShow(show) : db.getAllChampionships();
  res.json(championships);
});

app.post('/api/championships', (req, res) => {
  const { name, show, holder, debutDate, notes } = req.body;
  if (!name || !show) {
    return res.status(400).json({ error: 'Name and show are required' });
  }
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
  const { id } = req.params;
  db.deleteChampionship(id);
  res.json({ success: true });
});

app.get('/api/championship-history/:championshipId', (req, res) => {
  const { championshipId } = req.params;
  const history = db.getChampionshipHistory(championshipId);
  res.json(history);
});

app.post('/api/championship-history', (req, res) => {
  const { championshipId, holder, dateCaptured, notes } = req.body;
  if (!championshipId || !holder) {
    return res.status(400).json({ error: 'Championship ID and holder are required' });
  }
  const id = db.addChampionshipHistory(championshipId, holder, dateCaptured || new Date().toISOString(), notes || '');
  res.json({ id, championshipId, holder, dateCaptured, notes });
});

// ==================== ROSTER TRANSFERS ====================
app.get('/api/transfers', (req, res) => {
  const transfers = db.getAllTransfers();
  res.json(transfers);
});

app.post('/api/transfers', (req, res) => {
  const { wrestlerId, fromShow, toShow, date, reason } = req.body;
  if (!wrestlerId || !fromShow || !toShow) {
    return res.status(400).json({ error: 'Wrestler ID, from show, and to show are required' });
  }
  const id = db.addTransfer(wrestlerId, fromShow, toShow, date || new Date().toISOString(), reason || '');
  
  // Update wrestler's show
  const wrestler = db.getWrestlerById(wrestlerId);
  if (wrestler) {
    db.updateWrestler(wrestlerId, wrestler.name, toShow, wrestler.division, wrestler.status, wrestler.imageUrl);
  }
  
  res.json({ id, wrestlerId, fromShow, toShow, date, reason });
});

// ==================== DASHBOARD ====================
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    totalWrestlers: db.getTotalWrestlers(),
    showBreakdown: db.getShowBreakdown(),
    upcomingMatches: db.getUpcomingMatches(5),
    championships: db.getAllChampionships()
  };
  res.json(stats);
});

// ==================== IMPORT/EXPORT ====================
app.post('/api/import/wrestlers', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    let imported = 0;
    let errors = [];

    records.forEach((record, index) => {
      try {
        const { name, show, division, status } = record;
        if (!name || !show) {
          errors.push(`Row ${index + 2}: Missing name or show`);
          return;
        }
        
        db.addWrestler(
          name.trim(),
          show.trim(),
          division?.trim() || 'Unassigned',
          status?.trim() || 'Active',
          ''
        );
        imported++;
      } catch (err) {
        errors.push(`Row ${index + 2}: ${err.message}`);
      }
    });

    // Clean up
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      imported,
      errors,
      message: `Successfully imported ${imported} wrestlers`
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/import/sample', (req, res) => {
  const sampleData = `name,show,division,status
Roman Reigns,RAW,Heavyweight,Active
Cody Rhodes,RAW,Heavyweight,Active
Rhea Ripley,RAW,Women's,Active
Gunther,RAW,Heavyweight,Active`;
  
  res.set('Content-Type', 'text/csv');
  res.send(sampleData);
});

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎭 WWE Universe Mode Manager running on http://localhost:${PORT}`);
  console.log(`📊 Database initialized at ./data/wwe-universe.db`);
});
