import { useEffect, useMemo, useState } from "react";
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

export default function DemoTimerBanner({ enabled }: { enabled: boolean }) {
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const show = enabled;
  const pollMs = 5000;

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

  const waitingForFirst =
    status?.enabled &&
    status?.phase === 0 &&
    (status?.nextPhaseAtMs === null || typeof status?.nextPhaseAtMs === "undefined");

  return (
    <div className="card-premium p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-900">Public Demo</div>
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

      {status?.enabled === false && status?.reasonDisabled && (
        <div className="mt-2 text-xs text-amber-800">
          Autophasing disabled: <span className="font-mono">{status.reasonDisabled}</span>
        </div>
      )}
    </div>
  );
}

