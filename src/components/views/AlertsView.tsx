import { AlertsPanel, Alert } from "@/components/dashboard/AlertsPanel";
import { mockAlerts } from "@/data/mockData";
import { Bell, Filter, CheckCheck, Settings, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const allAlerts: Alert[] = [
  ...mockAlerts,
  {
    id: "a7",
    type: "critical",
    category: "engine",
    title: "Engine Overheating",
    description: "Engine temperature exceeded 230°F, immediate attention required",
    vehicle: "International LT (TRK-5612)",
    time: "Yesterday",
  },
  {
    id: "a8",
    type: "warning",
    category: "tire",
    title: "Tire Wear Alert",
    description: "Front left tire tread depth below 4/32 inch",
    vehicle: "Mack Anthem (TRK-9087)",
    time: "2 days ago",
  },
  {
    id: "a9",
    type: "info",
    category: "maintenance",
    title: "Service Completed",
    description: "Annual inspection completed successfully",
    vehicle: "Kenworth T680 (TRK-4521)",
    time: "3 days ago",
  },
];

export function AlertsView() {
  const criticalCount = allAlerts.filter(a => a.type === "critical").length;
  const warningCount = allAlerts.filter(a => a.type === "warning").length;
  const infoCount = allAlerts.filter(a => a.type === "info").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-muted-foreground">Manage and respond to fleet alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="secondary" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Alert Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-danger/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <div>
            <p className="text-2xl font-bold text-danger">{criticalCount}</p>
            <p className="text-sm text-muted-foreground">Critical</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{warningCount}</p>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
            <Info className="w-6 h-6 text-info" />
          </div>
          <div>
            <p className="text-2xl font-bold text-info">{infoCount}</p>
            <p className="text-sm text-muted-foreground">Informational</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <Bell className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{allAlerts.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Alerts Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="warning">Warnings</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="h-[600px]">
            <AlertsPanel alerts={allAlerts} />
          </div>
        </TabsContent>
        <TabsContent value="critical" className="mt-4">
          <div className="h-[600px]">
            <AlertsPanel alerts={allAlerts.filter(a => a.type === "critical")} />
          </div>
        </TabsContent>
        <TabsContent value="warning" className="mt-4">
          <div className="h-[600px]">
            <AlertsPanel alerts={allAlerts.filter(a => a.type === "warning")} />
          </div>
        </TabsContent>
        <TabsContent value="info" className="mt-4">
          <div className="h-[600px]">
            <AlertsPanel alerts={allAlerts.filter(a => a.type === "info")} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
