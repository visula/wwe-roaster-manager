# Accounts System - Data Isolation Guide

## What Data is Isolated Per Account?

Each account has its **own separate database file** with completely isolated data:

### ✅ Account-Specific Data (Isolated)
- **Wrestlers** - Each account has its own roster
- **Matches** - Match history is separate per account
- **Championships** - Titles and holders are per account
- **Shows** - Show configurations (RAW, SmackDown, etc.)
- **Transfers** - Roster movement history
- **Events** - Main events and special shows
- **Teams** - Tag teams and factions
- **Storylines** - Active storylines and participants
- **Rivalries** - Wrestler rivalries
- **Championship History** - Title reign history
- **Match History** - Historical match records

### 🔄 Shared Data (Global)
- **Match Configuration** - Match types and categories (stored in browser localStorage)
- **Season Start Date** - Calendar configuration (stored in browser localStorage)

## Database Structure

```
data/
├── accounts.db           # Main database - stores account list only
├── default.db           # Default account's universe data
├── my_universe_1234.db  # Custom account 1's data
└── wwe_2026_5678.db     # Custom account 2's data
```

## How to Use Multiple Accounts

### 1. Create a New Account
1. Go to **Accounts** tab
2. Click **+ Create New Account**
3. Enter a name (e.g., "My Universe 2026")
4. Click **Create Account**

### 2. Switch Between Accounts
1. Go to **Accounts** tab
2. Click **Switch to This Account** on any inactive account
3. Page will reload with that account's data

### 3. What Happens When You Switch?
- Server closes current database
- Opens the selected account's database file
- All data (roster, matches, storylines, etc.) comes from the new account
- No data mixing between accounts

### 4. Delete an Account
- Only **inactive** accounts can be deleted
- Deletes both the account record and its database file
- **⚠️ This is permanent and cannot be undone!**

## Testing Data Isolation

To verify accounts are working correctly:

1. **Create Account A**
   - Add some wrestlers (e.g., "Test Wrestler A")
   - Schedule some matches
   - Create a storyline

2. **Create Account B** 
   - Switch to Account B
   - Verify roster is empty (no wrestlers from Account A)
   - Verify no matches or storylines from Account A

3. **Switch Back to Account A**
   - All your Account A data should still be there
   - Account B data should not appear

## Current Active Account

The active account is displayed in the **header** (top-right corner) with a green badge showing the account name.

## Technical Details

- **Account List**: Stored in `accounts.db` (shared across all accounts)
- **Account Data**: Each account gets `{accountname}_{timestamp}.db`
- **Middleware**: Server automatically switches database based on active account
- **API Isolation**: All `/api/*` endpoints use the active account's database

## Troubleshooting

**Q: I see data from another account**
- A: Restart the server to force database reload

**Q: Can I rename an account?**
- A: Not currently supported (would require database file rename)

**Q: How do I backup an account?**
- A: Copy the account's `.db` file from the `data/` folder

**Q: Can I have multiple accounts active?**
- A: No, only one account can be active at a time

---

**Everything except Match Configuration is completely isolated per account!**
