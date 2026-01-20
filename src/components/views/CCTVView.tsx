import { Video, Play, Pause, Maximize2, Volume2, VolumeX, Camera, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const cameras = [
  { id: 1, name: "TRK-2847 - Dashboard", vehicle: "Freightliner Cascadia", status: "live", hasAlert: false },
  { id: 2, name: "TRK-2847 - Rear", vehicle: "Freightliner Cascadia", status: "live", hasAlert: false },
  { id: 3, name: "TRK-1923 - Dashboard", vehicle: "Peterbilt 579", status: "live", hasAlert: true },
  { id: 4, name: "TRK-7834 - Dashboard", vehicle: "Volvo VNL 860", status: "live", hasAlert: false },
  { id: 5, name: "TRK-7834 - Cargo", vehicle: "Volvo VNL 860", status: "offline", hasAlert: false },
  { id: 6, name: "TRK-4521 - Dashboard", vehicle: "Kenworth T680", status: "recording", hasAlert: false },
];

export function CCTVView() {
  const [selectedCamera, setSelectedCamera] = useState(cameras[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CCTV Feeds</h1>
          <p className="text-muted-foreground">Live and recorded camera feeds from all vehicles</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-success">5 Live</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Video Player */}
        <div className="xl:col-span-2 space-y-4">
          <div className="glass-card overflow-hidden">
            {/* Video Area */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {/* Placeholder for video */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-background flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Live Feed: {selectedCamera.name}</p>
                  {selectedCamera.status === "live" && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-success">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                      </span>
                      <span className="text-sm font-medium">LIVE</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <span className="text-sm font-mono">LIVE</span>
                  </div>
                  <Button size="icon" variant="ghost">
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Alert Badge */}
              {selectedCamera.hasAlert && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/90 text-danger-foreground">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Driver Distraction Detected</span>
                </div>
              )}
            </div>
          </div>

          {/* Camera Info */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{selectedCamera.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedCamera.vehicle}</p>
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
          <h3 className="font-semibold">All Cameras</h3>
          <div className="space-y-2">
            {cameras.map((camera) => (
              <button
                key={camera.id}
                onClick={() => setSelectedCamera(camera)}
                className={cn(
                  "w-full glass-card p-3 text-left transition-all",
                  selectedCamera.id === camera.id ? "border-primary/50 bg-primary/5" : "hover:border-primary/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      camera.status === "live" ? "bg-success/20" :
                      camera.status === "recording" ? "bg-info/20" : "bg-muted"
                    )}>
                      <Video className={cn(
                        "w-5 h-5",
                        camera.status === "live" ? "text-success" :
                        camera.status === "recording" ? "text-info" : "text-muted-foreground"
                      )} />
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
