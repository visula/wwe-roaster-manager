# Phase 2 - Enhancement Roadmap

## Overview
Phase 2 focuses on advanced features that require database schema changes and API modifications. These features build on the clean foundation established in Phase 1.

---

## Priority 1: Teams/Factions System ⭐⭐⭐

### User Story
"As a Universe Mode manager, I want to create and manage tag teams and factions so I can track stable members and book team-based matches."

### Database Changes

#### New Table: `teams`
```sql
CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  show TEXT NOT NULL,
  type TEXT DEFAULT 'Tag Team', -- Tag Team, Faction, Stable
  status TEXT DEFAULT 'Active', -- Active, Split, Inactive
  formationDate TEXT,
  notes TEXT
);
```

#### New Table: `team_members`
```sql
CREATE TABLE team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teamId INTEGER NOT NULL,
  wrestlerId INTEGER NOT NULL,
  role TEXT DEFAULT 'Member', -- Leader, Member, Manager
  joinDate TEXT,
  leftDate TEXT,
  FOREIGN KEY (teamId) REFERENCES teams(id),
  FOREIGN KEY (wrestlerId) REFERENCES wrestlers(id),
  UNIQUE(teamId, wrestlerId, joinDate)
);
```

### API Endpoints

```javascript
// Teams CRUD
GET    /api/teams              // Get all teams
POST   /api/teams              // Create team
GET    /api/teams/:id          // Get single team with members
PUT    /api/teams/:id          // Update team
DELETE /api/teams/:id          // Delete team

// Team Members
POST   /api/teams/:id/members  // Add member to team
DELETE /api/teams/:teamId/members/:memberId // Remove member
PUT    /api/teams/:teamId/members/:memberId // Update member role
```

### UI Components

1. **Teams Tab**
   - Teams table with columns: Name, Show, Type, Members, Status
   - Add/Edit/Delete team buttons
   - Filter by show and status

2. **Team Modal**
   - Team name, show, type dropdown
   - Member selection (multi-select from roster)
   - Leader designation
   - Formation date picker

3. **Match Booking Enhancement**
   - "Use Team" checkbox for tag matches
   - Team dropdown (filtered by show)
   - Auto-populate participants from team members

### Implementation Steps
1. Create database migration in `db.js`
2. Add API routes in `index.js`
3. Build UI components in `index.html`
4. Update match modal to support team selection
5. Add team badge display in roster table

### Estimated Effort: 6-8 hours

---

## Priority 2: Match Type Engine 🔧

### User Story
"As a Universe Mode manager, I want to define custom match types with specific rules so I can book unique stipulation matches."

### Database Changes

#### New Table: `match_type_definitions`
```sql
CREATE TABLE match_type_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  minParticipants INTEGER DEFAULT 2,
  maxParticipants INTEGER DEFAULT 2,
  allowsTeams BOOLEAN DEFAULT 0,
  allowsCrossShow BOOLEAN DEFAULT 0,
  description TEXT,
  isCustom BOOLEAN DEFAULT 0
);
```

### Features
- Define min/max participants per match type
- Mark types as team-compatible
- Mark types as cross-show compatible
- Custom match type creation by user
- Import/export match type definitions

### Implementation Steps
1. Migrate match types from localStorage to database
2. Create match type management UI
3. Update match modal to use database definitions
4. Add validation based on participant counts
5. Add custom match type creation form

### Estimated Effort: 4-6 hours

---

## Priority 3: Championship Auto-Update 🏆

### User Story
"As a Universe Mode manager, I want championship holders to automatically update when a match is completed so I don't have to manually update titles."

### Implementation

