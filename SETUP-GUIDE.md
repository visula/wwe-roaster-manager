# WWE Universe Mode Manager - Setup Instructions

## Overview
A full-featured web application for managing WWE 2K26 Universe Mode with roster management, match scheduling, championship tracking, and roster transfers.

## System Requirements
- Node.js 14+ (download from https://nodejs.org)
- Windows, Mac, or Linux
- Modern web browser

## Installation & Setup

### Step 1: Prepare Project Folder
```bash
# Create a new directory for the project
mkdir wwe-universe-mode
cd wwe-universe-mode
```

### Step 2: Copy Project Files
Copy the following files from this package:
- `package.json` → root folder
- `server-index.js` → rename to `server/index.js` (create server folder)
- `db.js` → `server/db.js`
- `public-index.html` → rename to `public/index.html` (create public folder)

After copying, your folder structure should look like:
```
wwe-universe-mode/
├── server/
│   ├── index.js
│   └── db.js
├── public/
│   └── index.html
└── package.json
```

### Step 3: Install Dependencies
```bash
npm install
```

This will install:
- **Express** - Web server framework
- **SQLite3** - Local database
- **CORS** - Cross-origin requests
- **body-parser** - JSON parsing

### Step 4: Start the Application
```bash
npm start
```

You should see:
```
🎭 WWE Universe Mode Manager running on http://localhost:5000
📊 Database initialized at ./data/wwe-universe.db
```

### Step 5: Open in Browser
Go to: **http://localhost:5000**

## Features

### 1. Dashboard 📊
- View total wrestlers across all shows
- See upcoming matches
- Track championship counts
- View wrestler distribution by brand

### 2. Roster Management 👥
- Add/edit/delete wrestlers
- Assign wrestlers to shows: RAW, Smackdown, NXT, TNA, AAA, AEW
- Set division (Heavyweight, Cruiserweight, Women's, Tag Team)
- Track status (Active, Injured, Inactive)
- Search and filter by show

### 3. Match Management 🎯
- Schedule matches across all 6 brands
- Multiple match types: Singles, Tag Team, Triple Threat, Fatal 4-Way, Championship
- Track match results and winners
- View upcoming matches
- Add notes for special conditions

### 4. Championship System 👑
- Create championships per brand
- Track current title holders
- Maintain championship history
- Record title changes with dates

### 5. Roster Transfers 📋
- Record wrestler transfers between shows
- Track transfer dates and reasons
- Maintain complete transfer history

## Usage Guide

### Adding a Wrestler
1. Go to **Roster** tab
2. Click **+ Add Wrestler**
3. Fill in name, select show, division, and status
4. Click Save

### Scheduling a Match
1. Go to **Matches** tab
2. Click **+ Schedule Match**
3. Select show and date
4. Add participants (minimum 1)
5. Click Save

### Creating a Championship
1. Go to **Championships** tab
2. Click **+ Add Championship**
3. Enter title name, show, and current holder
4. Click Save

### Recording Transfers
1. Go to **Transfers** tab
2. Click **+ New Transfer**
3. Select wrestler, from show, to show, and date
4. Add transfer reason
5. Click Save

## Database

The application uses **SQLite** which stores data in:
```
wwe-universe-mode/data/wwe-universe.db
```

This file is automatically created on first run. It contains:
- **wrestlers** - All roster members
- **matches** - Scheduled and completed matches
- **championships** - Active titles and history
- **roster_transfers** - Transfer records
- **shows** - Brand information (RAW, Smackdown, etc.)

## Troubleshooting

### Port 5000 already in use
```bash
# Change port in server/index.js or:
set PORT=5001
npm start
```

### "Cannot find module" error
```bash
npm install
```

### Database errors
Delete `data/wwe-universe.db` and restart the app to reinitialize the database.

### CORS errors
Make sure you're accessing at **http://localhost:5000** (not 127.0.0.1 or other variants)

## API Endpoints

All endpoints are available at `http://localhost:5000/api/`

### Wrestlers
- `GET /wrestlers` - Get all wrestlers
- `GET /wrestlers?show=RAW` - Get wrestlers from specific show
- `POST /wrestlers` - Add new wrestler
- `PUT /wrestlers/:id` - Update wrestler
- `DELETE /wrestlers/:id` - Delete wrestler

### Matches
- `GET /matches` - Get all matches
- `GET /matches?show=RAW` - Get matches from specific show
- `POST /matches` - Schedule match
- `PUT /matches/:id` - Update match
- `DELETE /matches/:id` - Delete match

### Championships
- `GET /championships` - Get all championships
- `POST /championships` - Add championship
- `PUT /championships/:id` - Update championship
- `DELETE /championships/:id` - Delete championship

### Transfers
- `GET /transfers` - Get all transfers
- `POST /transfers` - Record transfer

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

## Advanced Features

### Importing from Excel
You can manually enter data from your Excel sheet into the application:
1. View your WWE Universal [Roster information] sheet
2. Add each wrestler via the Roster tab UI
3. Repeat for matches, championships, and show-specific data

### Exporting Data (Future)
Data is saved in SQLite. You can:
- Access raw data at `data/wwe-universe.db`
- Use DB browser tools to view/export

### Customization
Edit `public/index.html` to:
- Change colors (CSS variables in `<style>`)
- Add new match types in divisions
- Modify forms

## Support & Tips

- **Always refresh** if data doesn't update immediately
- **Backup your database** before making major changes (copy data/wwe-universe.db)
- **Use consistent wrestler names** for match tracking
- **Check browser console** (F12) if something isn't working

## Next Steps

1. Start the server: `npm start`
2. Open http://localhost:5000
3. Begin adding your wrestlers, matches, and championships
4. Use the dashboard to track your universe mode progress

Enjoy managing your WWE Universe Mode! 🎭👑
