import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import ReactJson from "react-json-view";
import { ensureIkaInitialized } from "@/lib/ika";

type ResultItem =
  | { id: string; ok: true; data: any }
  | { id: string; ok: false; error: string };

const DEFAULT_CHUNK_SIZE = 50;

function parseIds(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\s,]+/g)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    )
  );
}

function looksLikeSuiObjectId(id: string): boolean {
  // simple heuristic: hex-ish, starts with 0x, length >= 4
  return /^0x[0-9a-fA-F]+$/.test(id) && id.length >= 4;
}

async function fetchWithFallback(
  ids: string[],
  chunkSize = DEFAULT_CHUNK_SIZE
): Promise<ResultItem[]> {
  const ika = await ensureIkaInitialized();

  // Prefer batch API if present
  const hasBatch =
    ika && typeof (ika as any).getMultipleDWallets === "function";

  if (hasBatch) {
    // Some SDKs may throw for missing IDs; handle defensively
    const results: ResultItem[] = [];
    // Chunk to avoid large payloads/timeouts
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      try {
        const arr: any[] = await (ika as any).getMultipleDWallets(chunk);
        // Assume SDK preserves order. Fallback to mapping by id if it returns keyed form.
        if (Array.isArray(arr)) {
          for (let j = 0; j < chunk.length; j++) {
            const id = chunk[j];
            const val = arr[j];
            if (val) {
              results.push({ id, ok: true, data: val });
            } else {
              results.push({ id, ok: false, error: "Not found or empty result" });
            }
          }
        } else if (arr && typeof arr === "object") {
          for (const id of chunk) {
            const val = (arr as any)[id];
            if (val) {
              results.push({ id, ok: true, data: val });
            } else {
              results.push({ id, ok: false, error: "Not found" });
            }
          }
        } else {
          for (const id of chunk) {
            results.push({ id, ok: false, error: "Unexpected SDK response shape" });
          }
        }
      } catch (e: any) {
        // If the whole chunk failed, degrade to per-ID calls for this chunk
        const perId = await Promise.allSettled(
          chunk.map((id) => ika.getDWallet(id))
        );
        perId.forEach((p, idx) => {
          const id = chunk[idx];
          if (p.status === "fulfilled") {
            results.push({ id, ok: true, data: p.value });
          } else {
            results.push({
              id,
              ok: false,
              error: p.reason?.message ?? String(p.reason),
            });
          }
        });
      }
    }
    return results;
  } else {
    // Fallback: per-ID parallel with allSettled (chunked)
    const results: ResultItem[] = [];
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const settled = await Promise.allSettled(
        chunk.map((id) => ika.getDWallet(id))
      );
      settled.forEach((p, idx) => {
        const id = chunk[idx];
        if (p.status === "fulfilled") {
          results.push({ id, ok: true, data: p.value });
        } else {
          results.push({
            id,
            ok: false,
            error: p.reason?.message ?? String(p.reason),
          });
        }
      });
    }
    return results;
  }
}

export default function DWalletBatchQueryer() {
  const [input, setInput] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chunkSize, setChunkSize] = useState<number>(DEFAULT_CHUNK_SIZE);

  const parsed = useMemo(() => parseIds(input), [input]);
  const invalids = useMemo(
    () => parsed.filter((id) => !looksLikeSuiObjectId(id)),
    [parsed]
  );

  const handlePrepare = () => {
    setIds(parsed);
    setResults(null);
    setError(null);
  };

  const handleClear = () => {
    setInput("");
    setIds([]);
    setResults(null);
    setError(null);
  };

  const downloadingRef = useRef(false);

  const handleFetch = async () => {
    if (downloadingRef.current) return;
    downloadingRef.current = true;
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const res = await fetchWithFallback(ids, chunkSize);
      setResults(res);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
      downloadingRef.current = false;
    }
  };

  const summary = useMemo(() => {
    if (!results) return null;
    const ok = results.filter((r) => r.ok).length;
    const fail = results.length - ok;
    return { ok, fail, total: results.length };
  }, [results]);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">DWallet Batch Queryer</h2>

      {/* Input block */}
      <div className="grid gap-3">
        <label className="text-sm text-muted-foreground">
          Paste dWallet IDs (comma or newline separated)
        </label>
        <textarea
          className="min-h-28 w-full rounded-md border p-3 text-sm"
          placeholder="0x..., 0x..., 0x...\nor one per line"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              setInput((s) =>
                (s ? s + "\n" : "") +
                ["0x123...", "0x456...", "0x789..."].join("\n")
              )
            }
          >
            Insert sample
          </Button>
          <Button onClick={handlePrepare} disabled={parsed.length === 0}>
            Prepare {parsed.length > 0 ? `(${parsed.length})` : ""}
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Chunk size</span>
            <Input
              type="number"
              className="w-24"
              min={1}
              value={chunkSize}
              onChange={(e) => setChunkSize(Math.max(1, Number(e.target.value)))}
            />
          </div>
        </div>

        {invalids.length > 0 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
            <strong>Warning:</strong> {invalids.length} ID(s) look invalid (not hex
            0x...). They will still be submitted but may fail.
          </div>
        )}
      </div>

      {/* Prepared list */}
      {ids.length > 0 && (
        <div className="rounded-xl border p-4 bg-muted/40">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Prepared IDs: {ids.length}
            </div>
            <Button onClick={handleFetch} disabled={loading}>
              {loading ? "Querying..." : "Fetch dWallets"}
            </Button>
          </div>
          <div className="max-h-40 overflow-auto text-xs">
            <ul className="list-disc pl-5">
              {ids.slice(0, 100).map((id) => (
                <li key={id} className={!looksLikeSuiObjectId(id) ? "text-red-600" : ""}>
                  {id}
                </li>
              ))}
              {ids.length > 100 && <li>…and {ids.length - 100} more</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-3">
          {summary && (
            <div className="rounded-md border p-3 text-sm">
              <span className="mr-3">Total: {summary.total}</span>
              <span className="mr-3">Success: {summary.ok}</span>
              <span className={summary.fail ? "text-red-600" : ""}>
                Failed: {summary.fail}
              </span>
            </div>
          )}

          <div className="grid gap-4">
            {results.map((r) => (
              <div key={r.id} className="rounded-xl border p-4 bg-muted/40">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-mono text-xs md:text-sm">{r.id}</div>
                  <div
                    className={`text-xs ${
                      r.ok ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {r.ok ? "OK" : "ERROR"}
                  </div>
                </div>

                {r.ok ? (
                  <div className="overflow-auto text-sm leading-6">
                    <ReactJson
                      src={r.data}
                      theme="monokai"
                      collapsed={1}
                      enableClipboard={true}
                      displayDataTypes={false}
                    />
                    {/* Example derived line similar to your console log */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {(() => {
                        try {
                          const kind =
                            r.data?.state?.$kind ?? "(unknown-state-kind)";
                          const typ = r.data?.kind ?? "(unknown-kind)";
                          return `state.$kind=${kind} kind=${typ}`;
                        } catch {
                          return "";
                        }
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">
                    <span className="font-medium">Reason:</span> {r.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
