# WWE Universe Mode Manager - System Architecture

## Current Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                     http://localhost:5000                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Node.js)                      │
│                      server/index.js                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         Middleware: ensureActiveAccountDb()             │   │
│  │  - Checks active account from accounts.db               │   │
│  │  - Switches to correct database if needed               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  API Endpoints:                                                 │
│  - /api/wrestlers                                               │
│  - /api/matches                                                 │
│  - /api/championships                                           │
│  - /api/shows                                                   │
│  - /api/accounts                                                │
│  - /api/transfers                                               │
│  - /api/storylines                                              │
│  - /api/rivalries                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Database Operations
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE MANAGER (db.js)                       │
│                                                                  │
│  Properties:                                                    │
│  - mainDb  → accounts.db (metadata)                            │
│  - db      → active account's database (data)                  │
│                                                                  │
│  Methods:                                                       │
│  - init()                                                       │
│  - getAllWrestlers()                                            │
│  - addWrestler()                                                │
│  - updateWrestler()                                             │
│  - getAllAccounts()                                             │
│  - setActiveAccount()                                           │
│  - ... (all CRUD operations)                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ SQLite Connections
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FILE SYSTEM (data/)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  accounts.db (MAIN DATABASE)                             │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Table: accounts                                     │  │  │
│  │  │ ├─ id (PK)                                         │  │  │
│  │  │ ├─ name (e.g., "Default Account")                 │  │  │
│  │  │ ├─ dbFileName (e.g., "wwe-universe.db")           │  │  │
│  │  │ ├─ isActive (0 or 1)                              │  │  │
│  │  │ └─ createdAt                                       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  template.db (TEMPLATE DATABASE)                         │  │
│  │  - Contains default shows (RAW, SmackDown, etc.)         │  │
│  │  - Contains default wrestlers (379 wrestlers)            │  │
│  │  - Used as copy source for new accounts                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  default.db (FALLBACK TEMPLATE)                          │  │
│  │  - Contains default shows                                │  │
│  │  - Contains default wrestlers (379 wrestlers)            │  │
│  │  - Used if template.db doesn't exist                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  wwe-universe.db (ACCOUNT DATABASE)                      │  │
│  │  - Active account's database                             │  │
│  │  - Contains actual user data                             │  │
│  │  Tables:                                                  │  │
│  │  ├─ shows                                                │  │
│  │  ├─ wrestlers (379 rows)                                 │  │
│  │  ├─ matches                                              │  │
│  │  ├─ championships                                        │  │
│  │  ├─ roster_transfers                                     │  │
│  │  ├─ storylines                                           │  │
│  │  ├─ rivalries                                            │  │
│  │  ├─ events                                               │  │
│  │  └─ teams                                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  account_name_timestamp.db (NEW ACCOUNT DATABASE)        │  │
│  │  - Created when user creates new account                 │  │
│  │  - Should be copied from template.db                     │  │
│  │  - Independent copy of roster data                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow for Account Creation

```
User Creates New Account "My Universe"
         │
         ▼
POST /api/accounts { name: "My Universe" }
         │
         ▼
server/index.js:
├─ Generate filename: my_universe_1735401234567.db
├─ db.addAccount() → Insert into accounts.db
│
├─ Check if template.db exists
│  ├─ YES → fs.copyFileSync(template.db → new_file.db) ✓
│  │         Copy all 379 wrestlers
│  └─ NO  → Check if default.db exists
│           ├─ YES → fs.copyFileSync(default.db → new_file.db) ✓
│           │         Copy all 379 wrestlers
│           └─ NO  → Create empty DB + init() ✗
│                    No wrestlers!
│
└─ Return { id, name, dbFileName, isActive: 0 }
```

## Current Issue Analysis

### Problem Location:
The issue is in `server/index.js` at the account creation endpoint:

```javascript
app.post('/api/accounts', (req, res) => {
  // ... code ...
  
  // PROBLEM: If template.db doesn't exist, fallback creates EMPTY database
  } else {
    // Last resort: create empty database
    const tempDb = new Database(dbFileName);  // ← WRONG: Uses just filename, not full path
    tempDb.init();                             // ← Creates empty tables only
    tempDb.close();
  }
});
```

### Issues:
1. **Wrong path**: `new Database(dbFileName)` should use full path
2. **Empty database**: `init()` only creates table structure, no data
3. **No wrestlers imported**: No default roster is loaded

### Expected Behavior:
When user creates "Test Account":
1. Copy `template.db` (379 wrestlers) → `test_account_123.db`
2. User activates "Test Account"
3. GET /api/wrestlers → Returns 379 wrestlers ✓

### Actual Behavior:
If template.db missing:
1. Creates `test_account_123.db` with empty tables
2. User activates "Test Account"  
3. GET /api/wrestlers → Returns [] (empty) ✗

## Database File Hierarchy

```
data/
├── accounts.db                          ← Account metadata (which DB to use)
│   └── Table: accounts
│       ├── id=1, name="Default Account", dbFileName="wwe-universe.db", isActive=1
│       └── id=2, name="Test Account", dbFileName="test_account_123.db", isActive=0
│
├── template.db                          ← Master template (379 wrestlers)
│   ├── shows (11 rows: RAW, SmackDown, NXT, AEW, TNA, AAA, Legends, etc.)
│   └── wrestlers (379 rows: all default wrestlers)
│
├── default.db                           ← Fallback template (379 wrestlers)
│   └── Same structure as template.db
│
├── wwe-universe.db                      ← Default Account's data (ACTIVE)
│   ├── shows (11 rows)
│   ├── wrestlers (379 rows)
│   └── matches, championships, etc.
│
└── test_account_123.db                  ← New Account's data
    ├── shows (11 rows) ← Should be copied
    └── wrestlers (0 rows) ← PROBLEM: Empty instead of 379!
```

## Account Activation Flow

```
User clicks "Activate" on account ID=2
         │
         ▼
POST /api/accounts/2/activate
         │
         ▼
server/index.js:
├─ Get account from accounts.db
│  └─ account = { id: 2, dbFileName: "test_account_123.db" }
│
├─ db.setActiveAccount(2)
│  └─ UPDATE accounts SET isActive=0 (all)
│  └─ UPDATE accounts SET isActive=1 WHERE id=2
│
├─ db.close() (close old connection)
│
├─ db = new Database("test_account_123.db")
│  └─ Opens data/test_account_123.db
│
├─ db.init()
│  └─ Run migrations
│  └─ Create tables if not exist
│
└─ Return { success: true }
```

## Middleware: ensureActiveAccountDb

```
Every API request → ensureActiveAccountDb()
         │
         ▼
1. Query accounts.db for active account
   activeAccount = SELECT * FROM accounts WHERE isActive=1
         │
         ▼
2. Check current DB connection
   currentDbFile = path.basename(db.db.name)
         │
         ▼
3. If different, switch databases
   if (currentDbFile !== activeAccount.dbFileName) {
     db.close()
     db = new Database(activeAccount.dbFileName)
     db.init()
   }
         │
         ▼
4. Continue to endpoint handler
```

## Solution Required

Update the account creation fallback to properly initialize with data:

```javascript
} else {
  // Create database with full path
  const tempDb = new Database(newAccountPath);  // Use full path
  tempDb.init();  // This only creates tables
  
  // TODO: Load default roster data here
  // Option 1: Import from default SQL file
  // Option 2: Copy wrestlers from template programmatically
  // Option 3: Always ensure template.db exists
  
  tempDb.close();
}
```

The current fix ensures template.db exists, but if it doesn't, the fallback to default.db should work. If both are missing, the database will be empty.
