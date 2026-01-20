import { FuelMonitor } from "@/components/dashboard/FuelMonitor";
import { mockVehicles, mockFuelHistory } from "@/data/mockData";
import { Fuel, TrendingUp, TrendingDown, AlertTriangle, Droplet, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";

const fuelEfficiencyData = [
  { name: "Mon", efficiency: 6.8 },
  { name: "Tue", efficiency: 7.2 },
  { name: "Wed", efficiency: 6.5 },
  { name: "Thu", efficiency: 7.4 },
  { name: "Fri", efficiency: 7.1 },
  { name: "Sat", efficiency: 7.8 },
  { name: "Sun", efficiency: 7.5 },
];

const fuelCostData = [
  { week: "Week 1", cost: 2450 },
  { week: "Week 2", cost: 2680 },
  { week: "Week 3", cost: 2320 },
  { week: "Week 4", cost: 2890 },
];

export function FuelView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fuel Monitor</h1>
          <p className="text-muted-foreground">Track fuel consumption, efficiency, and costs</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Fuel className="w-4 h-4" />
            <span className="text-sm">Total Consumption</span>
          </div>
          <p className="text-2xl font-bold">1,245 gal</p>
          <p className="text-sm text-muted-foreground">This month</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm">Avg Efficiency</span>
          </div>
          <p className="text-2xl font-bold">7.2 mpg</p>
          <p className="text-sm text-success">↑ 5% from last month</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Fuel Cost</span>
          </div>
          <p className="text-2xl font-bold">$4,890</p>
          <p className="text-sm text-muted-foreground">This month</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm">Low Fuel Alerts</span>
          </div>
          <p className="text-2xl font-bold text-warning">2</p>
          <p className="text-sm text-muted-foreground">Active now</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Chart */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Weekly Fuel Efficiency</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fuelEfficiencyData}>
                <defs>
                  <linearGradient id="effGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} domain={[6, 8]} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="efficiency" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#effGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Chart */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Monthly Fuel Costs</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelCostData}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vehicle Fuel Status */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Vehicle Fuel Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockVehicles.map((vehicle) => (
            <FuelMonitor
              key={vehicle.id}
              currentLevel={vehicle.fuel * 2.5}
              capacity={250}
              efficiency={6.8}
              lastRefuel="Yesterday"
              history={mockFuelHistory}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
