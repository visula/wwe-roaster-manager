# WWE Universe Mode Manager - Complete Package

## What You're Getting

A complete, production-ready web application for managing WWE 2K26 Universe Mode with:
- ✅ Roster management (add/edit/delete wrestlers across 6 shows)
- ✅ Match scheduling and tracking (with results)
- ✅ Championship system (track holders and history)
- ✅ Roster transfers (move wrestlers between brands)
- ✅ Dashboard (stats and upcoming matches)
- ✅ Database (SQLite - local, no cloud needed)
- ✅ Professional UI (responsive, mobile-friendly)

## Files Provided

### Core Application Files
1. **package.json** - Node.js dependencies and configuration
2. **server-index.js** - Main Express server (rename to server/index.js)
3. **db.js** - SQLite database manager (place in server/ folder)
4. **public-index.html** - Web UI (rename to public/index.html)

### Documentation
5. **README-WWE-PROJECT.md** - Project overview
6. **SETUP-GUIDE.md** - Detailed setup instructions
7. **setup-windows.bat** - Automated Windows setup
8. **THIS FILE** - Complete package guide

## Quick Start (3 Steps)

### Step 1: Setup Folder Structure
```
wwe-universe-mode/
├── server/
│   ├── index.js (from server-index.js)
│   └── db.js
├── public/
│   └── index.html (from public-index.html)
├── package.json
└── data/ (auto-created)
```

### Step 2: Install & Start
```bash
cd wwe-universe-mode
npm install
npm start
```

### Step 3: Access Application
Open browser to: **http://localhost:5000**

## Features Breakdown

### 1. Dashboard
- Total wrestlers count
- Wrestler distribution by show (RAW, Smackdown, NXT, TNA, AAA, AEW)
- Upcoming matches (next 5)
- Active championships

### 2. Roster Management
- Add wrestlers with name, show assignment, division, status
- Edit wrestler information
- Delete wrestlers
- Filter by show or search by name
- Status tracking (Active, Injured, Inactive)
- Divisions: Heavyweight, Cruiserweight, Women's, Tag Team

### 3. Match Management
- Schedule matches with participants
- Multiple match types: Singles, Tag Team, Triple Threat, Fatal 4-Way, Championship
- Set match date and time
- Track match results (Pending/Completed)
- Record winner
- Add match notes
- Filter by show and status

### 4. Championship System
- Create championships for each show
- Track current title holders
- Set championship debut date
- View championship history
- Record title changes
- Maintains complete lineage

### 5. Roster Transfers
- Record wrestler transfers between shows
- Track transfer date and reason
- Maintain complete transfer history
- Auto-updates wrestler show assignment

### 6. Dashboard Stats
- Real-time statistics
- Upcoming match alerts
- Show roster breakdown
- Championship holder tracking

## Shows Included

Pre-configured shows:
1. **RAW** - Primary WWE brand
2. **Smackdown** - Secondary WWE brand
3. **NXT** - WWE development brand
4. **TNA** - Impact Wrestling
5. **AAA** - Mexican promotion
6. **AEW** - All Elite Wrestling

## Database Structure

**SQLite Database**: `data/wwe-universe.db`

Tables:
- `shows` - Brand information
- `wrestlers` - All roster members
- `matches` - Match schedule and results
- `championships` - Title information
- `championship_history` - Title change history
- `roster_transfers` - Transfer records
- `match_history` - Match participant tracking

## System Requirements

