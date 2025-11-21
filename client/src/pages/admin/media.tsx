import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload, RefreshCw, Play, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
  createdAt: string;
}

export default function AdminMedia() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!title || !selectedFile) {
      toast({
        title: "Validation Error",
        description: "Title and video file are required.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const presignedResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type || 'video/mp4'
        })
      });

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json();
        throw new Error(error.message);
      }

      const { uploadUrl, key } = await presignedResponse.json();

      setUploadProgress(25);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type || 'video/mp4'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      setUploadProgress(75);

      const videoResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          s3Key: key,
          thumbnailUrl: thumbnailUrl || null,
          heroImageUrl: thumbnailUrl || null,
          videoUrl: null,
          hlsUrl: null,
          duration: "0h 00m",
          year: new Date().getFullYear(),
          genre: ["Uploaded"],
          rating: "NR",
          transcodeStatus: "pending"
        })
      });

      if (!videoResponse.ok) {
        const error = await videoResponse.json();
        throw new Error(error.message);
      }

      setUploadProgress(100);

      toast({
        title: "Upload Successful",
        description: "Video uploaded successfully. You can now start transcoding.",
      });

      setIsOpen(false);
      resetForm();
      fetchVideos();

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleStartTranscode = async (videoId: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/transcode`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast({
        title: "Transcoding Started",
        description: "Video transcoding job has been initiated. This may take several minutes.",
      });

      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      toast({
        title: "Video Deleted",
        description: "The video has been removed from your library."
      });

      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setThumbnailUrl("");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      processing: { variant: "default", label: "Processing" },
      completed: { variant: "outline", label: "Ready" },
      failed: { variant: "destructive", label: "Failed" }
    };

    const config = variants[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Media Library</h1>
            <p className="text-gray-400 mt-2">Upload and manage your video content.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Upload New Video
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Video to S3</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Upload a video file directly to your S3 bucket. It will automatically trigger the transcoding pipeline.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/20 border-white/10"
                    placeholder="Enter video title"
                    disabled={uploading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video-file">Video File *</Label>
                  <Input 
                    id="video-file" 
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="bg-black/20 border-white/10"
                    disabled={uploading}
                  />
                  {selectedFile && (
                    <p className="text-xs text-gray-400">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea 
                    id="desc" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-black/20 border-white/10"
                    placeholder="Video description..."
                    disabled={uploading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="thumb">Thumbnail URL (Optional)</Label>
                  <Input 
                    id="thumb" 
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="bg-black/20 border-white/10"
                    placeholder="https://..."
                    disabled={uploading}
                  />
                </div>
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)} 
                  className="border-white/10 text-white hover:bg-white/5"
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload} 
                  className="bg-primary hover:bg-primary/90"
                  disabled={uploading}
                >
                  {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {uploading ? 'Uploading...' : 'Upload to S3'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border border-white/10 overflow-hidden">
          <div className="bg-white/5 p-4 grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Year</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
          <div className="divide-y divide-white/5">
            {videos.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No videos uploaded yet. Click "Upload New Video" to get started.
              </div>
            ) : (
              videos.map((video, index) => (
                <div key={video.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-white/5 transition-colors">
                  <div className="col-span-1 text-gray-500 text-sm">{index + 1}</div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-16 h-10 rounded bg-gray-800 overflow-hidden shrink-0">
                      {video.thumbnailUrl && (
                        <img src={video.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                      )}
                    </div>
                    <div>
                      <span className="text-white font-medium block truncate">{video.title}</span>
                      <span className="text-xs text-gray-500 truncate block">{video.s3Key}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    {getStatusBadge(video.transcodeStatus)}
                  </div>
                  <div className="col-span-2 text-gray-400 text-sm">{video.year}</div>
                  <div className="col-span-3 flex justify-end gap-2">
                    {video.transcodeStatus === 'pending' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleStartTranscode(video.id)}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Start Transcode
                      </Button>
                    )}
                    {video.hlsUrl && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-red-400"
                      onClick={() => handleDelete(video.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
