/**
 * Unified Fleet Intelligence — deterministic decision layer.
 *
 * This module turns the already-connected fleet data (telemetry, GPS, trips,
 * documents, incidents) into scored, explainable signals. The multi-agent AI
 * layer (supabase/functions/fleet-ai-agents) enriches these signals with
 * natural-language reasoning, but every panel stays useful without an AI call.
 */

export type AgentId = "maintenance" | "routing" | "compliance" | "incident" | "unified";
export type Severity = "info" | "warning" | "critical";

export interface FleetAiInsight {
  id: string;
  agent: AgentId;
  vehicle_id: string | null;
  vehicle_name: string | null;
  severity: Severity;
  risk_score: number;
  title: string;
  summary: string;
  recommendations: string[];
  payload: Record<string, unknown>;
  status: "open" | "acknowledged" | "resolved";
  created_at: string;
}

export interface ComplianceReportRow {
  id: string;
  title: string;
  report_type: string;
  period_start: string | null;
  period_end: string | null;
  summary: string;
  content: string;
  metrics: Record<string, unknown>;
  created_at: string;
}

/** Telemetry snapshot shape shared with the agents (subset of VehicleCard). */
export interface TelemetrySnapshot {
  id: string;
  name: string;
  plate: string;
  status: string;
  location: string;
  speed: number;
  fuel: number;
  engineTemp: number;
  mileage: number;
  alerts: number;
  tirePressure: { fl: number; fr: number; rl: number; rr: number };
  adBlueLevel?: number;
}

export interface ComponentRisk {
  component: string;
  score: number; // 0-100
  detail: string;
}

export interface MaintenancePrediction {
  vehicleId: string;
  vehicleName: string;
  plate: string;
  riskScore: number; // 0-100
  riskLevel: "low" | "moderate" | "high" | "critical";
  predictedFailure: string;
  etaDays: number;
  components: ComponentRisk[];
  recommendations: string[];
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export function riskLevel(score: number): MaintenancePrediction["riskLevel"] {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 28) return "moderate";
  return "low";
}

export const severityForScore = (score: number): Severity =>
  score >= 75 ? "critical" : score >= 50 ? "warning" : "info";

/** Predictive maintenance model — weighted sensor degradation scoring. */
export function predictMaintenance(v: TelemetrySnapshot): MaintenancePrediction {
  const tires = [v.tirePressure.fl, v.tirePressure.fr, v.tirePressure.rl, v.tirePressure.rr];
  const avgTire = tires.reduce((a, b) => a + b, 0) / 4;
  const tireSpread = Math.max(...tires) - Math.min(...tires);

  const components: ComponentRisk[] = [
    {
      component: "Cooling system / engine",
      score: clamp(((v.engineTemp - 180) / 45) * 100),
      detail: `Coolant-side temperature holding at ${Math.round(v.engineTemp)}°F`,
    },
    {
      component: "Tyres & axle load",
      score: clamp(((105 - avgTire) / 25) * 100 + tireSpread * 2.5),
      detail: `Avg ${avgTire.toFixed(0)} psi, imbalance ${tireSpread.toFixed(0)} psi across axles`,
    },
    {
      component: "Fuel / injection system",
      score: clamp(((30 - v.fuel) / 30) * 90),
      detail: `Tank at ${Math.round(v.fuel)}% — low-level running strains the lift pump`,
    },
    {
      component: "Emissions (BS6 / AdBlue)",
      score: clamp(((40 - (v.adBlueLevel ?? 70)) / 40) * 100),
      detail: `AdBlue reserve ${Math.round(v.adBlueLevel ?? 70)}%`,
    },
    {
      component: "Drivetrain wear (odometer)",
      score: clamp(((v.mileage % 60000) / 60000) * 60),
      detail: `${v.mileage.toLocaleString("en-IN")} km since manufacture`,
    },
  ].sort((a, b) => b.score - a.score);

  const weighted =
    components[0].score * 0.45 +
    components[1].score * 0.25 +
    components[2].score * 0.15 +
    components[3].score * 0.1 +
    components[4].score * 0.05;

  const score = Math.round(clamp(weighted + (v.alerts > 0 ? v.alerts * 4 : 0)));
  const top = components[0];

  const recommendations: string[] = [];
  if (components.find((c) => c.component.startsWith("Cooling") && c.score > 45))
    recommendations.push("Pressure-test radiator and replace coolant; inspect thermostat and fan clutch.");
  if (components.find((c) => c.component.startsWith("Tyres") && c.score > 40))
    recommendations.push("Re-inflate to 105 psi, rotate tyres and check wheel alignment for uneven wear.");
  if (v.fuel < 25) recommendations.push("Refuel before the next leg — avoid running the tank below 25%.");
  if ((v.adBlueLevel ?? 70) < 30) recommendations.push("Top up AdBlue to protect the SCR catalyst and stay BS6 compliant.");
  if (!recommendations.length) recommendations.push("No intervention required — continue standard 10,000 km service cycle.");

  return {
    vehicleId: v.id,
    vehicleName: v.name,
    plate: v.plate,
    riskScore: score,
    riskLevel: riskLevel(score),
    predictedFailure: score >= 28 ? top.component : "No imminent failure predicted",
    etaDays: score >= 75 ? 2 : score >= 50 ? 7 : score >= 28 ? 21 : 60,
    components,
    recommendations,
  };
}

