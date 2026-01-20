import { VehicleCard } from "@/components/dashboard/VehicleCard";
import { mockVehicles } from "@/data/mockData";
import { Truck, Filter, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FleetView() {
  const activeCount = mockVehicles.filter(v => v.status === "active").length;
  const idleCount = mockVehicles.filter(v => v.status === "idle").length;
  const maintenanceCount = mockVehicles.filter(v => v.status === "maintenance").length;
  const offlineCount = mockVehicles.filter(v => v.status === "offline").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fleet Overview</h1>
          <p className="text-muted-foreground">Manage and monitor all vehicles in your fleet</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <Truck className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
            <Truck className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{idleCount}</p>
            <p className="text-sm text-muted-foreground">Idle</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
            <Truck className="w-6 h-6 text-info" />
          </div>
          <div>
            <p className="text-2xl font-bold">{maintenanceCount}</p>
            <p className="text-sm text-muted-foreground">Maintenance</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
            <Truck className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold">{offlineCount}</p>
            <p className="text-sm text-muted-foreground">Offline</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input placeholder="Search vehicles..." className="max-w-xs" />
        <Button variant="secondary" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Vehicle Grid */}
      <div className="data-grid">
        {mockVehicles.map((vehicle, index) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
        ))}
      </div>
    </div>
  );
}
