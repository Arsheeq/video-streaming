import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Movie, MOVIES as INITIAL_MOVIES } from './data';

interface MovieContextType {
  movies: Movie[];
  addMovie: (movie: Movie) => void;
  deleteMovie: (id: string) => void;
  awsConfig: AWSConfig;
  updateAwsConfig: (config: AWSConfig) => void;
}

interface AWSConfig {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  cloudfrontDomain: string;
}

const defaultAwsConfig: AWSConfig = {
  accessKeyId: '',
  secretAccessKey: '',
  bucketName: 'my-video-bucket',
  region: 'us-east-1',
  cloudfrontDomain: 'd12345.cloudfront.net',
};

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function MovieProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [awsConfig, setAwsConfig] = useState<AWSConfig>(defaultAwsConfig);

  const addMovie = (movie: Movie) => {
    setMovies((prev) => [movie, ...prev]);
  };

  const deleteMovie = (id: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  const updateAwsConfig = (config: AWSConfig) => {
    setAwsConfig(config);
  };

  return (
    <MovieContext.Provider value={{ movies, addMovie, deleteMovie, awsConfig, updateAwsConfig }}>
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
