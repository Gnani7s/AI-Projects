
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Movie, MovieDetails, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w600_and_h900_bestv2"; // Higher quality poster
const TMDB_PROFILE_BASE = "https://image.tmdb.org/t/p/w300_and_h450_bestv2"; // Profile size

// Global cache to prevent redundant heavy AI calls
const cache: Record<string, any> = JSON.parse(sessionStorage.getItem('cc_cache_v2') || '{}');

const saveToCache = (key: string, data: any) => {
  cache[key] = data;
  sessionStorage.setItem('cc_cache_v2', JSON.stringify(cache));
};

/**
 * Enhanced image resolution. 
 * Prioritizes full URLs from high-authority domains found via Google Search.
 */
const resolveImageUrl = (path: string | undefined, title: string, type: 'poster' | 'profile'): string => {
  if (!path || path.length < 5) return getFallback(title, type);
  
  let cleaned = path.trim();

  // If the model gave us a full valid URL (e.g., from IMDb, Letterboxd, TMDB CDN)
  if (cleaned.startsWith('http')) {
    // Basic verification that it looks like an image URL
    if (/\.(jpg|jpeg|png|webp|avif)/i.test(cleaned) || cleaned.includes('media-amazon.com') || cleaned.includes('tmdb.org')) {
      return cleaned;
    }
  }

  // Handle common relative paths returned by TMDB-trained models
  // If it's a TMDB path like /abc.jpg
  if (cleaned.startsWith('/')) {
    const base = type === 'poster' ? TMDB_IMAGE_BASE : TMDB_PROFILE_BASE;
    return `${base}${cleaned}`;
  }
  
  // If it's just the filename without slash
  if (!cleaned.includes('/') && cleaned.includes('.')) {
    const base = type === 'poster' ? TMDB_IMAGE_BASE : TMDB_PROFILE_BASE;
    return `${base}/${cleaned}`;
  }

  return getFallback(title, type);
};

const getFallback = (title: string, type: 'poster' | 'profile'): string => {
  // Use a stylized color-based placeholder that looks "pro" instead of random stock photos
  const color = type === 'poster' ? '0f172a' : '1e293b';
  const textColor = '64748b';
  return `https://via.placeholder.com/${type === 'poster' ? '600x900' : '300x450'}/${color}/${textColor}?text=${encodeURIComponent(title)}`;
};

export const searchMovies = async (query: string): Promise<{ movies: Movie[], sources: GroundingSource[] }> => {
  const cacheKey = `search_${query.toLowerCase()}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Search for movies related to: "${query}". 
    For each movie, you MUST find the REAL official image. Search for:
    1. TMDB poster_path (e.g., /6oHqZp6vYvC9pYmNCZ69Y0X3YmN.jpg)
    2. OR a direct IMDb image URL.
    Return JSON: { "movies": [{ "id", "title", "year", "description", "genre", "director", "imagePath" }] }`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          movies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                year: { type: Type.STRING },
                description: { type: Type.STRING },
                genre: { type: Type.ARRAY, items: { type: Type.STRING } },
                director: { type: Type.STRING },
                imagePath: { type: Type.STRING, description: "Official TMDB path or IMDb URL" },
              },
              required: ["title", "year"]
            }
          }
        }
      }
    }
  });

  const text = response.text || '{"movies": []}';
  const cleanJson = text.replace(/```json|```/g, '').trim();
  const data = JSON.parse(cleanJson);
  
  const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || '#'
  })) || [];

  const movies = (data.movies || []).map((m: any) => ({
    ...m,
    id: m.id || Math.random().toString(36).substr(2, 9),
    poster: resolveImageUrl(m.imagePath, m.title, 'poster')
  }));

  const result = { movies, sources };
  saveToCache(cacheKey, result);
  return result;
};

export const getMovieDetails = async (title: string, year: string): Promise<MovieDetails> => {
  const cacheKey = `detail_${title}_${year}`.toLowerCase();
  if (cache[cacheKey]) return cache[cacheKey];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Fetch official details for the movie "${title}" released in ${year}. 
    MANDATORY: Use Google Search to find the ACTUAL image paths.
    - Movie poster path (TMDB or IMDb)
    - REAL cast members with their AUTHENTIC profile photos (TMDB profile_path or IMDb)
    - Production stats: Budget, Box Office, Runtime.
    Return as structured JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          year: { type: Type.STRING },
          description: { type: Type.STRING },
          genre: { type: Type.ARRAY, items: { type: Type.STRING } },
          director: { type: Type.STRING },
          runtime: { type: Type.STRING },
          releaseDate: { type: Type.STRING },
          budget: { type: Type.STRING },
          boxOffice: { type: Type.STRING },
          posterPath: { type: Type.STRING },
          cast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                profilePath: { type: Type.STRING }
              }
            }
          },
          trivia: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  const text = response.text || '{}';
  const cleanJson = text.replace(/```json|```/g, '').trim();
  const data = JSON.parse(cleanJson);
  
  const movie = {
    ...data,
    id: data.id || Math.random().toString(36).substr(2, 9),
    poster: resolveImageUrl(data.posterPath, data.title, 'poster'),
    cast: (data.cast || []).map((c: any) => ({
      ...c,
      image: resolveImageUrl(c.profilePath, c.name, 'profile')
    })),
    rating: 0,
    recommendations: []
  };

  saveToCache(cacheKey, movie);
  return movie;
};

export const getTrendingMovies = async (): Promise<Movie[]> => {
    const cacheKey = 'trending_list';
    if (cache[cacheKey]) return cache[cacheKey];

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "List 5 currently trending/popular movies as of late 2024 / early 2025. Include their REAL TMDB poster paths.",
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    const text = response.text || '[]';
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanJson);
    const moviesList = data.movies || data;

    const movies = (Array.isArray(moviesList) ? moviesList : []).map((m: any) => ({
        ...m,
        id: m.id || Math.random().toString(36).substr(2, 9),
        poster: resolveImageUrl(m.posterPath || m.imagePath, m.title, 'poster'),
        genre: m.genre || ["Trending"],
        description: m.description || "Top rated movie."
    }));

    saveToCache(cacheKey, movies);
    return movies;
};
