# Season Start Date Feature

## Overview
Implemented automatic calculation and storage of next episode dates for shows based on their broadcast days and a season start date.

## Features Implemented

### 1. Database Schema Updates
- Added `nextEpisodeDate` column to the `shows` table
- Database migration automatically adds column to existing databases

### 2. Backend API
- **New Endpoint**: `POST /api/shows/apply-season-start`
  - Accepts a `startDate` parameter
  - Calculates the Monday of the selected week
  - Computes next episode date for each show based on its broadcast day
  - Updates all shows with their calculated dates
  - Returns list of updated shows with their new dates

- **Updated Endpoints**:
  - `POST /api/shows` - Now accepts and stores `nextEpisodeDate`
  - `PUT /api/shows/:id` - Now accepts and updates `nextEpisodeDate`
  - Added helper method `updateShowNextEpisodeDate(id, date)` in database manager

### 3. Frontend Features

#### Season Setup Tab
- **Apply Season Start Date**:
  - User selects any date in the starting week
  - System calculates Monday of that week
  - Automatically updates all weekly shows with their next episode dates
  - Displays success message with updated shows and dates
  - Data is persisted to database

#### Shows Management Tab
- **Updated Display**:
  - Added "Next Episode" column to shows table
  - Displays calculated next episode date for each show
  - Shows "-" for shows without scheduled dates

- **Auto-Calculate on New Shows**:
  - When creating/editing a show with a broadcast day
  - System automatically calculates the next occurrence of that day
  - Date is stored and displayed immediately

### 4. How It Works

#### Season Start Date Flow:
1. User enters a date in Season Setup
2. System finds the Monday of that week
3. For each show with a broadcast day:
   - Calculate offset from Monday (e.g., Friday = +4 days)
   - Add offset to Monday to get show's date
   - Store date in database
4. Reload shows and display updated dates

#### New Show Flow:
1. User creates a show and selects a broadcast day
2. System calculates next occurrence of that day from today
3. Date is stored with the show
4. If Season Start Date is later applied, date is recalculated

## Usage

### Setting Season Start Date:
1. Go to "Season Setup" tab
2. Enter any date in the week you want to start
3. Click "Apply Start Date"
4. All weekly shows will be updated with their next episode dates

### Adding New Shows:
1. Go to "Shows" tab
2. Click "+ Add Show"
3. Select a "Broadcast Day" (Monday-Sunday)
4. System automatically calculates next episode date
5. Date is visible in shows table immediately

### Viewing Show Dates:
- Open "Shows" tab
- "Next Episode" column displays the calculated date for each show
- Shows without broadcast days display "-"

## Technical Details

### Date Calculation Logic:
```javascript
// Day indices: Monday=1, Tuesday=2, ..., Sunday=0
const DAY_INDEX = { 
  Monday: 1, Tuesday: 2, Wednesday: 3, 
  Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 
};

// Find Monday of selected week
const monday = new Date(selectedDate);
monday.setDate(selectedDate.getDate() - ((selectedDate.getDay() + 6) % 7));

// Calculate show date
const showDate = new Date(monday);
const offset = DAY_INDEX[broadcastDay];
showDate.setDate(monday.getDate() + (offset === 0 ? 7 : offset) - 1);
```

### Database Schema:
```sql
ALTER TABLE shows ADD COLUMN nextEpisodeDate TEXT;
```

## Benefits

1. **Automated Planning**: No manual date tracking needed
2. **Consistency**: All shows use the same week-based calendar
3. **Flexibility**: Can reset season dates anytime
4. **Persistence**: Dates stored in database, survive restarts
5. **New Show Integration**: New shows automatically get calculated dates

## Future Enhancements

Possible improvements:
- Auto-advance dates after each episode
- Multi-week scheduling (e.g., every 2 weeks)
- Holiday/special date handling
- Conflict detection for overlapping shows
- Calendar export functionality
