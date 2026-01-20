import { Users, Star, Clock, Award, TrendingUp, TrendingDown, Phone, Mail, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const drivers = [
  {
    id: 1,
    name: "Mike Johnson",
    vehicle: "TRK-2847",
    status: "on-duty",
    score: 94,
    hoursRemaining: 6.5,
    totalMiles: 45678,
    trips: 234,
    phone: "+1 (555) 123-4567",
    avatar: "MJ",
  },
  {
    id: 2,
    name: "Sarah Williams",
    vehicle: "TRK-1923",
    status: "on-duty",
    score: 88,
    hoursRemaining: 4.2,
    totalMiles: 38912,
    trips: 198,
    phone: "+1 (555) 234-5678",
    avatar: "SW",
  },
  {
    id: 3,
    name: "James Rodriguez",
    vehicle: "TRK-4521",
    status: "off-duty",
    score: 91,
    hoursRemaining: 11,
    totalMiles: 52341,
    trips: 267,
    phone: "+1 (555) 345-6789",
    avatar: "JR",
  },
  {
    id: 4,
    name: "David Chen",
    vehicle: "TRK-7834",
    status: "on-duty",
    score: 72,
    hoursRemaining: 2.8,
    totalMiles: 67234,
    trips: 312,
    phone: "+1 (555) 456-7890",
    avatar: "DC",
  },
  {
    id: 5,
    name: "Robert Martinez",
    vehicle: "TRK-5612",
    status: "sleeper",
    score: 86,
    hoursRemaining: 8,
    totalMiles: 41234,
    trips: 189,
    phone: "+1 (555) 567-8901",
    avatar: "RM",
  },
];

export function DriversView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Drivers</h1>
          <p className="text-muted-foreground">Manage drivers and monitor performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Total Drivers</span>
          </div>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4 text-success" />
            <span className="text-sm">On Duty</span>
          </div>
          <p className="text-2xl font-bold text-success">8</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Star className="w-4 h-4 text-warning" />
            <span className="text-sm">Avg Score</span>
          </div>
          <p className="text-2xl font-bold">86.2</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm">Top Performer</span>
          </div>
          <p className="text-lg font-bold truncate">Mike Johnson</p>
        </div>
      </div>

      {/* Drivers List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">All Drivers</h3>
        </div>
        <div className="divide-y divide-border">
          {drivers.map((driver) => (
            <div key={driver.id} className="p-4 hover:bg-secondary/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold">
                    {driver.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">Vehicle: {driver.vehicle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  {/* Status */}
                  <div className="text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium capitalize",
                      driver.status === "on-duty" ? "bg-success/20 text-success" :
                      driver.status === "sleeper" ? "bg-info/20 text-info" : "bg-muted text-muted-foreground"
                    )}>
                      {driver.status.replace("-", " ")}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{driver.hoursRemaining}h remaining</p>
                  </div>

                  {/* Score */}
                  <div className="w-24">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <span className={cn(
                        "font-bold",
                        driver.score >= 90 ? "text-success" :
                        driver.score >= 75 ? "text-warning" : "text-danger"
                      )}>{driver.score}</span>
                    </div>
                    <Progress 
                      value={driver.score} 
                      className={cn(
                        "h-1.5",
                        driver.score >= 90 ? "[&>div]:bg-success" :
                        driver.score >= 75 ? "[&>div]:bg-warning" : "[&>div]:bg-danger"
                      )} 
                    />
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="font-mono font-bold">{driver.totalMiles.toLocaleString()} mi</p>
                    <p className="text-xs text-muted-foreground">{driver.trips} trips</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