#### Backend Logic
```javascript
async function completeMatch(matchId, winnerId) {
  const match = await getMatch(matchId);
  
  if (match.championshipId && winnerId) {
    const championship = await getChampionship(match.championshipId);
    const winner = await getWrestler(winnerId);
    
    // Update championship holder
    await updateChampionship(championship.id, {
      holder: winner.name,
      lastDefense: new Date()
    });
    
    // Create reign history record (new table)
    await createReignHistory({
      championshipId: championship.id,
      previousHolder: championship.holder,
      newHolder: winner.name,
      dateWon: new Date(),
      matchId: matchId
    });
  }
  
  // Update match winner
  await updateMatch(matchId, { result: 'Completed', winner: winnerId });
}
```

#### Database Changes
```sql
CREATE TABLE reign_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  championshipId INTEGER NOT NULL,
  holder TEXT NOT NULL,
  dateWon TEXT NOT NULL,
  dateLost TEXT,
  daysHeld INTEGER,
  matchId INTEGER,
  FOREIGN KEY (championshipId) REFERENCES championships(id),
  FOREIGN KEY (matchId) REFERENCES matches(id)
);
```

### UI Changes
- Add "Complete Match & Update Title" button
- Show confirmation dialog with title change summary
- Display reign history in championship details
- Add "Days as Champion" statistics

### Implementation Steps
1. Create reign_history table
2. Add API endpoint for match completion with title update
3. Build confirmation dialog UI
4. Add reign history display component
5. Add title statistics dashboard

### Estimated Effort: 5-7 hours

---

## Priority 4: Win/Loss Records 📊

### User Story
"As a Universe Mode manager, I want to track win/loss records for each wrestler so I can build realistic storylines."

### Database Changes

#### Add Columns to `wrestlers`
```sql
ALTER TABLE wrestlers ADD COLUMN wins INTEGER DEFAULT 0;
ALTER TABLE wrestlers ADD COLUMN losses INTEGER DEFAULT 0;
ALTER TABLE wrestlers ADD COLUMN draws INTEGER DEFAULT 0;
```

#### New Table: `match_history`
```sql
CREATE TABLE match_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wrestlerId INTEGER NOT NULL,
  matchId INTEGER NOT NULL,
  result TEXT NOT NULL, -- Win, Loss, Draw
  show TEXT NOT NULL,
  date TEXT NOT NULL,
  FOREIGN KEY (wrestlerId) REFERENCES wrestlers(id),
  FOREIGN KEY (matchId) REFERENCES matches(id)
);
```

### Features
- Auto-update W/L records when match is completed
- Display W-L-D record in roster table
- Show individual wrestler match history
- Calculate win percentage
- Show records by show, division, year

### UI Components
1. **Roster Enhancement**
   - Add W-L-D column to roster table
   - Add win percentage badge

2. **Wrestler Details Modal**
   - Match history timeline
   - Statistics breakdown
   - Recent opponents list

3. **Leaderboards**
   - Top performers by win %
   - Most wins overall
   - Longest win streaks

### Implementation Steps
1. Add columns to wrestlers table
2. Create match_history table
3. Add logic to update records on match completion
4. Build wrestler details modal
5. Create statistics dashboard

### Estimated Effort: 6-8 hours

---

## Priority 5: Rivalry Tracking System 🔥

### User Story
"As a Universe Mode manager, I want to track active rivalries between wrestlers so I can plan compelling feuds."

### Database Changes

```sql
CREATE TABLE rivalries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  wrestler1Id INTEGER NOT NULL,
  wrestler2Id INTEGER NOT NULL,
  show TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate TEXT,
  status TEXT DEFAULT 'Active', -- Active, Resolved, Ongoing
  notes TEXT,
  FOREIGN KEY (wrestler1Id) REFERENCES wrestlers(id),
  FOREIGN KEY (wrestler2Id) REFERENCES wrestlers(id)
);

CREATE TABLE rivalry_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rivalryId INTEGER NOT NULL,
  matchId INTEGER NOT NULL,
  FOREIGN KEY (rivalryId) REFERENCES rivalries(id),
  FOREIGN KEY (matchId) REFERENCES matches(id)
);
```

