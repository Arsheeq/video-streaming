import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState([1]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState("-1");
  const [qualities, setQualities] = useState<{ id: string; label: string }[]>([
    { id: "-1", label: "Auto" }
  ]);
  const [currentQualityLabel, setCurrentQualityLabel] = useState("Auto");
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isHLS = src.endsWith('.m3u8');

    if (isHLS) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          console.log('HLS manifest loaded, found ' + data.levels.length + ' quality levels');
          
          const levelOptions = data.levels.map((level, index) => ({
            id: String(index),
            label: `${level.height}p (${Math.round(level.bitrate / 1000)} kbps)`
          }));
          
          setQualities([{ id: "-1", label: "Auto" }, ...levelOptions]);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          const level = hls.levels[data.level];
          if (level) {
            setCurrentQualityLabel(
              hls.autoLevelEnabled 
                ? `Auto (${level.height}p)` 
                : `${level.height}p`
            );
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error, attempting to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Media error, attempting to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal error, cannot recover');
                hls.destroy();
                break;
            }
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

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
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

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

  const handleQualityChange = (value: string) => {
    setQuality(value);
    if (hlsRef.current) {
      const level = parseInt(value);
      if (level === -1) {
        hlsRef.current.currentLevel = -1;
      } else {
        hlsRef.current.currentLevel = level;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
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
      ref={containerRef}
      className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
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
            {/* Quality Settings - Real Adaptive Bitrate */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10">
                  <Settings className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" container={containerRef.current} className="bg-black/90 border-white/10 text-white backdrop-blur-xl z-[9999]">
                <DropdownMenuLabel>Quality (Adaptive Bitrate)</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuRadioGroup value={quality} onValueChange={handleQualityChange}>
                  {qualities.map((q) => (
                    <DropdownMenuRadioItem key={q.id} value={q.id} className="focus:bg-white/20 focus:text-white cursor-pointer">
                      {q.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="px-2 py-1.5 text-xs text-gray-400">
                  Current: {currentQualityLabel}
                </div>
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
