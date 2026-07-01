import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const accountsDb = new Database(path.join(dataDir, 'accounts.db'));

// Get the Default Account
const defaultAccount = accountsDb.prepare('SELECT * FROM accounts WHERE dbFileName = ?').get('default.db');

if (defaultAccount) {
  // Set it as active
  accountsDb.prepare('UPDATE accounts SET isActive = 0').run();
  accountsDb.prepare('UPDATE accounts SET isActive = 1 WHERE id = ?').run(defaultAccount.id);
  console.log('✅ Set Default Account (default.db) as active');
} else {
  console.log('❌ Default Account not found');
}

accountsDb.close();
