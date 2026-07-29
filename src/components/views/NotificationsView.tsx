import { Bell, Check, X, Settings, Filter, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    type: "alert",
    title: "Low Tire Pressure Alert",
    description: "TRK-7834 front left tire at 28 PSI",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "alert",
    title: "Low Fuel Warning",
    description: "TRK-7834 fuel level at 18%",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Trip Completed",
    description: "TRK-2847 completed Denver to Kansas City route",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 4,
    type: "success",
    title: "Maintenance Complete",
    description: "TRK-4521 oil change completed successfully",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "info",
    title: "Driver Check-in",
    description: "Mike Johnson started shift at 06:30 AM",
    time: "6 hours ago",
    read: true,
  },
];

export function NotificationsView() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="secondary" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Recent Notifications</h3>
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="divide-y divide-border">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={cn(
                "p-4 hover:bg-secondary/20 transition-colors flex items-start gap-4",
                !notification.read && "bg-primary/5"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                notification.type === "alert" ? "bg-danger/20" :
                notification.type === "success" ? "bg-success/20" : "bg-info/20"
              )}>
                <Bell className={cn(
                  "w-5 h-5",
                  notification.type === "alert" ? "text-danger" :
                  notification.type === "success" ? "text-success" : "text-info"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                  <p className="font-medium">{notification.title}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {notification.time}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
