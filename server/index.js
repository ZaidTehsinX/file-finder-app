import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import db from './db.js';
import { scanFolderRecursive, searchFiles } from './fileScanner.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all available drives
function getAvailableDrives() {
  try {
    const drives = [];
    // Check common drive letters A-Z
    for (let i = 65; i <= 90; i++) {
      const driveLetter = String.fromCharCode(i);
      const drivePath = `${driveLetter}:\\`;
      
      try {
        if (fs.existsSync(drivePath)) {
          drives.push(drivePath);
        }
      } catch (err) {
        // Drive doesn't exist, skip it
      }
    }
    
    return drives.length > 0 ? drives : ['C:\\'];
  } catch (error) {
    console.error('Error getting drives:', error);
    return ['C:\\'];
  }
}

// Endpoint to list all drives
app.get('/api/drives', (req, res) => {
  try {
    const drives = getAvailableDrives();
    const availableDrives = drives.filter(drive => {
      try {
        return fs.existsSync(drive);
      } catch {
        return false;
      }
    });

    res.json({ drives: availableDrives });
  } catch (error) {
    console.error('Drives error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to list directories
app.post('/api/list-dirs', (req, res) => {
  try {
    const { path: folderPath } = req.body;

    if (!folderPath) {
      return res.status(400).json({ error: 'path is required' });
    }

    // Check if path exists
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: 'Path does not exist' });
    }

    const stat = fs.statSync(folderPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    // List subdirectories
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const folders = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => ({
        name: entry.name,
        path: path.join(folderPath, entry.name)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ folders });
  } catch (error) {
    console.error('List dirs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to scan a folder
app.post('/api/scan', async (req, res) => {
  try {
    const { folderPath } = req.body;

    if (!folderPath) {
      return res.status(400).json({ error: 'folderPath is required' });
    }

    console.log(`Scanning folder: ${folderPath}`);

    // Check if we already have a scan for this folder
    let scan = await db.get('SELECT id FROM scans WHERE folderPath = ?', [folderPath]);
    
    if (scan) {
      // Delete old scan and files
      await db.run('DELETE FROM scans WHERE id = ?', [scan.id]);
    }

    // Create new scan
    const result = await db.run('INSERT INTO scans (folderPath) VALUES (?)', [folderPath]);
    const scanId = result.lastID;

    // Scan the folder recursively
    const { totalFolders, totalFiles } = await scanFolderRecursive(folderPath, db, scanId);

    // Update scan record with totals
    await db.run('UPDATE scans SET totalFolders = ?, totalFiles = ? WHERE id = ?',
      [totalFolders, totalFiles, scanId]);

    res.json({
      success: true,
      message: `Scan complete: ${totalFiles} files found in ${totalFolders} folders`,
      scanId,
      totalFolders,
      totalFiles
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to search files
app.post('/api/search', async (req, res) => {
  try {
    const { folderPath, searchTerm } = req.body;

    if (!folderPath || !searchTerm) {
      return res.status(400).json({ error: 'folderPath and searchTerm are required' });
    }

    console.log(`Searching for "${searchTerm}" in ${folderPath}`);

    const results = await searchFiles(db, folderPath, searchTerm);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`📁 File Finder Backend running on http://localhost:${PORT}`);
  console.log(`   List drives: GET http://localhost:${PORT}/api/drives`);
  console.log(`   List dirs: POST http://localhost:${PORT}/api/list-dirs`);
  console.log(`   Scan endpoint: POST http://localhost:${PORT}/api/scan`);
  console.log(`   Search endpoint: POST http://localhost:${PORT}/api/search`);
});
