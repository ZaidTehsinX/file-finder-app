import React, { useState, useRef, useEffect } from 'react';
import type { SearchStats } from '../utils/fileSearch';
import { formatFileSize } from '../utils/fileSearch';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  results: SearchStats;
  filename: string;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  filename,
  onReset,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'all' | 'with' | 'without'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  // Combine both with and without file folders
  const allFolders = [
    ...results.foldersWithFile,
    ...results.foldersWithoutFile,
  ].sort((a, b) => a.folderPath.localeCompare(b.folderPath));

  // Filter based on mode
  const getFilteredFolders = () => {
    if (filterMode === 'with') {
      return results.foldersWithFile.sort((a, b) => a.folderPath.localeCompare(b.folderPath));
    } else if (filterMode === 'without') {
      return results.foldersWithoutFile.sort((a, b) => a.folderPath.localeCompare(b.folderPath));
    }
    return allFolders;
  };

  const displayedFolders = getFilteredFolders();

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="results-fullscreen">
      <div className="results-header-modern">
        <div className="header-content">
          <div className="header-title">
            <h1>Search Results</h1>
            <div className="search-term">
              <span className="search-label">Searching for:</span>
              <span className="search-value">{filename}</span>
            </div>
          </div>
          <button onClick={onReset} className="btn-new-search">
            <span className="icon">🔄</span>
            <span>New Search</span>
          </button>
        </div>
      </div>

      <div className="results-stats-modern">
        <div className="stat-card">
          <div className="stat-icon">📂</div>
          <div className="stat-info">
            <div className="stat-number">{results.totalFoldersWithFile + results.totalFoldersWithoutFile}</div>
            <div className="stat-label">Total Folders</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <div className="stat-number">{results.totalFoldersWithFile}</div>
            <div className="stat-label">With Results</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">○</div>
          <div className="stat-info">
            <div className="stat-number">{results.totalFoldersWithoutFile}</div>
            <div className="stat-label">Without Results</div>
          </div>
        </div>
        <div className="stat-card primary">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <div className="stat-number">{results.totalFilesFound}</div>
            <div className="stat-label">Files Found</div>
          </div>
        </div>
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMode('all')}
        >
          📋 All Results
        </button>
        <button
          className={`filter-btn with-results ${filterMode === 'with' ? 'active' : ''}`}
          onClick={() => setFilterMode('with')}
        >
          ✓ With Results
        </button>
        <button
          className={`filter-btn without-results ${filterMode === 'without' ? 'active' : ''}`}
          onClick={() => setFilterMode('without')}
        >
          ○ Without Results
        </button>
      </div>

      <div className="results-list-container" ref={scrollContainerRef}>
        {displayedFolders.length > 0 ? (
          <div className="modern-results-list">
            {displayedFolders.map((folder, index) => (
              <div 
                key={index} 
                className={`result-item ${folder.hasFile ? 'has-file' : 'no-file'}`}
              >
                <div 
                  className="result-header"
                  onClick={() => folder.foundFiles.length > 0 && toggleFolder(folder.folderPath)}
                >
                  <div className="result-header-left">
                    {folder.foundFiles.length > 0 && (
                      <span className={`expand-icon ${expandedFolders.has(folder.folderPath) ? 'expanded' : ''}`}>
                        ▶
                      </span>
                    )}
                    {!folder.foundFiles.length && <span className="expand-icon empty">•</span>}
                    
                    <span className={`folder-badge ${folder.hasFile ? 'with-file' : 'without-file'}`}>
                      {folder.hasFile ? '✓ Found' : '○ Not Found'}
                    </span>
                  </div>
                  <div className="result-header-middle">
                    <div className="folder-path-modern">{folder.folderPath}</div>
                    {folder.foundFiles.length > 0 && (
                      <div className="file-count">{folder.foundFiles.length} file(s)</div>
                    )}
                  </div>
                  <div className="result-header-right">
                    {folder.foundFiles.length > 0 && (
                      <span className="file-badge">{folder.foundFiles.length}</span>
                    )}
                  </div>
                </div>

                {folder.foundFiles.length > 0 && expandedFolders.has(folder.folderPath) && (
                  <div className="result-files">
                    {folder.foundFiles.map((file, fileIndex) => (
                      <div key={fileIndex} className="file-item">
                        <span className="file-icon">📄</span>
                        <div className="file-info">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                        <span className="file-path" title={file.path}>{file.path}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No folders found</h3>
            <p>Try searching with a different term</p>
          </div>
        )}
      </div>

      <div className="scroll-buttons">
        <button className="scroll-btn scroll-up" onClick={scrollToTop} title="Scroll to top">
          ⬆️
        </button>
        <button className="scroll-btn scroll-down" onClick={scrollToBottom} title="Scroll to bottom">
          ⬇️
        </button>
      </div>

      <div className="results-footer">
        <div className="footer-content">
          <p className="footer-text">Created by <span className="footer-author">Zaid Tehsin</span></p>
          <div className="tech-stack-divider">•</div>
          <div className="tech-icons">
            <a href="https://react.dev" title="React" className="tech-icon react" aria-label="React">
              <span className="tech-icon-label">React</span>
            </a>
            <a href="https://www.typescriptlang.org" title="TypeScript" className="tech-icon typescript" aria-label="TypeScript">
              <span className="tech-icon-label">TypeScript</span>
            </a>
            <a href="https://tailwindcss.com" title="Tailwind CSS" className="tech-icon tailwind" aria-label="Tailwind CSS">
              <span className="tech-icon-label">Tailwind</span>
            </a>
            <a href="https://nodejs.org" title="Node.js" className="tech-icon nodejs" aria-label="Node.js">
              <span className="tech-icon-label">Node.js</span>
            </a>
            <a href="https://expressjs.com" title="Express.js" className="tech-icon express" aria-label="Express">
              <span className="tech-icon-label">Express</span>
            </a>
            <a href="https://www.sqlite.org" title="SQLite" className="tech-icon sqlite" aria-label="SQLite">
              <span className="tech-icon-label">SQLite</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
