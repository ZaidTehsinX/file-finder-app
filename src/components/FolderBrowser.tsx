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
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPathInput, setShowPathInput] = useState(true);

  const fetchFolders = async (path: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/list-dirs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setFolders(data.folders);
      setCurrentPath(path);
    } catch (err) {
      setError((err as Error).message);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToPath = () => {
    const pathInput = document.getElementById('pathInput') as HTMLInputElement;
    const path = pathInput?.value?.trim();
    if (path) {
      fetchFolders(path);
      setShowPathInput(false);
    }
  };

  const handleFolderClick = (path: string) => {
    fetchFolders(path);
  };

  const handleSelectFolder = () => {
    if (currentPath) {
      onSelectFolder(currentPath);
      onClose();
    }
  };

  const handleGoUp = () => {
    const parts = currentPath.split('\\');
    parts.pop();
    const parentPath = parts.join('\\') || 'C:\\';
    fetchFolders(parentPath);
  };

  useEffect(() => {
    // Try to start with common root paths on Windows
    if (!currentPath && showPathInput) {
      // Default to a common location or user's home
    }
  }, []);

  return (
    <div className="folder-browser-overlay">
      <div className="folder-browser-modal">
        <div className="folder-browser-header">
          <h2>Select a Folder</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {showPathInput && (
          <div className="path-input-section">
            <input
              id="pathInput"
              type="text"
              placeholder="Enter folder path (e.g., C:\Users\YourName\Documents)"
              className="path-input"
              onKeyPress={(e) => e.key === 'Enter' && handleNavigateToPath()}
            />
            <button onClick={handleNavigateToPath} className="browse-btn">
              Browse
            </button>
          </div>
        )}

        {currentPath && !showPathInput && (
          <div className="current-path">
            <strong>Current Path:</strong> {currentPath}
            <button onClick={() => setShowPathInput(true)} className="change-path-btn">
              Change Path
            </button>
          </div>
        )}

        {error && <div className="error-message">Error: {error}</div>}

        {loading && <div className="loading">Loading folders...</div>}

        {!loading && folders.length > 0 && (
          <div className="folders-list">
            {currentPath && currentPath !== 'C:\\' && (
              <div className="folder-item parent-folder" onClick={handleGoUp}>
                <span className="folder-icon">📁</span>
                <span className="folder-name">.. (Parent Folder)</span>
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

        {!loading && folders.length === 0 && currentPath && (
          <div className="no-folders">No subfolders found in this directory</div>
        )}

        <div className="folder-browser-footer">
          <button
            onClick={handleSelectFolder}
            disabled={!currentPath}
            className="select-btn"
          >
            Select This Folder
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
