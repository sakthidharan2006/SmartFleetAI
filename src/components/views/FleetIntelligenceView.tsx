import { useMemo, useState } from "react";
import { Bot, Brain, FileCheck, Layers, Radar, Sparkles, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/StatCard";
import { PredictiveMaintenancePanel } from "@/components/intelligence/PredictiveMaintenancePanel";
import { DispatchPanel } from "@/components/intelligence/DispatchPanel";
import { ComplianceAutomationPanel } from "@/components/intelligence/ComplianceAutomationPanel";
import { AgentInsightCard } from "@/components/intelligence/AgentInsightCard";
import { useSimulation } from "@/contexts/SimulationContext";
import { useFleetIntelligence } from "@/hooks/useFleetIntelligence";
import { usePermissions } from "@/hooks/usePermissions";
import {
  AgentId,
  TelemetrySnapshot,
  predictMaintenance,
  summariseCompliance,
} from "@/lib/fleetIntelligence";

const AGENT_META: { id: AgentId; label: string; icon: React.ElementType; blurb: string }[] = [
  { id: "maintenance", label: "Maintenance Agent", icon: Wrench, blurb: "Sensor-trend failure prediction" },
  { id: "routing", label: "Dispatch & Routing Agent", icon: Radar, blurb: "Vehicle/driver assignment + routes" },
  { id: "compliance", label: "Compliance Agent", icon: FileCheck, blurb: "Document validity + auto reports" },
  { id: "incident", label: "Fleet & Incident Agent", icon: Layers, blurb: "Security, theft and anomaly patterns" },
];

export function FleetIntelligenceView() {
  const { vehicleCards, theftAlerts, alerts, isDriver } = useSimulation();
  const { canApprove } = usePermissions();
  const {
    insights,
    reports,
    documents,
    runningAgent,
    runAgent,
    acknowledgeInsight,
    resolveInsight,
    saveReport,
  } = useFleetIntelligence();
  const [tab, setTab] = useState("overview");

  const telemetry: TelemetrySnapshot[] = useMemo(
    () =>
      vehicleCards.map((v) => ({
        id: v.id,
        name: v.name,
        plate: v.plate,
        status: v.status,
        location: v.location,
        speed: v.speed,
        fuel: v.fuel,
        engineTemp: v.engineTemp,
        mileage: v.mileage,
        alerts: v.alerts,
        tirePressure: v.tirePressure,
        adBlueLevel: v.adBlueLevel,
      })),
    [vehicleCards],
  );

  const predictions = useMemo(
    () => telemetry.map(predictMaintenance).sort((a, b) => b.riskScore - a.riskScore),
    [telemetry],
  );
  const compliance = useMemo(() => summariseCompliance(documents), [documents]);

  const atRisk = predictions.filter((p) => p.riskScore >= 50).length;
  const fleetHealth = predictions.length
    ? Math.round(100 - predictions.reduce((a, p) => a + p.riskScore, 0) / predictions.length)
    : 100;
  const openIncidents = theftAlerts.filter((t) => !t.isAcknowledged).length;

  const signals = useMemo(
    () => ({
      predictions: predictions.slice(0, 10),
      compliance,
      openIncidents,
      liveAlerts: alerts.slice(0, 10).map((a) => ({ title: a.title, message: a.message, type: a.type })),
    }),
    [predictions, compliance, openIncidents, alerts],
  );

  const latestByAgent = (agent: AgentId) => insights.filter((i) => i.agent === agent);

  const run = (agent: AgentId, extra: Record<string, unknown> = {}) =>
    runAgent(agent, { telemetry, signals, ...extra });

  return (
    <div className="space-y-4">
      {/* Command bar */}
      <div className="flex flex-wrap items-end justify-between gap-3 pb-3 border-b border-border">
        <div>
          <p className="eyebrow">Unified fleet intelligence</p>
          <h1 className="text-xl md:text-2xl font-display font-semibold tracking-tight text-foreground">
            Multi-Agent AI Command Layer
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Connected fleet data → multi-agent AI → predictive maintenance → intelligent dispatch → automated compliance
          </p>
        </div>
        <Button
          size="sm"
          disabled={runningAgent !== null}
          onClick={() =>
            run("unified", {
              peerFindings: {
                maintenance: latestByAgent("maintenance")[0] ?? null,
                routing: latestByAgent("routing")[0] ?? null,
                compliance: latestByAgent("compliance")[0] ?? null,
                incident: latestByAgent("incident")[0] ?? null,
              },
            })
          }
        >
          <Brain className="w-4 h-4 mr-2" />
          {runningAgent === "unified" ? "Synthesising…" : "Run Fleet Brief"}
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard compact title="Fleet Health Index" value={`${fleetHealth}%`} subtitle="Predictive model" icon={Sparkles} variant={fleetHealth > 70 ? "success" : "warning"} delay={0} />
        <StatCard compact title="Vehicles at Risk" value={atRisk} subtitle="Risk ≥ 50/100" icon={Wrench} variant={atRisk ? "warning" : "default"} delay={0.05} />
        <StatCard compact title="Compliance Score" value={`${compliance.complianceScore}%`} subtitle={`${compliance.expired} expired`} icon={FileCheck} delay={0.1} />
        <StatCard compact title="Open Incidents" value={openIncidents} subtitle="Security & cargo" icon={Layers} variant={openIncidents ? "warning" : "default"} delay={0.15} />
      </div>

      {/* Agent roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {AGENT_META.map(({ id, label, icon: Icon, blurb }) => {
          const agentInsights = latestByAgent(id);
          return (
            <div key={id} className="glass-card p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{blurb}</p>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                  {agentInsights.length}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                disabled={runningAgent !== null}
                onClick={() => run(id, id === "compliance" ? { persistReport: true } : {})}
              >
                <Bot className="w-3.5 h-3.5 mr-1.5" />
                {runningAgent === id ? "Running…" : "Run agent"}
              </Button>
            </div>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto">
          <TabsTrigger value="overview">Fleet Brief</TabsTrigger>
          <TabsTrigger value="maintenance">Predictive Maintenance</TabsTrigger>
          <TabsTrigger value="dispatch">Dispatch & Routing</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Automation</TabsTrigger>
          <TabsTrigger value="incident">Incident Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-3">
          {insights.length === 0 && (
            <div className="glass-card p-6 text-center space-y-2">
              <Brain className="w-8 h-8 text-primary mx-auto" />
              <p className="text-sm text-foreground font-medium">No agent briefs yet</p>
              <p className="text-xs text-muted-foreground">
                Run an agent above — every brief is stored and shared across the intelligence layer.
              </p>
            </div>
          )}
          {insights.slice(0, 12).map((i) => (
            <AgentInsightCard
              key={i.id}
              insight={i}
              canAct={canApprove}
              onAcknowledge={acknowledgeInsight}
              onResolve={resolveInsight}
            />
          ))}
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4 space-y-3">
          <PredictiveMaintenancePanel predictions={predictions} />
          {latestByAgent("maintenance").slice(0, 4).map((i) => (
            <AgentInsightCard key={i.id} insight={i} canAct={canApprove} onAcknowledge={acknowledgeInsight} onResolve={resolveInsight} />
          ))}
        </TabsContent>

        <TabsContent value="dispatch" className="mt-4 space-y-3">
          <DispatchPanel
            vehicles={telemetry}
            running={runningAgent === "routing"}
            onRunAgent={(job, ranking) => runAgent("routing", { telemetry, signals: { ...signals, ranking }, job })}
          />
          {latestByAgent("routing").slice(0, 4).map((i) => (
            <AgentInsightCard key={i.id} insight={i} canAct={canApprove} onAcknowledge={acknowledgeInsight} onResolve={resolveInsight} />
          ))}
        </TabsContent>

        <TabsContent value="compliance" className="mt-4 space-y-3">
          <ComplianceAutomationPanel
            documents={documents}
            reports={reports}
            running={runningAgent === "compliance"}
            onRunAgent={() => run("compliance", { persistReport: true })}
            onArchive={saveReport}
          />
          {latestByAgent("compliance").slice(0, 4).map((i) => (
            <AgentInsightCard key={i.id} insight={i} canAct={canApprove} onAcknowledge={acknowledgeInsight} onResolve={resolveInsight} />
          ))}
        </TabsContent>

        <TabsContent value="incident" className="mt-4 space-y-3">
          <div className="glass-card p-4 space-y-2">
            <h3 className="section-title">Live incident signals</h3>
            <p className="text-xs text-muted-foreground">
              {openIncidents} open security incident(s) · {alerts.length} live telemetry alerts
              {isDriver ? " for your vehicle" : " across the fleet"}
            </p>
            {theftAlerts.slice(0, 5).map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-2.5">
                <p className="text-xs font-medium text-foreground">{t.title ?? "Security event"}</p>
                <p className="text-xs text-muted-foreground">{t.description ?? t.vehicleName}</p>
              </div>
            ))}
          </div>
          {latestByAgent("incident").slice(0, 4).map((i) => (
            <AgentInsightCard key={i.id} insight={i} canAct={canApprove} onAcknowledge={acknowledgeInsight} onResolve={resolveInsight} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
