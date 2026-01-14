export interface FolderResult {
  folderPath: string;
  hasFile: boolean;
  foundFiles: Array<{
    name: string;
    size: number;
    path: string;
  }>;
  depth: number; // How deep in the hierarchy
}

export interface SearchStats {
  totalFoldersScanned: number;
  totalFoldersWithFile: number;
  totalFoldersWithoutFile: number;
  totalFilesFound: number;
  foldersWithFile: FolderResult[];
  foldersWithoutFile: FolderResult[];
}

// Type for FileSystemDirectoryHandle with async iterator
type FileSystemDirectoryHandleWithIterator = FileSystemDirectoryHandle & AsyncIterable<FileSystemHandle>;

// Convert wildcard pattern to regex (PDF files only)
function wildcardToRegex(wildcard: string): RegExp {
  const escaped = wildcard
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  // Match pattern anywhere in the filename, but only for PDF files (case-insensitive)
  return new RegExp(escaped + '.*\\.pdf$', 'i');
}

// Format file size to human readable format
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export async function searchFiles(
  folderHandle: FileSystemDirectoryHandle,
  filename: string
): Promise<SearchStats> {
  const pattern = wildcardToRegex(filename);
  const results: FolderResult[] = [];
  let totalScanned = 0;

  // Start recursive scan from depth 0
  await scanFolder(folderHandle, pattern, folderHandle.name, 0, results);

  totalScanned = results.length;
  const foldersWithFile = results.filter(r => r.hasFile);
  const foldersWithoutFile = results.filter(r => !r.hasFile);
  
  const totalFilesFound = foldersWithFile.reduce(
    (sum, folder) => sum + folder.foundFiles.length,
    0
  );

  return {
    totalFoldersScanned: totalScanned,
    totalFoldersWithFile: foldersWithFile.length,
    totalFoldersWithoutFile: foldersWithoutFile.length,
    totalFilesFound,
    foldersWithFile,
    foldersWithoutFile,
  };
}

async function scanFolder(
  handle: FileSystemDirectoryHandle,
  pattern: RegExp,
  fullPath: string,
  depth: number,
  results: FolderResult[]
): Promise<void> {
  const foundFiles: FolderResult['foundFiles'] = [];

  console.log(`Scanning folder: ${fullPath} at depth ${depth}`);

  try {
    // Iterate through all entries in this folder
    for await (const entry of (handle as FileSystemDirectoryHandleWithIterator)) {
      // Skip hidden files/folders
      if (entry.name.startsWith('.')) {
        continue;
      }

      if (entry.kind === 'file') {
        console.log(`  Checking file: ${entry.name}`);
        // Check if filename matches the pattern
        if (pattern.test(entry.name)) {
          const file = await (entry as FileSystemFileHandle).getFile();
          console.log(`    ✓ Match found: ${entry.name}`);
          foundFiles.push({
            name: entry.name,
            size: file.size,
            path: `${fullPath}/${entry.name}`,
          });
        }
      } else if (entry.kind === 'directory') {
        console.log(`  Found subfolder: ${entry.name}, recursing...`);
        // Recursively scan subdirectories
        const subFolderPath = `${fullPath}/${entry.name}`;
        await scanFolder(
          entry as FileSystemDirectoryHandle,
          pattern,
          subFolderPath,
          depth + 1,
          results
        );
      }
    }

    // Add this folder to results
    results.push({
      folderPath: fullPath,
      hasFile: foundFiles.length > 0,
      foundFiles,
      depth,
    });
    
    console.log(`Finished scanning ${fullPath}: Found ${foundFiles.length} matching files`);
  } catch (error) {
    console.error(`Error scanning folder ${fullPath}:`, error);
    results.push({
      folderPath: fullPath,
      hasFile: false,
      foundFiles: [],
      depth,
    });
  }
}

export { formatFileSize };
