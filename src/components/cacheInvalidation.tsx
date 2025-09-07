import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { ensureIkaInitialized } from "@/lib/ika";

export default function CacheInvalidation() {
  const [encryptionKeyID, setEncryptionKeyID] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function run(fn: (ika: any)=>void, label: string) {
    setMessage(null); setErrorMsg(null);
    try {
      const ika = await ensureIkaInitialized();
      fn(ika);
      setMessage(`${label} executed.`);
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    }
  }

  return (<section className="space-y-4">
    <h2 className="text-lg font-semibold">Cache Invalidation</h2>
    <CodeBlock code={`// Invalidate all caches\nika.invalidateCache();\n// Invalidate object cache only\nika.invalidateObjectCache();\n// Invalidate encryption key cache only\nika.invalidateEncryptionKeyCache();\n// Invalidate protocol params for a key\nika.invalidateProtocolPublicParametersCache(encryptionKeyID);\n// Invalidate all protocol params\nika.invalidateProtocolPublicParametersCache();`}/>
    <div className="flex flex-wrap items-center gap-3">
      <Input placeholder="Encryption Key ID (optional for specific params)" value={encryptionKeyID} onChange={(e)=>setEncryptionKeyID(e.target.value.trim())} />
      <Button variant="secondary" onClick={()=>run(i=>i.invalidateCache(), 'invalidateCache')}>All</Button>
      <Button onClick={()=>run(i=>i.invalidateObjectCache(),'invalidateObjectCache')}>Objects</Button>
      <Button onClick={()=>run(i=>i.invalidateEncryptionKeyCache(),'invalidateEncryptionKeyCache')}>Encryption Keys</Button>
      <Button onClick={()=>run(i=>i.invalidateProtocolPublicParametersCache(encryptionKeyID||undefined),'invalidateProtocolPublicParametersCache(specific)')} disabled={!encryptionKeyID}>Params (key)</Button>
      <Button variant="outline" onClick={()=>run(i=>i.invalidateProtocolPublicParametersCache(),'invalidateProtocolPublicParametersCache(all)')}>Params (all)</Button>
    </div>
    {message && <div className="rounded-md border border-green-300 bg-green-50 p-2 text-xs">{message}</div>}
    {errorMsg && <div className="rounded-md border border-red-300 bg-red-50 p-2 text-xs"><strong>Error:</strong> {errorMsg}</div>}
  </section>);
}
