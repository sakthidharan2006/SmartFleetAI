// Multi-Agent Fleet Intelligence service.
//
// Agents: maintenance | routing | compliance | incident | unified
// Each agent reads the already-connected fleet data (vehicles, trips, documents,
// load slips, door security events, alerts) plus the live telemetry snapshot sent
// by the dashboard, reasons over it with Lovable AI, and persists the result in
// public.fleet_ai_insights. The compliance agent can additionally persist a
// generated report into public.compliance_reports.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
const MODEL = 'google/gemini-3.7-flash'

type Json = Record<string, unknown>
const json = (body: Json, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const AGENTS = ['maintenance', 'routing', 'compliance', 'incident', 'unified'] as const
type Agent = (typeof AGENTS)[number]

const ROLE_PROMPT: Record<Agent, string> = {
  maintenance:
    'You are the Predictive Maintenance Agent of an Indian trucking fleet. Predict component failures from telemetry trends (engine temperature, tyre pressure spread, fuel, AdBlue, odometer). Be specific about the failing subsystem, a realistic time-to-failure window, and workshop actions. Use km, INR and BS6 terminology.',
  routing:
    'You are the Dispatch & Routing Agent of an Indian trucking fleet. Assign the best vehicle and driver to each pending job using GPS position, vehicle status, predicted health risk, fuel range and trip history. Recommend highway routes (NH numbers), realistic ETAs, toll-aware advice and rest stops.',
  compliance:
    'You are the Compliance Agent of an Indian trucking fleet. Track FC, RC, Insurance, Permit, PUC and Road Tax validity, flag expiring or expired documents, quantify penalty exposure in INR and produce audit-ready renewal plans.',
  incident:
    'You are the Fleet & Incident Intelligence Agent. Correlate cargo-door security events, theft/tamper signals, harsh-driving alerts, toll anomalies and load history to surface incident patterns, root causes and prevention measures.',
  unified:
    'You are the Chief Fleet Intelligence Agent. You receive the findings of the maintenance, dispatch, compliance and incident agents plus raw fleet data, and produce one prioritised operating brief for the fleet owner: what matters today, in what order, and why.',
}

const SCHEMA_HINT = `Return ONLY JSON of shape:
{
  "headline": string,
  "summary": string,
  "risk_score": number,          // 0-100 overall urgency
  "severity": "info"|"warning"|"critical",
  "recommendations": string[],   // 3-6 concrete actions
  "items": [                     // per-vehicle / per-job findings, may be empty
    { "vehicle_name": string, "vehicle_id": string, "title": string,
      "detail": string, "risk_score": number, "severity": "info"|"warning"|"critical",
      "actions": string[] }
  ]
}`

async function callAi(system: string, user: string) {
  if (!LOVABLE_API_KEY) {
    return { error: 'AI is not configured for this project (missing LOVABLE_API_KEY).', status: 500 }
  }
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${system}\n\n${SCHEMA_HINT}` },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[fleet-ai-agents] gateway error', res.status, text)
    let message = text
    try {
      message = JSON.parse(text)?.error?.message ?? JSON.parse(text)?.message ?? text
    } catch { /* keep raw */ }
    if (res.status === 402) message = 'AI credits exhausted for this workspace. Add credits to keep the agents running.'
    if (res.status === 429) message = 'AI rate limit reached. Try again in a moment.'
    if (res.status === 403) message = 'AI access is blocked for this workspace.'
    return { error: message, status: res.status }
  }

  const data = await res.json()
  const raw = data?.choices?.[0]?.message?.content ?? '{}'
  try {
    return { result: JSON.parse(raw) }
  } catch {
    const match = String(raw).match(/\{[\s\S]*\}/)
    if (match) {
      try { return { result: JSON.parse(match[0]) } } catch { /* fall through */ }
    }
    return { result: { headline: 'Agent brief', summary: String(raw).slice(0, 4000), risk_score: 0, severity: 'info', recommendations: [], items: [] } }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const body = await req.json().catch(() => ({}))
    const agent = body?.agent as Agent
    if (!AGENTS.includes(agent)) return json({ error: `agent must be one of ${AGENTS.join(', ')}` }, 400)

    const telemetry = Array.isArray(body?.telemetry) ? body.telemetry.slice(0, 25) : []
    const job = body?.job ?? null
    const localSignals = body?.signals ?? null
    const persistReport = Boolean(body?.persistReport)

    // ---- Connected fleet data (single decision layer) -------------------
    const [docs, trips, slips, doorEvents, alerts, tollTx] = await Promise.all([
      admin.from('vehicle_documents').select('vehicle_name, document_type, expiry_date, status, renewal_cost').order('expiry_date').limit(60),
      admin.from('trips').select('origin, destination, status, distance_miles, start_time').order('created_at', { ascending: false }).limit(25),
      admin.from('load_slips').select('vehicle_name, origin, destination, load_description, weight_kg, status, created_at').order('created_at', { ascending: false }).limit(20),
      admin.from('door_security_events').select('event_type, severity, message, cargo_description, created_at').order('created_at', { ascending: false }).limit(25),
      admin.from('alerts').select('type, title, message, created_at').order('created_at', { ascending: false }).limit(25),
      admin.from('toll_transactions').select('vehicle_name, amount, status, created_at').order('created_at', { ascending: false }).limit(15),
    ])

    const context = {
      generated_at: new Date().toISOString(),
      live_telemetry: telemetry,
      documents: docs.data ?? [],
      trips: trips.data ?? [],
      load_slips: slips.data ?? [],
      door_security_events: doorEvents.data ?? [],
      alerts: alerts.data ?? [],
      toll_transactions: tollTx.data ?? [],
      dispatch_job: job,
      deterministic_signals: localSignals,
      peer_agent_findings: body?.peerFindings ?? null,
    }

    const { result, error, status } = await callAi(
      ROLE_PROMPT[agent],
      `Fleet data snapshot (JSON):\n${JSON.stringify(context).slice(0, 90_000)}\n\nProduce the ${agent} agent brief now.`,
    )
    if (error) return json({ error }, status ?? 500)

    const severity = ['info', 'warning', 'critical'].includes(result?.severity) ? result.severity : 'info'
    const riskScore = Math.max(0, Math.min(100, Number(result?.risk_score) || 0))
    const recommendations = Array.isArray(result?.recommendations) ? result.recommendations.slice(0, 8) : []
    const items = Array.isArray(result?.items) ? result.items.slice(0, 25) : []

    const { data: inserted, error: insErr } = await admin
      .from('fleet_ai_insights')
      .insert({
        agent,
        severity,
        risk_score: riskScore,
        title: String(result?.headline ?? `${agent} agent brief`).slice(0, 200),
        summary: String(result?.summary ?? '').slice(0, 4000),
        recommendations,
        payload: { items, job, model: MODEL },
        created_by: user.id,
      })
      .select()
      .single()
    if (insErr) console.error('[fleet-ai-agents] insert insight failed', insErr.message)

    let report: unknown = null
    if (agent === 'compliance' && persistReport) {
      const lines = [
        `# Automated Compliance Report`,
        `Generated: ${new Date().toLocaleString('en-IN')}`,
        ``,
        `## Agent summary`,
        String(result?.summary ?? ''),
        ``,
        `## Required actions`,
        ...recommendations.map((r: string) => `- ${r}`),
        ``,
        `## Document findings`,
        ...items.map((i: Json) => `- **${i.vehicle_name ?? 'Fleet'}** — ${i.title ?? ''}: ${i.detail ?? ''}`),
      ]
      const { data: rep, error: repErr } = await admin
        .from('compliance_reports')
        .insert({
          title: String(result?.headline ?? 'Fleet Compliance Report').slice(0, 200),
          report_type: 'ai_compliance',
          summary: String(result?.summary ?? '').slice(0, 2000),
          content: lines.join('\n'),
          metrics: { risk_score: riskScore, documents: (docs.data ?? []).length },
          generated_by: user.id,
        })
        .select()
        .single()
      if (repErr) console.error('[fleet-ai-agents] insert report failed', repErr.message)
      report = rep ?? null
    }

    return json({ agent, insight: inserted ?? null, result, report })
  } catch (e) {
    console.error('[fleet-ai-agents] unhandled', e)
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500)
  }
})
