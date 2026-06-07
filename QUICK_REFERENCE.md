# Phase 1 Quick Reference Guide

## 🎯 What's New in v2.1.0

### Championship Auto-Add
**How to Use:**
1. Go to Matches tab → Schedule Match (or Main Events → Add Match)
2. Select a championship from "Championship on the Line" dropdown
3. **Champion automatically appears as Participant 1**
4. Select opponent and other match details
5. Save match

**Benefits:** No more manually searching for the champion every time!

---

### Clean Match Lists
**What Changed:**
- **Matches Tab:** Now shows only regular weekly show matches
- **Storylines Tab:** Now shows only storyline matches (not main events)
- **Main Events Tab:** All main events isolated here

**Benefits:** No more cluttered views - everything is organized!

---

### Archive System
**How to Archive:**
1. Complete all matches in a main event
2. Event automatically shows "Completed" badge
3. Click **"Archive"** button on event header
4. Event moves to archived section

**How to View Archived Events:**
1. Go to Main Events tab
2. Change filter from "Active Events" to "Archived Events" or "All Events"
3. Archived events display with history

**Benefits:** Focus on upcoming events, keep completed events for reference!

---

### Status Badges
**Visual Indicators:**
- 🟡 **Upcoming** badge = Event has pending matches
- 🟢 **Completed** badge = All matches finished
- 🔵 **Category** badges = Match stipulation type (Hell in a Cell, Ladder, etc.)

**Benefits:** At-a-glance understanding of event and match status!

---

## 🚀 Quick Tips

### Championship Matches
- ✅ Championship auto-selects current holder
- ✅ Change championship = updates Participant 1
- ✅ Works for vacant titles (no auto-select)

### Event Organization
- ✅ Main events never appear in regular match lists
- ✅ Archive completed events to clean up workspace
- ✅ Use "All Events" filter to see full history

### Storylines
- ✅ Check "⭐ Storyline" box when booking important matches
- ✅ Only storyline matches appear in Storylines tab
- ✅ Main event matches can be storylines too

---

## 🔧 Troubleshooting

### "Champion didn't auto-populate"
**Possible causes:**
- Title is vacant (no holder to auto-populate)
- Championship from different show selected
- Browser cache issue (hard refresh: Ctrl+F5)

### "Can't find my main event"
**Check:**
- Archive filter is set to "Active Events" (not archived)
- Show filter isn't hiding it
- Event was created successfully (check database)

### "Matches appearing in wrong tab"
**Solution:**
- Regular matches → Matches tab ✅
- Storyline matches (⭐ checked) → Storylines tab ✅
- Main event matches → Main Events tab ✅
- If misplaced, edit match and verify settings

---

## 📋 Cheat Sheet

### Keyboard Shortcuts
- **Ctrl+F5** = Hard refresh (clear cache)
- **Tab** = Navigate form fields
- **Enter** = Submit form

### Filter Combinations
| Tab | Show Filter | Status Filter | Archive Filter | Result |
|-----|-------------|---------------|----------------|--------|
| Matches | All | Pending | N/A | All upcoming matches |
| Matches | RAW | Completed | N/A | RAW completed matches |
| Storylines | All | All | N/A | All storyline matches |
| Main Events | SmackDown | Pending | Active | SD upcoming events |
| Main Events | All | All | Archived | All past events |

---

## 🎓 Best Practices

### Championship Booking
1. Always book championship matches with the title selected
2. Let the champion auto-populate as P1
3. Select challenger as P2
4. Mark match as "Completed" when done
5. Manually update title holder after (auto-update coming in Phase 2!)

### Event Management
1. Create main event first (WrestleMania, etc.)
2. Add all matches to the event
3. Mark matches as completed one-by-one
4. Archive event when all matches are done
5. Use archived events for reference/history

### Organization
1. Use storyline flag for important matches only
2. Archive completed events regularly
3. Use show filters to focus on specific brands
4. Keep notes field clean (tags are automatic)

---

## 🆕 What's Coming in Phase 2

### Priority Features
1. **Teams/Factions** - Create tag teams and stables
2. **Match Type Engine** - Custom match type definitions
3. **Auto-Update Championships** - Winners automatically become champion
4. **Win/Loss Records** - Track wrestler performance
5. **Rivalry System** - Manage active feuds

### Timeline
- **Sprint 1 (Weeks 1-2):** Teams & Match Engine
- **Sprint 2 (Weeks 3-4):** Auto-updates & Records
- **Sprint 3 (Weeks 5-6):** Rivalries & Promos

---

## 📞 Getting Help

### Documentation
- **README.md** - Full feature guide and setup
- **PHASE1_COMPLETE.md** - Technical implementation details
- **PHASE2_ROADMAP.md** - Upcoming features

### Support
- **GitHub Issues** - Bug reports
- **Email/Discord** - Feature requests
- **In-App Help** - Context-sensitive tooltips (coming soon)

---

## 🎉 Quick Start for New Users

1. **Import Default Data**
   - Go to Season Setup tab
   - Click "Import Default Roster"
   - Click "Import Default Championships"

2. **Book Your First Match**
   - Go to Matches tab → Schedule Match
   - Select show (e.g., RAW)
   - Select match type (e.g., One vs One)
   - Select participants
   - Save!

3. **Create Your First Main Event**
   - Go to Main Events tab → Create Main Event
   - Name event (e.g., "WrestleMania 41")
   - Select show and date
   - Choose participating shows (up to 3)
   - Save event
   - Click "Add Match" to add matches

4. **Book a Championship Match**
   - Schedule match as normal
   - Select championship from dropdown
   - **Champion auto-fills as P1!**
   - Select challenger
   - Save!

---

## 🔑 Key Concepts

### Tags (Auto-Managed)
- `[MEEVENT]` = Main event header
- `[MEMATCH:X]` = Match belongs to event X
- `[ARCHIVED]` = Event is archived
- `[MENAME:Name]` = Event name storage
- `[POOLS:A,B,C]` = Eligible shows for event

**Note:** Tags are managed automatically - don't edit manually!

### Filters
- **Show Filter** = Which brand to display
- **Status Filter** = Pending vs Completed
- **Archive Filter** = Active vs Archived (main events only)

### Match States
- **Pending** = Not yet played
- **Completed** = Results recorded
- **Storyline** = Important/flagged match

---

## 📊 System Stats

- **Total Features:** 4 new features in Phase 1
- **Code Changes:** 100% client-side (no backend)
- **Database Changes:** 0 migrations required
- **Deployment Risk:** Zero (HTML file only)
- **Browser Support:** Chrome, Firefox, Safari, Edge

---

## ✅ Phase 1 Checklist

Use this checklist to verify Phase 1 features are working:

- [ ] Championship auto-adds champion as P1
- [ ] Main events don't appear in Matches tab
- [ ] Main events don't appear in Storylines tab
- [ ] Archive button appears on completed events
- [ ] Archive filter works (Active/Archived/All)
- [ ] Status badges display correctly
- [ ] Match categories display in all views
- [ ] All filters work correctly
- [ ] No console errors

**All checked?** ✅ **Phase 1 is working perfectly!**

---

**Version:** v2.1.0  
**Last Updated:** January 2025  
**Status:** Production Ready ✅
