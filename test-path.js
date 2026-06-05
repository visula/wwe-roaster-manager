import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'data/wwe-universe.db');

console.log('__dirname:', __dirname);
console.log('DB_PATH:', DB_PATH);
console.log('cwd:', process.cwd());
