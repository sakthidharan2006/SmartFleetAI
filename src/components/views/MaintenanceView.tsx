import { Wrench, Calendar, AlertTriangle, CheckCircle, Clock, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const maintenanceTasks = [
  {
    id: 1,
    vehicle: "Volvo VNL 860 (TRK-7834)",
    task: "Oil Change",
    dueIn: "500 mi",
    priority: "high",
    status: "due",
    lastService: "15,000 mi ago",
  },
  {
    id: 2,
    vehicle: "International LT (TRK-5612)",
    task: "Brake Pad Replacement",
    dueIn: "In Service",
    priority: "critical",
    status: "in-progress",
    lastService: "—",
  },
  {
    id: 3,
    vehicle: "Freightliner Cascadia (TRK-2847)",
    task: "Tire Rotation",
    dueIn: "2,500 mi",
    priority: "medium",
    status: "scheduled",
    lastService: "8,000 mi ago",
  },
  {
    id: 4,
    vehicle: "Peterbilt 579 (TRK-1923)",
    task: "Transmission Fluid",
    dueIn: "5,000 mi",
    priority: "low",
    status: "scheduled",
    lastService: "25,000 mi ago",
  },
  {
    id: 5,
    vehicle: "Kenworth T680 (TRK-4521)",
    task: "Air Filter Replacement",
    dueIn: "Completed",
    priority: "low",
    status: "completed",
    lastService: "Today",
  },
];

const priorityStyles = {
  critical: "bg-danger/20 text-danger border-danger/30",
  high: "bg-warning/20 text-warning border-warning/30",
  medium: "bg-info/20 text-info border-info/30",
  low: "bg-muted/50 text-muted-foreground border-border",
};

const statusIcons = {
  due: AlertTriangle,
  "in-progress": Wrench,
  scheduled: Clock,
  completed: CheckCircle,
};

export function MaintenanceView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-foreground">Maintenance</h1>
          <p className="text-muted-foreground">Schedule and track vehicle maintenance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 border-l-4 border-l-danger">
          <p className="text-sm text-muted-foreground">Critical</p>
          <p className="text-3xl font-bold text-danger">1</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-warning">
          <p className="text-sm text-muted-foreground">Due Soon</p>
          <p className="text-3xl font-bold text-warning">3</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-info">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-3xl font-bold text-info">1</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-success">
          <p className="text-sm text-muted-foreground">Completed (30d)</p>
          <p className="text-3xl font-bold text-success">12</p>
        </div>
      </div>

      {/* Maintenance Tasks */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Maintenance Schedule</h3>
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="divide-y divide-border">
          {maintenanceTasks.map((task) => {
            const StatusIcon = statusIcons[task.status as keyof typeof statusIcons];
            return (
              <div key={task.id} className="p-4 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      task.status === "completed" ? "bg-success/20" :
                      task.status === "in-progress" ? "bg-info/20" :
                      task.priority === "critical" ? "bg-danger/20" :
                      task.priority === "high" ? "bg-warning/20" : "bg-secondary"
                    )}>
                      <StatusIcon className={cn(
                        "w-5 h-5",
                        task.status === "completed" ? "text-success" :
                        task.status === "in-progress" ? "text-info" :
                        task.priority === "critical" ? "text-danger" :
                        task.priority === "high" ? "text-warning" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium">{task.task}</p>
                      <p className="text-sm text-muted-foreground">{task.vehicle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono font-medium">{task.dueIn}</p>
                      <p className="text-xs text-muted-foreground">Last: {task.lastService}</p>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border capitalize",
                      priorityStyles[task.priority as keyof typeof priorityStyles]
                    )}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
