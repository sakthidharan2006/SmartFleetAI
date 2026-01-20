import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Expand, Layers, Navigation, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VehicleMarker {
  id: string;
  name: string;
  plate: string;
  position: [number, number];
  status: "active" | "idle" | "maintenance" | "offline";
  speed: number;
  heading: number;
}

interface FleetMapProps {
  vehicles: VehicleMarker[];
}

const statusColors = {
  active: "bg-success",
  idle: "bg-warning",
  maintenance: "bg-info",
  offline: "bg-muted-foreground",
};

export function FleetMap({ vehicles }: FleetMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamically import leaflet components only on client side
    import("react-leaflet").then((mod) => {
      import("leaflet").then((L) => {
        import("leaflet/dist/leaflet.css");
        // Set up a custom component after imports
        setMapComponent(() => () => <MapWithLeaflet vehicles={vehicles} L={L.default} ReactLeaflet={mod} />);
      });
    }).catch(console.error);
  }, [vehicles]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card overflow-hidden h-full relative"
    >
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button size="icon" variant="secondary" className="h-9 w-9 bg-card/90 backdrop-blur-sm border border-border">
          <Layers className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="secondary" className="h-9 w-9 bg-card/90 backdrop-blur-sm border border-border">
          <Expand className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="secondary" className="h-9 w-9 bg-card/90 backdrop-blur-sm border border-border">
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Vehicle Count Badge */}
      <div className="absolute top-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs font-medium">{vehicles.filter(v => v.status === "active").length} Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-xs font-medium">{vehicles.filter(v => v.status === "idle").length} Idle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="text-xs font-medium">{vehicles.filter(v => v.status === "offline").length} Offline</span>
          </div>
        </div>
      </div>

      {MapComponent ? (
        <MapComponent />
      ) : (
        <div className="h-full w-full bg-secondary/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Inner component that uses Leaflet after it's loaded
function MapWithLeaflet({ 
  vehicles, 
  L, 
  ReactLeaflet 
}: { 
  vehicles: VehicleMarker[]; 
  L: any; 
  ReactLeaflet: any;
}) {
  const { MapContainer, TileLayer, Marker, Popup } = ReactLeaflet;
  const center: [number, number] = [39.8283, -98.5795];

  const statusColorHex = {
    active: "#22c55e",
    idle: "#eab308",
    maintenance: "#0ea5e9",
    offline: "#6b7280",
  };

  function createTruckIcon(status: VehicleMarker["status"], heading: number) {
    const color = statusColorHex[status];
    return L.divIcon({
      className: "custom-truck-marker",
      html: `
        <div style="
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${heading}deg);
        ">
          <div style="
            width: 32px;
            height: 32px;
            background: ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px ${color}80;
            border: 3px solid #0f172a;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
              <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/>
              <circle cx="7" cy="18" r="2"/>
              <circle cx="17" cy="18" r="2"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }

  return (
    <>
      <MapContainer
        center={center}
        zoom={4}
        className="h-full w-full"
        style={{ background: "hsl(222 47% 6%)" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={vehicle.position}
            icon={createTruckIcon(vehicle.status, vehicle.heading)}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[160px]">
                <h4 className="font-semibold text-sm">{vehicle.name}</h4>
                <p className="text-xs text-gray-400 font-mono">{vehicle.plate}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Status</span>
                    <span className={cn(
                      "font-medium capitalize",
                      vehicle.status === "active" ? "text-green-400" :
                      vehicle.status === "idle" ? "text-yellow-400" : "text-gray-400"
                    )}>{vehicle.status}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Speed</span>
                    <span className="font-medium">{vehicle.speed} mph</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style>{`
        .leaflet-popup-content-wrapper {
          background: hsl(222 47% 10%);
          border: 1px solid hsl(217 33% 20%);
          border-radius: 12px;
          color: white;
        }
        .leaflet-popup-tip {
          background: hsl(222 47% 10%);
          border: 1px solid hsl(217 33% 20%);
        }
        .leaflet-container {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </>
  );
}
