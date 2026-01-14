import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../file-finder.db');

// Open database with promisified interface
const sqlite3_db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database opening error: ', err);
  } else {
    console.log('Database connected');
  }
});

// Promisify database methods
const db = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqlite3_db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqlite3_db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqlite3_db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      sqlite3_db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folderPath TEXT UNIQUE NOT NULL,
    scanDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    totalFolders INTEGER,
    totalFiles INTEGER
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scanId INTEGER NOT NULL,
    fileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    fileSize INTEGER,
    folderPath TEXT,
    fileExtension TEXT,
    FOREIGN KEY (scanId) REFERENCES scans(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scanId INTEGER NOT NULL,
    folderPath TEXT NOT NULL,
    FOREIGN KEY (scanId) REFERENCES scans(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_files_scanId ON files(scanId);
  CREATE INDEX IF NOT EXISTS idx_files_fileName ON files(fileName);
  CREATE INDEX IF NOT EXISTS idx_files_folderPath ON files(folderPath);
  CREATE INDEX IF NOT EXISTS idx_folders_scanId ON folders(scanId);
`).catch(err => console.log('Tables might already exist:', err.message));

export default db;
