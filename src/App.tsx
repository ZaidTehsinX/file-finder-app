import { useState } from 'react';
import './App.css';
import AnimatedHeading from './components/AnimatedHeading';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingAnimation from './components/LoadingAnimation';
import Footer from './components/Footer';
import type { SearchStats } from './utils/fileSearch';
import { searchFiles } from './utils/fileSearch';

function App() {
  const [searchState, setSearchState] = useState<'form' | 'loading' | 'results'>('form');
  const [results, setResults] = useState<SearchStats | null>(null);
  const [searchFilename, setSearchFilename] = useState('');

  const handleSearch = async (filename: string, folder: FileSystemDirectoryHandle) => {
    setSearchFilename(filename);
    setSearchState('loading');

    try {
      // Add a small delay to show the loading animation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const searchResults = await searchFiles(folder, filename);
      setResults(searchResults);
      setSearchState('results');
    } catch (error) {
      console.error('Search error:', error);
      setSearchState('form');
      alert('An error occurred during search. Please try again.');
    }
  };

  const handleReset = () => {
    setSearchState('form');
    setResults(null);
    setSearchFilename('');
  };

  return (
    <div className="app-wrapper">
      <div className="app-content">
        <AnimatedHeading />

        <main className="main-content">
          {searchState === 'form' && (
            <SearchForm onSearch={handleSearch} isLoading={false} />
          )}

          {searchState === 'loading' && (
            <LoadingAnimation message="Searching for files..." />
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
