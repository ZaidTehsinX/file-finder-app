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
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
            color: 'white',
            padding: '18px 24px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            maxWidth: '600px',
            fontSize: '0.95rem',
            fontWeight: 500,
            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'slideInDown 0.4s ease-out'
          }}>
            <strong>⚠️ Error:</strong> {errorMessage}
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
