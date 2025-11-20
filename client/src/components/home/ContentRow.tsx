import { Movie } from "@/lib/data";
import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface ContentRowProps {
  title: string;
  movies: Movie[];
  isLarge?: boolean;
}

export function ContentRow({ title, movies, isLarge = false }: ContentRowProps) {
  return (
    <div className="py-8 px-4 md:px-12 space-y-4 group/row">
      <h2 className="text-xl md:text-2xl font-bold text-white transition-colors duration-300 hover:text-primary cursor-pointer flex items-center gap-2">
        {title}
        <span className="text-xs text-cyan-400 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">Explore All &gt;</span>
      </h2>
      
      <div className="relative group">
        <div className="flex overflow-x-auto gap-4 pb-8 pt-4 no-scrollbar snap-x snap-mandatory scroll-smooth">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className={cn(
                "relative shrink-0 transition-all duration-300 ease-in-out cursor-pointer hover:z-20 group/card snap-start",
                isLarge ? "w-[200px] md:w-[300px]" : "w-[200px] md:w-[280px]"
              )}
            >
              {/* Thumbnail */}
              <Link href={`/watch/${movie.id}`}>
                <div className={cn(
                  "relative rounded-md overflow-hidden aspect-video transition-transform duration-300 group-hover/card:scale-105 group-hover/card:shadow-2xl group-hover/card:ring-2 ring-white/50",
                  isLarge && "aspect-[2/3]"
                )}>
                  <img 
                    src={isLarge ? movie.heroImage : movie.thumbnail} 
                    alt={movie.title} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="rounded-full bg-white/20 backdrop-blur p-3 ring-1 ring-white/50">
                          <Play className="w-6 h-6 fill-white text-white" />
                      </div>
                  </div>
                </div>
              </Link>

              {/* Info (Only visible on hover or larger screens effectively) - Keeping it simple for now */}
              <div className="mt-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 absolute top-full left-0 right-0 bg-[#181818] p-4 rounded-b-md shadow-xl z-20 -mt-1 scale-105 hidden md:block">
                 <div className="flex items-center gap-2 mb-3">
                    <Link href={`/watch/${movie.id}`}>
                        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <Play className="w-4 h-4 fill-black text-black" />
                        </button>
                    </Link>
                    <button className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="ml-auto w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                        <ChevronDown className="w-4 h-4" />
                    </button>
                 </div>
                 
                 <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
                    <span className="text-green-400">98% Match</span>
                    <span className="border border-gray-500 px-1 rounded text-[10px]">{movie.rating}</span>
                    <span>{movie.duration}</span>
                 </div>
                 
                 <div className="flex flex-wrap gap-1">
                    {movie.genre.slice(0, 3).map(g => (
                        <span key={g} className="text-[10px] text-gray-300 flex items-center after:content-['•'] after:ml-1 after:text-gray-600 last:after:content-none">
                            {g}
                        </span>
                    ))}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
