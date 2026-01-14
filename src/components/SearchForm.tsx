import React, { useState } from 'react';
import FolderBrowser from './FolderBrowser';
import './SearchForm.css';

interface SearchFormProps {
  onSearch: (filename: string, folderPath: string) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [filename, setFilename] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [showBrowser, setShowBrowser] = useState(false);

  const handleSelectFolder = () => {
    setShowBrowser(true);
  };

  const handleFolderSelected = (path: string) => {
    setFolderPath(path);
    setShowBrowser(false);
  };

  const handleRemoveFolder = () => {
    setFolderPath('');
  };

  const handleSearch = async () => {
    if (filename.trim() && folderPath.trim()) {
      onSearch(filename, folderPath);
    }
  };

  return (
    <>
      {showBrowser && (
        <FolderBrowser
          onSelectFolder={handleFolderSelected}
          onClose={() => setShowBrowser(false)}
        />
      )}
      
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
            <p className="input-hint">Supports all file types: Documents (PDF, DOCX, XLSX), Images (JPG, PNG, GIF), Videos, Audio, and more</p>
          </div>

          <div className="folder-selection">
            <label className="input-label">Select Folder to Search</label>
            {folderPath ? (
              <div className="selected-folder">
                <div className="folder-info">
                  <span className="folder-icon">📁</span>
                  <span className="folder-name" title={folderPath}>{folderPath}</span>
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
    </>
  );
};

export default SearchForm;
