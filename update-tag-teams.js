import Database from './server/db.js';

const db = new Database();
db.init();

// Map of team name to their members
const teamMembersMap = {};

const tagTeamData = [
  {name:'Adam Cole',team:'MJF and stable'},
  {name:'AJ Lee',team:'AJ Lee & CM Punk'},
  {name:'Akira Tozawa',team:'Alpha Academy'},
  {name:'Alba Fyre',team:'Chelsea Green & The Secret Service'},
  {name:'Aleister Black',team:'House of Black'},
  {name:'Alex Shelley',team:'Motor City Machine Guns'},
  {name:'Alexa Bliss',team:'Alexa Bliss & Charlotte Flair'},
  {name:'Angel',team:'Los Garza'},
  {name:'Angelo Dawkins',team:'The Street Profits'},
  {name:'Asuka',team:'The Kabuki Warriors'},
  {name:'Austin Theory',team:'The Vision'},
  {name:'Axiom',team:'Fraxiom'},
  {name:'B-Fab',team:'The Takeover'},
  {name:'Bayley',team:'Role Model & Valkyria'},
  {name:'Berto',team:'Los Garza'},
  {name:'Bravo Americano',team:'Los Americanos'},
  {name:'Brody King',team:'House of Black'},
  {name:'Bron Breakker',team:'The Vision'},
  {name:'Bronson Reed',team:'The Vision'},
  {name:'Brutus Creed',team:'American Made'},
  {name:'Bubba Ray Dudley',team:'The Dudley Boyz'},
  {name:'Buddy Matthews',team:'House of Black'},
  {name:'Buzz',team:'MJF and stable'},
  {name:'Candice LeRae',team:'#DIY'},
  {name:'Cash Wheeler',team:'FTR'},
  {name:'Channing Lorenzo',team:'Birth Right'},
  {name:'Charlie Dempsey',team:'Birth Right'},
  {name:'Charlotte Flair',team:'Alexa Bliss & Charlotte Flair'},
  {name:'Chase',team:'Tre & Chase'},
  {name:'Chelsea Green',team:'Chelsea Green & The Secret Service'},
  {name:'Chris Jericho',team:'Old Buddies'},
  {name:'Chris Sabin',team:'Motor City Machine Guns'},
  {name:'Christian Cage',team:'Old Buddies'},
  {name:'Claudio Castagnoli',team:'Death Riders'},
  {name:'CM Punk',team:'AJ Lee & CM Punk'},
  {name:'Cruz Del Toro',team:'LWO - Latino World Order'},
  {name:'D-Von Dudley',team:'The Dudley Boyz'},
  {name:'Damian Priest',team:'Damian Priest & R-Truth'},
  {name:'Darby Allin',team:'Sting & Darby'},
  {name:'Dax Harwood',team:'FTR'},
  {name:'Dexter Lumis',team:'The Wyatt Sicks'},
  {name:'Dirty Dominik Mysterio',team:'The Judgment Day'},
  {name:'Dragon Lee',team:'LWO - Latino World Order'},
  {name:'Edge',team:'Old Buddies'},
  {name:'El Grande Americano',team:'Los Americanos'},
  {name:'Elton Prince',team:'Pretty Deadly'},
  {name:'Erick Rowan',team:'The Wyatt Sicks'},
  {name:'Erik',team:'The War Raiders'},
  {name:'Fallon Henley',team:'The Fatal Influence'},
  {name:'Flammer',team:'Las Toxicas'},
  {name:'Giulia',team:'Giulia & Kiana James'},
  {name:'Grayson Waller',team:'The New Day'},
  {name:'Hank Walker',team:'Hank & Tank'},
  {name:'Hope Eternal',team:'Red Eternal'},
  {name:'Ivar',team:'The War Raiders'},
  {name:'Ivy Nile',team:'American Made'},
  {name:'Iyo Sky',team:'Rhiyo'},
  {name:'Izzi Dame',team:'The Culling'},
  {name:'Jacy Jayne',team:'The Fatal Influence'},
  {name:'Jade Cargill',team:'The Takeover'},
  {name:'Jamal',team:'3 Minute Warning'},
  {name:'Jazmyn Nyx',team:'The Fatal Influence'},
  {name:'JC Mateo',team:'MFT'},
  {name:'JD McDonagh',team:'The Judgment Day'},
  {name:'Jey Uso',team:'The Usos'},
  {name:'Jimmy Uso',team:'The Usos'},
  {name:'Joaquin Wilde',team:'LWO - Latino World Order'},
  {name:'Joe Gacy',team:'The Wyatt Sicks'},
  {name:'Johnny Gargano',team:'#DIY'},
  {name:'Jon Moxley',team:'Death Riders'},
  {name:'Julia Hart',team:'House of Black'},
  {name:'Julius Creed',team:'American Made'},
  {name:'Kairi Sane',team:'The Kabuki Warriors'},
  {name:'Kalisto',team:'Lucha House Party'},
  {name:'Kane',team:'Brothers of Destruction'},
  {name:'Kiana James',team:'Giulia & Kiana James'},
  {name:'Kit Wilson',team:'Pretty Deadly'},
  {name:'Kofi Kingston',team:'The New Day'},
  {name:'La Hiedra',team:'Las Toxicas'},
  {name:'La Park',team:"LA Park's"},
  {name:'La Parka',team:"LA Park's"},
  {name:'Lash Legend',team:'The Irresistible Forces'},
  {name:'Matt Jackson',team:'Young Bucks'},
  {name:'Lexis King',team:'Birth Right'},
  {name:'Lince Dorado',team:'Lucha House Party'},
  {name:'Liv Morgan',team:'The Judgment Day'},
  {name:'LJ',team:'Local Rift'},
  {name:'Lock',team:'MJF and stable'},
  {name:'Logan Paul',team:'The Vision'},
  {name:'Lyra Valkyria',team:'Role Model & Valkyria'},
  {name:'Maryse',team:'The Miz & Maryse'},
  {name:'Maxxine Dupri',team:'Alpha Academy'},
  {name:'Michin',team:'The Takeover'},
  {name:'Miz',team:'The Miz & Maryse'},
  {name:'MJF',team:'MJF and stable'},
  {name:'Montez Ford',team:'The Street Profits'},
  {name:'Mosh',team:'The Head Bangers'},
  {name:'Nathan Frazer',team:'Fraxiom'},
  {name:'Nia Jax',team:'The Irresistible Forces'},
  {name:'Nick Jackson',team:'Young Bucks'},
  {name:'Nikki Cross',team:'The Wyatt Sicks'},
  {name:'Odyssey Rift',team:'Local Rift'},
  {name:'Otis',team:'Alpha Academy'},
  {name:'Pac',team:'Death Riders'},
  {name:'Perry Saturn',team:'The Flock'},
  {name:'Piper Niven',team:'Chelsea Green & The Secret Service'},
  {name:'R-Truth',team:'Damian Priest & R-Truth'},
  {name:'Raquel Rodriguez',team:'The Judgment Day'},
  {name:'Raven',team:'The Flock'},
  {name:'Red',team:'Red Eternal'},
  {name:'Rey Mysterio',team:'LWO - Latino World Order'},
  {name:'Rhea Ripley',team:'Rhiyo'},
  {name:'Rosey',team:'3 Minute Warning'},
  {name:'Roxanne Perez',team:'The Judgment Day'},
  {name:'Ryback',team:'MJF and stable'},
  {name:'Shawn Michaels',team:'D-Generation X'},
  {name:'Shawn Spears',team:'The Culling'},
  {name:'Sin Cara',team:'Lucha House Party'},
  {name:'Solo Sikoa',team:'MFT'},
  {name:'Sting',team:'Sting & Darby'},
  {name:'Talla Tonga',team:'MFT'},
  {name:'Tama Tonga',team:'MFT'},
  {name:'Tank Ledger',team:'Hank & Tank'},
  {name:'Thrasher',team:'The Head Bangers'},
  {name:'Tonga Loa',team:'MFT'},
  {name:'TRE',team:'Tre & Chase'},
  {name:'Triple H',team:'D-Generation X'},
  {name:'Uncle Howdy',team:'The Wyatt Sicks'},
  {name:'Undertaker',team:'Brothers of Destruction'},
  {name:'Wheeler Yuta',team:'Death Riders'},
  {name:'Xavier Woods',team:'The New Day'},
  {name:'Zelina Vega',team:'House of Black'}
];

