import { 
  Truck, 
  Gauge, 
  Fuel, 
  AlertTriangle, 
  Route,
  Zap,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { VehicleCard } from "@/components/dashboard/VehicleCard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { FleetMapPlaceholder } from "@/components/dashboard/FleetMapPlaceholder";
import { TireDiagram } from "@/components/dashboard/TireDiagram";
import { FuelMonitor } from "@/components/dashboard/FuelMonitor";
import { EngineHealth } from "@/components/dashboard/EngineHealth";
import { mockFuelHistory } from "@/data/mockData";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulation } from "@/contexts/SimulationContext";
import { useState } from "react";

export function DashboardView() {
  const { vehicleCards, alertPanelData, fleetStats, isSimulating } = useSimulation();
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);
  
  const selectedVehicle = vehicleCards[selectedVehicleIndex] || vehicleCards[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fleet Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time monitoring of {fleetStats.totalVehicles} vehicles
            </p>
          </div>
          {isSimulating && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
              <Zap className="w-4 h-4 text-success animate-pulse" />
              <span className="text-sm font-medium text-success">Live Updates</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Vehicles"
          value={fleetStats.activeVehicles}
          subtitle={`of ${fleetStats.totalVehicles} total`}
          icon={Truck}
          trend={{ value: 12, isPositive: true }}
          variant="success"
          delay={0}
        />
        <StatCard
          title="Miles Today"
          value={fleetStats.totalMileageToday.toLocaleString()}
          subtitle="Combined fleet mileage"
          icon={Route}
          trend={{ value: 8, isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Fuel Efficiency"
          value={`${fleetStats.avgFuelEfficiency} mpg`}
          subtitle="Fleet average"
          icon={Fuel}
          trend={{ value: 3, isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="Active Alerts"
          value={fleetStats.activeAlerts}
          subtitle="Requires attention"
          icon={AlertTriangle}
          variant="warning"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Fleet Map */}
        <div className="xl:col-span-2 h-[500px]">
          <FleetMapPlaceholder />
        </div>

        {/* Alerts Panel */}
        <div className="h-[500px]">
          <AlertsPanel alerts={alertPanelData.length > 0 ? alertPanelData : []} />
        </div>
      </div>

      {/* Vehicle Details Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Vehicle Details</h2>
            <p className="text-sm text-muted-foreground">
              {selectedVehicle?.name} ({selectedVehicle?.plate})
            </p>
          </div>
          <Tabs defaultValue="overview" className="w-auto">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {selectedVehicle && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TireDiagram 
              pressures={selectedVehicle.tirePressure}
              vehicleName={`${selectedVehicle.name} (${selectedVehicle.plate})`}
            />
            <FuelMonitor
              currentLevel={selectedVehicle.fuel}
              capacity={250}
              efficiency={6.8}
              lastRefuel="Live simulation"
              history={mockFuelHistory}
            />
            <EngineHealth
              metrics={{
                engineTemp: selectedVehicle.engineTemp,
                oilPressure: 42,
                batteryVoltage: 13.8,
                coolantLevel: 78,
              }}
              lastDiagnostic="Live simulation"
              overallHealth={selectedVehicle.engineTemp < 200 ? 92 : selectedVehicle.engineTemp < 210 ? 74 : 45}
            />
          </div>
        )}
      </div>

      {/* Fleet Overview */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Fleet Overview</h2>
            <p className="text-sm text-muted-foreground">All vehicles in your fleet (click to view details)</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">Idle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-info" />
              <span className="text-muted-foreground">Maintenance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">Offline</span>
            </div>
          </div>
        </div>

        <div className="data-grid">
          {vehicleCards.map((vehicle, index) => (
            <div 
              key={vehicle.id} 
              onClick={() => setSelectedVehicleIndex(index)}
              className={`cursor-pointer transition-all ${selectedVehicleIndex === index ? 'ring-2 ring-primary rounded-xl' : ''}`}
            >
              <VehicleCard vehicle={vehicle} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
