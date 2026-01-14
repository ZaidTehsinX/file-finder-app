import express from 'express';
import cors from 'cors';
import db from './db.js';
import { scanFolderRecursive, searchFiles } from './fileScanner.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Endpoint to scan a folder
app.post('/api/scan', async (req, res) => {
  try {
    const { folderPath } = req.body;

    if (!folderPath) {
      return res.status(400).json({ error: 'folderPath is required' });
    }

    console.log(`Scanning folder: ${folderPath}`);

    // Check if we already have a scan for this folder
    let scan = db.prepare('SELECT id FROM scans WHERE folderPath = ?').get(folderPath);
    
    if (scan) {
      // Delete old scan and files
      db.prepare('DELETE FROM scans WHERE id = ?').run(scan.id);
    }

    // Create new scan
    const result = db.prepare('INSERT INTO scans (folderPath) VALUES (?)').run(folderPath);
    const scanId = result.lastInsertRowid;

    // Scan the folder recursively
    const { totalFolders, totalFiles } = await scanFolderRecursive(folderPath, db, scanId);

    // Update scan record with totals
    db.prepare('UPDATE scans SET totalFolders = ?, totalFiles = ? WHERE id = ?')
      .run(totalFolders, totalFiles, scanId);

    res.json({
      success: true,
      message: `Scan complete: ${totalFiles} PDF files found in ${totalFolders} folders`,
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
app.post('/api/search', (req, res) => {
  try {
    const { folderPath, searchTerm } = req.body;

    if (!folderPath || !searchTerm) {
      return res.status(400).json({ error: 'folderPath and searchTerm are required' });
    }

    console.log(`Searching for "${searchTerm}" in ${folderPath}`);

    const results = searchFiles(db, folderPath, searchTerm);

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
  console.log(`   Scan endpoint: POST http://localhost:${PORT}/api/scan`);
  console.log(`   Search endpoint: POST http://localhost:${PORT}/api/search`);
});
