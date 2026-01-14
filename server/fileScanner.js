import fs from 'fs';
import path from 'path';

export async function scanFolderRecursive(folderPath, db, scanId) {
  let totalFiles = 0;
  let totalFolders = 0;
  const fileRecords = [];

  async function scanDir(dirPath, depth = 0) {
    try {
      totalFolders++;
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files/folders
        if (entry.name.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isFile()) {
          // Only process PDF files
          if (entry.name.toLowerCase().endsWith('.pdf')) {
            totalFiles++;
            try {
              const stats = fs.statSync(fullPath);
              fileRecords.push({
                scanId,
                fileName: entry.name,
                filePath: fullPath,
                fileSize: stats.size,
                folderPath: dirPath,
                fileExtension: '.pdf'
              });
            } catch (error) {
              console.error(`Error getting stats for ${fullPath}:`, error.message);
            }
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

  // Search for PDF files matching the search term (case-insensitive)
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

  return {
    foldersWithFile: Object.entries(filesByFolder).map(([folderPath, folderFiles]) => ({
      folderPath,
      hasFile: true,
      foundFiles: folderFiles.map(f => ({
        name: f.fileName,
        size: f.fileSize,
        path: f.filePath
      }))
    })),
    foldersWithoutFile: [],
    totalFoldersScanned: 0,
    totalFoldersWithFile: Object.keys(filesByFolder).length,
    totalFoldersWithoutFile: 0,
    totalFilesFound: files.length
  };
}
