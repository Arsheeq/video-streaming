import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import { Link } from "wouter";
import { Movie } from "@/lib/data";

interface HeroSectionProps {
  movie: Movie;
}

export function HeroSection({ movie }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[85vh] md:h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={movie.heroImage} 
          alt={movie.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-4 md:px-16 max-w-3xl space-y-6 pt-20">
        <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-300 mb-2">
                <span className="px-2 py-1 border border-gray-500 rounded text-xs tracking-wider">N SERIES</span>
                <span className="text-primary font-bold tracking-wider">NEW EPISODES</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight text-white leading-tight drop-shadow-lg">
            {movie.title}
            </h1>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span className="text-green-400 font-bold">98% Match</span>
          <span>{movie.year}</span>
          <span className="border border-gray-500 px-1 text-xs rounded">{movie.rating}</span>
          <span>{movie.duration}</span>
          <span className="hidden md:inline px-2 py-0.5 border border-white/40 rounded text-[10px]">HD</span>
        </div>

        <p className="text-lg text-gray-200 line-clamp-3 drop-shadow-md max-w-xl">
          {movie.description}
        </p>

        <div className="flex items-center gap-4 pt-4">
          <Link href={`/watch/${movie.id}`}>
            <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bold px-8 h-14 text-lg rounded-md transition-transform hover:scale-105">
                <Play className="mr-2 h-6 w-6 fill-black" /> Play
            </Button>
          </Link>
          <Button size="lg" variant="secondary" className="bg-gray-600/70 text-white hover:bg-gray-600/50 font-bold px-8 h-14 text-lg rounded-md backdrop-blur-md transition-transform hover:scale-105">
            <Info className="mr-2 h-6 w-6" /> More Info
          </Button>
        </div>
      </div>
    </div>
  );
}
