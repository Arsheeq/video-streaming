import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Video {
  id: string;
  title: string;
  description?: string;
  s3Key: string;
  thumbnailUrl?: string;
  heroImageUrl?: string;
  videoUrl?: string;
  hlsUrl?: string;
  duration: string;
  year: number;
  genre: string[];
  rating: string;
  transcodeStatus: string;
}

interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  heroImage?: string;
  duration: string;
  year: number;
  genre: string[];
  rating: string;
  videoUrl: string;
}

interface MovieContextType {
  movies: Movie[];
  loading: boolean;
  refreshMovies: () => Promise<void>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function MovieProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const videoToMovie = (video: Video): Movie => ({
    id: video.id,
    title: video.title,
    description: video.description || 'No description available',
    thumbnail: video.thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=60',
    heroImage: video.heroImageUrl || video.thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    duration: video.duration,
    year: video.year,
    genre: video.genre,
    rating: video.rating,
    videoUrl: video.hlsUrl || video.videoUrl || ''
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videos');
      if (response.ok) {
        const videos: Video[] = await response.json();
        const completedVideos = videos.filter(v => v.hlsUrl || v.videoUrl);
        setMovies(completedVideos.map(videoToMovie));
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const refreshMovies = async () => {
    await fetchMovies();
  };

  return (
    <MovieContext.Provider value={{ movies, loading, refreshMovies }}>
      {children}
    </MovieContext.Provider>
  );
}

export function useMovies() {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
}
