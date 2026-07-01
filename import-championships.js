import Database from 'better-sqlite3';
const db = new Database('./universe.db');

// Create championships table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS championships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    show TEXT,
    holder TEXT DEFAULT 'Vacant',
    debutDate TEXT,
    notes TEXT
  )
`);

const championships = [
  { show: 'AEW', name: 'AEW World Championship', holder: 'Vacant' },
  { show: 'AEW', name: 'AEW World Tag Team Championship', holder: 'Vacant' },
  { show: 'AEW', name: 'AEW Continental Championship', holder: 'Chris Jericho' },
  { show: 'AEW', name: 'AEW Women\'s World Championship', holder: 'Vacant' },
  { show: 'AEW', name: 'AEW Women\'s World Tag Team Championship', holder: 'Vacant' },
  { show: 'AEW', name: 'AEW TBS Women\'s Championship', holder: 'Vacant' },
  { show: 'AEW', name: 'Money in the Bank AEW', holder: 'Vacant' },
  { show: 'RAW', name: 'World Height Weight Championship', holder: 'CM Punk' },
  { show: 'RAW', name: 'WWE Women\'s World Championship', holder: 'Stephanie Vaquer' },
  { show: 'RAW', name: 'WWE Intercontinental Championship', holder: 'Penta' },
  { show: 'RAW', name: 'World Tag Team Championship', holder: 'Uso\'s' },
  { show: 'RAW', name: 'WWE Women\'s Tag Team Champion', holder: 'Rhiyo' },
  { show: 'RAW', name: 'WWE Women\'s Intercontinental Championship', holder: 'Becky Lynch' },
  { show: 'RAW', name: 'Men\'s Money in the Bank', holder: 'Vacant' },
  { show: 'RAW', name: 'Women\'s Money in the Bank', holder: 'Vacant' },
  { show: 'SmackDown', name: 'Undisputed WWE Championship', holder: 'Drew McIntyre' },
  { show: 'SmackDown', name: 'WWE Women\'s Championship', holder: 'Jade Cargill' },
  { show: 'SmackDown', name: 'WWE United States Championship', holder: 'Carmelo Hayes' },
  { show: 'SmackDown', name: 'WWE Tag Team Championship', holder: 'Rhiyo' },
  { show: 'SmackDown', name: 'WWE Women\'s United States Championship', holder: 'Giulia' },
  { show: 'AAA', name: 'AAA Mega Championship', holder: 'Dominik Mysterio' },
  { show: 'AAA', name: 'AAA Latin American Championship', holder: 'Vacant' },
  { show: 'AAA', name: 'AAA Tag Team Championship', holder: 'Vacant' },
  { show: 'AAA', name: 'AAA Reina De Reinas Championship', holder: 'Flammer' },
  { show: 'AAA', name: 'Origyn Women\'s Championship', holder: 'Vacant' },
  { show: 'AAA', name: 'Lucha Underground', holder: 'Vacant' },
  { show: 'NXT', name: 'NXT Championship', holder: 'Vacant' },
  { show: 'NXT', name: 'NXT North American Championship', holder: 'Ethan Page' },
  { show: 'NXT', name: 'Nxt Tag Team Championship', holder: 'Hank & Tank' },
  { show: 'NXT', name: 'NXT Women\'s Championship', holder: 'Jacy Jayne' },
  { show: 'NXT', name: 'WWE Tag Team Championship', holder: 'Rhiyo' },
  { show: 'NXT', name: 'NXT Women\'s North American Championship', holder: 'Izzi Dame' }
];

const insert = db.prepare('INSERT INTO championships (name, show, holder, debutDate) VALUES (?, ?, ?, ?)');
const today = new Date().toISOString().split('T')[0];

let added = 0;
championships.forEach(c => {
  try {
    insert.run(c.name, c.show, c.holder, today);
    added++;
    console.log(`✓ ${c.name} - ${c.holder}`);
  } catch (err) {
    console.log(`⚠ Skipped: ${c.name}`);
  }
});

console.log(`\n${added} championships imported successfully`);
db.close();
