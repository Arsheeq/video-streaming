import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Settings, Maximize, Minimize, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  backLink?: string;
}

export function VideoPlayer({ src, poster, title, backLink = "/" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState([1]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState("auto");
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Quality Options Mockup - This simulates the Adaptive Bitrate Selection
  const qualities = [
    { id: "auto", label: "Auto (1080p)" },
    { id: "4k", label: "4K Ultra HD" },
    { id: "1080p", label: "1080p HD" },
    { id: "720p", label: "720p" },
    { id: "480p", label: "480p" },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = value[0];
      setVolume(value);
      setIsMuted(value[0] === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {/* Back Button Overlay */}
      <div className={cn(
        "absolute top-0 left-0 p-6 transition-opacity duration-300 z-50",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <Link href={backLink}>
          <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full h-12 w-12 p-0">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      {/* Big Play Button (Center) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 pointer-events-none">
           <div className="p-6 rounded-full bg-primary/90 backdrop-blur-sm animate-in zoom-in duration-300">
             <Play className="h-12 w-12 text-white fill-white ml-1" />
           </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/60 to-transparent px-6 pb-6 pt-20 transition-opacity duration-300 z-40",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        
        {/* Progress Bar */}
        <div className="mb-4 group/slider">
           <Slider 
             value={[progress]} 
             max={100} 
             step={0.1} 
             onValueChange={handleSeek}
             className="cursor-pointer"
           />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={togglePlay} variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10">
              {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
            </Button>

            <div className="flex items-center gap-2 group/volume">
              <Button onClick={toggleMute} variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10">
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
              <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                 <Slider 
                   value={isMuted ? [0] : volume} 
                   max={1} 
                   step={0.01} 
                   onValueChange={handleVolumeChange}
                   className="w-24"
                 />
              </div>
            </div>
            
            <h2 className="text-white font-medium ml-2 hidden md:block">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Quality Settings - Adaptive Bitrate Mockup */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10">
                  <Settings className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                <DropdownMenuLabel>Quality (Bitrate)</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuRadioGroup value={quality} onValueChange={setQuality}>
                  {qualities.map((q) => (
                    <DropdownMenuRadioItem key={q.id} value={q.id} className="focus:bg-white/20 focus:text-white cursor-pointer">
                      {q.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={toggleFullscreen} variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10">
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
