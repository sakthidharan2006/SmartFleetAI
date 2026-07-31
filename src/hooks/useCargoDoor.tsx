import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { CargoDoor, DoorEvent, UnlockRequest } from "@/lib/cargoDoor";

interface FleetVehicleRow {
  id: string;
  name: string;
  plate: string;
  driver_id: string | null;
}

async function callDoorService(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("cargo-door-command", { body });
  if (error) {
    let details = error.message;
    try {
      const ctx = (error as unknown as { context?: Response }).context;
      if (ctx) {
        const text = await ctx.text();
        const parsed = JSON.parse(text);
        details = parsed.error ?? text;
      }
    } catch {
      /* keep original message */
    }
    throw new Error(details);
  }
  return data as Record<string, unknown>;
}

export function useCargoDoor() {
  const { user, role, profile } = useAuth();
  const isOwner = role === "owner" || role === "admin";

  const [vehicles, setVehicles] = useState<FleetVehicleRow[]>([]);
  const [doors, setDoors] = useState<CargoDoor[]>([]);
  const [requests, setRequests] = useState<UnlockRequest[]>([]);
  const [events, setEvents] = useState<DoorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const seenCritical = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    const [v, d, r, e] = await Promise.all([
      supabase.from("vehicles").select("id,name,plate,driver_id").order("name"),
      supabase.from("cargo_doors").select("*"),
      supabase.from("door_unlock_requests").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("door_security_events").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setVehicles((v.data ?? []) as FleetVehicleRow[]);
    setDoors((d.data ?? []) as unknown as CargoDoor[]);
    setRequests((r.data ?? []) as unknown as UnlockRequest[]);
    setEvents((e.data ?? []) as unknown as DoorEvent[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

  // Realtime: doors, requests and the security event timeline
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("cargo-door-security")
      .on("postgres_changes", { event: "*", schema: "public", table: "cargo_doors" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "door_unlock_requests" }, (payload) => {
        load();
        const row = payload.new as Partial<UnlockRequest> | null;
        if (!row) return;
        if (payload.eventType === "INSERT" && isOwner) {
          toast.warning("Cargo door unlock approval needed", { description: row.reason ?? "" });
        }
        if (payload.eventType === "UPDATE" && row.driver_id === user.id) {
          if (row.status === "approved") toast.success("Unlock approved — door open for 60s");
          if (row.status === "rejected") toast.error("Unlock request rejected");
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "door_security_events" }, (payload) => {
        const row = payload.new as unknown as DoorEvent;
        setEvents((prev) => [row, ...prev].slice(0, 200));
        if (row.severity === "critical" && !seenCritical.current.has(row.id)) {
          seenCritical.current.add(row.id);
          toast.error(row.message, { duration: 10000 });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isOwner, load]);

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((v) => [v.id, v])) as Record<string, FleetVehicleRow>,
    [vehicles],
  );
  const doorByVehicle = useMemo(
    () => Object.fromEntries(doors.map((d) => [d.vehicle_id, d])) as Record<string, CargoDoor>,
    [doors],
  );
  const pendingRequests = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);
  const myVehicle = useMemo(
    () => vehicles.find((v) => v.driver_id === user?.id) ?? null,
    [vehicles, user],
  );

  const requestUnlock = useCallback(
    async (input: {
      vehicle_id: string;
      reason: string;
      cargo_description?: string;
      location_name?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      setBusy(true);
      try {
        await callDoorService({ action: "request_unlock", ...input });
        toast.success("Approval request sent to fleet owner");
        await load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Request failed");
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  const decide = useCallback(
    async (requestId: string, decision: "approved" | "rejected", note?: string) => {
      setBusy(true);
      try {
        await callDoorService({ action: "decide", request_id: requestId, decision, note });
        toast.success(decision === "approved" ? "Unlock command sent to smart lock" : "Request rejected");
        await load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Decision failed");
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  const forceLock = useCallback(
    async (vehicleId: string) => {
      setBusy(true);
      try {
        await callDoorService({ action: "force_lock", vehicle_id: vehicleId });
        toast.success("Remote lock command published");
        await load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lock command failed");
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  const emitDeviceEvent = useCallback(
    async (input: Record<string, unknown>) => {
      try {
        await callDoorService({ action: "device_event", ...input });
      } catch (err) {
        console.error("[cargo-door] device event failed", err);
      }
    },
    [],
  );

  return {
    loading,
    busy,
    isOwner,
    userId: user?.id ?? null,
    userName: profile?.full_name ?? user?.email ?? "User",
    vehicles,
    vehicleById,
    doors,
    doorByVehicle,
    requests,
    pendingRequests,
    events,
    myVehicle,
    requestUnlock,
    decide,
    forceLock,
    emitDeviceEvent,
    refresh: load,
  };
}

export type CargoDoorApi = ReturnType<typeof useCargoDoor>;
