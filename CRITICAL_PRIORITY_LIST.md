# Critical Priority List - v3.0.0 Release
## Advanced Booking Intelligence Features

**Target Version:** v3.0.0  
**Focus:** Transform from data tracker to intelligent booking assistant  
**Timeline:** 4-6 weeks

---

## P0: CRITICAL - Must Have for v3.0.0 ⚠️

### 1. Teams/Factions Auto-Fill System
**Priority:** P0 Critical  
**Effort:** 6-8 hours  
**Impact:** Eliminates repetitive participant selection, essential for tag team booking

#### Requirements
- Database tables for teams and team_members
- Team management UI (Add/Edit/Delete teams)
- Auto-populate match participants when team selected
- Example: Select "DIY" → auto-fills Johnny Gargano + Tommaso Ciampa
- Support for 2-member teams and 3+ member factions
- Show-based team filtering

#### Implementation
```sql
-- New Tables
CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  show TEXT NOT NULL,
  type TEXT DEFAULT 'Tag Team',
  status TEXT DEFAULT 'Active',
  formationDate TEXT,
  notes TEXT
);

CREATE TABLE team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teamId INTEGER NOT NULL,
  wrestlerId INTEGER NOT NULL,
  role TEXT DEFAULT 'Member',
  joinDate TEXT,
  FOREIGN KEY (teamId) REFERENCES teams(id),
  FOREIGN KEY (wrestlerId) REFERENCES wrestlers(id)
);
```

#### UI Changes
- New "Teams" tab with CRUD operations
- Match modal: "Use Team" checkbox for tag matches
- Team dropdown (filtered by show)
- Auto-populate participant slots from selected team

#### Success Criteria
✅ User selects team → all participants auto-filled  
✅ Works for both regular and main event matches  
✅ Teams filterable by show  
✅ Clear visual indicator when team is selected

---

### 2. Match Type ↔ Category Validation Engine
**Priority:** P0 Critical  
**Effort:** 5-7 hours  
**Impact:** Prevents invalid match bookings, enforces WWE 2K26 game logic

#### Requirements
- Define valid type/category combinations in database
- Smart UI that filters categories based on selected type
- Prevent invalid combinations (e.g., Hell in a Cell type can only have Hell in a Cell category)
- Validation rules match WWE 2K26 game restrictions

#### Implementation
```sql
-- New Table
CREATE TABLE match_type_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matchType TEXT NOT NULL,
  validCategories TEXT NOT NULL, -- JSON array
  minParticipants INTEGER DEFAULT 2,
  maxParticipants INTEGER DEFAULT 2,
  requiresTeams BOOLEAN DEFAULT 0,
  allowsCrossShow BOOLEAN DEFAULT 0
);
```

#### Validation Rules Examples
- **War Games** type → Only "War Games" category
- **Hell in a Cell** type → Only "Hell in a Cell" category
- **Tag Team** type → Only "Tag Team", "Tornado Tag", or "Normal" categories
- **Battle Royal** type → Only "Battle Royal" category
- **1v1** type → Cannot use "Tag Team" category

#### UI Changes
- Match type dropdown onChange → filter category dropdown
- Disable invalid categories (grayed out)
- Show warning message if invalid combination attempted
- Add info tooltip explaining restrictions

#### Success Criteria
✅ Category dropdown updates dynamically based on type  
✅ Invalid combinations cannot be saved  
✅ Clear error messages guide user to valid options  
✅ Rules configurable via Season Setup

---

### 3. Championship Filtering in Main Events (Bug Fix)
**Priority:** P0 Critical  
**Effort:** 1-2 hours  
**Impact:** Fixes broken functionality preventing proper title match booking

#### Problem
Championship dropdown in Main Event match modal does not update when show filter changes. Shows all championships regardless of selected show filter.

#### Solution
- Add `onMEChampionshipShowFilterChange()` handler
- Rebuild championship dropdown when show filter changes
- Filter championships by selected show
- If "All (Cross-show)" selected, show all championships from pool shows

