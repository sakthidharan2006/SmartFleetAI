import { TireDiagram } from "@/components/dashboard/TireDiagram";
import { EngineHealth } from "@/components/dashboard/EngineHealth";
import { BS6CompliancePanel } from "@/components/dashboard/BS6CompliancePanel";
import { Gauge, AlertTriangle, CheckCircle, Activity, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/contexts/SimulationContext";

export function DiagnosticsView() {
  const { vehicleCards, isDriver, vehicles } = useSimulation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedVehicle = vehicleCards[selectedIndex] || vehicleCards[0];
  const selectedSimVehicle = vehicles[selectedIndex] || vehicles[0];

  if (!selectedVehicle) {
    return <div className="text-muted-foreground p-8 text-center">No vehicles available.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-foreground">Diagnostics</h1>
          <p className="text-muted-foreground">
            {isDriver ? 'Your vehicle health monitoring' : 'Real-time vehicle health monitoring and OBD-II data'}
          </p>
        </div>
        <Button size="sm">
          <Scan className="w-4 h-4 mr-2" />
          Run Full Diagnostic
        </Button>
      </div>

      {/* Vehicle Selector */}
      {!isDriver && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Select Vehicle</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {vehicleCards.map((vehicle, index) => (
              <button
                key={vehicle.id}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all whitespace-nowrap",
                  selectedIndex === index
                    ? "bg-primary/10 border-primary/50" 
                    : "bg-secondary/30 border-border hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  vehicle.status === "active" ? "bg-success" :
                  vehicle.status === "idle" ? "bg-warning" :
                  vehicle.status === "maintenance" ? "bg-info" : "bg-muted-foreground"
                )} />
                <div className="text-left">
                  <p className="font-medium text-sm">{vehicle.name}</p>
                  <p className="text-xs text-muted-foreground">{vehicle.plate}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TireDiagram 
          pressures={selectedVehicle.tirePressure}
          vehicleName={`${selectedVehicle.name} (${selectedVehicle.plate})`}
        />
        <EngineHealth
          metrics={{
            engineTemp: selectedVehicle.engineTemp,
            oilPressure: 42,
            batteryVoltage: 13.8,
            coolantLevel: 78,
          }}
          lastDiagnostic="Live simulation"
          overallHealth={selectedVehicle.alerts > 0 ? 74 : 92}
        />
      </div>

      {/* BS6 Emission Compliance */}
      {selectedSimVehicle && (
        <BS6CompliancePanel
          metrics={{
            adBlueLevel: selectedSimVehicle.adBlueLevel,
            adBlueCapacity: selectedSimVehicle.adBlueCapacity,
            dpfStatus: selectedSimVehicle.dpfStatus,
            dpfSootLoad: selectedSimVehicle.dpfSootLoad,
            scrEfficiency: selectedSimVehicle.scrEfficiency,
            noxLevel: selectedSimVehicle.noxLevel,
            egrStatus: selectedSimVehicle.egrStatus,
            exhaustTemp: selectedSimVehicle.exhaustTemp,
            emissionCompliance: selectedSimVehicle.noxLevel <= 460 && selectedSimVehicle.adBlueLevel > 5 && selectedSimVehicle.dpfStatus !== 'blocked',
          }}
          vehicleName={`${selectedVehicle.name} (${selectedVehicle.plate})`}
        />
      )}

      {/* Diagnostic Codes */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Active Diagnostic Codes
        </h3>
        <div className="space-y-3">
          {selectedVehicle.alerts > 0 ? (
            <>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-warning/10 border border-warning/30">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <div className="flex-1">
                  <p className="font-medium">P0128 - Coolant Thermostat</p>
                  <p className="text-sm text-muted-foreground">Coolant temperature below thermostat regulating temperature</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-danger/10 border border-danger/30">
                <AlertTriangle className="w-5 h-5 text-danger" />
                <div className="flex-1">
                  <p className="font-medium">P0217 - Engine Overtemperature</p>
                  <p className="text-sm text-muted-foreground">Engine coolant over temperature condition detected</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">45m ago</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-success/10 border border-success/30">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium">No Active Codes</p>
                <p className="text-sm text-muted-foreground">All systems operating normally</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
