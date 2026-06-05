# WWE Universe Mode Manager - Quick Reference

## File Placement Guide

Copy files to the correct locations:

```
Your Project Folder (e.g., wwe-universe-mode)
│
├── 📄 package.json
│   └── Copy from: package.json
│
├── 📁 server/
│   ├── 📄 index.js
│   │   └── Copy from: server-index.js (rename it)
│   └── 📄 db.js
│       └── Copy from: db.js
│
├── 📁 public/
│   └── 📄 index.html
│       └── Copy from: public-index.html (rename it)
│
└── 📁 data/
    └── (auto-created by app)
        └── wwe-universe.db
```

## Installation Commands

```bash
# 1. Navigate to your project folder
cd wwe-universe-mode

# 2. Install dependencies (one-time only)
npm install

# 3. Start the server
npm start

# 4. Open in browser
# http://localhost:5000
```

## Shows Available

| Show | Abbreviation | Use For |
|------|--------------|---------|
| RAW | RAW | Monday Night RAW brand |
| Smackdown | SD | Friday Night Smackdown |
| NXT | NXT | WWE developmental brand |
| TNA | TNA | Impact Wrestling |
| AAA | AAA | Mexican promotion |
| AEW | AEW | All Elite Wrestling |

## Wrestler Divisions

- **Heavyweight** - Main event singles wrestlers
- **Cruiserweight** - Lighter, high-flying wrestlers
- **Women's** - Women's division wrestlers
- **Tag Team** - Tag team specialists
- **Unassigned** - Default/unknown

## Match Types

- **Singles** - 1v1 match
- **Tag Team** - 2v2 team match
- **Triple Threat** - 3-way match
- **Fatal 4-Way** - 4-way match
- **Championship** - Title defense

## Wrestler Status

- **Active** - Available to compete
- **Injured** - Sidelined but not gone
- **Inactive** - On leave or retired

## How To...

### Add a Wrestler
1. Click "Roster" tab
2. Click "+ Add Wrestler"
3. Fill form → Click Save

### Schedule a Match
1. Click "Matches" tab
2. Click "+ Schedule Match"
3. Select show, date, participants
4. Click Save

### Create a Championship
1. Click "Championships" tab
2. Click "+ Add Championship"
3. Enter title name, show, holder
4. Click Save

### Record a Transfer
1. Click "Transfers" tab
2. Click "+ New Transfer"
3. Select wrestler, shows, date
4. Click Save

### Mark Match as Completed
1. Click "Matches" tab
2. Click "Edit" on match
3. Set Result to "Completed"
4. Enter winner name
5. Click Save

## Keyboard Shortcuts

| Action | How |
|--------|-----|
| Close Modal | Press Esc or click X |
| Search Roster | Type in search box |
| Filter by Show | Use dropdown filter |
| Delete | Click Delete button → Confirm |

## Dashboard Widgets

| Widget | Shows |
|--------|-------|
| Total Wrestlers | Count across all shows |
| Upcoming Matches | Next 5 pending matches |
| Active Championships | Total active titles |
| Brands | Total available shows (6) |
| Show Breakdown | Wrestler count per show |

## Database Info

**Location**: `data/wwe-universe.db`

**Size**: ~100KB for 100 wrestlers + matches

**Backup**: Copy `wwe-universe.db` file to backup location

**Reset**: Delete file and restart app to reinitialize

## Ports & Access

| Service | URL | Purpose |
|---------|-----|---------|
| Web UI | http://localhost:5000 | Your application |
| API | http://localhost:5000/api | Backend services |
| Status | Terminal | Shows if running |

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Port already in use" | Change port in server/index.js |
| "Cannot find module" | Run `npm install` |
| Data not showing | Refresh page (Ctrl+F5) |
| Server crashes | Check terminal for errors |
| Database locked | Close app and delete db file |

## Browser Requirements

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

**Note**: Internet Explorer NOT supported

## Tips & Tricks

1. **Use consistent wrestler names** - Makes match tracking easier
2. **Set dates in chronological order** - Easier to track timeline
3. **Regular backups** - Copy data/wwe-universe.db monthly
4. **Use search** - Quickly find wrestlers or matches
5. **Filter by show** - Organize data by brand
6. **Add notes** - Include match stipulations
7. **Check dashboard** - Get quick overview of universe status

## Data Limits

- **Unlimited wrestlers** - Scale to 1000+
- **Unlimited matches** - Performance good up to 10,000
- **Unlimited championships** - As many as you want
- **Unlimited transfers** - Full history kept

## Want to Restart?

```bash
# Stop current server: Press Ctrl+C

# Delete old data:
# - Delete folder: data/wwe-universe.db

# Restart:
npm start

# This resets database to empty state
```

## Export Data

Your data is stored in: `data/wwe-universe.db`

This is a standard SQLite database. You can:
1. **View with SQLite Browser** - Download "DB Browser for SQLite"
2. **Export to CSV** - Use any SQLite tool
3. **Backup** - Copy the file anywhere
4. **Share** - Send .db file to another computer

## Performance Tips

- Keep browser tabs to minimum
- Close other applications
- Use Firefox or Chrome (best performance)
- Restart server weekly for best performance

## Getting Help

**Need more info?**
- Read: `SETUP-GUIDE.md` - Detailed setup
- Read: `COMPLETE-PACKAGE-GUIDE.md` - Full features
- Check browser console: Press F12 → Console tab

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Author**: WWE Universe Mode Manager Team

Happy managing! 🎭👑