#### Implementation
```javascript
function onMEChampionshipShowFilterChange(eventId) {
  const showFilter = document.getElementById(`me-match-show-filter-${eventId}`).value;
  const champDropdown = document.getElementById(`me-match-championship-${eventId}`);
  
  let filtered = [...allChampionships];
  if (showFilter && showFilter !== 'ALL') {
    filtered = allChampionships.filter(c => c.show === showFilter);
  }
  
  rebuildChampionshipDropdown(champDropdown, filtered);
}
```

#### Success Criteria
✅ Championship dropdown updates when show filter changes  
✅ Only relevant championships visible based on show selection  
✅ Cross-show matches show all pool championships  
✅ Current selection preserved if valid

---

### 4. Dynamic Match Builder
**Priority:** P0 Very High  
**Effort:** 8-10 hours  
**Impact:** Revolutionary UX improvement, contextual participant fields

#### Requirements
- Generate participant fields contextually based on match type
- Intelligent field naming (e.g., "Team A Member 1", "Challenger 1")
- Visual grouping for team-based matches
- Auto-adjust field count when match type changes

#### Examples
**Traditional Tag Team Match (2v2):**
```
Team A:
  └─ Participant 1
  └─ Participant 2
Team B:
  └─ Participant 3
  └─ Participant 4
```

**War Games (4v4):**
```
Team A:
  └─ Member 1
  └─ Member 2
  └─ Member 3
  └─ Member 4
Team B:
  └─ Member 1
  └─ Member 2
  └─ Member 3
  └─ Member 4
```

**Championship Match (1v1):**
```
Champion: [Auto-filled from championship]
Challenger: [User selects]
```

**Fatal 4-Way:**
```
Participant 1
Participant 2
Participant 3
Participant 4
```

#### Implementation
- Extend MATCH_SLOTS config with field grouping metadata
- Create `buildDynamicMatchFields()` function
- Add visual separators/headers for grouped fields
- Support both regular and main event matches

#### UI Design
```javascript
const DYNAMIC_MATCH_CONFIG = {
  'Traditional Tag Team Match': {
    groups: [
      { label: 'Team A', slots: 2 },
      { label: 'Team B', slots: 2 }
    ]
  },
  'War Games': {
    groups: [
      { label: 'Team A', slots: 4 },
      { label: 'Team B', slots: 4 }
    ]
  },
  'One vs One': {
    groups: [
      { label: 'Participants', slots: 2 }
    ]
  }
};
```

#### Success Criteria
✅ Fields generated dynamically based on match type  
✅ Clear visual grouping for team matches  
✅ Contextual labels (Champion/Challenger, Team A/B)  
✅ Smooth transition when type changes  
✅ Preserves existing selections when possible

---

## P1: HIGH - Should Have for v3.0.0 🎯

### 5. Championship-Based Auto-Booking
**Priority:** P1 High  
**Effort:** 4-6 hours  
**Impact:** Streamlines championship match booking workflow

#### Requirements
- Auto-add current champion when championship selected
- Filter challengers by show and division
- Prevent duplicate participant selection
- Show title holder badge in dropdown

#### Workflow
1. User selects championship → Champion auto-fills Participant 1
2. Participant 2+ dropdowns filter out champion
3. Challengers filtered by:
   - Same show as championship (or pool shows for main events)
   - Compatible division (Heavyweight champ can defend against Heavyweight/Unassigned)
4. Visual indicator shows who is champion

#### Implementation
```javascript
function onChampionshipSelected(champId) {
  const champ = championships.find(c => c.id === champId);
  
  // Auto-fill champion
  document.getElementById('participant1').value = champ.holder;
  
  // Filter challengers
  const eligibleChallengers = wrestlers.filter(w => 
    w.name !== champ.holder &&
    w.show === champ.show &&
    (w.division === champ.division || w.division === 'Unassigned')
  );
  
  rebuildChallengerDropdowns(eligibleChallengers);
}
```

#### Success Criteria
✅ Champion auto-fills when title selected  
✅ Challengers properly filtered by show/division  
✅ Champion cannot be selected as challenger  
✅ Clear visual cues for title matches

---

### 6. Win/Loss Records System
**Priority:** P1 High (moved from P2)  
**Effort:** 6-8 hours  
**Impact:** Essential for realistic booking decisions

