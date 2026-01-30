import { useEffect, useMemo, useRef, useState } from "react";
import { BACKEND_URL } from "@/constants";

type DemoStatus = {
  enabled?: boolean;
  reasonDisabled?: string | null;
  demoElectionAddress?: string | null;
  adminOk?: boolean;
  roundId?: number;
  phase?: number | null;
  nowMs?: number;
  nextPhaseAtMs?: number | null;
  timeRemainingMs?: number | null;
  transitioning?: boolean;
  lastTransitionTx?: string | null;
  lastTransitionAtMs?: number | null;
  lastAttemptAtMs?: number | null;
  lastError?: string | null;
  lastErrorAtMs?: number | null;
};

function formatMs(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function phaseLabel(phase: number | null | undefined) {
  if (phase === 0) return "Commit open";
  if (phase === 1) return "Reveal open";
  if (phase === 2) return "Round finished";
  return "Demo status";
}

export default function DemoTimerBanner({
  enabled,
  variant = "card",
}: {
  enabled: boolean;
  variant?: "card" | "inline";
}) {
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastKickAtMsRef = useRef<number>(0);

  const show = enabled;
  const pollMs = 5000;

  const callTick = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/demo/tick`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  const callStatus = async () => {
    setError(null);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/demo/status`, { cache: "no-store" });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `HTTP ${resp.status}`);
      }
      const data = (await resp.json()) as DemoStatus;
      setStatus(data);

      // If the backend host sleeps or the scheduler loop isn't running continuously,
      // proactively trigger a tick when the timer reaches 0 to advance the on-chain phase.
      const canKick =
        data?.enabled &&
        !data?.transitioning &&
        typeof data?.timeRemainingMs === "number" &&
        data.timeRemainingMs <= 0;

      if (canKick) {
        const now = Date.now();
        // Avoid a thundering herd: only kick once every 20s per client.
        if (now - lastKickAtMsRef.current > 20000) {
          lastKickAtMsRef.current = now;
          await callTick();
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load demo status");
    }
  };

  useEffect(() => {
    if (!show) return;
    callStatus();
    const id = window.setInterval(callStatus, pollMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const title = useMemo(() => phaseLabel(status?.phase), [status?.phase]);

  if (!show) return null;

  const remaining =
    typeof status?.timeRemainingMs === "number" ? formatMs(status.timeRemainingMs) : null;

  const lastError =
    status?.lastError && status.lastError.length > 260 ? `${status.lastError.slice(0, 260)}…` : status?.lastError;

  const waitingForFirst =
    status?.enabled &&
    status?.phase === 0 &&
    (status?.nextPhaseAtMs === null || typeof status?.nextPhaseAtMs === "undefined");

  const containerClass =
    variant === "inline"
      ? "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
      : "card-premium p-4";

  return (
    <div className={containerClass}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Demo Status</div>
          <div className="text-sm text-slate-600 mt-1">{title}</div>
        </div>

        <div className="text-sm font-medium text-slate-900">
          {error
            ? "Demo timer unavailable"
            : waitingForFirst
              ? "Waiting for first participant…"
              : remaining
                ? `Next phase in ${remaining}`
                : "Loading…"}
        </div>
      </div>

      {error && <div className="mt-2 text-xs text-red-700">{error}</div>}

      {lastError && (
        <div className="mt-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2">
          Demo autophasing warning: <span className="font-mono">{lastError}</span>
        </div>
      )}

      {status?.enabled === false && status?.reasonDisabled && (
        <div className="mt-2 text-xs text-amber-800">
          Autophasing disabled: <span className="font-mono">{status.reasonDisabled}</span>
        </div>
      )}
    </div>
  );
}
