import { FleetMapPlaceholder } from "@/components/dashboard/FleetMapPlaceholder";
import { mockVehicles } from "@/data/mockData";
import { MapPin, Navigation, Layers, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TrackingView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Tracking</h1>
          <p className="text-muted-foreground">Real-time GPS tracking of all fleet vehicles</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Layers className="w-4 h-4 mr-2" />
            Map Layers
          </Button>
          <Button variant="secondary" size="sm">
            <Maximize2 className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Main Map */}
      <div className="h-[600px]">
        <FleetMapPlaceholder />
      </div>

      {/* Vehicle List */}
      <div className="glass-card p-4">
        <h3 className="font-semibold mb-4">Active Vehicles</h3>
        <div className="space-y-2">
          {mockVehicles.filter(v => v.status === "active").map((vehicle) => (
            <div 
              key={vehicle.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">{vehicle.name}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.plate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold">{vehicle.speed} mph</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {vehicle.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
