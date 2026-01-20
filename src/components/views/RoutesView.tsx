import { Route, Clock, MapPin, Fuel, ChevronRight, Calendar, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const trips = [
  {
    id: 1,
    from: "Denver, CO",
    to: "Kansas City, MO",
    vehicle: "Volvo VNL 860 (TRK-7834)",
    driver: "David Chen",
    status: "in-progress",
    progress: 65,
    distance: "604 mi",
    eta: "4h 32m",
    startTime: "06:30 AM",
  },
  {
    id: 2,
    from: "Omaha, NE",
    to: "Chicago, IL",
    vehicle: "Freightliner Cascadia (TRK-2847)",
    driver: "Mike Johnson",
    status: "in-progress",
    progress: 42,
    distance: "469 mi",
    eta: "6h 15m",
    startTime: "08:15 AM",
  },
  {
    id: 3,
    from: "Salt Lake City, UT",
    to: "Phoenix, AZ",
    vehicle: "Peterbilt 579 (TRK-1923)",
    driver: "Sarah Williams",
    status: "scheduled",
    progress: 0,
    distance: "660 mi",
    eta: "—",
    startTime: "Tomorrow 05:00 AM",
  },
  {
    id: 4,
    from: "Los Angeles, CA",
    to: "Las Vegas, NV",
    vehicle: "Kenworth T680 (TRK-4521)",
    driver: "James Rodriguez",
    status: "completed",
    progress: 100,
    distance: "270 mi",
    eta: "Completed",
    startTime: "Yesterday",
  },
];

export function RoutesView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Routes & Trips</h1>
          <p className="text-muted-foreground">Manage and track all scheduled and active trips</p>
        </div>
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Trips</p>
          <p className="text-3xl font-bold text-primary">8</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Scheduled Today</p>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed Today</p>
          <p className="text-3xl font-bold text-success">5</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Distance</p>
          <p className="text-3xl font-bold">2,456 mi</p>
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
                  <p className="text-sm text-muted-foreground">{trip.vehicle} • {trip.driver}</p>
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
