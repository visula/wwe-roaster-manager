import DatabaseManager from './db.js';

const db = new DatabaseManager();
db.init();

console.log('\n=== DATABASE CHECK ===');
const wrestlers = db.getAllWrestlers();
const shows = db.getAllShows();
const stats = {
  totalWrestlers: db.getTotalWrestlers(),
  showBreakdown: db.getShowBreakdown(),
  totalShows: shows.length
};

console.log(`\n✅ Total wrestlers: ${stats.totalWrestlers}`);
console.log(`✅ Total shows: ${stats.totalShows}`);

if (stats.totalWrestlers === 0) {
  console.log('\n⚠️ WARNING: No wrestlers found in database!');
} else {
  console.log('\n✅ Show breakdown:');
  for (const item of stats.showBreakdown) {
    console.log(`   ${item.show}: ${item.count}`);
  }
  
  console.log('\n✅ Sample wrestlers:');
  wrestlers.slice(0, 5).forEach(w => {
    console.log(`   ${w.name} - ${w.show}`);
  });
}

console.log('\n✅ Registered shows:');
for (const show of shows) {
  console.log(`   ${show.name}`);
}

db.close();
process.exit(0);
