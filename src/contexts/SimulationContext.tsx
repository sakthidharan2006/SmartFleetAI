import { createContext, useContext, ReactNode, useMemo } from 'react';
import { 
  useRealtimeSimulation, 
  SimulatedVehicle, 
  SimulatedAlert 
} from '@/hooks/useRealtimeSimulation';
import { Vehicle } from '@/components/dashboard/VehicleCard';
import { Alert } from '@/components/dashboard/AlertsPanel';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SimulationContextType {
  vehicles: SimulatedVehicle[];
  alerts: SimulatedAlert[];
  isSimulating: boolean;
  unreadAlertCount: number;
  startSimulation: () => void;
  stopSimulation: () => void;
  markAlertAsRead: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  // Transformed data for compatibility with existing components
  vehicleCards: Vehicle[];
  alertPanelData: Alert[];
  fleetStats: {
    totalVehicles: number;
    activeVehicles: number;
    idleVehicles: number;
    maintenanceVehicles: number;
    offlineVehicles: number;
    totalMileageToday: number;
    avgFuelEfficiency: number;
    activeAlerts: number;
  };
  userRole: 'owner' | 'driver' | 'admin' | null;
  isDriver: boolean;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// Transform SimulatedVehicle to Vehicle format for VehicleCard
function transformToVehicleCard(vehicle: SimulatedVehicle): Vehicle {
  const timeSinceUpdate = Math.round((Date.now() - vehicle.lastUpdate.getTime()) / 1000);
  const lastUpdateStr = timeSinceUpdate < 60 
    ? `${timeSinceUpdate}s ago` 
    : `${Math.round(timeSinceUpdate / 60)}m ago`;

  // Determine alerts based on vehicle conditions
  let alertCount = 0;
  if (vehicle.fuelLevel < 25) alertCount++;
  if (vehicle.engineTemp > 210) alertCount++;
  const avgTire = (vehicle.tirePressure.frontLeft + vehicle.tirePressure.frontRight + 
                   vehicle.tirePressure.rearLeft + vehicle.tirePressure.rearRight) / 4;
  if (avgTire < 95) alertCount++;

  return {
    id: vehicle.id,
    name: vehicle.name,
    plate: vehicle.plate,
    driver: 'Assigned Driver',
    status: vehicle.status,
    location: getLocationName(vehicle.latitude, vehicle.longitude),
    speed: vehicle.speed,
    fuel: Math.round(vehicle.fuelLevel),
    tirePressure: {
      fl: vehicle.tirePressure.frontLeft,
      fr: vehicle.tirePressure.frontRight,
      rl: vehicle.tirePressure.rearLeft,
      rr: vehicle.tirePressure.rearRight,
    },
    engineTemp: vehicle.engineTemp,
    lastUpdate: lastUpdateStr,
    mileage: Math.round(vehicle.mileage),
    alerts: alertCount,
    adBlueLevel: vehicle.adBlueLevel,
  };
}

// Transform SimulatedAlert to AlertPanel format
function transformToAlertPanel(alert: SimulatedAlert): Alert {
  const timeSinceAlert = Math.round((Date.now() - alert.timestamp.getTime()) / 1000);
  const timeStr = timeSinceAlert < 60 
    ? `${timeSinceAlert}s ago` 
    : timeSinceAlert < 3600 
      ? `${Math.round(timeSinceAlert / 60)}m ago`
      : `${Math.round(timeSinceAlert / 3600)}h ago`;

  // Map alert type to category
  const categoryMap: Record<string, Alert['category']> = {
    'Low Tire Pressure': 'tire',
    'Engine Overheat': 'engine',
    'Low Fuel': 'fuel',
    'Harsh Braking': 'speed',
    'Route Deviation': 'geofence',
    'Scheduled Maintenance': 'maintenance',
  };

  return {
    id: alert.id,
    type: alert.type,
    category: categoryMap[alert.title] || 'maintenance',
    title: alert.title,
    description: alert.message,
    vehicle: alert.vehicleName,
    time: timeStr,
  };
}

// Get approximate location name from coordinates
function getLocationName(lat: number, lng: number): string {
  // Simple mapping based on regions
  if (lat > 42 && lng > -90) return 'Northeast Region';
  if (lat > 38 && lat < 42 && lng > -100) return 'Midwest Region';
  if (lat > 35 && lat < 40 && lng < -100) return 'Mountain West';
  if (lat < 35 && lng > -100) return 'Southern Region';
  if (lat < 38 && lng < -110) return 'Southwest Region';
  if (lng < -115) return 'Pacific Region';
  return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
}

interface SimulationProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function SimulationProvider({ children, enabled = true }: SimulationProviderProps) {
  const simulation = useRealtimeSimulation(enabled);
  const { user, role } = useAuth();

  const isDriver = role === 'driver';
  const userRole = role;

  // Map driver emails to their vehicle index (matches DEMO_ACCOUNTS order in Auth.tsx)
  const DRIVER_VEHICLE_MAP: Record<string, string> = {
    'driver1@truckpulse.demo': '1', // Tata Prima 4928.S
    'driver2@truckpulse.demo': '2', // Ashok Leyland 4923
    'driver3@truckpulse.demo': '3', // Mahindra Blazo X 46
    'driver4@truckpulse.demo': '4', // BharatBenz 4228R
    'driver5@truckpulse.demo': '5', // Eicher Pro 6049
    'driver6@truckpulse.demo': '6', // Tata Signa 4825.TK
  };

  const filteredVehicles = useMemo(() => {
    if (isDriver && user) {
      const assignedVehicleId = DRIVER_VEHICLE_MAP[user.email || ''];
      if (assignedVehicleId) {
        const match = simulation.vehicles.filter(v => v.id === assignedVehicleId);
        if (match.length > 0) return match;
      }
      // Fallback to first vehicle
      return simulation.vehicles.slice(0, 1);
    }
    return simulation.vehicles;
  }, [simulation.vehicles, isDriver, user]);

  const filteredAlerts = useMemo(() => {
    if (isDriver && user) {
      // Driver only sees alerts for their assigned vehicle
      const driverVehicleIds = filteredVehicles.map(v => v.id);
      return simulation.alerts.filter(a => driverVehicleIds.includes(a.vehicleId));
    }
    return simulation.alerts;
  }, [simulation.alerts, filteredVehicles, isDriver, user]);

  // Transform data for components
  const vehicleCards = filteredVehicles.map(transformToVehicleCard);
  const alertPanelData = filteredAlerts.map(transformToAlertPanel);

  // Calculate fleet stats based on filtered data
  const fleetStats = {
    totalVehicles: filteredVehicles.length,
    activeVehicles: filteredVehicles.filter(v => v.status === 'active').length,
    idleVehicles: filteredVehicles.filter(v => v.status === 'idle').length,
    maintenanceVehicles: filteredVehicles.filter(v => v.status === 'maintenance').length,
    offlineVehicles: filteredVehicles.filter(v => v.status === 'offline').length,
    totalMileageToday: Math.round(filteredVehicles.reduce((acc, v) => acc + (v.speed > 0 ? v.speed * 0.5 : 0), 0) * 10),
    avgFuelEfficiency: 7.2,
    activeAlerts: filteredAlerts.filter(a => !a.isRead).length,
  };

  return (
    <SimulationContext.Provider value={{
      ...simulation,
      vehicles: filteredVehicles,
      alerts: filteredAlerts,
      vehicleCards,
      alertPanelData,
      fleetStats,
      userRole,
      isDriver,
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
