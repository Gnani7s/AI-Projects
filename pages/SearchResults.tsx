
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchMovies } from '../services/geminiService';
import { Movie, GroundingSource } from '../types';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      setLoading(true);
      setError('');
      try {
        const { movies, sources } = await searchMovies(query);
        setResults(movies);
        setSources(sources);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch results. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Searching the cinema archives...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-red-200">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Search results for "{query}"</h1>
        <p className="text-slate-400">{results.length} movies found</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {results.map((movie) => (
          <Link 
            key={movie.id} 
            to={`/movie/${encodeURIComponent(movie.title)}/${movie.year}`}
            className="group flex flex-col sm:flex-row bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all hover:border-slate-700 p-4 gap-6"
          >
            <img 
              src={movie.poster} 
              alt={movie.title} 
              className="w-full sm:w-32 aspect-[2/3] object-cover rounded-lg shadow-md"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white group-hover:text-green-500 transition-colors">
                  {movie.title} <span className="text-slate-500 font-medium ml-2">{movie.year}</span>
                </h2>
              </div>
              <p className="text-slate-400 line-clamp-2 italic">Directed by {movie.director || 'Unknown'}</p>
              <p className="text-slate-300 leading-relaxed line-clamp-3">
                {movie.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {movie.genre?.map(g => (
                  <span key={g} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="mt-12 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Verification Sources</h3>
          <div className="flex flex-wrap gap-4">
            {sources.map((source, i) => (
              <a 
                key={i}
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-500 hover:text-green-400 text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {source.title}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {results.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-slate-500 text-xl">No movies found matching your search. Try a different title.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
