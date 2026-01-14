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
    const folderResults = await scanFolder(folder, pattern);
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
  pattern: RegExp
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

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
          results.push({
            folderPath: handle.name,
            foundFiles: [
              {
                name: entry.name,
                size: file.size,
                path: `${handle.name}/${entry.name}`,
              },
            ],
            hasFile: true,
          });
          return results;
        }
      } else if (entry.kind === 'directory') {
        // Recursively scan subdirectories
        const subResults = await scanFolder(
          entry as FileSystemDirectoryHandle,
          pattern
        );
        results.push(...subResults);
      }
    }

    // If no file was found in this folder tree, add an empty result
    if (results.length === 0) {
      results.push({
        folderPath: handle.name,
        foundFiles: [],
        hasFile: false,
      });
    }
  } catch (error) {
    console.error(`Error scanning folder ${handle.name}:`, error);
  }

  return results;
}

export { formatFileSize };
