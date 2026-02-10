
import React, { useEffect, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { getTrendingMovies } from '../services/geminiService';
import { Movie } from '../types';
import { Star, PlayCircle, Loader2, Film, TrendingUp } from 'lucide-react';

const MovieCard = memo(({ movie }: { movie: Movie }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link 
      to={`/movie/${encodeURIComponent(movie.title)}/${movie.year}`}
      className="group block relative rounded-xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:ring-2 hover:ring-green-500/50 bg-slate-900 aspect-[2/3]"
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse">
          <Film className="w-8 h-8 text-slate-700" />
        </div>
      )}
      <img 
        src={movie.poster} 
        alt={movie.title} 
        loading="lazy"
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => { 
          e.currentTarget.src = `https://via.placeholder.com/400x600/0f172a/64748b?text=${encodeURIComponent(movie.title)}`;
          setLoaded(true);
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        <h3 className="text-sm font-bold text-white line-clamp-1 drop-shadow-md">{movie.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-slate-400 text-xs">{movie.year}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-white text-xs font-bold">4.2</span>
          </div>
        </div>
      </div>
    </Link>
  );
});

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const movies = await getTrendingMovies();
        setTrending(movies);
      } catch (err) {
        console.error("Home loading error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium tracking-widest text-xs uppercase animate-pulse">Initializing Cinema Experience</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Section - Reduced Height for better performance */}
      <section className="relative rounded-[2rem] overflow-hidden h-[400px] flex items-end border border-slate-800 shadow-2xl bg-slate-950 group">
        <img 
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1400" 
          alt="Cinema" 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        <div className="relative p-8 md:p-12 w-full max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
            <TrendingUp className="w-3 h-3" /> Now Trending
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 leading-none">The Movie Database, Reimagined.</h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl font-light">
            Track films you've watched. Save those you want to see. Tell your friends what's good.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-slate-950 px-8 py-3 rounded-full font-bold transition-all hover:bg-green-500 hover:text-white shadow-xl active:scale-95">
              GET STARTED
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            Popular on CineCritique
          </h2>
          <Link to="/search?q=Oscar" className="text-green-500 hover:text-green-400 text-xs font-bold uppercase tracking-widest transition-colors">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
          {trending.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {[
          { icon: Star, title: "Rate & Review", desc: "Keep a diary of every film you've seen." },
          { icon: Film, title: "Deep Insights", desc: "Detailed cast and production data." },
          { icon: PlayCircle, title: "Discovery", desc: "AI powered recommendations for you." }
        ].map((feat, i) => (
          <div key={i} className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
            <feat.icon className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
