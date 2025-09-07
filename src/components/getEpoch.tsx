import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { ensureIkaInitialized } from "@/lib/ika";

export default function GetEpoch() {
  const [epoch, setEpoch] = useState<string | number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchEpoch() {
    setLoading(true); setErrorMsg(null); setEpoch(null);
    try {
      const ika = await ensureIkaInitialized();
      const e = await ika.getEpoch();
      setEpoch(e);
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    } finally { setLoading(false);}  
  }

  return (<section className="space-y-4">
    <h2 className="text-lg font-semibold">Current Epoch</h2>
    <CodeBlock code={`// Core SDK call\nconst epoch = await ika.getEpoch();`}/>
    <Button onClick={fetchEpoch} disabled={loading}>{loading?"Querying...":"Get Epoch"}</Button>
    {errorMsg && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm"><strong>Error:</strong> {errorMsg}</div>}
    {epoch !== null && <div className="rounded-md border p-3 text-sm">Epoch: <strong>{epoch}</strong></div>}
  </section>);
}
