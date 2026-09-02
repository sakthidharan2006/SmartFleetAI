import { Bot, Check, CircleDot, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FleetAiInsight } from "@/lib/fleetIntelligence";

const severityStyles: Record<string, string> = {
  info: "border-primary/30 bg-primary/5 text-primary",
  warning: "border-warning/40 bg-warning/10 text-warning",
  critical: "border-destructive/40 bg-destructive/10 text-destructive",
};

interface Props {
  insight: FleetAiInsight;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
  canAct?: boolean;
}

export function AgentInsightCard({ insight, onAcknowledge, onResolve, canAct }: Props) {
  const items = (insight.payload?.items as Array<Record<string, string | string[]>> | undefined) ?? [];

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center shrink-0", severityStyles[insight.severity])}>
            {insight.severity === "critical" ? <ShieldAlert className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{insight.title}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {insight.agent} agent · risk {insight.risk_score}/100 ·{" "}
              {new Date(insight.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="capitalize shrink-0">
          {insight.status}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground whitespace-pre-line">{insight.summary}</p>

      {insight.recommendations?.length > 0 && (
        <ul className="space-y-1.5">
          {insight.recommendations.map((r, i) => (
            <li key={i} className="flex gap-2 text-xs text-foreground">
              <CircleDot className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="rounded-lg border border-border divide-y divide-border">
          {items.slice(0, 6).map((it, i) => (
            <div key={i} className="p-2.5">
              <p className="text-xs font-medium text-foreground">
                {String(it.vehicle_name ?? "Fleet")} — {String(it.title ?? "")}
              </p>
              <p className="text-xs text-muted-foreground">{String(it.detail ?? "")}</p>
            </div>
          ))}
        </div>
      )}

      {canAct && insight.status !== "resolved" && (
        <div className="flex gap-2 pt-1">
          {insight.status === "open" && (
            <Button size="sm" variant="secondary" onClick={() => onAcknowledge?.(insight.id)}>
              Acknowledge
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onResolve?.(insight.id)}>
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Resolve
          </Button>
        </div>
      )}
    </div>
  );
}
