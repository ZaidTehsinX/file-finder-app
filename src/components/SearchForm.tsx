import React, { useState } from 'react';
import './SearchForm.css';

interface SearchFormProps {
  onSearch: (filename: string, folder: FileSystemDirectoryHandle) => void;
  isLoading: boolean;
}

declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite';
      startIn?: FileSystemHandle;
    }): Promise<FileSystemDirectoryHandle>;
  }
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [filename, setFilename] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<FileSystemDirectoryHandle | null>(null);

  const handleSelectFolder = async () => {
    try {
      const folderHandle = await window.showDirectoryPicker({
        mode: 'read',
      });
      setSelectedFolder(folderHandle);
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleRemoveFolder = () => {
    setSelectedFolder(null);
  };

  const handleSearch = () => {
    if (filename.trim() && selectedFolder) {
      onSearch(filename, selectedFolder);
    }
  };

  return (
    <div className="search-form-container">
      <div className="form-step">
        <h2 className="step-title">Search for Files</h2>
        <p className="step-description">
          Enter the filename and select a folder to search recursively
        </p>

        <div className="form-group">
          <label className="input-label">File Name or Pattern</label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="e.g., report*.pdf or image.jpg"
            className="input-field"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isLoading}
          />
          <p className="input-hint">Use * for wildcard patterns (e.g., *.pdf, document*.txt)</p>
        </div>

        <div className="folder-selection">
          <label className="input-label">Select Folder to Search</label>
          {selectedFolder ? (
            <div className="selected-folder">
              <div className="folder-info">
                <span className="folder-icon">📁</span>
                <span className="folder-name">{selectedFolder.name}</span>
              </div>
              <button
                onClick={handleRemoveFolder}
                className="remove-folder-btn"
                type="button"
                disabled={isLoading}
              >
                Change Folder
              </button>
            </div>
          ) : (
            <p className="no-folder-message">No folder selected</p>
          )}
          
          <button
            onClick={handleSelectFolder}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            📁 {selectedFolder ? 'Change Folder' : 'Select Folder'}
          </button>
        </div>

        <button
          onClick={handleSearch}
          disabled={!filename.trim() || !selectedFolder || isLoading}
          className="btn btn-primary"
        >
          {isLoading ? '🔍 Searching...' : '🔍 Search Recursively'}
        </button>
      </div>
    </div>
  );
};

export default SearchForm;
