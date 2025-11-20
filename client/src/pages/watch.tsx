import { useRoute } from "wouter";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { useMovies } from "@/lib/store"; // Changed import
import NotFound from "@/pages/not-found";

export default function Watch() {
  const [match, params] = useRoute("/watch/:id");
  const { movies } = useMovies(); // Use context
  
  if (!match) return <NotFound />;
  
  const movie = movies.find(m => m.id === params.id);
  
  if (!movie) return <NotFound />;

  return (
    <div className="w-full h-screen bg-black">
      <VideoPlayer 
        src={movie.videoUrl} 
        poster={movie.heroImage} 
        title={movie.title}
        backLink="/"
      />
    </div>
  );
}
