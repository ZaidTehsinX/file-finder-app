import React, { useState } from 'react';
import './SearchForm.css';

interface SearchFormProps {
  onSearch: (filename: string, folderPath: string) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [filename, setFilename] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [folderInput, setFolderInput] = useState('');

  const handleSelectFolder = async () => {
    try {
      // Open file picker to select folder
      const input = document.createElement('input');
      input.type = 'text';
      input.value = folderPath;
      
      // For now, use a text input for folder path
      const newPath = prompt('Enter the full path to the folder to scan:', folderPath || 'e.g., C:\\Users\\YourName\\Documents');
      if (newPath && newPath.trim()) {
        setFolderPath(newPath.trim());
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleRemoveFolder = () => {
    setFolderPath('');
    setFolderInput('');
  };

  const handleSearch = async () => {
    if (filename.trim() && folderPath.trim()) {
      onSearch(filename, folderPath);
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
            placeholder="e.g., Return or Invoice"
            className="input-field"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isLoading}
          />
          <p className="input-hint">Searches for PDF files only. Type filename (e.g., "Return" finds Return 2024.pdf, Return 2025.pdf, etc.)</p>
        </div>

        <div className="folder-selection">
          <label className="input-label">Select Folder to Search</label>
          {folderPath ? (
            <div className="selected-folder">
              <div className="folder-info">
                <span className="folder-icon">📁</span>
                <span className="folder-name">{folderPath}</span>
              </div>
              <button
                onClick={handleRemoveFolder}
                className="remove-folder-btn"
                type="button"
                disabled={isLoading}
              >
                Clear
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
            📁 {folderPath ? 'Change Folder' : 'Select Folder'}
          </button>
        </div>

        <button
          onClick={handleSearch}
          disabled={!filename.trim() || !folderPath.trim() || isLoading}
          className="btn btn-primary"
        >
          {isLoading ? '🔍 Scanning & Searching...' : '🔍 Search Recursively'}
        </button>
      </div>
    </div>
  );
};

export default SearchForm;
