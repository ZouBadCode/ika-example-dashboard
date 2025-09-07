import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CodeBlock } from "@/components/ui/code-block";
import ReactJson from "react-json-view";
import { ensureIkaInitialized } from "@/lib/ika";
import { toPrintableJSON } from "@/utils/printableJson";

/**
 * Watch a dWallet become `Active` with a configurable timeout and interval.
 *
 * Key fixes for reliable polling:
 * - Force manual polling loop (do NOT rely on SDK helper internally)
 * - Per-iteration try/catch so transient errors don't break the loop
 * - AbortController for cancel
 * - Live elapsed time, attempt counter, last observed state
 */
export default function DWalletActiveWatcher() {
  const [dWalletID, setDWalletID] = useState("");
  const [timeoutMs, setTimeoutMs] = useState<number>(60000);
  const [intervalMs, setIntervalMs] = useState<number>(2000);

  const [status, setStatus] = useState<
    "idle" | "polling" | "success" | "timeout" | "error" | "cancelled"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [pretty, setPretty] = useState<string>("");
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [lastState, setLastState] = useState<string>("-");

  const controllerRef = useRef<AbortController | null>(null);
  const tickerRef = useRef<number | null>(null);

  const progress = useMemo(() => {
    if (timeoutMs <= 0) return 0;
    const pct = Math.min(100, (elapsedMs / timeoutMs) * 100);
    return Number.isFinite(pct) ? pct : 0;
  }, [elapsedMs, timeoutMs]);

  useEffect(() => {
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
      if (tickerRef.current) window.clearInterval(tickerRef.current);
    };
  }, []);

  async function startWatching() {
    setStatus("polling");
    setErrorMsg(null);
    setResult(null);
    setPretty("");
    setElapsedMs(0);
    setAttempts(0);
    setLastState("-");

    const controller = new AbortController();
    controllerRef.current = controller;

    // start elapsed timer
    tickerRef.current = window.setInterval(() => {
      setElapsedMs((ms) => ms + 100);
    }, 100);

    try {
      const ika = await ensureIkaInitialized();

      const dWallet = await pollUntilActiveFallback({
        ika,
        dWalletID,
        timeoutMs,
        intervalMs,
        signal: controller.signal,
        onAttempt: ({ state }) => {
          setAttempts((n) => n + 1);
          setLastState(state ?? "-");
        },
      });
      console.log("dWallet is Active:", dWallet);
      setResult(dWallet);
      setPretty(toPrintableJSON(dWallet));
      setStatus("success");
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setStatus("cancelled");
      } else if (String(err?.message || err).toLowerCase().includes("timeout")) {
        setStatus("timeout");
        setErrorMsg(err?.message ?? "Timeout waiting for dWallet to become active");
      } else {
        setStatus("error");
        setErrorMsg(err?.message ?? String(err));
      }
    } finally {
      if (tickerRef.current) window.clearInterval(tickerRef.current);
      controllerRef.current = null;
    }
  }

  function cancelWatching() {
    if (controllerRef.current) controllerRef.current.abort();
  }

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Wait for dWallet to be Active</h2>
        <p className="text-sm text-muted-foreground">
          Manually polls the dWallet state until it becomes <code>Active</code>, or until timeout.
        </p>
        <CodeBlock
          small
          code={`// Core logic showcased\nconst dWallet = await ika.getDWallet(dWalletID);\n// Repeated until dWallet.state.$kind === 'Active'`}
        />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="dwallet-id">dWallet ID</Label>
          <Input
            id="dwallet-id"
            placeholder="0x..."
            value={dWalletID}
            onChange={(e) => setDWalletID(e.target.value.trim())}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeout">Timeout (ms)</Label>
          <Input
            id="timeout"
            type="number"
            min={0}
            value={timeoutMs}
            onChange={(e) => setTimeoutMs(Number(e.target.value || 0))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interval">Interval (ms)</Label>
          <Input
            id="interval"
            type="number"
            min={100}
            step={100}
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value || 0))}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={startWatching}
          disabled={!dWalletID || status === "polling"}
        >
          {status === "polling" ? "Watching..." : "Start Watching"}
        </Button>

        <Button variant="secondary" onClick={cancelWatching} disabled={status !== "polling"}>
          Cancel
        </Button>

        <StatusBadge status={status} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Elapsed: {formatMs(elapsedMs)}</span>
          <span>Timeout: {formatMs(timeoutMs)}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-xs text-muted-foreground flex items-center gap-3">
          <span>Attempts: {attempts}</span>
          <span>Last state: <code>{lastState}</code></span>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {pretty && (
        <div className="rounded-xl border p-4 bg-muted/40">
          <div className="mb-2 text-sm text-muted-foreground">dWallet (Active) Result</div>
          <div className="overflow-auto text-sm leading-6">
            {result && (
              <ReactJson
                src={result}
                theme="monokai"
                collapsed={1}
                enableClipboard
                displayDataTypes={false}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status: "idle" | "polling" | "success" | "timeout" | "error" | "cancelled";
}) {
  const map: Record<typeof status, { label: string; variant?: "default" | "secondary" | "destructive" | "outline" }> = {
    idle: { label: "Idle", variant: "outline" },
    polling: { label: "Polling...", variant: "secondary" },
    success: { label: "Active", variant: "default" },
    timeout: { label: "Timeout", variant: "destructive" },
    error: { label: "Error", variant: "destructive" },
    cancelled: { label: "Cancelled", variant: "outline" },
  } as const;

  const cfg = map[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

/**
 * Fallback manual polling with robust error handling.
 */
async function pollUntilActiveFallback(params: {
  ika: any;
  dWalletID: string;
  timeoutMs: number;
  intervalMs: number;
  signal?: AbortSignal;
  onAttempt?: (info: { attempt: number; state?: string }) => void;
}): Promise<any> {
  const { ika, dWalletID, timeoutMs, intervalMs, signal, onAttempt } = params;
  const until = Date.now() + timeoutMs;
  let attempt = 0;

  const throwIfAborted = () => {
    if (signal?.aborted) {
      const e = new Error("Aborted");
      (e as any).name = "AbortError";
      throw e;
    }
  };

  while (true) {
    throwIfAborted();
    attempt += 1;

    try {
      const dWallet = await ika.getDWallet(dWalletID);
      const kind = (dWallet?.state?.$kind ?? dWallet?.state ?? "").toString();
      onAttempt?.({ attempt, state: kind });
      if (kind === "Active") return dWallet;
    } catch (err: any) {
      // Swallow transient errors and keep polling until timeout
      const msg = String(err?.message || err).toLowerCase();
      const retriable =
        msg.includes("not found") ||
        msg.includes("objectnotfound") ||
        msg.includes("network") ||
        msg.includes("fetch") ||
        msg.includes("temporarily");
      if (!retriable) {
        throw err; // non-retriable -> surface error
      }
      onAttempt?.({ attempt, state: undefined });
    }

    throwIfAborted();

    if (Date.now() >= until) {
      const e = new Error("Timeout waiting for dWallet to become active");
      (e as any).name = "TimeoutError";
      throw e;
    }

    await sleep(intervalMs, signal);
  }
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const id = setTimeout(() => resolve(), ms);
    const onAbort = () => {
      clearTimeout(id);
      const e = new Error("Aborted");
      (e as any).name = "AbortError";
      reject(e);
    };
    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return "-";
  if (ms < 1000) return `${ms} ms`;
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}