export interface DispatchCandidate {
  vehicleId: string;
  vehicleName: string;
  plate: string;
  score: number; // higher = better fit
  reasons: string[];
  blockers: string[];
}

export interface DispatchJob {
  origin: string;
  destination: string;
  distanceKm: number;
  cargo?: string;
}

/** Intelligent dispatch scoring — readiness, health risk and telemetry fit. */
export function scoreDispatch(
  vehicles: TelemetrySnapshot[],
  job: DispatchJob,
): DispatchCandidate[] {
  return vehicles
    .map((v) => {
      const health = predictMaintenance(v);
      const reasons: string[] = [];
      const blockers: string[] = [];
      let score = 100;

      if (v.status === "active") { score -= 22; reasons.push("Currently on an active trip — can be chained after handover"); }
      if (v.status === "idle") { score += 12; reasons.push("Idle and immediately dispatchable"); }
      if (v.status === "maintenance") { score -= 70; blockers.push("In maintenance bay"); }
      if (v.status === "offline") { score -= 55; blockers.push("Telemetry offline — position unverified"); }

      score -= health.riskScore * 0.45;
      if (health.riskScore >= 50) blockers.push(`High failure risk: ${health.predictedFailure}`);
      else reasons.push(`Health risk low (${health.riskScore}/100)`);

      const rangeKm = Math.round((v.fuel / 100) * 250 * 4.2);
      if (rangeKm < job.distanceKm) blockers.push(`Range ${rangeKm} km short of ${job.distanceKm} km leg`);
      else reasons.push(`Fuel range ~${rangeKm} km covers the ${job.distanceKm} km leg`);

      reasons.push(`Positioned at ${v.location}`);

      return {
        vehicleId: v.id,
        vehicleName: v.name,
        plate: v.plate,
        score: Math.round(clamp(score, 0, 130)),
        reasons,
        blockers,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export interface ComplianceDoc {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  document_type: string;
  expiry_date: string;
  status: string;
  renewal_cost?: number | null;
}

export interface ComplianceSummary {
  total: number;
  expired: number;
  expiring30: number;
  valid: number;
  complianceScore: number;
  criticalDocs: (ComplianceDoc & { daysLeft: number })[];
}

export function daysUntil(dateStr: string): number {
  const d = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(d / 86_400_000);
}

export function summariseCompliance(docs: ComplianceDoc[]): ComplianceSummary {
  const withDays = docs.map((d) => ({ ...d, daysLeft: daysUntil(d.expiry_date) }));
  const expired = withDays.filter((d) => d.daysLeft < 0);
  const expiring30 = withDays.filter((d) => d.daysLeft >= 0 && d.daysLeft <= 30);
  const valid = withDays.filter((d) => d.daysLeft > 30);
  const score = docs.length
    ? Math.round(((valid.length + expiring30.length * 0.6) / docs.length) * 100)
    : 100;

  return {
    total: docs.length,
    expired: expired.length,
    expiring30: expiring30.length,
    valid: valid.length,
    complianceScore: score,
    criticalDocs: [...expired, ...expiring30].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 12),
  };
}

/** Markdown compliance report — the offline half of compliance automation. */
export function buildComplianceReport(
  summary: ComplianceSummary,
  docs: ComplianceDoc[],
  fleetName = "SmartFleetAI",
): string {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const rows = docs
    .map((d) => {
      const left = daysUntil(d.expiry_date);
      const state = left < 0 ? `EXPIRED ${Math.abs(left)}d ago` : `${left}d left`;
      return `| ${d.vehicle_name} | ${d.document_type} | ${new Date(d.expiry_date).toLocaleDateString("en-IN")} | ${state} |`;
    })
    .join("\n");

  return `# ${fleetName} — Fleet Compliance Report
Generated: ${today}

## Summary
- Compliance score: **${summary.complianceScore}%**
- Documents tracked: ${summary.total}
- Expired: ${summary.expired}
- Expiring within 30 days: ${summary.expiring30}
- Valid: ${summary.valid}

## Document register
| Vehicle | Document | Expiry | Status |
| --- | --- | --- | --- |
${rows || "| — | — | — | — |"}

## Required actions
${
  summary.criticalDocs.length
    ? summary.criticalDocs
        .map((d) => `- ${d.vehicle_name} — renew ${d.document_type} (${d.daysLeft < 0 ? "overdue" : `${d.daysLeft} days left`})`)
        .join("\n")
    : "- No action required. All documents valid beyond 30 days."
}
`;
}

export function downloadTextFile(filename: string, content: string, mime = "text/markdown") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
