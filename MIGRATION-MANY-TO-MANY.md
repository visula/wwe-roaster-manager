# Many-to-Many Wrestler-Show Relationship Migration

## ✅ Completed Changes

### 1. Database Schema
- **Created**: `wrestler_shows` junction table with columns:
  - `id` (PRIMARY KEY)
  - `wrestlerId` (FOREIGN KEY → wrestlers.id)
  - `showName` (FOREIGN KEY → shows.name)
  - `isPrimary` (1 for primary show, 0 for others)
  - `createdAt` (timestamp)
  - UNIQUE constraint on (wrestlerId, showName)

### 2. Data Migration
- **Deduplicated wrestlers**: Removed 33 duplicate wrestler records
- **Kept**: 378 unique wrestlers
- **Created**: 411 wrestler-show relationships
- **Strategy**: Kept records with team info > gender > overall > lowest ID

### 3. Database Methods (db.js)
Updated methods to use junction table:
- `getAllWrestlers()` - Returns wrestlers with `shows` array and `primaryShow`
- `getWrestlersByShow(show)` - Filters by junction table
- `getWrestlerById(id)` - Includes shows array
- `addWrestler(name, shows, ...)` - Accepts shows array, creates junction records
- `updateWrestler(id, name, shows, ...)` - Updates junction records

### 4. API Endpoints (index.js)
- `POST /api/wrestlers` - Accepts `shows` array instead of single `show`
- `PUT /api/wrestlers/:id` - Updates multiple shows
- `POST /api/transfers` - Updates show arrays (removes from old, adds to new)

### 5. Frontend (index.html)
- **Roster Table**: Displays multiple show badges per wrestler
- **Wrestler Modal**: Multi-select dropdown (Hold Ctrl/Cmd for multiple)
- **Save Logic**: Sends shows as array
- **Edit Logic**: Pre-selects all assigned shows

## 🎯 Benefits

1. **No More Duplicates**: Each wrestler exists once in the database
2. **Multi-Brand Superstars**: Wrestlers can appear on multiple shows (e.g., legends, special appearances)
3. **Primary Show**: First selected show is marked as primary
4. **Better Data Integrity**: Referential integrity with foreign keys
5. **Cleaner Database**: 33 fewer records, cleaner data structure

## 📊 Migration Results

```
Before Migration:
- Total records: 411 wrestlers (with duplicates)
- Unique wrestlers: 378
- Duplicates: 33

After Migration:
- Total wrestlers: 378 (unique)
- Total relationships: 411 (wrestler-show pairs)
- Duplicates: 0 ✅
```

## 🔄 How It Works Now

### Adding a Wrestler
1. User selects multiple shows (Ctrl+Click)
2. First show becomes primary show
3. Backend creates 1 wrestler record + N junction records

### Viewing Roster
- Roster table shows multiple show badges for multi-brand wrestlers
- Each badge represents a show relationship

### Transfers
- Transfer removes wrestler from old show
- Adds wrestler to new show
- Wrestler can still belong to other shows

### Filtering
- Filter by show uses junction table
- Shows all wrestlers assigned to that show

## 🚀 Future Enhancements

1. Add "Make Primary" button to change primary show
2. Show assignment history tracking
3. Cross-brand match booking improvements
4. Bulk show assignment tool

## ⚠️ Breaking Changes

**API Changes:**
- `show` field changed to `shows` array in requests
- Responses include `shows` array and `primaryShow` field

**Database:**
- `wrestler_shows` junction table added
- `wrestlers.show` column deprecated (still exists for backward compatibility)

## 🧪 Testing Checklist

- [x] Migration script removes duplicates
- [x] Junction table created
- [x] Database methods use junction table
- [x] API endpoints accept/return shows array
- [x] Frontend displays multiple badges
- [x] Multi-select works in modal
- [ ] Test transfers with multi-show wrestlers
- [ ] Test match booking with multi-show wrestlers
- [ ] Test team creation with multi-show members

## 📝 Notes

- The old `show` column still exists in wrestlers table for backward compatibility
- Can be removed in future version after thorough testing
- Migration script is idempotent and can be run multiple times safely
