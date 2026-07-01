import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, 'data');

console.log('\n=== Checking test_account_123_1782653902988.db ===');
try {
  const testDb = new Database(path.join(dataDir, 'test_account_123_1782653902988.db'));
  const wrestlers = testDb.prepare('SELECT COUNT(*) as count FROM wrestlers').get();
  console.log(`Wrestlers in new test account: ${wrestlers.count}`);
  if (wrestlers.count > 0) {
    const sample = testDb.prepare('SELECT * FROM wrestlers LIMIT 5').all();
    console.log('Sample wrestlers:', sample);
  }
  testDb.close();
} catch (e) {
  console.error('Error:', e.message);
}
