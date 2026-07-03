import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '../../cache');

export function initializeCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log('✓ Cache directory initialized');
  }
}

export function getCacheFile(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}

export function readCache(key) {
  try {
    const filePath = getCacheFile(key);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      console.log(`✓ Cache hit for: ${key}`);
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn(`Cache read error for ${key}:`, error.message);
  }
  return null;
}

export function writeCache(key, data) {
  try {
    const filePath = getCacheFile(key);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✓ Cache written for: ${key}`);
  } catch (error) {
    console.warn(`Cache write error for ${key}:`, error.message);
  }
}
