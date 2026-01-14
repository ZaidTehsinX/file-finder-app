import { useState } from 'react';
import './App.css';
import AnimatedHeading from './components/AnimatedHeading';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingAnimation from './components/LoadingAnimation';
import Footer from './components/Footer';
import type { SearchStats } from './utils/fileSearch';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [searchState, setSearchState] = useState<'form' | 'loading' | 'results'>('form');
  const [results, setResults] = useState<SearchStats | null>(null);
  const [searchFilename, setSearchFilename] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (filename: string, folderPath: string) => {
    setSearchFilename(filename);
    setSearchState('loading');
    setErrorMessage('');

    try {
      // First, scan the folder to index all files
      console.log(`Scanning folder: ${folderPath}`);
      const scanResponse = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath })
      });

      if (!scanResponse.ok) {
        const error = await scanResponse.json();
        throw new Error(error.error || 'Failed to scan folder');
      }

      const scanData = await scanResponse.json();
      console.log('Scan result:', scanData);

      // Then, search for the files
      console.log(`Searching for: ${filename}`);
      const searchResponse = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath, searchTerm: filename })
      });

      if (!searchResponse.ok) {
        const error = await searchResponse.json();
        throw new Error(error.error || 'Failed to search');
      }

      const searchData = await searchResponse.json();
      console.log('Search result:', searchData);

      setResults(searchData.data);
      setSearchState('results');
    } catch (error) {
      console.error('Search error:', error);
      setErrorMessage((error as Error).message || 'An error occurred. Make sure the backend is running on port 3001.');
      setSearchState('form');
    }
  };

  const handleReset = () => {
    setSearchState('form');
    setResults(null);
    setSearchFilename('');
    setErrorMessage('');
  };

  return (
    <div className="app-wrapper">
      <div className="app-content">
        <AnimatedHeading />

        {errorMessage && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        <main className="main-content">
          {searchState === 'form' && (
            <SearchForm onSearch={handleSearch} isLoading={false} />
          )}

          {searchState === 'loading' && (
            <LoadingAnimation message="Scanning folder and searching files..." />
          )}

          {searchState === 'results' && results && (
            <ResultsDisplay
              results={results}
              filename={searchFilename}
              onReset={handleReset}
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
