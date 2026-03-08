import { Video, Play, Pause, Maximize2, Volume2, VolumeX, Camera, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/contexts/SimulationContext";

// Free stock truck/driving footage URLs for simulated feeds
const dashcamVideos = [
  "https://videos.pexels.com/video-files/2053100/2053100-sd_640_360_30fps.mp4",
  "https://videos.pexels.com/video-files/856116/856116-sd_640_360_25fps.mp4",
  "https://videos.pexels.com/video-files/3129671/3129671-sd_640_360_30fps.mp4",
  "https://videos.pexels.com/video-files/1721294/1721294-sd_640_360_25fps.mp4",
  "https://videos.pexels.com/video-files/2547131/2547131-sd_640_360_24fps.mp4",
  "https://videos.pexels.com/video-files/1580507/1580507-sd_640_360_30fps.mp4",
];

const rearCamVideos = [
  "https://videos.pexels.com/video-files/1904488/1904488-sd_640_360_24fps.mp4",
  "https://videos.pexels.com/video-files/3048163/3048163-sd_640_360_30fps.mp4",
  "https://videos.pexels.com/video-files/2278095/2278095-sd_640_360_30fps.mp4",
  "https://videos.pexels.com/video-files/3214448/3214448-sd_640_360_25fps.mp4",
  "https://videos.pexels.com/video-files/854669/854669-sd_640_360_25fps.mp4",
  "https://videos.pexels.com/video-files/2614018/2614018-sd_640_360_24fps.mp4",
];

export function CCTVView() {
  const { vehicles, isDriver } = useSimulation();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate cameras from simulation vehicles
  const cameras = vehicles.flatMap((v, idx) => [
    {
      id: `${v.id}-dash`,
      name: `${v.plate} - Dashboard`,
      vehicle: v.name,
      status: v.status === 'active' ? 'live' as const : v.status === 'idle' ? 'recording' as const : 'offline' as const,
      hasAlert: v.engineTemp > 210 || v.fuelLevel < 20,
      alertText: v.engineTemp > 210 ? 'Engine Overheat Warning' : v.fuelLevel < 20 ? 'Low Fuel Alert' : '',
      videoUrl: dashcamVideos[idx % dashcamVideos.length],
    },
    {
      id: `${v.id}-rear`,
      name: `${v.plate} - Rear Cam`,
      vehicle: v.name,
      status: v.status === 'active' ? 'live' as const : 'offline' as const,
      hasAlert: false,
      alertText: '',
      videoUrl: rearCamVideos[idx % rearCamVideos.length],
    },
  ]);

  const [selectedCameraId, setSelectedCameraId] = useState(cameras[0]?.id || '');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCamera = cameras.find(c => c.id === selectedCameraId) || cameras[0];
  const liveCount = cameras.filter(c => c.status === 'live').length;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      if (isPlaying) videoRef.current.play().catch(() => {});
    }
  }, [selectedCameraId]);

  useEffect(() => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.play().catch(() => {}) : videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (cameras.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No vehicles assigned to view CCTV feeds.</p>
      </div>
    );
  }

  const now = new Date();
  const timestamp = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CCTV Feeds</h1>
          <p className="text-muted-foreground">
            {isDriver ? 'Your vehicle camera feeds' : 'Live and recorded camera feeds from all vehicles'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-success">{liveCount} Live</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Video Player */}
        <div className="xl:col-span-2 space-y-4">
          <div ref={containerRef} className="glass-card overflow-hidden">
            <div className="relative aspect-video bg-black">
              {selectedCamera?.status !== 'offline' ? (
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={selectedCamera?.videoUrl}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-background flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Camera Offline</p>
                  </div>
                </div>
              )}

              {/* HUD Overlay */}
              {selectedCamera?.status !== 'offline' && (
                <>
                  {/* Top-left: Camera info */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
                      </span>
                      <span className="text-xs font-mono font-bold text-white tracking-wider">REC</span>
                    </div>
                  </div>

                  {/* Top-right: Timestamp */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <span className="text-xs font-mono text-white/80">{timestamp}</span>
                    </div>
                  </div>

                  {/* Bottom-left: Vehicle & Camera name */}
                  <div className="absolute bottom-14 left-3 z-10">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <p className="text-xs font-semibold text-white">{selectedCamera?.vehicle}</p>
                      <p className="text-[10px] font-mono text-white/60">{selectedCamera?.name}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Controls bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    {selectedCamera?.status === 'live' && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-danger/80 text-white text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {selectedCamera?.hasAlert && (
                <div className="absolute top-12 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/90 text-white animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{selectedCamera.alertText}</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{selectedCamera?.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedCamera?.vehicle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">Download Recording</Button>
                <Button variant="secondary" size="sm">View History</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Grid */}
        <div className="space-y-4">
          <h3 className="font-semibold">All Cameras ({cameras.length})</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
            {cameras.map((camera) => (
              <button
                key={camera.id}
                onClick={() => setSelectedCameraId(camera.id)}
                className={cn(
                  "w-full glass-card p-3 text-left transition-all",
                  selectedCameraId === camera.id ? "border-primary/50 bg-primary/5" : "hover:border-primary/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail preview */}
                    <div className={cn(
                      "w-16 h-10 rounded-lg overflow-hidden relative flex-shrink-0",
                      camera.status === "offline" ? "bg-muted" : "bg-black"
                    )}>
                      {camera.status !== 'offline' ? (
                        <video
                          className="w-full h-full object-cover"
                          src={camera.videoUrl}
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Camera className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      {camera.status === 'live' && (
                        <div className="absolute top-0.5 left-0.5 px-1 py-px rounded bg-danger/80 text-[8px] font-bold text-white">
                          LIVE
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{camera.name}</p>
                      <p className="text-xs text-muted-foreground">{camera.vehicle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {camera.hasAlert && (
                      <AlertTriangle className="w-4 h-4 text-danger" />
                    )}
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                      camera.status === "live" ? "bg-success/20 text-success" :
                      camera.status === "recording" ? "bg-info/20 text-info" : "bg-muted text-muted-foreground"
                    )}>
                      {camera.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
