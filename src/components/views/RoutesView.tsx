import { Route, Clock, MapPin, ChevronRight, Calendar, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSimulation } from "@/contexts/SimulationContext";

export function RoutesView() {
  const { vehicleCards, isDriver } = useSimulation();

  // Generate trips from simulation vehicles
  const indianRoutes = [
    { from: 'Mumbai', to: 'Pune', distance: '150 km', eta: '2h 45m' },
    { from: 'Ahmedabad', to: 'Surat', distance: '265 km', eta: '4h 10m' },
    { from: 'Jaipur', to: 'Delhi', distance: '281 km', eta: '4h 30m' },
    { from: 'Bengaluru', to: 'Chennai', distance: '346 km', eta: '5h 20m' },
    { from: 'Chennai', to: 'Hyderabad', distance: '630 km', eta: '9h 15m' },
    { from: 'Delhi', to: 'Gurugram', distance: '32 km', eta: '45m' },
  ];

  const trips = vehicleCards.map((v, i) => {
    const route = indianRoutes[i % indianRoutes.length];
    const isActive = v.status === 'active';
    const isMaintenance = v.status === 'maintenance';
    return {
      id: v.id,
      from: route.from,
      to: route.to,
      vehicle: `${v.name} (${v.plate})`,
      driver: 'Assigned Driver',
      status: isActive ? 'in-progress' : isMaintenance ? 'scheduled' : 'completed',
      progress: isActive ? Math.min(95, Math.max(10, v.speed + 20)) : isMaintenance ? 0 : 100,
      distance: route.distance,
      eta: isActive ? route.eta : isMaintenance ? '—' : 'Completed',
      startTime: isActive ? 'Today 06:30 AM' : isMaintenance ? 'Tomorrow 05:00 AM' : 'Yesterday',
    };
  });

  const activeTrips = trips.filter(t => t.status === 'in-progress').length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isDriver ? 'My Trips' : 'Routes & Trips'}
          </h1>
          <p className="text-muted-foreground">
            {isDriver ? 'Your scheduled and active trips' : 'Manage and track all scheduled and active trips'}
          </p>
        </div>
        {!isDriver && (
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button size="sm">
              <Route className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Trips</p>
          <p className="text-3xl font-bold text-primary">{activeTrips}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Scheduled Today</p>
          <p className="text-3xl font-bold">{trips.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed Today</p>
          <p className="text-3xl font-bold text-success">{completedTrips}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Distance</p>
          <p className="text-3xl font-bold">1,840 km</p>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map((trip) => (
          <div key={trip.id} className="glass-card p-5 hover:border-primary/30 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  trip.status === "in-progress" ? "bg-primary/20" :
                  trip.status === "completed" ? "bg-success/20" : "bg-secondary"
                }`}>
                  {trip.status === "completed" ? (
                    <CheckCircle className="w-6 h-6 text-success" />
                  ) : trip.status === "in-progress" ? (
                    <Play className="w-6 h-6 text-primary" />
                  ) : (
                    <Clock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <span>{trip.from}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    <span>{trip.to}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{trip.vehicle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{trip.startTime}</p>
                <p className="font-mono font-bold">{trip.distance}</p>
              </div>
            </div>
            
            {trip.status === "in-progress" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{trip.progress}% • ETA: {trip.eta}</span>
                </div>
                <Progress value={trip.progress} className="h-2 [&>div]:bg-primary" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