### Features
- Create/edit/delete rivalries
- Link matches to rivalries
- Auto-suggest rivalries when booking matches
- Display rivalry head-to-head records
- Show rivalry timeline

### UI Components
1. **Rivalries Tab**
   - Active rivalries list
   - Rivalry details with match history
   - Add/Edit rivalry modal

2. **Match Booking Enhancement**
   - "Part of Rivalry" dropdown
   - Auto-link based on participants

3. **Rivalry Dashboard**
   - Visual timeline of rivalry
   - Match results breakdown
   - Current feud standings

### Implementation Steps
1. Create rivalries and rivalry_matches tables
2. Add API endpoints for rivalry management
3. Build rivalries tab UI
4. Add rivalry selection to match modal
5. Create rivalry statistics view

### Estimated Effort: 7-9 hours

---

## Priority 6: Promo/Segment Tracking 🎤

### User Story
"As a Universe Mode manager, I want to track promos and segments alongside matches so I can plan complete show cards."

### Database Changes

```sql
CREATE TABLE segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL, -- Promo, Interview, Backstage, Opening, Closing
  participants TEXT, -- JSON array of wrestler IDs
  title TEXT,
  description TEXT,
  duration INTEGER, -- minutes
  notes TEXT,
  orderNumber INTEGER -- position in show
);
```

### Features
- Add segments to show cards
- Define segment types
- Assign participants to segments
- Reorder segments via drag-and-drop
- Export complete show card

### UI Components
1. **Show Card Builder**
   - Timeline view of matches + segments
   - Drag-and-drop reordering
   - Add segment button

2. **Segment Modal**
   - Type dropdown
   - Participant multi-select
   - Duration input
   - Description textarea

3. **Show Export**
   - Generate printable show card
   - Export to PDF/CSV

### Implementation Steps
1. Create segments table
2. Add API endpoints for segments
3. Build show card builder UI
4. Implement drag-and-drop reordering
5. Create export functionality

### Estimated Effort: 8-10 hours

---

## Priority 7: Calendar View 📅

### User Story
"As a Universe Mode manager, I want a calendar view of all shows and events so I can plan the season visually."

### Features
- Monthly/weekly calendar grid
- Show all scheduled matches and events
- Click day to see detailed schedule
- Color-code by show brand
- Drag events to reschedule

### UI Components
1. **Calendar Tab**
   - Month/week view toggle
   - Navigation arrows
   - Show filter
   - Today button

2. **Day Detail Modal**
   - All matches for selected date
   - Show breakdown
   - Quick edit/delete options

### Implementation Steps
1. Create calendar grid component
2. Fetch and display matches by date range
3. Add date click handler for details
4. Implement drag-to-reschedule
5. Add color-coding by brand

### Estimated Effort: 6-8 hours

---

## Priority 8: Advanced Filtering & Search 🔍

### User Story
"As a Universe Mode manager, I want powerful filtering and search so I can quickly find specific matches, wrestlers, or events."

### Features
- Multi-criteria filtering
- Full-text search across all entities
- Saved filter presets
- Quick filters (e.g., "Championship matches only")
- Export filtered results

### UI Enhancements
1. **Advanced Filter Panel**
   - Date range picker
   - Multiple show selection
   - Match type filter
   - Championship filter
   - Participant search

2. **Quick Filters**
   - Preset buttons for common filters
   - "Title matches", "Main events", "Recent"

3. **Search Bar**
   - Global search in header
   - Search across wrestlers, matches, events
   - Instant results dropdown

### Implementation Steps
1. Add full-text search to API endpoints
2. Build advanced filter UI component
3. Implement saved filter presets
4. Add quick filter buttons
5. Create global search bar

### Estimated Effort: 5-7 hours

---

## Priority 9: Export & Reporting 📄

### User Story
"As a Universe Mode manager, I want to export data and generate reports so I can share results and analyze trends."

