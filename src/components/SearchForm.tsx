import React, { useState } from 'react';
import './SearchForm.css';

interface SearchFormProps {
  onSearch: (filename: string, folders: FileSystemDirectoryHandle[]) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [filename, setFilename] = useState('');
  const [selectedFolders, setSelectedFolders] = useState<
    FileSystemDirectoryHandle[]
  >([]);

  const handleSelectFolders = async () => {
    try {
      const folderHandles = await (window as any).showDirectoryPicker({
        mode: 'read',
      });
      setSelectedFolders([folderHandles]);
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleAddMoreFolders = async () => {
    try {
      const folderHandle = await (window as any).showDirectoryPicker({
        mode: 'read',
      });
      setSelectedFolders([...selectedFolders, folderHandle]);
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleRemoveFolder = (index: number) => {
    setSelectedFolders(selectedFolders.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (filename.trim()) {
      setStep(2);
    }
  };

  const handleSearch = () => {
    if (filename.trim() && selectedFolders.length > 0) {
      onSearch(filename, selectedFolders);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="search-form-container">
      {step === 1 ? (
        <div className="form-step">
          <h2 className="step-title">Step 1: Enter File Name</h2>
          <p className="step-description">
            Enter the filename or pattern to search for (e.g., *.pdf, document.txt)
          </p>
          <div className="form-group">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., report*.pdf or image.jpg"
              className="input-field"
              onKeyPress={(e) => e.key === 'Enter' && handleNext()}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleNext}
            disabled={!filename.trim() || isLoading}
            className="btn btn-primary"
          >
            Next: Select Folders →
          </button>
        </div>
      ) : (
        <div className="form-step">
          <h2 className="step-title">Step 2: Select Folders</h2>
          <p className="step-description">
            Choose one or more folders to search in
          </p>
          
          <div className="selected-folders">
            {selectedFolders.length > 0 ? (
              <>
                <p className="folders-count">
                  Selected: {selectedFolders.length} folder{selectedFolders.length !== 1 ? 's' : ''}
                </p>
                <div className="folders-list">
                  {selectedFolders.map((folder, index) => (
                    <div key={index} className="folder-tag">
                      <span className="folder-name">{folder.name}</span>
                      <button
                        onClick={() => handleRemoveFolder(index)}
                        className="remove-btn"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-folders">No folders selected yet</p>
            )}
          </div>

          <div className="button-group">
            <button
              onClick={handleSelectFolders}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              📁 Select First Folder
            </button>
            <button
              onClick={handleAddMoreFolders}
              disabled={selectedFolders.length === 0 || isLoading}
              className="btn btn-secondary"
            >
              ➕ Add More Folders
            </button>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="btn btn-outline"
            >
              ← Back
            </button>
            <button
              onClick={handleSearch}
              disabled={
                !filename.trim() || selectedFolders.length === 0 || isLoading
              }
              className="btn btn-primary"
            >
              {isLoading ? '🔍 Searching...' : '🔍 Search Files'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchForm;
