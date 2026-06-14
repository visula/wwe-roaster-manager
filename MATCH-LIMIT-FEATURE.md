# Match Limit System - Implementation Guide

## ✅ COMPLETED FEATURES

### Backend Implementation (server/db.js)

1. **`getMatchesCountByShowAndDate(show, date)`**
   - Counts matches for a specific show on a specific date
   - Returns integer count

2. **`canAddMatch(show, date, excludeMatchId)`**
   - Validates if a match can be added based on configured limit
   - Returns: `{ canAdd: boolean, current: number, limit: number }`
   - Excludes current match when editing (to prevent false positives)

3. **Enhanced `addMatch()` and `updateMatch()`**
   - Automatically checks match limit before saving
   - Throws error if limit exceeded with detailed message
   - Error format: `"Match limit reached for RAW on 2025-01-20. Limit: 7, Current: 7"`

### API Endpoint (server/index.js)

**GET `/api/matches/check-limit`**

Query Parameters:
- `show` (required): Show name
- `date` (required): Match date (ISO format)
- `excludeId` (optional): Match ID to exclude from count (for editing)

Response:
```json
{
  "canAdd": true,
  "current": 4,
  "limit": 7
}
```

### Frontend Implementation (public/index.html)

1. **Live Match Count Indicator**
   - Shows when selecting show + date
   - Green badge: `✅ Match count: 4/7 for RAW on 1/20/2025`
   - Red badge: `⚠️ LIMIT REACHED: 7/7 matches...`

2. **Date Field Enhancement**
   - Added `onchange="checkMatchLimit()"` trigger
   - Updates live when date is changed

3. **Save Error Handling**
   - Displays backend error messages in alert
   - Shows detailed limit violation message

4. **`checkMatchLimit()` Function**
   - Calls API to check current match count
   - Updates warning banner with color-coded status
   - Auto-hides when no limit configured

## 🎯 HOW TO USE

### Step 1: Configure Match Limits

1. Go to **Shows** tab
2. Edit a show (e.g., RAW, SmackDown)
3. Set **Match Limit** field:
   - Weekly shows: Recommended 7 matches per episode
   - Special events: Recommended 9 matches (WrestleMania, etc.)
   - Leave blank or 0 for unlimited matches
4. Click **Save**

### Step 2: Schedule Matches

1. Go to **Matches** tab → **+ Schedule Match**
2. Select **Show** and **Date**
3. **Live Counter** appears:
   - ✅ Green = Still have room
   - ⚠️ Red = Limit reached
4. If limit reached, match **won't save** (backend blocks it)

### Step 3: Track Match Counts

The system automatically:
- Counts ALL matches for that show on that specific date
- Includes regular matches, storylines, and main events
- Excludes the current match when editing (so you can update it)

## 📊 EXAMPLE SCENARIOS

### Scenario 1: RAW Weekly Show (Limit: 7)
- Monday Jan 20: 4 matches scheduled → ✅ Can add 3 more
- Monday Jan 20: 7 matches scheduled → ⚠️ Limit reached
- Monday Jan 27: 0 matches scheduled → ✅ Fresh week, can add 7

### Scenario 2: WrestleMania (Limit: 9)
- April 6: 8 matches scheduled → ✅ Can add 1 more
- April 6: 9 matches scheduled → ⚠️ Limit reached

### Scenario 3: NXT (No Limit)
- Thursday: 5 matches → No warning shown
- Thursday: 20 matches → Still allowed

## 🔧 TECHNICAL DETAILS

### Match Counting Logic
```sql
-- Counts all matches for show on specific date
SELECT COUNT(*) as count 
FROM matches 
WHERE show = ? 
AND DATE(date) = DATE(?)
```

### Database Schema
```sql
ALTER TABLE shows ADD COLUMN matchLimit INTEGER;
```

### Validation Flow
```
User clicks "Save Match"
    ↓
Frontend: checkMatchLimit()
    ↓
API: GET /api/matches/check-limit
    ↓
Backend: canAddMatch(show, date, excludeId)
    ↓
IF limit exceeded:
    - Frontend: Show red warning
    - Backend: Throw error on save
    - User: See error alert
ELSE:
    - Frontend: Show green status
    - Backend: Allow save
    - Match saved successfully
```

## 🎨 UI INDICATORS

### Match Limit Warning Styles

**Green (Under Limit)**
```
✅ Match count: 4/7 for RAW on 1/20/2025
Background: rgba(34,197,94,0.15)
Border: rgba(34,197,94,0.4)
Color: #4ade80
```

**Red (Limit Reached)**
```
⚠️ LIMIT REACHED: 7/7 matches for RAW on 1/20/2025. Cannot add more matches.
Background: rgba(220,38,38,0.15)
Border: rgba(220,38,38,0.4)
Color: #f87171
```

## 🚀 DEPLOYMENT NOTES

1. **Restart server** after code changes: `npm start`
2. **Database migration** runs automatically on startup
3. **No data loss** - existing matches unaffected
4. **Backwards compatible** - shows without limits work as before

## 🐛 TROUBLESHOOTING

**Problem**: Warning doesn't show
- **Solution**: Check that show has matchLimit set (not null/0)

**Problem**: Can't edit existing match
- **Solution**: System excludes current match from count automatically

**Problem**: Limit not enforced
- **Solution**: Restart server to apply backend changes

## 📝 FUTURE ENHANCEMENTS (Optional)

- [ ] Show limit in shows table column
- [ ] Bulk edit match limits for multiple shows
- [ ] Weekly limit vs per-show limit
- [ ] Match count dashboard widget
- [ ] Export match counts per show/date
- [ ] Different limits for different match types

---

**Version**: 2.0.2
**Date**: 2025-01-21
**Status**: ✅ Fully Implemented & Tested
