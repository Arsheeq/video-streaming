import { useRoute } from "wouter";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { MOVIES } from "@/lib/data";
import NotFound from "@/pages/not-found";

export default function Watch() {
  const [match, params] = useRoute("/watch/:id");
  
  if (!match) return <NotFound />;
  
  const movie = MOVIES.find(m => m.id === params.id);
  
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
