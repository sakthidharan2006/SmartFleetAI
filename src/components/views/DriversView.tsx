import { Users, Star, Clock, Award, Phone, Mail, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/contexts/SimulationContext";

const drivers = [
  {
    id: 1,
    name: "Suresh Kumar",
    vehicle: "MH-12-AB-1234",
    vehicleName: "Tata Prima 4928.S",
    status: "on-duty",
    score: 94,
    hoursRemaining: 6.5,
    totalKm: 73500,
    trips: 234,
    phone: "+91 98765 43210",
    avatar: "SK",
  },
  {
    id: 2,
    name: "Amit Patel",
    vehicle: "GJ-05-CD-5678",
    vehicleName: "Ashok Leyland 4923",
    status: "on-duty",
    score: 88,
    hoursRemaining: 4.2,
    totalKm: 62600,
    trips: 198,
    phone: "+91 87654 32109",
    avatar: "AP",
  },
  {
    id: 3,
    name: "Ravi Verma",
    vehicle: "RJ-14-EF-9012",
    vehicleName: "Mahindra Blazo X 46",
    status: "off-duty",
    score: 91,
    hoursRemaining: 11,
    totalKm: 84200,
    trips: 267,
    phone: "+91 76543 21098",
    avatar: "RV",
  },
  {
    id: 4,
    name: "Vikram Singh",
    vehicle: "KA-01-GH-3456",
    vehicleName: "BharatBenz 4228R",
    status: "on-duty",
    score: 72,
    hoursRemaining: 2.8,
    totalKm: 108200,
    trips: 312,
    phone: "+91 65432 10987",
    avatar: "VS",
  },
  {
    id: 5,
    name: "Manoj Yadav",
    vehicle: "TN-09-IJ-7890",
    vehicleName: "Eicher Pro 6049",
    status: "sleeper",
    score: 86,
    hoursRemaining: 8,
    totalKm: 66400,
    trips: 189,
    phone: "+91 54321 09876",
    avatar: "MY",
  },
  {
    id: 6,
    name: "Prakash Joshi",
    vehicle: "DL-01-KL-2345",
    vehicleName: "Tata Signa 4825.TK",
    status: "on-duty",
    score: 90,
    hoursRemaining: 5.5,
    totalKm: 55800,
    trips: 156,
    phone: "+91 43210 98765",
    avatar: "PJ",
  },
];

export function DriversView() {
  const { isDriver } = useSimulation();

  // Drivers only see their own profile
  const displayDrivers = isDriver ? [drivers[0]] : drivers;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isDriver ? 'My Profile' : 'Drivers'}
          </h1>
          <p className="text-muted-foreground">
            {isDriver ? 'Your performance and details' : 'Manage drivers and monitor performance'}
          </p>
        </div>
        {!isDriver && (
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
        )}
      </div>

      {/* Stats */}
      {!isDriver && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Total Drivers</span>
            </div>
            <p className="text-2xl font-bold">{drivers.length}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4 text-success" />
              <span className="text-sm">On Duty</span>
            </div>
            <p className="text-2xl font-bold text-success">{drivers.filter(d => d.status === 'on-duty').length}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Star className="w-4 h-4 text-warning" />
              <span className="text-sm">Avg Score</span>
            </div>
            <p className="text-2xl font-bold">{(drivers.reduce((a, d) => a + d.score, 0) / drivers.length).toFixed(1)}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm">Top Performer</span>
            </div>
            <p className="text-lg font-bold truncate">Suresh Kumar</p>
          </div>
        </div>
      )}

      {/* Drivers List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">{isDriver ? 'My Details' : 'All Drivers'}</h3>
        </div>
        <div className="divide-y divide-border">
          {displayDrivers.map((driver) => (
            <div key={driver.id} className="p-4 hover:bg-secondary/20 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold">
                    {driver.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">{driver.vehicleName} • {driver.vehicle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 flex-wrap">
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
                    <p className="font-mono font-bold">{driver.totalKm.toLocaleString()} km</p>
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
