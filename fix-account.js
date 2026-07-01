import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const accountsDb = new Database(path.join(dataDir, 'accounts.db'));

// Update the default account to use wwe-universe.db
accountsDb.prepare('UPDATE accounts SET dbFileName = ? WHERE name = ?')
  .run('wwe-universe.db', 'Default Account');

console.log('✅ Updated Default Account to use wwe-universe.db');

accountsDb.close();
