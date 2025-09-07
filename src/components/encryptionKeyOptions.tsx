import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { ensureIkaInitialized } from "@/lib/ika";

export default function EncryptionKeyOptions() {
  const [current, setCurrent] = useState<any>(null);
  const [encryptionKeyID, setEncryptionKeyID] = useState("");
  const [autoDetect, setAutoDetect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function refresh() {
    const ika = await ensureIkaInitialized();
    const opts = ika.getEncryptionKeyOptions();
    setCurrent(opts);
    setEncryptionKeyID(opts.encryptionKeyID || "");
    setAutoDetect(!!opts.autoDetect);
  }

  useEffect(()=>{ refresh(); }, []);

  async function applyID() {
    setLoading(true); setErrorMsg(null); setMessage(null);
    try {
      const ika = await ensureIkaInitialized();
      if (encryptionKeyID) {
        ika.setEncryptionKeyID(encryptionKeyID);
      }
      await refresh();
      setMessage("Encryption Key ID set successfully");
    } catch (err: any) { setErrorMsg(err?.message ?? String(err)); }
    finally { setLoading(false);}  
  }

  async function applyOptions() {
    setLoading(true); setErrorMsg(null); setMessage(null);
    try {
  const ika = await ensureIkaInitialized();
  ika.setEncryptionKeyOptions({ encryptionKeyID: encryptionKeyID || undefined as any, autoDetect });
      await refresh();
      setMessage("Options updated");
    } catch (err: any) { setErrorMsg(err?.message ?? String(err)); }
    finally { setLoading(false);}  
  }

  return (<section className="space-y-4">
    <h2 className="text-lg font-semibold">Encryption Key Options</h2>
    <CodeBlock code={`// Read options\nconst opts = ika.getEncryptionKeyOptions();\n// Set specific key\nika.setEncryptionKeyID(encryptionKeyID);\n// Set options\nika.setEncryptionKeyOptions({ encryptionKeyID, autoDetect: false });`}/>
    <div className="space-y-2 text-sm">
      <div className="rounded-md border p-3 bg-muted/40">
        <div className="font-medium mb-1">Current Options</div>
        <pre className="text-xs overflow-auto">{JSON.stringify(current, null, 2)}</pre>
      </div>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
      <Input placeholder="Encryption Key ID (optional)" value={encryptionKeyID} onChange={(e)=>setEncryptionKeyID(e.target.value.trim())} />
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input type="checkbox" checked={autoDetect} onChange={(e)=>setAutoDetect(e.target.checked)} /> Auto-detect
      </label>
      <Button disabled={loading} onClick={applyID}>{loading?"...":"Set ID"}</Button>
      <Button variant="secondary" disabled={loading} onClick={applyOptions}>{loading?"...":"Set Options"}</Button>
      <Button variant="outline" disabled={loading} onClick={refresh}>Refresh</Button>
    </div>
    {message && <div className="rounded-md border border-green-300 bg-green-50 p-2 text-xs">{message}</div>}
    {errorMsg && <div className="rounded-md border border-red-300 bg-red-50 p-2 text-xs"><strong>Error:</strong> {errorMsg}</div>}
  </section>);
}
