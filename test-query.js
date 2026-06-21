import Database from 'better-sqlite3';

const db = new Database('./data/wwe-universe.db');

console.log('=== AAA Female Wrestlers ===');
const aaaFemales = db.prepare(`
  SELECT w.id, w.name, w.gender, ws.showName 
  FROM wrestlers w 
  INNER JOIN wrestler_shows ws ON w.id = ws.wrestlerId 
  WHERE ws.showName = 'AAA' AND w.gender = 'Female'
  ORDER BY w.name
`).all();
console.log('Count:', aaaFemales.length);
console.log(aaaFemales);

console.log('\n=== Show Breakdown Query Result ===');
const breakdown = db.prepare(`
  SELECT ws.showName as show, COUNT(DISTINCT ws.wrestlerId) as count,
  SUM(CASE WHEN w.gender = 'Male' THEN 1 ELSE 0 END) as maleCount,
  SUM(CASE WHEN w.gender = 'Female' THEN 1 ELSE 0 END) as femaleCount
  FROM wrestler_shows ws 
  INNER JOIN wrestlers w ON ws.wrestlerId = w.id
  WHERE ws.showName = 'AAA'
  GROUP BY ws.showName
`).get();
console.log(breakdown);

console.log('\n=== All AAA Wrestlers ===');
const allAAA = db.prepare(`
  SELECT w.id, w.name, w.gender
  FROM wrestlers w 
  INNER JOIN wrestler_shows ws ON w.id = ws.wrestlerId 
  WHERE ws.showName = 'AAA'
  ORDER BY w.gender, w.name
`).all();
console.log('Total:', allAAA.length);
allAAA.forEach(w => console.log(`${w.id}: ${w.name} - ${w.gender || 'NULL'}`));

db.close();
