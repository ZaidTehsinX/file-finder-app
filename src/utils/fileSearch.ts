export interface SearchResult {
  folderPath: string;
  foundFiles: Array<{
    name: string;
    size: number;
    path: string;
  }>;
  hasFile: boolean;
}

export interface SearchStats {
  totalFoldersScanned: number;
  totalFoldersWithFile: number;
  totalFoldersWithoutFile: number;
  totalFilesFound: number;
  foldersWithFile: SearchResult[];
  foldersWithoutFile: SearchResult[];
}

// Convert wildcard pattern to regex
function wildcardToRegex(wildcard: string): RegExp {
  const escaped = wildcard
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
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
  folders: FileSystemDirectoryHandle[],
  filename: string
): Promise<SearchStats> {
  const pattern = wildcardToRegex(filename);
  const results: SearchResult[] = [];

  for (const folder of folders) {
    const folderResults = await scanFolder(folder, pattern, folder.name);
    results.push(...folderResults);
  }

  const foldersWithFile = results.filter(r => r.hasFile);
  const foldersWithoutFile = results.filter(r => !r.hasFile);
  
  const totalFilesFound = foldersWithFile.reduce(
    (sum, folder) => sum + folder.foundFiles.length,
    0
  );

  return {
    totalFoldersScanned: results.length,
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
  parentPath: string = ''
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const fullPath = parentPath ? `${parentPath}/${handle.name}` : handle.name;
  const foundFiles: SearchResult['foundFiles'] = [];

  try {
    for await (const entry of handle.values()) {
      // Skip hidden files/folders
      if (entry.name.startsWith('.')) {
        continue;
      }

      if (entry.kind === 'file') {
        // Check if filename matches the pattern
        if (pattern.test(entry.name)) {
          const file = await (entry as FileSystemFileHandle).getFile();
          foundFiles.push({
            name: entry.name,
            size: file.size,
            path: `${fullPath}/${entry.name}`,
          });
        }
      } else if (entry.kind === 'directory') {
        // Recursively scan subdirectories
        const subResults = await scanFolder(
          entry as FileSystemDirectoryHandle,
          pattern,
          fullPath
        );
        results.push(...subResults);
      }
    }

    // Add this folder to results
    if (foundFiles.length > 0) {
      results.push({
        folderPath: fullPath,
        foundFiles,
        hasFile: true,
      });
    } else {
      results.push({
        folderPath: fullPath,
        foundFiles: [],
        hasFile: false,
      });
    }
  } catch (error) {
    console.error(`Error scanning folder ${fullPath}:`, error);
    results.push({
      folderPath: fullPath,
      foundFiles: [],
      hasFile: false,
    });
  }

  return results;
}

export { formatFileSize };