console.log('🏷️  Step 1: Building team roster from tag data...\n');

const wrestlers = db.getAllWrestlers();

// Build team membership map
tagTeamData.forEach(entry => {
  const wrestler = wrestlers.find(w => 
    w.name.toLowerCase() === entry.name.toLowerCase() ||
    w.name.toLowerCase().includes(entry.name.toLowerCase()) ||
    entry.name.toLowerCase().includes(w.name.toLowerCase())
  );
  
  if (wrestler) {
    if (!teamMembersMap[entry.team]) {
      teamMembersMap[entry.team] = { members: [], shows: new Set() };
    }
    teamMembersMap[entry.team].members.push(wrestler.name);
    teamMembersMap[entry.team].shows.add(wrestler.show);
  }
});

console.log(`\n🏷️  Step 2: Creating/updating teams in database...\n`);

const existingTeams = db.getAllTeams();
let teamsCreated = 0;
let teamsUpdated = 0;

Object.entries(teamMembersMap).forEach(([teamName, data]) => {
  const members = [...new Set(data.members)]; // Remove duplicates
  const shows = [...data.shows];
  const primaryShow = shows.length === 1 ? shows[0] : null; // Only set show if all members are from same brand
  
  const existingTeam = existingTeams.find(t => t.name === teamName);
  
  try {
    if (existingTeam) {
      db.updateTeam(existingTeam.id, teamName, primaryShow, members);
      console.log(`🔄 Updated: ${teamName} (${members.length} members${primaryShow ? ` - ${primaryShow}` : ' - Multi-brand'})`);
      teamsUpdated++;
    } else {
      db.addTeam(teamName, primaryShow, members);
      console.log(`✅ Created: ${teamName} (${members.length} members${primaryShow ? ` - ${primaryShow}` : ' - Multi-brand'})`);
      teamsCreated++;
    }
  } catch (err) {
    console.log(`❌ Error with team ${teamName}: ${err.message}`);
  }
});

console.log(`\n🏷️  Step 3: Updating wrestler records with team info...\n`);

let wrestlersUpdated = 0;
let wrestlersNotFound = 0;

tagTeamData.forEach(entry => {
  const wrestler = wrestlers.find(w => 
    w.name.toLowerCase() === entry.name.toLowerCase() ||
    w.name.toLowerCase().includes(entry.name.toLowerCase()) ||
    entry.name.toLowerCase().includes(w.name.toLowerCase())
  );
  
  if (wrestler) {
    db.updateWrestler(
      wrestler.id,
      wrestler.name,
      wrestler.show,
      wrestler.division,
      wrestler.status,
      wrestler.imageUrl,
      wrestler.gender,
      wrestler.overall,
      wrestler.alignment,
      entry.team
    );
    wrestlersUpdated++;
  } else {
    console.log(`❌ Wrestler not found: ${entry.name}`);
    wrestlersNotFound++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Teams created: ${teamsCreated}`);
console.log(`   Teams updated: ${teamsUpdated}`);
console.log(`   Wrestlers updated: ${wrestlersUpdated}`);
console.log(`   Wrestlers not found: ${wrestlersNotFound}`);
console.log(`\n✨ Done! Check the Teams tab in your WWE Universe Manager.`);

db.close();
