import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMovies } from "@/lib/store";
import { Movie } from "@/lib/data";
import { Plus, Trash2, Play, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Helper to generate random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function AdminMedia() {
  const { movies, addMovie, deleteMovie } = useMovies();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [s3Key, setS3Key] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [heroUrl, setHeroUrl] = useState("");
  
  const handleAddVideo = () => {
    if (!title || !s3Key) {
        toast({
            title: "Validation Error",
            description: "Title and S3 Key are required.",
            variant: "destructive"
        });
        return;
    }

    // In a real app, this URL would be constructed from CloudFront domain + S3 Key
    // For now we just use the key or a placeholder if it's not a full URL
    const videoUrl = s3Key.startsWith('http') 
        ? s3Key 
        : `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${s3Key}`;

    const newMovie: Movie = {
      id: generateId(),
      title,
      description: description || "No description provided.",
      thumbnail: thumbnailUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=60",
      heroImage: heroUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
      duration: "0h 00m", // This would come from metadata in a real app
      year: new Date().getFullYear(),
      genre: ["New Upload"],
      rating: "NR",
      videoUrl,
    };

    addMovie(newMovie);
    toast({
        title: "Video Added",
        description: "The video has been added to your library.",
    });
    setIsOpen(false);
    
    // Reset form
    setTitle("");
    setDescription("");
    setS3Key("");
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Media Library</h1>
            <p className="text-gray-400 mt-2">Manage your video content.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Add New Video
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Register a video file from your S3 bucket.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/20 border-white/10"
                    placeholder="Enter video title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s3key">S3 Key / Filename</Label>
                  <Input 
                    id="s3key" 
                    value={s3Key}
                    onChange={(e) => setS3Key(e.target.value)}
                    className="bg-black/20 border-white/10"
                    placeholder="my-folder/video.mp4"
                  />
                  <p className="text-[10px] text-gray-500">
                    Enter the filename exactly as it appears in your S3 bucket.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea 
                    id="desc" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-black/20 border-white/10"
                    placeholder="Video description..."
                  />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="thumb">Thumbnail URL</Label>
                  <Input 
                    id="thumb" 
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="bg-black/20 border-white/10"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
                <Button onClick={handleAddVideo} className="bg-primary hover:bg-primary/90">Add Video</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border border-white/10 overflow-hidden">
          <div className="bg-white/5 p-4 grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
             <div className="col-span-1">#</div>
             <div className="col-span-5">Title</div>
             <div className="col-span-2">Year</div>
             <div className="col-span-2">Genre</div>
             <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-white/5">
            {movies.map((movie, index) => (
                <div key={movie.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-white/5 transition-colors">
                    <div className="col-span-1 text-gray-500 text-sm">{index + 1}</div>
                    <div className="col-span-5 flex items-center gap-3">
                        <div className="w-10 h-6 rounded bg-gray-800 overflow-hidden shrink-0">
                            <img src={movie.thumbnail} className="w-full h-full object-cover" alt="" />
                        </div>
                        <span className="text-white font-medium truncate">{movie.title}</span>
                    </div>
                    <div className="col-span-2 text-gray-400 text-sm">{movie.year}</div>
                    <div className="col-span-2 text-gray-400 text-sm truncate">{movie.genre.join(", ")}</div>
                    <div className="col-span-2 flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                            <Play className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-red-400"
                            onClick={() => {
                                deleteMovie(movie.id);
                                toast({ title: "Video Deleted", description: `Deleted ${movie.title}` });
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