- **Node.js** 14+ (from https://nodejs.org)
- **Modern Browser** (Chrome, Firefox, Edge, Safari)
- **Windows, Mac, or Linux**
- **Minimum 100MB disk space**

## Installation Methods

### Windows Users - Automated Setup
Double-click `setup-windows.bat` to automatically:
1. Check Node.js installation
2. Create project structure
3. Install dependencies
4. Verify all files

### Manual Setup (All Platforms)
```bash
# Create project folder
mkdir wwe-universe-mode
cd wwe-universe-mode

# Copy files to proper locations:
# - server-index.js → server/index.js
# - db.js → server/db.js
# - public-index.html → public/index.html
# - package.json → package.json

# Install dependencies
npm install

# Start server
npm start
```

## Using the Application

### Adding Your First Wrestler
1. Click "Roster" tab
2. Click "+ Add Wrestler"
3. Enter name and select show
4. Choose division (or leave Unassigned)
5. Set status to Active
6. Click Save

### Importing from Your Excel Sheet
Your Excel sheet has:
- WWE Universal [Roster information] - Add wrestlers here
- Sections [Category segregation] - Reference for divisions
- Match sheets per show - Add matches here

Manually enter each item via the UI, or we can build an import tool if needed.

### Scheduling a Match
1. Click "Matches" tab
2. Click "+ Schedule Match"
3. Select show and match type
4. Add participants (names from roster)
5. Set date/time
6. Click Save

## API Endpoints (for advanced users)

Base URL: `http://localhost:5000/api`

Wrestlers:
- `GET /wrestlers` - Get all
- `POST /wrestlers` - Add new
- `PUT /wrestlers/:id` - Update
- `DELETE /wrestlers/:id` - Delete

Matches:
- `GET /matches` - Get all
- `POST /matches` - Schedule
- `PUT /matches/:id` - Update
- `DELETE /matches/:id` - Delete

Championships:
- `GET /championships` - Get all
- `POST /championships` - Add
- `PUT /championships/:id` - Update

Transfers:
- `GET /transfers` - Get all
- `POST /transfers` - Record

## Troubleshooting

### "npm: command not found"
→ Node.js not installed. Download from https://nodejs.org

### "Cannot find module"
→ Run `npm install` again in the project folder

### Port 5000 already in use
→ Change PORT in server/index.js or use: `set PORT=5001 && npm start`

### Database errors
→ Delete `data/wwe-universe.db` and restart (it will recreate)

### Data not showing
→ Check browser console (F12) for errors
→ Make sure server is running (should see message on startup)

## Customization

### Change Colors
Edit `public/index.html` line ~30:
```css
--primary: #ffd700;      /* Gold */
--secondary: #000;       /* Black */
--accent: #ff0000;       /* Red */
```

### Add Match Types
Edit `public/index.html` around line ~1200:
```html
<option value="Your New Type">Your New Type</option>
```

### Add Divisions
Same location - look for divisions dropdown

## Support

If you encounter issues:
1. **Check the terminal** for error messages when starting server
2. **Use F12** in browser to see JavaScript errors
3. **Verify folder structure** - must have server/, public/, and package.json
4. **Re-run npm install** - sometimes node_modules gets corrupted
5. **Check Node.js version** - `node --version` should be 14+

## Features Not Yet Implemented

- Excel import/export (can be added)
- User authentication (single user assumed)
- Multiple database backups (manual backups recommended)
- Mobile app (web version is responsive)

These can be added if needed!

## Future Enhancement Ideas

1. **Excel Importer** - Bulk import from your existing sheet
2. **Match Ratings** - Add match quality ratings
3. **Storyline Tracking** - Track feuds and storylines
4. **Statistics** - Win-loss records, PPV attendance
5. **Calendar Export** - Export to Google Calendar
6. **REST API Documentation** - Swagger/OpenAPI
7. **Data Backup/Restore** - Automatic backups
8. **Report Generation** - PDF reports and statistics

## Next Steps

1. ✅ Copy all files to correct locations
2. ✅ Run `npm install`
3. ✅ Run `npm start`
4. ✅ Open http://localhost:5000
5. ✅ Start adding your universe mode data
6. ✅ Enjoy managing your WWE 2K26 experience!

## Contact & Support

For issues with:
- **Installation** - Check SETUP-GUIDE.md
- **Features** - Check this file and the UI help
- **Errors** - Look at browser console (F12) and terminal output

---

**Congratulations!** You now have a professional WWE Universe Mode management system. 

Happy wrestling! 🎭👑

