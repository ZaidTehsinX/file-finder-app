import fs from 'fs';
import path from 'path';

export async function scanFolderRecursive(folderPath, db, scanId) {
  let totalFiles = 0;
  let totalFolders = 0;
  const fileRecords = [];
  const allFoldersSet = new Set();

  async function scanDir(dirPath, depth = 0) {
    try {
      allFoldersSet.add(dirPath);
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files/folders
        if (entry.name.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isFile()) {
          // Process all files (not just PDFs)
          totalFiles++;
          try {
            const stats = fs.statSync(fullPath);
            const ext = path.extname(entry.name) || 'no-extension';
            fileRecords.push({
              scanId,
              fileName: entry.name,
              filePath: fullPath,
              fileSize: stats.size,
              folderPath: dirPath,
              fileExtension: ext
            });
          } catch (error) {
            console.error(`Error getting stats for ${fullPath}:`, error.message);
          }
        } else if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await scanDir(fullPath, depth + 1);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
  }

  await scanDir(folderPath);
  totalFolders = allFoldersSet.size;

  // Batch insert file records
  if (fileRecords.length > 0) {
    for (const record of fileRecords) {
      await db.run(
        `INSERT INTO files (scanId, fileName, filePath, fileSize, folderPath, fileExtension)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          record.scanId,
          record.fileName,
          record.filePath,
          record.fileSize,
          record.folderPath,
          record.fileExtension
        ]
      );
    }
  }

  // Insert all folders into the folders table
  for (const folderPath of allFoldersSet) {
    await db.run(
      `INSERT INTO folders (scanId, folderPath) VALUES (?, ?)`,
      [scanId, folderPath]
    );
  }

  return { totalFolders, totalFiles };
}

export async function searchFiles(db, folderPath, searchTerm) {
  // Get the scan for this folder
  const scan = await db.get('SELECT id FROM scans WHERE folderPath = ?', [folderPath]);
  
  if (!scan) {
    return {
      foldersScanned: 0,
      filesFound: [],
      summary: 'No scan results found for this folder'
    };
  }

  // Get all unique folders that were scanned from the folders table
  const allFoldersResult = await db.all(
    `SELECT DISTINCT folderPath FROM folders WHERE scanId = ? ORDER BY folderPath`,
    [scan.id]
  );

  const allFolders = new Set(allFoldersResult.map(row => row.folderPath));

  // Search for files matching the search term (case-insensitive)
  const searchPattern = `%${searchTerm.toLowerCase()}%`;
  const files = await db.all(
    `SELECT DISTINCT filePath, fileName, fileSize, folderPath
     FROM files
     WHERE scanId = ? AND LOWER(fileName) LIKE ?
     ORDER BY folderPath, fileName`,
    [scan.id, searchPattern]
  );

  // Group files by folder
  const filesByFolder = {};
  for (const file of files) {
    if (!filesByFolder[file.folderPath]) {
      filesByFolder[file.folderPath] = [];
    }
    filesByFolder[file.folderPath].push(file);
  }

  // Create foldersWithFile array
  const foldersWithFileArray = Object.entries(filesByFolder).map(([folderPath, folderFiles]) => ({
    folderPath,
    hasFile: true,
    foundFiles: folderFiles.map(f => ({
      name: f.fileName,
      size: f.fileSize,
      path: f.filePath
    }))
  }));

  // Create foldersWithoutFile array - all folders not in filesByFolder
  const foldersWithoutFileArray = Array.from(allFolders)
    .filter(folderPath => !filesByFolder[folderPath])
    .map(folderPath => ({
      folderPath,
      hasFile: false,
      foundFiles: []
    }));

  return {
    foldersWithFile: foldersWithFileArray,
    foldersWithoutFile: foldersWithoutFileArray,
    totalFoldersScanned: allFolders.size,
    totalFoldersWithFile: foldersWithFileArray.length,
    totalFoldersWithoutFile: foldersWithoutFileArray.length,
    totalFilesFound: files.length
  };
}
