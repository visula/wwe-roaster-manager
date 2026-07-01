import Database from 'better-sqlite3';
import readline from 'readline';
const db = new Database('./universe.db');

// Create matches table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT,
    participant1 TEXT,
    participant2 TEXT,
    participant3 TEXT,
    participant4 TEXT,
    participant5 TEXT,
    participant6 TEXT,
    participant7 TEXT,
    participant8 TEXT,
    date TEXT NOT NULL,
    result TEXT DEFAULT 'Pending',
    winner TEXT,
    notes TEXT,
    championshipId INTEGER,
    isImportant INTEGER DEFAULT 0
  )
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   WWE Universe Manager - Reset Tool      ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  console.log('Select an option:');
  console.log('1. Reset ALL Matches (including Main Events)');
  console.log('2. Reset ONLY Main Events');
  console.log('3. Reset ONLY Regular Matches');
  console.log('4. Exit\n');
}

function resetAllMatches() {
  const result = db.prepare('DELETE FROM matches').run();
  console.log(`✓ Deleted ${result.changes} matches (including main events)`);
}

function resetMainEvents() {
  const result = db.prepare('DELETE FROM matches WHERE isImportant = 1').run();
  console.log(`✓ Deleted ${result.changes} main event records`);
}

function resetRegularMatches() {
  const result = db.prepare('DELETE FROM matches WHERE isImportant = 0 OR isImportant IS NULL').run();
  console.log(`✓ Deleted ${result.changes} regular matches`);
}

function askQuestion() {
  showMenu();
  rl.question('Enter choice (1-4): ', (answer) => {
    console.log('');
    
    switch(answer.trim()) {
      case '1':
        resetAllMatches();
        break;
      case '2':
        resetMainEvents();
        break;
      case '3':
        resetRegularMatches();
        break;
      case '4':
        console.log('Goodbye!');
        db.close();
        rl.close();
        return;
      default:
        console.log('Invalid choice. Please select 1-4.');
    }
    
    askQuestion();
  });
}

console.log('⚠ WARNING: This will permanently delete data from your database!');
console.log('⚠ Make sure the server is stopped before proceeding.\n');

askQuestion();
