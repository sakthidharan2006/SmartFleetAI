import { Activity, Wrench } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MaintenancePrediction } from "@/lib/fleetIntelligence";

const levelStyle: Record<MaintenancePrediction["riskLevel"], string> = {
  low: "text-success border-success/40 bg-success/10",
  moderate: "text-warning border-warning/40 bg-warning/10",
  high: "text-warning border-warning/50 bg-warning/15",
  critical: "text-destructive border-destructive/40 bg-destructive/10",
};

export function PredictiveMaintenancePanel({ predictions }: { predictions: MaintenancePrediction[] }) {
  return (
    <div className="space-y-3">
      {predictions.map((p) => (
        <div key={p.vehicleId} className="glass-card p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center", levelStyle[p.riskLevel])}>
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{p.vehicleName}</p>
                <p className="text-xs text-muted-foreground font-mono">{p.plate}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={cn("capitalize", levelStyle[p.riskLevel])}>
                {p.riskLevel} risk · {p.riskScore}/100
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Predicted window: <span className="font-mono">{p.etaDays}d</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Likely failure point: <span className="text-foreground font-medium">{p.predictedFailure}</span>
            </p>
            <Progress value={p.riskScore} className="h-1.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {p.components.slice(0, 4).map((c) => (
              <div key={c.component} className="rounded-lg border border-border p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-foreground">{c.component}</p>
                  <span className="text-xs font-mono text-muted-foreground">{Math.round(c.score)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{c.detail}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-muted/40 border border-border p-2.5 space-y-1.5">
            <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-primary" /> Maintenance recommendations
            </p>
            {p.recommendations.map((r, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                • {r}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
