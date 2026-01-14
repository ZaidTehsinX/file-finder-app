import React, { useState } from 'react';
import type { SearchStats } from '../utils/fileSearch';
import { formatFileSize } from '../utils/fileSearch';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  results: SearchStats;
  filename: string;
  onReset: () => void;
}

type ViewMode = 'list' | 'compact';

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  filename,
  onReset,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Search Results for: <span className="filename">{filename}</span></h2>
        
        <div className="results-controls">
          <div className="view-mode-selector">
            <label>View as:</label>
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="view-mode-select"
            >
              <option value="list">Detailed List</option>
              <option value="compact">Compact View</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-summary">
        <div className="summary-stat">
          <span className="stat-label">Folders Scanned</span>
          <span className="stat-value">{results.totalFoldersScanned}</span>
        </div>
        <div className="summary-stat highlight">
          <span className="stat-label">With File</span>
          <span className="stat-value success">{results.totalFoldersWithFile}</span>
        </div>
        <div className="summary-stat highlight">
          <span className="stat-label">Without File</span>
          <span className="stat-value">{results.totalFoldersWithoutFile}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Total Files Found</span>
          <span className="stat-value">{results.totalFilesFound}</span>
        </div>
      </div>

      {viewMode === 'list' ? (
        <DetailedListView results={results} />
      ) : (
        <CompactView results={results} />
      )}

      <button onClick={onReset} className="btn-reset">
        ← New Search
      </button>
    </div>
  );
};

const DetailedListView: React.FC<{ results: SearchStats }> = ({ results }) => {
  return (
    <div className="results-content">
      <div className="results-section">
        <div className="section-header with-file">
          <h3>✓ Folders With File ({results.totalFoldersWithFile})</h3>
        </div>
        
        {results.foldersWithFile.length > 0 ? (
          <div className="folders-grid">
            {results.foldersWithFile.map((folder, index) => (
              <div key={index} className="folder-card with-file-card">
                <div className="folder-info">
                  <p className="folder-path">{folder.folderPath}</p>
                  <div className="files-in-folder">
                    {folder.foundFiles.map((file, fileIndex) => (
                      <div key={fileIndex} className="file-item">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No folders found with the file</p>
        )}
      </div>

      <div className="results-section">
        <div className="section-header without-file">
          <h3>✗ Folders Without File ({results.totalFoldersWithoutFile})</h3>
        </div>
        
        {results.foldersWithoutFile.length > 0 ? (
          <div className="folders-grid">
            {results.foldersWithoutFile.map((folder, index) => (
              <div key={index} className="folder-card without-file-card">
                <p className="folder-path">{folder.folderPath}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">All folders contain the file</p>
        )}
      </div>
    </div>
  );
};

const CompactView: React.FC<{ results: SearchStats }> = ({ results }) => {
  return (
    <div className="results-content compact">
      <div className="results-section">
        <div className="section-header with-file">
          <h3>✓ With File ({results.totalFoldersWithFile})</h3>
        </div>
        
        {results.foldersWithFile.length > 0 ? (
          <ul className="compact-list">
            {results.foldersWithFile.map((folder, index) => (
              <li key={index} className="compact-item with-file">
                <span className="item-text">{folder.folderPath}</span>
                <span className="file-count">
                  {folder.foundFiles.length} file{folder.foundFiles.length !== 1 ? 's' : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">No folders found with the file</p>
        )}
      </div>

      <div className="results-section">
        <div className="section-header without-file">
          <h3>✗ Without File ({results.totalFoldersWithoutFile})</h3>
        </div>
        
        {results.foldersWithoutFile.length > 0 ? (
          <ul className="compact-list">
            {results.foldersWithoutFile.map((folder, index) => (
              <li key={index} className="compact-item without-file">
                <span className="item-text">{folder.folderPath}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">All folders contain the file</p>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
