# WWE Universe Mode Manager

A comprehensive web application for managing WWE 2K26 Universe Mode, featuring roster management, match scheduling, championships tracking, transfers, storylines, and main events.

![Version](https://img.shields.io/badge/version-2.0.0-red)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

### Core Management
- **Dashboard**: Real-time statistics and upcoming matches overview
- **Roster Management**: Complete wrestler database with divisions, shows, and status tracking
- **Match Scheduling**: Advanced match booking system with 30+ match types
- **Championships**: Title management with holder tracking and history
- **Transfers**: Brand switches with reason tracking and revert functionality
- **Shows Management**: Weekly shows and special events configuration

### Advanced Features
- **Storylines System**: Flag and track important storyline matches
- **Main Events**: Create major events (WrestleMania, Royal Rumble) with multi-show rosters
- **Match Categories**: 18+ match stipulations (Hell in a Cell, Ladder, TLC, etc.)
- **Cross-Show Matches**: Special matches with wrestlers from multiple brands
- **Season Planning**: Week-by-week calendar with automated date scheduling
- **CSV Import/Export**: Bulk data management for roster and championships

### Customization
- **Configurable Match Types**: Add/remove match types via Season Setup
- **Configurable Match Categories**: Customize match stipulations
- **Multi-Show Support**: Manage RAW, SmackDown, NXT, AEW, TNA, AAA, and custom brands
- **Dark Mode UI**: WWE-inspired red and black theme

---

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Quick Start Guide](#quick-start-guide)
- [Configuration](#configuration)
- [User Guide](#user-guide)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 💻 System Requirements

### Prerequisites
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Modern Web Browser**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

### Recommended System Specs
- **RAM**: 2GB minimum
- **Storage**: 100MB free space
- **Internet**: Not required (runs locally)

---

## 🚀 Installation

### Step 1: Clone or Download Repository
```bash
git clone https://github.com/yourusername/wwe-universe-manager.git
cd wwe-universe-manager
```

Or download ZIP and extract to your preferred location.

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- Express.js (web server)
- better-sqlite3 (database)
- cors (cross-origin support)

### Step 3: Verify Installation
Check that the following files exist:
```
wwe-universe-manager/
├── server/
│   ├── index.js
│   └── db.js
├── public/
│   └── index.html
├── package.json
└── README.md
```

---

## ⚡ Quick Start Guide

### Starting the Application

1. **Start the Server**
   ```bash
   npm start
   ```
   
   You should see:
   ```
   Server running on http://localhost:5000
   Database initialized successfully
   ```

2. **Open the Application**
   - Open your web browser
   - Navigate to: `http://localhost:5000`
   - The dashboard should load automatically

3. **Initial Setup** (First Time Users)
   - Click **"Season Setup"** tab
   - Import default roster: Click **"Import Default Roster"**
   - Import default championships: Click **"Import Default Championships"**
   - Set season start date (optional)

4. **Add Your First Show**
   - Go to **"Shows"** tab
   - Click **"+ Add Show"**
   - Fill in show details (RAW, SmackDown, etc.)
   - Click **"Save"**

5. **Schedule Your First Match**
   - Go to **"Matches"** tab
   - Click **"+ Schedule Match"**
   - Select show, match type, participants
   - Click **"Save"**

---

## ⚙️ Configuration

### Database Configuration
- **Location**: `./universe.db` (auto-created on first run)
- **Type**: SQLite3
- **Backup**: Copy `universe.db` file to backup location

### Server Configuration
Edit `server/index.js` to change:
- **Port**: Default `5000` (line 4: `const PORT = 5000;`)
- **CORS**: Allowed origins (line 8)

### Match Configuration
In the application:
1. Go to **Season Setup** → **Match Configuration**
2. Edit **Match Categories** (one per line)
3. Edit **Match Types** (one per line)
4. Click **Save** buttons
5. Changes persist in browser localStorage

### Season Calendar Setup
1. Go to **Season Setup**
2. Enter any date in the week you want to start
3. Click **"Apply Start Date"**
4. Preview shows the calculated dates for all weekly shows

---

## 📖 User Guide

### Dashboard
- **Statistics Cards**: Total wrestlers, matches, championships, shows
- **Upcoming Matches**: Next scheduled matches across all brands
- **Show Breakdown**: Roster count per brand

### Roster Management

#### Adding Wrestlers
1. Click **"+ Add Wrestler"**
2. Fill in details:
   - Name (required)
   - Show/Brand (required)
   - Division: Heavyweight, Cruiserweight, Women's, Tag Team, Unassigned
   - Status: Active, Injured, Inactive
   - Image URL (optional)
3. Click **"Save"**

#### Editing Wrestlers
- Click **"Edit"** button on any wrestler row
- Modify fields
- Click **"Save"**

#### Filtering
- **By Show**: Dropdown filter
- **By Name/Division**: Search box

#### Bulk Import/Export
- **Export**: Season Setup → Export Roster CSV
- **Edit**: Open CSV in Excel/Google Sheets
- **Import**: Season Setup → Import Roster CSV

### Match Scheduling

#### Regular Matches
1. Click **"+ Schedule Match"**
2. Select **Show** (auto-populates date based on broadcast day)
3. Choose **Match Category** (Normal, Hell in a Cell, Ladder, etc.)
4. Choose **Match Type** (1v1, Triple Threat, Fatal 4-Way, etc.)
5. Select **Participants** (filtered by show, or all if cross-show match)
6. Optional: Add **Championship** on the line
7. Optional: Check **⭐ Storyline** for important matches
8. Set **Status**: Pending or Completed
9. If Completed, select **Winner**
10. Click **"Save"**

#### Match Types (30+)
- **Singles**: 1v1, Triple Threat, Fatal 4-Way, 5-Way, 6-Way, 8-Way
- **Tag Team**: 2v2, 3v3, 4v4, Tornado Tag variants
- **Handicap**: 1v2, 1v3, 2v3
- **Specialty**: Hell in a Cell, Ladder, TLC, Steel Cage, Tables
- **Extreme**: Last Man Standing, Iron Man, Submission, I Quit
- **Other**: Battle Royal, Ambulance, Casket, 3 Stages of Hell

#### Match Categories (18+)
- Normal, Tag Team, Handicap
- Extreme Rules, Falls Count Anywhere, No Holds Barred
- Hell in a Cell, Steel Cage, Tables, Ladder, TLC
- Submission, Last Man Standing, Iron Man
- Backstage Brawl, Battle Royal, Promo, Special Matches

#### Cross-Show Matches
Automatically enabled for:
- Battle Royal
- Special stipulation matches (Ambulance, Casket, etc.)
- Shows all wrestlers regardless of brand

#### Special Event Matches
For special shows (WrestleMania, SummerSlam):
1. Create show with type **"Special"**
2. Select up to 3 **eligible source shows**
3. When scheduling matches, wrestlers from all eligible shows appear

### Championships

#### Adding Championships
1. Click **"+ Add Championship"**
2. Fill in:
   - Title Name (e.g., "WWE Championship")
   - Show (brand)
   - Current Holder (dropdown filtered by show, or "Vacant")
   - Debut Date
   - Notes (optional)
3. Click **"Save"**

#### Championship Matches
- When scheduling a match, select championship from dropdown
- Only championships from the match's show appear
- Winner auto-updates title holder (manual update required currently)

### Transfers

#### Recording Transfers
1. Click **"+ New Transfer"**
2. Select **From Show** (populates wrestler list)
3. Select **Wrestler**
4. Select **To Show**
5. Enter **Date** and **Reason**
6. Click **"Save"**
7. Wrestler's brand automatically updates

#### Reverting Transfers
- Click **"Revert"** button
- Wrestler moves back to original show
- Transfer record deleted

### Storylines

#### Marking Storylines
- When scheduling/editing match, check **⭐ Storyline** checkbox
- Match appears in **Storylines** tab
- Badge appears in **Matches** tab

#### Storylines Tab
- Shows only matches marked as storylines
- Filter by show and status
- Edit/Delete functionality

### Main Events System

#### Creating Main Events
1. Go to **"Main Events"** tab
2. Click **"+ Create Main Event"**
3. Fill in:
   - Event Name (e.g., "WrestleMania 41")
   - Show (primary brand)
   - Date & Time
   - Participating Shows (up to 3 brands for cross-brand matches)
4. Click **"Save Event"**

#### Adding Matches to Main Events
1. Event card appears with **"+ Add Match"** button
2. Click **"+ Add Match"**
3. Use **"Filter by Show"** dropdown:
   - Select specific show: Only wrestlers from that show
   - Select "All (Cross-show)": All wrestlers from all pool shows
4. Choose **Match Category** and **Match Type**
5. Select **Participants** (from filtered pool)
6. Optional: Add **Championship**
7. Set **Status** and **Winner** (if completed)
8. Click **"Save Match"**

#### Main Event Match Types
- Standard types: 1v1, Triple Threat, Fatal 4-Way, etc.
- Special: Hell in a Cell, Ladder, TLC, Steel Cage
- Main Event Exclusives: Elimination Chamber, Royal Rumble, War Games

#### Managing Main Events
- **Edit Event**: Click "Edit" on event header
- **Edit Match**: Click "Edit" on individual match
- **Delete Match**: Removes only that match
- **Delete Event**: Removes event + all its matches

### Shows Management

#### Adding Shows
1. Go to **"Shows"** tab
2. Click **"+ Add Show"**
3. Fill in:
   - Show Name (e.g., "Monday Night RAW")
   - Abbreviation (e.g., "RAW")
   - Show Type: Weekly or Special
   - Broadcast Day (for weekly shows)
4. For Special Shows:
   - Select up to 3 eligible source shows
   - Set match limit (1-9)
5. Click **"Save"**

#### Show Types
- **Weekly**: Regular episodic shows (RAW, SmackDown, NXT)
- **Special**: One-time events (WrestleMania, Royal Rumble)

#### Broadcast Days
Used for:
- Auto-populating match dates
- Season calendar calculations
- Dashboard upcoming matches sorting

### Season Setup

#### 📅 Season Start Date
1. Enter any date in the starting week
2. Click **"Apply Start Date"**
3. System calculates next show date for each weekly show
4. Preview shows calculated dates

#### 🎯 Match Configuration
1. **Match Categories**: Edit list (one per line), click "Save Categories"
2. **Match Types**: Edit list (one per line), click "Save Types"
3. Changes apply to all match scheduling modals

#### 📤 Export Current Data
- **Export Roster CSV**: Downloads wrestler data
- **Export Championships CSV**: Downloads title data
- Edit in Excel/Sheets for bulk updates

#### 📥 Import Updated Data
- **Import Roster CSV**: Updates existing wrestlers by ID
- **Import Championships CSV**: Updates existing titles by ID
- Shows success/error count

#### 👥 Import Default Roster
- **Import Default Roster**: Adds 90+ default wrestlers (skips duplicates)
- **Clear All & Import Fresh**: Deletes all wrestlers, imports defaults

#### 👑 Import Default Championships
- **Import Default Championships**: Adds 27 default titles (skips duplicates)
- **Clear All & Import Fresh**: Deletes all titles, imports defaults

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Wrestlers
```http
GET    /api/wrestlers          # Get all wrestlers
POST   /api/wrestlers          # Create wrestler
GET    /api/wrestlers/:id      # Get single wrestler
PUT    /api/wrestlers/:id      # Update wrestler
DELETE /api/wrestlers/:id      # Delete wrestler
```

**Request Body (POST/PUT)**:
```json
{
  "name": "John Cena",
  "show": "RAW",
  "division": "Heavyweight",
  "status": "Active",
  "imageUrl": ""
}
```

#### Matches
```http
GET    /api/matches            # Get all matches
POST   /api/matches            # Create match
GET    /api/matches/:id        # Get single match
PUT    /api/matches/:id        # Update match
DELETE /api/matches/:id        # Delete match
```

**Request Body (POST/PUT)**:
```json
{
  "show": "RAW",
  "type": "One vs One",
  "category": "Hell in a Cell",
  "participant1": "John Cena",
  "participant2": "Randy Orton",
  "participant3": null,
  "participant4": null,
  "date": "2025-01-20T20:00:00",
  "result": "Pending",
  "winner": null,
  "notes": "",
  "championshipId": 1,
  "isImportant": 0
}
```

#### Championships
```http
GET    /api/championships      # Get all championships
POST   /api/championships      # Create championship
GET    /api/championships/:id  # Get single championship
PUT    /api/championships/:id  # Update championship
DELETE /api/championships/:id  # Delete championship
```

**Request Body (POST/PUT)**:
```json
{
  "name": "WWE Championship",
  "show": "RAW",
  "holder": "John Cena",
  "debutDate": "2002-01-01",
  "notes": ""
}
```

#### Transfers
```http
GET    /api/transfers          # Get all transfers
POST   /api/transfers          # Create transfer
DELETE /api/transfers/:id      # Delete transfer (revert)
```

**Request Body (POST)**:
```json
{
  "wrestlerId": 1,
  "fromShow": "RAW",
  "toShow": "SmackDown",
  "date": "2025-01-20",
  "reason": "Draft pick"
}
```

#### Shows
```http
GET    /api/shows              # Get all shows
POST   /api/shows              # Create show
GET    /api/shows/:id          # Get single show
PUT    /api/shows/:id          # Update show
DELETE /api/shows/:id          # Delete show
```

**Request Body (POST/PUT)**:
```json
{
  "name": "Monday Night RAW",
  "abbreviation": "RAW",
  "showType": "Weekly",
  "day": "Monday",
  "matchLimit": null,
  "eligibleShows": []
}
```

#### Dashboard Stats
```http
GET    /api/dashboard/stats    # Get dashboard statistics
```

**Response**:
```json
{
  "totalWrestlers": 95,
  "upcomingMatches": [...],
  "championships": [...],
  "showBreakdown": [
    {"show": "RAW", "count": 30},
    {"show": "SmackDown", "count": 28}
  ]
}
```

---

## 🗄️ Database Schema

### Tables

#### wrestlers
```sql
CREATE TABLE wrestlers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  show TEXT,
  division TEXT DEFAULT 'Unassigned',
  status TEXT DEFAULT 'Active',
  imageUrl TEXT
);
```

#### matches
```sql
CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  participant1 TEXT,
  participant2 TEXT,
  participant3 TEXT,
  participant4 TEXT,
  date TEXT NOT NULL,
  result TEXT DEFAULT 'Pending',
  winner TEXT,
  notes TEXT,
  championshipId INTEGER,
  isImportant INTEGER DEFAULT 0
);
```

#### championships
```sql
CREATE TABLE championships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  show TEXT,
  holder TEXT DEFAULT 'Vacant',
  debutDate TEXT,
  notes TEXT
);
```

#### transfers
```sql
CREATE TABLE transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wrestlerId INTEGER NOT NULL,
  fromShow TEXT NOT NULL,
  toShow TEXT NOT NULL,
  date TEXT NOT NULL,
  reason TEXT,
  FOREIGN KEY (wrestlerId) REFERENCES wrestlers(id)
);
```

#### shows
```sql
CREATE TABLE shows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL,
  day TEXT,
  showType TEXT DEFAULT 'Weekly',
  matchLimit INTEGER,
  eligibleShows TEXT
);
```

### Special Data Formats

#### Main Events (stored in matches table)
- **Event Header**: `notes` contains `[MEEVENT][MENAME:EventName][POOLS:show1,show2,show3]`
- **Event Match**: `notes` contains `[MEMATCH:eventId] + user notes`
- `isImportant` = 1 for all main event records

#### Storylines
- Regular matches with `isImportant` = 1
- No special tags in notes field

---

## 🛠️ Troubleshooting

### Server Won't Start

**Error**: `Port 5000 already in use`
- **Solution**: Change port in `server/index.js` or kill process using port 5000
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```

**Error**: `Cannot find module 'express'`
- **Solution**: Run `npm install` in project directory

### Database Issues

**Error**: Database locked
- **Solution**: Close all other instances of the app, restart server

**Error**: Data not saving
- **Solution**: Check file permissions on `universe.db`, ensure write access

### Browser Issues

**Blank page**
- Check browser console (F12) for errors
- Verify server is running at `http://localhost:5000`
- Clear browser cache and reload

**Dropdowns empty**
- Wait for data to load (2-3 seconds on first launch)
- Check Network tab in browser DevTools for failed requests
- Verify API is responding: Open `http://localhost:5000/api/wrestlers`

### Match Configuration Not Saving

**Categories/Types reset**
- **Cause**: localStorage cleared
- **Solution**: Re-save configurations in Season Setup → Match Configuration

### CSV Import Fails

**Error**: "Select a CSV file first"
- **Solution**: Click "Choose File" button before clicking Import

**Error**: High error count
- **Solution**: Verify CSV format matches export format (check column names and order)

---

## 🔄 Backup & Restore

### Backing Up Data
1. **Stop the server** (Ctrl+C)
2. **Copy database file**:
   ```bash
   cp universe.db universe-backup-2025-01-20.db
   ```
3. **Restart server**: `npm start`

### Restoring Data
1. **Stop the server**
2. **Replace database**:
   ```bash
   cp universe-backup-2025-01-20.db universe.db
   ```
3. **Restart server**

### Exporting All Data
1. Go to Season Setup
2. Click **"Export Roster CSV"**
3. Click **"Export Championships CSV"**
4. Save both files in safe location
5. For matches, manually backup `universe.db`

---

## 🚢 Deployment

### Running on Different Port
1. Edit `server/index.js`, line 4:
   ```javascript
   const PORT = 3000; // Change from 5000
   ```
2. Restart server
3. Access at `http://localhost:3000`

### Running on Network
1. Edit `server/index.js`, add:
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on http://0.0.0.0:${PORT}`);
   });
   ```
2. Find your IP address:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
3. Access from other devices: `http://YOUR_IP:5000`

### Production Considerations
- Use environment variables for configuration
- Add authentication/authorization
- Implement proper error handling
- Add request rate limiting
- Use production database (PostgreSQL, MySQL)
- Enable HTTPS
- Add logging system

---

## 🤝 Contributing

### Reporting Issues
1. Check existing issues on GitHub
2. Provide detailed description
3. Include steps to reproduce
4. Share error messages/screenshots

### Feature Requests
- Open issue with `[FEATURE]` prefix
- Describe use case and expected behavior
- Explain why it benefits Universe Mode management

### Code Contributions
1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 📧 Support

- **Issues**: GitHub Issues
- **Email**: support@example.com
- **Documentation**: This README + SYSTEM_DOCUMENTATION.md

---

## 🎮 Default Data

### Default Shows
- RAW (Monday)
- SmackDown (Friday)
- NXT (Thursday)
- AEW (Thursday)
- TNA (Tuesday)
- AAA (Wednesday)

### Default Wrestlers
90+ wrestlers including:
- RAW: CM Punk, Seth Rollins, Becky Lynch, etc.
- SmackDown: Cody Rhodes, Charlotte Flair, Randy Orton, etc.
- NXT: Trick Williams, Roxanne Perez, etc.
- AEW: Kenny Omega, Bryan Danielson, Jon Moxley, etc.
- TNA: Joe Hendry, AJ Styles, Nic Nemeth, etc.

### Default Championships
27 titles including:
- WWE: World Heavyweight, WWE, Intercontinental, US, Tag Team titles
- NXT: NXT Championship, North American, Tag Team titles
- AEW: World, Continental, Tag Team, Women's titles
- AAA: Mega, Latin American, Reina de Reinas titles

---

## 🎯 Roadmap

### Planned Features
- [ ] Automatic title changes on match completion
- [ ] Win/Loss records per wrestler
- [ ] Rivalry tracking system
- [ ] Match history timeline
- [ ] Custom report generation
- [ ] Mobile responsive design
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Cloud sync option
- [ ] PWA (Progressive Web App) support

---

## 📊 Version History

### v2.0.0 (2025-01-20)
- Added Main Events system
- Added Storylines tracking
- Added Match Categories (18+ types)
- Added configurable match types and categories
- WWE dark theme redesign
- Season calendar planning
- CSV import/export

### v1.0.0 (2024-12-01)
- Initial release
- Basic roster, match, championship management
- Transfers system
- Dashboard statistics

---

**Made with ❤️ for WWE Universe Mode players**
