import React, { useState, useEffect } from 'react';
import './FolderBrowser.css';

interface FolderBrowserProps {
  onSelectFolder: (path: string) => void;
  onClose: () => void;
}

interface FolderItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

const FolderBrowser: React.FC<FolderBrowserProps> = ({ onSelectFolder, onClose }) => {
  const [currentPath, setCurrentPath] = useState('');
  const [pathInput, setPathInput] = useState('');
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [drives, setDrives] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDrives, setShowDrives] = useState(true);

  const fetchDrives = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching available drives...');
      const response = await fetch('http://localhost:3001/api/drives');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Drives received:', data);
      setDrives(data.drives || []);
      setShowDrives(true);
      setCurrentPath('');
      setFolders([]);
    } catch (err) {
      console.error('Error fetching drives:', err);
      setError((err as Error).message);
      setDrives(['C:\\', 'D:\\', 'E:\\']);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async (path: string) => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching folders from:', path);
      const response = await fetch('http://localhost:3001/api/list-dirs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Folders received:', data);
      setFolders(data.folders || []);
      setCurrentPath(path);
      setPathInput(path);
      setShowDrives(false);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError((err as Error).message);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBrowse = async () => {
    const path = pathInput?.trim();
    if (path) {
      await fetchFolders(path);
    }
  };

  const handleFolderClick = async (path: string) => {
    await fetchFolders(path);
  };

  const handleDriveClick = async (drive: string) => {
    await fetchFolders(drive);
  };

  const handleSelectFolder = () => {
    if (currentPath) {
      onSelectFolder(currentPath);
      onClose();
    }
  };

  const handleGoUp = async () => {
    if (!currentPath) return;
    
    const parts = currentPath.split('\\').filter(p => p);
    if (parts.length > 1) {
      parts.pop();
      const parentPath = parts.join('\\') + '\\';
      await fetchFolders(parentPath);
    } else {
      // Go back to drives
      await fetchDrives();
    }
  };

  // Load drives on mount
  useEffect(() => {
    fetchDrives();
  }, []);

  return (
    <div className="folder-browser-overlay">
      <div className="folder-browser-modal">
        <div className="folder-browser-header">
          <h2>Select a Folder</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="path-input-section">
          <input
            type="text"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="Enter folder path (e.g., C:\Users\YourName\Documents)"
            className="path-input"
            onKeyPress={(e) => e.key === 'Enter' && handleBrowse()}
          />
          <button onClick={handleBrowse} className="browse-btn">
            📂 Go
          </button>
        </div>

        {currentPath && (
          <div className="current-path">
            <strong>Current:</strong>
            <span className="path-text">{currentPath}</span>
          </div>
        )}

        {error && <div className="error-message">Error: {error}</div>}

        {loading && <div className="loading">Loading...</div>}

        {!loading && showDrives && drives.length > 0 && (
          <div className="folders-list drives-view">
            <div className="drives-title">📀 Available Drives</div>
            {drives.map((drive) => (
              <div
                key={drive}
                className="folder-item drive-item"
                onClick={() => handleDriveClick(drive)}
              >
                <span className="folder-icon">💾</span>
                <span className="folder-name">{drive}</span>
              </div>
            ))}
          </div>
        )}

        {!loading && !showDrives && folders.length > 0 && (
          <div className="folders-list">
            {currentPath && (
              <div className="folder-item parent-folder" onClick={handleGoUp}>
                <span className="folder-icon">⬆️</span>
                <span className="folder-name">.. (Back)</span>
              </div>
            )}
            {folders.map((folder) => (
              <div
                key={folder.path}
                className="folder-item"
                onClick={() => handleFolderClick(folder.path)}
              >
                <span className="folder-icon">📁</span>
                <span className="folder-name">{folder.name}</span>
              </div>
            ))}
          </div>
        )}

        {!loading && !showDrives && folders.length === 0 && currentPath && (
          <div className="no-folders">No subfolders found in this directory</div>
        )}

        <div className="folder-browser-footer">
          <button
            onClick={handleSelectFolder}
            disabled={!currentPath}
            className="select-btn"
          >
            ✓ Select This Folder
          </button>
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderBrowser;
