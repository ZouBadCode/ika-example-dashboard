import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import ReactJson from "react-json-view";
import { ensureIkaInitialized } from "@/lib/ika";
import { toPrintableJSON } from "@/utils/printableJson";

export default function ProtocolParametersCache() {
  const [encryptionKeyID, setEncryptionKeyID] = useState("");
  const [cached, setCached] = useState<boolean | null>(null);
  const [params, setParams] = useState<any>(null);
  const [pretty, setPretty] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true); setErrorMsg(null); setParams(null); setPretty(""); setCached(null);
    try {
      const ika = await ensureIkaInitialized();
      const isCached = ika.isProtocolPublicParametersCached(encryptionKeyID);
      setCached(isCached);
      if (isCached) {
        const p = ika.getCachedProtocolPublicParameters(encryptionKeyID);
        setParams(p);
        setPretty(toPrintableJSON(p));
      }
    } catch (err: any) { setErrorMsg(err?.message ?? String(err)); }
    finally { setLoading(false);}  
  }

  return (<section className="space-y-4">
    <h2 className="text-lg font-semibold">Protocol Parameters Cache</h2>
    <CodeBlock code={`// Check cache\nconst isCached = ika.isProtocolPublicParametersCached(keyID);\nif (isCached) { ika.getCachedProtocolPublicParameters(keyID); }`}/>
    <div className="flex items-center gap-3">
      <Input placeholder="Encryption Key ID" value={encryptionKeyID} onChange={(e)=>setEncryptionKeyID(e.target.value.trim())} />
      <Button onClick={check} disabled={!encryptionKeyID || loading}>{loading?"Checking...":"Check Cache"}</Button>
    </div>
    {errorMsg && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm"><strong>Error:</strong> {errorMsg}</div>}
    {cached !== null && <div className="text-sm">Cached: <strong>{String(cached)}</strong></div>}
    {pretty && <div className="rounded-xl border p-4 bg-muted/40"><div className="mb-2 text-sm text-muted-foreground">Cached Parameters:</div><div className="overflow-auto text-sm leading-6"><ReactJson src={params} theme="monokai" collapsed={1} enableClipboard displayDataTypes={false}/></div></div>}
  </section>);
}
