
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Search, Film, Star, User, Menu, X, ArrowRight, Loader2 } from 'lucide-react';
import Home from './pages/Home';
import MovieDetailView from './pages/MovieDetailView';
import SearchResults from './pages/SearchResults';
import { Movie } from './types';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <Film className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-display font-bold text-white tracking-tight">CineCritique</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link to="/search?q=Oscar" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Awards</Link>
              <Link to="/search?q=Horror" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Genres</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search movies, actors, directors..."
                className="w-full bg-slate-800 text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all border border-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="text-slate-300 hover:text-white p-2">
              <User className="w-6 h-6" />
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-transform active:scale-95">
              SIGN IN
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-800 text-white rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          </form>
          <div className="flex flex-col space-y-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white py-2">Home</Link>
            <Link to="/search?q=Oscar" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white py-2">Awards</Link>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg font-bold">SIGN IN</button>
          </div>
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/movie/:title/:year" element={<MovieDetailView />} />
          </Routes>
        </main>
        
        <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center gap-2 items-center mb-4">
              <Film className="w-6 h-6 text-green-500" />
              <span className="text-xl font-display font-bold text-white">CineCritique</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              The social network for film lovers. Share your passion, track your progress, and discover new favorites.
            </p>
            <div className="text-slate-600 text-xs">
              © 2024 CineCritique. Powered by Gemini Pro. All cinema data sourced responsibly.
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
