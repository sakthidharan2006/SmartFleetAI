import { FleetMap } from "@/components/dashboard/FleetMap";
import { MapPin, Navigation, Layers, Maximize2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/contexts/SimulationContext";

export function TrackingView() {
  const { vehicleCards, vehicles, isSimulating, isDriver } = useSimulation();
  const activeVehicles = vehicleCards.filter(v => v.status === "active");

  // Transform simulation vehicles to map markers
  const mapMarkers = vehicles.map(v => ({
    id: v.id,
    name: v.name,
    plate: v.plate,
    position: [v.latitude, v.longitude] as [number, number],
    status: v.status,
    speed: v.speed,
    heading: v.heading,
    fuelLevel: v.fuelLevel,
    engineTemp: v.engineTemp,
  }));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {isDriver ? 'My Location' : 'Live Tracking'}
            </h1>
            {isSimulating && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 border border-success/30">
                <Zap className="w-3 h-3 text-success animate-pulse" />
                <span className="text-xs font-medium text-success">Live</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            {isDriver ? 'Real-time GPS tracking of your vehicle' : 'Real-time GPS tracking of all fleet vehicles'}
          </p>
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

      {/* Live Map */}
      <div className="h-[600px]">
        <FleetMap vehicles={mapMarkers} />
      </div>

      {/* Vehicle List */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{isDriver ? 'My Vehicle' : 'Active Vehicles'}</h3>
          <span className="text-sm text-muted-foreground">
            {isDriver ? (activeVehicles.length > 0 ? 'Currently moving' : 'Stationary') : `${activeVehicles.length} vehicles moving`}
          </span>
        </div>
        <div className="space-y-2">
          {(isDriver ? vehicleCards : activeVehicles).map((vehicle) => (
            <div 
              key={vehicle.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  vehicle.status === 'active' ? "bg-success/20" : 
                  vehicle.status === 'idle' ? "bg-warning/20" : "bg-muted"
                )}>
                  <Navigation className={cn(
                    "w-5 h-5",
                    vehicle.status === 'active' ? "text-success" : 
                    vehicle.status === 'idle' ? "text-warning" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="font-medium">{vehicle.name}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.plate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold">{vehicle.speed} km/h</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {vehicle.location}
                </p>
              </div>
            </div>
          ))}
          {vehicleCards.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No vehicles to display</p>
          )}
        </div>
      </div>
    </div>
  );
}