#### Requirements
- Track W-L-D for each wrestler
- Auto-update on match completion
- Display in roster table
- Show match history timeline
- Calculate win percentage and streaks

#### Database Changes
```sql
ALTER TABLE wrestlers ADD COLUMN wins INTEGER DEFAULT 0;
ALTER TABLE wrestlers ADD COLUMN losses INTEGER DEFAULT 0;
ALTER TABLE wrestlers ADD COLUMN draws INTEGER DEFAULT 0;

CREATE TABLE match_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wrestlerId INTEGER NOT NULL,
  matchId INTEGER NOT NULL,
  result TEXT NOT NULL,
  show TEXT NOT NULL,
  date TEXT NOT NULL,
  FOREIGN KEY (wrestlerId) REFERENCES wrestlers(id),
  FOREIGN KEY (matchId) REFERENCES matches(id)
);
```

#### Success Criteria
✅ W-L-D column in roster table  
✅ Auto-updates on match completion  
✅ Individual wrestler stats page  
✅ Leaderboard by win percentage

---

### 7. Championship Auto-Update
**Priority:** P1 High (moved from P2)  
**Effort:** 5-7 hours  
**Impact:** Eliminates manual title updates, tracks reign history

#### Requirements
- Auto-update champion when title match completed
- Create reign history records
- Show confirmation before updating
- Track days held, defenses, etc.

#### Implementation
```javascript
async function completeChampionshipMatch(matchId, winnerId) {
  const match = await getMatch(matchId);
  const championship = await getChampionship(match.championshipId);
  
  // Confirmation dialog
  const confirmed = confirm(
    `Update ${championship.name}?\n` +
    `Old Champion: ${championship.holder}\n` +
    `New Champion: ${winner.name}`
  );
  
  if (confirmed) {
    // Create history record
    await createReignHistory({
      championshipId: championship.id,
      holder: championship.holder,
      dateWon: championship.lastUpdate,
      dateLost: new Date(),
      matchId: matchId
    });
    
    // Update champion
    await updateChampionship(championship.id, {
      holder: winner.name,
      lastUpdate: new Date()
    });
  }
}
```

#### Success Criteria
✅ Title automatically updates on match completion  
✅ Reign history tracked in database  
✅ User confirmation before changes  
✅ Championship details show reign history

---

## P2: MEDIUM - Nice to Have 📌

### 8. Rivalry Tracking System
**Priority:** P2 Medium  
**Effort:** 7-9 hours  
**Impact:** Enhances storytelling, not critical for booking

(Details in PHASE2_ROADMAP.md Priority 5)

---

### 9. Promo/Segment Tracking
**Priority:** P2 Medium  
**Effort:** 8-10 hours  
**Impact:** Complete show planning, optional feature

(Details in PHASE2_ROADMAP.md Priority 6)

---

### 10. Calendar View
**Priority:** P2 Medium  
**Effort:** 6-8 hours  
**Impact:** Visual planning aid, not essential

(Details in PHASE2_ROADMAP.md Priority 7)

---

## P3: LOW - Future Enhancements 🔮

### 11. Advanced Filtering & Search
**Priority:** P3 Low  
**Effort:** 5-7 hours  

(Details in PHASE2_ROADMAP.md Priority 8)

---

### 12. Export & Reporting
**Priority:** P3 Low  
**Effort:** 8-10 hours  

(Details in PHASE2_ROADMAP.md Priority 9)

---

### 13. Mobile Responsive Design
**Priority:** P3 Low  
**Effort:** 10-12 hours  

(Details in PHASE2_ROADMAP.md Priority 10)

---

## Implementation Strategy

### Phase A: Foundation (Week 1-2)
**Goal:** Database schema and core APIs

1. **Teams/Factions System** (P0-1)
   - Create teams and team_members tables
   - Add API endpoints
   - Basic UI for team management

2. **Match Type Rules System** (P0-2)
   - Create match_type_rules table
   - Define default validation rules
   - Add configuration UI in Season Setup

3. **Database Enhancements** (P1-6, P1-7)
   - Add W-L-D columns to wrestlers
   - Create match_history table
   - Create reign_history table

### Phase B: Smart Booking UI (Week 3-4)
**Goal:** Intelligent match booking experience

