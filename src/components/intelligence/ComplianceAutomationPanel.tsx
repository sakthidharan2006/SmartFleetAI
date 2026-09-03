import { CalendarClock, Download, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ComplianceDoc,
  ComplianceReportRow,
  buildComplianceReport,
  downloadTextFile,
  summariseCompliance,
} from "@/lib/fleetIntelligence";

interface Props {
  documents: ComplianceDoc[];
  reports: ComplianceReportRow[];
  running: boolean;
  onRunAgent: () => void;
  onArchive: (title: string, summary: string, content: string, metrics: Record<string, unknown>) => void;
}

export function ComplianceAutomationPanel({ documents, reports, running, onRunAgent, onArchive }: Props) {
  const summary = summariseCompliance(documents);
  const markdown = buildComplianceReport(summary, documents);

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="section-title">Compliance score</h3>
            <p className="text-xs text-muted-foreground">
              {summary.total} documents tracked · {summary.expired} expired · {summary.expiring30} expiring in 30 days
            </p>
          </div>
          <span className="text-2xl font-display font-semibold text-foreground">{summary.complianceScore}%</span>
        </div>
        <Progress value={summary.complianceScore} className="h-1.5" />
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" disabled={running} onClick={onRunAgent}>
            <Sparkles className="w-4 h-4 mr-2" />
            {running ? "Compliance agent working…" : "Generate AI compliance report"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => downloadTextFile(`compliance-report-${new Date().toISOString().slice(0, 10)}.md`, markdown)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download register
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onArchive(
                `Fleet Compliance Report — ${new Date().toLocaleDateString("en-IN")}`,
                `Compliance score ${summary.complianceScore}% · ${summary.expired} expired · ${summary.expiring30} expiring soon`,
                markdown,
                { complianceScore: summary.complianceScore, expired: summary.expired, expiring30: summary.expiring30 },
              )
            }
          >
            <FileText className="w-4 h-4 mr-2" />
            Archive report
          </Button>
        </div>
      </div>

      <div className="glass-card p-4 space-y-2">
        <h3 className="section-title flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-primary" /> Expiry watchlist
        </h3>
        {summary.criticalDocs.length === 0 && (
          <p className="text-xs text-muted-foreground">All documents valid beyond 30 days.</p>
        )}
        {summary.criticalDocs.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {d.vehicle_name} — {d.document_type}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {new Date(d.expiry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0",
                d.daysLeft < 0
                  ? "text-destructive border-destructive/40 bg-destructive/10"
                  : "text-warning border-warning/40 bg-warning/10",
              )}
            >
              {d.daysLeft < 0 ? `Expired ${Math.abs(d.daysLeft)}d` : `${d.daysLeft}d left`}
            </Badge>
          </div>
        ))}
      </div>

      {reports.length > 0 && (
        <div className="glass-card p-4 space-y-2">
          <h3 className="section-title">Generated reports</h3>
          {reports.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground truncate">{r.summary}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => downloadTextFile(`${r.title.replace(/[^\w-]+/g, "-")}.md`, r.content)}
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