### Features
- Export show cards to PDF
- Generate season recap report
- Export statistics to CSV
- Custom report builder
- Email/share reports

### Report Types
1. **Season Recap**
   - All champions
   - Win/loss leaders
   - Match of the year candidates
   - Major events summary

2. **Wrestler Profile**
   - Full match history
   - Career statistics
   - Championship history
   - Rivalries timeline

3. **Show Report**
   - Complete card with results
   - Attendance/ratings (future)
   - Match quality ratings (future)

### Implementation Steps
1. Add PDF generation library
2. Create report templates
3. Build custom report builder UI
4. Add export buttons throughout app
5. Implement email sharing

### Estimated Effort: 8-10 hours

---

## Priority 10: Mobile Responsive Design 📱

### User Story
"As a Universe Mode manager, I want to use the app on my phone or tablet so I can manage my universe on the go."

### Requirements
- Responsive layout for all screen sizes
- Touch-friendly buttons and controls
- Mobile-optimized navigation
- Offline capability (PWA)
- Mobile-specific features (camera for wrestler photos)

### Implementation Steps
1. Add responsive CSS media queries
2. Convert desktop modals to mobile sheets
3. Optimize tables for small screens
4. Add PWA manifest and service worker
5. Test on multiple devices

### Estimated Effort: 10-12 hours

---

## Implementation Timeline

### Sprint 1 (Week 1-2): Core Features
- Priority 1: Teams/Factions System
- Priority 2: Match Type Engine

### Sprint 2 (Week 3-4): Automation
- Priority 3: Championship Auto-Update
- Priority 4: Win/Loss Records

### Sprint 3 (Week 5-6): Storytelling
- Priority 5: Rivalry Tracking
- Priority 6: Promo/Segment Tracking

### Sprint 4 (Week 7-8): UX Polish
- Priority 7: Calendar View
- Priority 8: Advanced Filtering

### Sprint 5 (Week 9-10): Sharing & Mobile
- Priority 9: Export & Reporting
- Priority 10: Mobile Responsive

---

## Testing Strategy

### Unit Tests
- API endpoint tests for all new routes
- Database query tests
- Business logic tests (auto-update, calculations)

### Integration Tests
- Complete user workflows
- Cross-feature interactions
- Data integrity checks

### User Acceptance Testing
- Real-world scenario testing
- Performance benchmarks
- Usability feedback

---

## Success Criteria

### Performance
- Page load time < 2 seconds
- Match listing renders < 500ms
- Database queries < 100ms

### Reliability
- Zero data loss in all operations
- Graceful error handling
- Automatic backup system

### Usability
- New user onboarding < 10 minutes
- Task completion rate > 95%
- User satisfaction score > 4.5/5

---

## Risk Mitigation

### Database Migrations
- **Risk:** Data loss during schema changes
- **Mitigation:** Automatic backup before migration + rollback capability

### Performance
- **Risk:** Slow queries with large datasets
- **Mitigation:** Proper indexing + pagination + query optimization

### Complexity
- **Risk:** Feature bloat and maintenance burden
- **Mitigation:** Modular architecture + thorough documentation + code reviews

---

## Phase 2 Completion Criteria

✅ All 10 priorities implemented  
✅ Comprehensive test suite with >80% coverage  
✅ Full documentation updated  
✅ Mobile responsive design complete  
✅ Performance benchmarks met  
✅ User acceptance testing passed  

**Target Completion:** 10 weeks from Phase 2 start  
**Version:** v3.0.0

---

## Long-Term Vision (Phase 3+)

- Cloud sync and multi-device support
- Collaborative universe mode (multiple managers)
- AI-powered storyline suggestions
- Match quality ratings and analytics
- Social features (share cards, compare universes)
- Integration with WWE 2K game APIs
- Voice control for hands-free booking
- Advanced statistics and predictive analytics
