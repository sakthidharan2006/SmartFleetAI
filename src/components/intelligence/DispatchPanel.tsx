import { useMemo, useState } from "react";
import { MapPin, Navigation, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DispatchJob, TelemetrySnapshot, scoreDispatch } from "@/lib/fleetIntelligence";

interface Props {
  vehicles: TelemetrySnapshot[];
  onRunAgent: (job: DispatchJob, ranking: ReturnType<typeof scoreDispatch>) => void;
  running: boolean;
}

const CORRIDORS: Record<string, string> = {
  "mumbai-pune": "NH-48 via Khalapur & Lonavala — 3 toll plazas, ghat section before Lonavala",
  "delhi-jaipur": "NH-48 via Gurugram, Kotputli — 5 toll plazas, expressway grade",
  "chennai-bengaluru": "NH-44 via Ranipet & Krishnagiri — 4 toll plazas",
  "ahmedabad-surat": "NH-48 via Bharuch — bridge weight restriction at Narmada",
};

export function DispatchPanel({ vehicles, onRunAgent, running }: Props) {
  const [origin, setOrigin] = useState("Mumbai");
  const [destination, setDestination] = useState("Pune");
  const [distanceKm, setDistanceKm] = useState("150");
  const [cargo, setCargo] = useState("Steel coils — 24 t");

  const job: DispatchJob = useMemo(
    () => ({ origin, destination, distanceKm: Number(distanceKm) || 0, cargo }),
    [origin, destination, distanceKm, cargo],
  );

  const ranking = useMemo(() => scoreDispatch(vehicles, job), [vehicles, job]);
  const corridor =
    CORRIDORS[`${origin.toLowerCase().trim()}-${destination.toLowerCase().trim()}`] ??
    "Route computed from GPS heading and highway network — verify toll plazas and night-driving restrictions.";

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          <h3 className="section-title">Dispatch request</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Origin</Label>
            <Input value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Destination</Label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Distance (km)</Label>
            <Input value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} inputMode="numeric" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cargo</Label>
            <Input value={cargo} onChange={(e) => setCargo(e.target.value)} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground flex gap-2">
          <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <span>{corridor}</span>
        </div>
        <Button size="sm" disabled={running} onClick={() => onRunAgent(job, ranking)}>
          <Sparkles className="w-4 h-4 mr-2" />
          {running ? "Dispatch agent thinking…" : "Ask Dispatch Agent"}
        </Button>
      </div>

      <div className="space-y-2">
        {ranking.map((c, i) => (
          <div key={c.vehicleId} className="glass-card p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-semibold shrink-0",
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{c.vehicleName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{c.plate}</p>
                </div>
              </div>
              <Badge variant={i === 0 ? "default" : "outline"}>fit {c.score}</Badge>
            </div>
            <div className="mt-2 space-y-1">
              {c.reasons.slice(0, 3).map((r, k) => (
                <p key={k} className="text-xs text-muted-foreground">
                  • {r}
                </p>
              ))}
              {c.blockers.map((b, k) => (
                <p key={`b-${k}`} className="text-xs text-destructive">
                  ✕ {b}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
