import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AgentId,
  ComplianceDoc,
  ComplianceReportRow,
  DispatchJob,
  FleetAiInsight,
  TelemetrySnapshot,
} from "@/lib/fleetIntelligence";

/**
 * Fleet Intelligence data layer — reads persisted agent insights + compliance
 * reports and triggers the multi-agent edge function.
 */
export function useFleetIntelligence() {
  const [insights, setInsights] = useState<FleetAiInsight[]>([]);
  const [reports, setReports] = useState<ComplianceReportRow[]>([]);
  const [documents, setDocuments] = useState<ComplianceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState<AgentId | null>(null);

  const load = useCallback(async () => {
    const [ins, rep, docs] = await Promise.all([
      supabase.from("fleet_ai_insights").select("*").order("created_at", { ascending: false }).limit(60),
      supabase.from("compliance_reports").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("vehicle_documents").select("*").order("expiry_date", { ascending: true }),
    ]);
    if (ins.data) setInsights(ins.data as unknown as FleetAiInsight[]);
    if (rep.data) setReports(rep.data as unknown as ComplianceReportRow[]);
    if (docs.data) setDocuments(docs.data as unknown as ComplianceDoc[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("fleet-ai-insights")
      .on("postgres_changes", { event: "*", schema: "public", table: "fleet_ai_insights" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const runAgent = useCallback(
    async (
      agent: AgentId,
      opts: {
        telemetry: TelemetrySnapshot[];
        job?: DispatchJob | null;
        signals?: unknown;
        peerFindings?: unknown;
        persistReport?: boolean;
      },
    ) => {
      setRunningAgent(agent);
      try {
        const { data, error } = await supabase.functions.invoke("fleet-ai-agents", {
          body: {
            agent,
            telemetry: opts.telemetry,
            job: opts.job ?? null,
            signals: opts.signals ?? null,
            peerFindings: opts.peerFindings ?? null,
            persistReport: opts.persistReport ?? false,
          },
        });
        if (error) throw error;
        if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
        toast.success(`${agent} agent finished`, { description: (data as { result?: { headline?: string } })?.result?.headline });
        await load();
        return data;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Agent run failed";
        toast.error("AI agent unavailable", { description: message });
        return null;
      } finally {
        setRunningAgent(null);
      }
    },
    [load],
  );

  const acknowledgeInsight = useCallback(async (id: string) => {
    const { error } = await supabase.from("fleet_ai_insights").update({ status: "acknowledged" }).eq("id", id);
    if (error) return toast.error("Could not acknowledge", { description: error.message });
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, status: "acknowledged" } : i)));
  }, []);

  const resolveInsight = useCallback(async (id: string) => {
    const { error } = await supabase.from("fleet_ai_insights").update({ status: "resolved" }).eq("id", id);
    if (error) return toast.error("Could not resolve", { description: error.message });
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, status: "resolved" } : i)));
  }, []);

  const saveReport = useCallback(
    async (title: string, summary: string, content: string, metrics: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("compliance_reports").insert({
        title,
        report_type: "fleet_compliance",
        summary,
        content,
        metrics: metrics as never,
        generated_by: user?.id ?? null,
      });
      if (error) return toast.error("Could not save report", { description: error.message });
      toast.success("Compliance report archived");
      load();
    },
    [load],
  );

  return {
    insights,
    reports,
    documents,
    loading,
    runningAgent,
    runAgent,
    acknowledgeInsight,
    resolveInsight,
    saveReport,
    reload: load,
  };
}
