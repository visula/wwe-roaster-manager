import DatabaseManager from './db.js';

const db = new DatabaseManager();
db.init();

// Test show registration
const shows = ['RAW', 'SmackDown', 'NXT'];
const existingShows = db.getAllShows();
console.log(`Existing shows: ${existingShows.map(s => s.name).join(', ')}`);

// Test checking for a show
const checkShow = db.db.prepare('SELECT name FROM shows WHERE name = ?').get('SmackDown');
console.log(`SmackDown found: ${checkShow ? checkShow.name : 'NOT FOUND'}`);

const checkShowWrong = db.db.prepare('SELECT name FROM shows WHERE name = ?').get('Smackdown');
console.log(`Smackdown (lowercase d) found: ${checkShowWrong ? checkShowWrong.name : 'NOT FOUND'}`);

db.close();
process.exit(0);
