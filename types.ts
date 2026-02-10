
export interface Movie {
  id: string;
  title: string;
  year: string;
  poster: string;
  rating: number;
  description: string;
  genre: string[];
  director: string;
}

export interface MovieDetails extends Movie {
  cast: CastMember[];
  budget: string;
  boxOffice: string;
  releaseDate: string;
  runtime: string;
  trivia: string[];
  recommendations: Movie[];
}

export interface CastMember {
  name: string;
  role: string;
  image?: string;
}

export interface Review {
  id: string;
  movieId: string;
  userName: string;
  rating: number;
  content: string;
  date: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