4. **Dynamic Match Builder** (P0-4)
   - Implement field generation logic
   - Add visual grouping
   - Support regular + main event matches

5. **Teams Auto-Fill** (P0-1)
   - Add team selection to match modals
   - Implement auto-population
   - Add visual indicators

6. **Championship Auto-Booking** (P1-5)
   - Champion auto-fill logic
   - Challenger filtering
   - Division-based filtering

### Phase C: Validation & Automation (Week 5)
**Goal:** Prevent errors, automate updates

7. **Type/Category Validation** (P0-2)
   - Dynamic category filtering
   - Client-side validation
   - Server-side validation
   - Error messaging

8. **Championship Auto-Update** (P1-7)
   - Match completion handler
   - Title update logic
   - Reign history tracking

9. **Win/Loss Records** (P1-6)
   - Auto-update on completion
   - Stats display in roster
   - Match history views

### Phase D: Bug Fixes & Polish (Week 6)
**Goal:** Production-ready release

10. **Championship Filter Fix** (P0-3)
    - Fix main event championship dropdown
    - Test all filtering scenarios

11. **Testing & QA**
    - End-to-end workflow testing
    - Edge case validation
    - Performance optimization

12. **Documentation**
    - Update README with new features
    - Create user guide for booking intelligence
    - API documentation updates

---

## Success Metrics for v3.0.0

### Booking Efficiency
- ✅ Time to book tag match reduced by 70% (team auto-fill)
- ✅ Invalid match attempts reduced to 0% (validation engine)
- ✅ Championship match booking reduced by 50% (auto-fill champion)

### Data Accuracy
- ✅ Zero invalid match type/category combinations
- ✅ 100% automatic W-L record updates
- ✅ 100% automatic championship updates

### User Experience
- ✅ Contextual participant fields for all match types
- ✅ Smart filtering reduces irrelevant options by 80%+
- ✅ Visual feedback for all automated actions

### Technical Quality
- ✅ All database migrations tested with rollback
- ✅ API response times < 100ms
- ✅ Zero data loss in all operations
- ✅ Comprehensive error handling

---

## Risk Assessment

### High Risk
**Database Migrations** (teams, match_type_rules, match_history, reign_history)
- **Mitigation:** Auto-backup before migration, test on copy of production DB

### Medium Risk
**Validation Logic Complexity**
- **Mitigation:** Comprehensive test suite, configurable rules via UI

### Low Risk
**UI Complexity** (Dynamic Match Builder)
- **Mitigation:** Incremental implementation, fallback to current UI if needed

---

## Release Checklist for v3.0.0

### Development
- [ ] All P0 features implemented
- [ ] All P1 features implemented
- [ ] Database migrations tested
- [ ] API endpoints tested
- [ ] UI components tested

### Testing
- [ ] Unit tests for new logic
- [ ] Integration tests for workflows
- [ ] User acceptance testing
- [ ] Performance benchmarks met
- [ ] Browser compatibility verified

### Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] User guide created
- [ ] CHANGELOG created
- [ ] Migration guide created

### Deployment
- [ ] Database backup created
- [ ] Migration script ready
- [ ] Rollback plan documented
- [ ] Release notes prepared
- [ ] Version tagged in git

---

## Next Steps

**Immediate Action Required:**
1. **Confirm Priorities** - Review P0/P1 classification
2. **Choose Approach** - Decide on implementation strategy:
   - Option A: Implement all P0 features first (4 weeks)
   - Option B: Quick wins first (P0-3 bug fix → P0-1 teams → etc.)
   - Option C: Feature by feature with full testing between each
3. **Database Design Review** - Approve schema changes before implementation
4. **UI/UX Mockups** - Create wireframes for Dynamic Match Builder

**Questions for Clarification:**
1. Should validation rules be user-configurable or hardcoded to WWE 2K26 logic?
2. What happens to teams when members are transferred to different shows?
3. Should championship auto-update be optional or always-on?
4. Should W-L records be retroactively calculated for existing matches?

---

**Last Updated:** 2025-01-22  
**Status:** Awaiting User Confirmation  
**Target Release:** v3.0.0 (4-6 weeks)
