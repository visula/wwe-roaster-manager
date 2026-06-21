import Database from 'better-sqlite3';

const db = new Database('./data/wwe-universe.db');

console.log('=== Wrestlers with AAA in old show column ===');
const oldShowAAA = db.prepare(`
  SELECT id, name, show, gender 
  FROM wrestlers 
  WHERE show = 'AAA'
  ORDER BY name
`).all();
console.log('Count:', oldShowAAA.length);
oldShowAAA.forEach(w => console.log(`${w.id}: ${w.name} (${w.gender || 'NULL'})`));

console.log('\n=== Wrestlers in wrestler_shows junction for AAA ===');
const junctionAAA = db.prepare(`
  SELECT w.id, w.name, w.gender, ws.showName
  FROM wrestler_shows ws
  INNER JOIN wrestlers w ON ws.wrestlerId = w.id
  WHERE ws.showName = 'AAA'
  ORDER BY w.name
`).all();
console.log('Count:', junctionAAA.length);
junctionAAA.forEach(w => console.log(`${w.id}: ${w.name} (${w.gender || 'NULL'})`));

console.log('\n=== Missing from junction table ===');
const missingIds = oldShowAAA.map(w => w.id).filter(id => !junctionAAA.find(j => j.id === id));
if (missingIds.length > 0) {
  console.log('IDs missing:', missingIds);
  missingIds.forEach(id => {
    const w = oldShowAAA.find(x => x.id === id);
    console.log(`${id}: ${w.name} (${w.gender || 'NULL'})`);
  });
}

db.close();
