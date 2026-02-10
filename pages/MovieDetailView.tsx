
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieDetails } from '../services/geminiService';
import { MovieDetails, Review } from '../types';
// Fixed: Added Film and User to the imports from lucide-react
import { Star, Clock, Calendar, DollarSign, Info, PlusCircle, Loader2, MessageSquare, ChevronRight, Share2, Heart, Film, User } from 'lucide-react';

const MovieDetailView: React.FC = () => {
  const { title, year } = useParams<{ title: string; year: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!title || !year) return;
      setLoading(true);
      setPosterLoaded(false);
      try {
        const data = await getMovieDetails(title, year);
        setMovie(data);
        
        const saved = localStorage.getItem(`reviews_${data.id}`);
        if (saved) setReviews(JSON.parse(saved));
      } catch (err) {
        console.error("Detail load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [title, year]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movie || userRating === 0) return;

    setIsSubmitting(true);
    // Simulate tiny delay for feel
    setTimeout(() => {
      const newReview: Review = {
        id: Math.random().toString(36).substr(2, 9),
        movieId: movie.id,
        userName: 'You',
        rating: userRating,
        content: userReview,
        date: new Date().toLocaleDateString()
      };

      const updated = [newReview, ...reviews];
      setReviews(updated);
      localStorage.setItem(`reviews_${movie.id}`, JSON.stringify(updated));
      
      setUserReview('');
      setUserRating(0);
      setIsSubmitting(false);
    }, 400);
  };

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>, fallback: string) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.includes('placeholder')) {
      target.src = fallback;
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium tracking-[0.2em] text-xs uppercase animate-pulse">Curating Content</p>
      </div>
    );
  }

  if (!movie) return <div className="text-center py-20 text-slate-500">Movie not found.</div>;

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-500">
      {/* Backdrop Area */}
      <section className="relative -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 h-[60vh] max-h-[600px] overflow-hidden">
        <img 
          src={movie.poster} 
          alt="" 
          className="w-full h-full object-cover blur-2xl opacity-10 scale-110"
          onLoad={() => setPosterLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end w-full">
            <div className="w-44 sm:w-64 flex-shrink-0 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10 bg-slate-900 aspect-[2/3] relative">
              {!posterLoaded && <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse"><Film className="w-12 h-12 text-slate-700" /></div>}
              <img 
                src={movie.poster} 
                alt={movie.title} 
                className={`w-full h-full object-cover transition-opacity duration-500 ${posterLoaded ? 'opacity-100' : 'opacity-0'}`}
                onError={(e) => handleImageError(e, `https://via.placeholder.com/600x900/0f172a/64748b?text=${encodeURIComponent(movie.title)}`)}
              />
            </div>
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl md:text-6xl font-display font-bold text-white drop-shadow-lg">
                    {movie.title}
                  </h1>
                  <span className="text-3xl text-slate-500 font-light">{movie.year}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-green-500" /> {movie.runtime || '120 min'}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-green-500" /> {movie.releaseDate || 'N/A'}</span>
                  <span className="text-white px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold uppercase tracking-wider">Directed by {movie.director}</span>
                </div>
              </div>
              <p className="text-lg text-slate-200 leading-relaxed max-w-3xl line-clamp-3 md:line-clamp-none">
                {movie.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {movie.genre?.map(g => (
                  <span key={g} className="px-4 py-1.5 bg-white/5 backdrop-blur text-white text-[10px] font-bold rounded-full border border-white/10 uppercase tracking-widest">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Actions Row */}
      <section className="flex flex-wrap gap-4 items-center justify-between border-y border-slate-900 py-6">
        <div className="flex gap-8">
           <div className="text-center">
             <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Budget</p>
             <p className="text-white font-medium">{movie.budget || 'N/A'}</p>
           </div>
           <div className="text-center">
             <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Revenue</p>
             <p className="text-white font-medium">{movie.boxOffice || 'N/A'}</p>
           </div>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-red-500">
            <Heart className="w-6 h-6" />
          </button>
          <button className="p-3 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-green-500">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          {/* Review Area */}
          <section className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <PlusCircle className="text-green-500 w-5 h-5" /> Add Review
            </h2>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setUserRating(s)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star className={`w-10 h-10 ${userRating >= s ? 'text-yellow-500 fill-yellow-500' : 'text-slate-800'}`} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Share your thoughts..."
                className="w-full bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 focus:ring-1 focus:ring-green-500 focus:outline-none min-h-[140px] text-sm"
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
              />
              <button
                type="submit"
                disabled={userRating === 0 || isSubmitting}
                className="w-full md:w-auto px-12 bg-green-600 hover:bg-green-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'POST REVIEW'}
              </button>
            </form>
          </section>

          {/* Reviews List */}
          <section className="space-y-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="text-green-500 w-5 h-5" /> Recent Activity
            </h2>
            <div className="space-y-6">
              {reviews.map(r => (
                <div key={r.id} className="border-l-2 border-slate-800 pl-6 space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-sm">{r.userName}</span>
                    <span className="text-slate-500 text-xs">{r.date}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${r.rating >= s ? 'text-yellow-500 fill-yellow-500' : 'text-slate-800'}`} />)}
                  </div>
                  <p className="text-slate-400 text-sm italic leading-relaxed">"{r.content}"</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-slate-600 italic text-sm">No reviews yet.</p>}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-12">
          {/* Cast List - AUTHENTIC PHOTOS */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <User className="w-3 h-3" /> Principal Cast
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {movie.cast?.slice(0, 6).map((member, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-default">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-800 bg-slate-900 ring-offset-2 ring-offset-slate-950 group-hover:border-green-500/50 transition-colors">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      onError={(e) => handleImageError(e, `https://via.placeholder.com/150x150/1e293b/64748b?text=${encodeURIComponent(member.name.split(' ')[0])}`)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{member.name}</p>
                    <p className="text-slate-500 text-xs truncate">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trivia */}
          <section className="bg-slate-900/20 rounded-3xl p-6 border border-slate-900">
             <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <Info className="w-3 h-3" /> Trivia
             </h3>
             <ul className="space-y-4">
               {movie.trivia?.slice(0, 3).map((t, i) => (
                 <li key={i} className="text-slate-400 text-xs leading-relaxed border-b border-slate-900/50 pb-2 italic">
                   {t}
                 </li>
               ))}
             </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default MovieDetailView;
