import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { ContentRow } from "@/components/home/ContentRow";
import { MOVIES } from "@/lib/data";

export default function Home() {
  const featuredMovie = MOVIES[0];
  const trendingMovies = MOVIES.slice(1, 6);
  const sciFiMovies = MOVIES.filter(m => m.genre.includes("Sci-Fi"));
  const newReleases = [...MOVIES].reverse();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <main className="pb-20">
        <HeroSection movie={featuredMovie} />
        
        <div className="-mt-32 relative z-20 space-y-4">
          <ContentRow title="Trending Now" movies={trendingMovies} />
          <ContentRow title="Top Sci-Fi Picks" movies={sciFiMovies} />
          <ContentRow title="New Releases" movies={newReleases} isLarge />
          <ContentRow title="Watch It Again" movies={MOVIES} />
        </div>
      </main>
      
      <footer className="py-12 px-12 text-gray-500 text-sm bg-black/50 mt-12">
         <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
                <p>Audio Description</p>
                <p>Investor Relations</p>
                <p>Legal Notices</p>
            </div>
            <div className="space-y-3">
                <p>Help Center</p>
                <p>Jobs</p>
                <p>Cookie Preferences</p>
            </div>
             <div className="space-y-3">
                <p>Gift Cards</p>
                <p>Terms of Use</p>
                <p>Corporate Information</p>
            </div>
            <div className="space-y-3">
                <p>Media Center</p>
                <p>Privacy</p>
                <p>Contact Us</p>
            </div>
         </div>
         <div className="max-w-5xl mx-auto mt-8">
            <button className="border border-gray-500 px-4 py-2 hover:text-white hover:border-white transition-colors">
                Service Code
            </button>
            <p className="mt-4 text-xs">© 2025 Nubinix Inc.</p>
         </div>
      </footer>
    </div>
  );
}
