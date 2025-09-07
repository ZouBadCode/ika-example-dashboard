import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import ReactJson from "react-json-view";
import { ensureIkaInitialized } from "@/lib/ika";
import { toPrintableJSON } from "@/utils/printableJson";

export default function GetProtocolPublicParameters() {
  const [dWalletID, setDWalletID] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawObj, setRawObj] = useState<any>(null);
  const [pretty, setPretty] = useState<string>("");

  async function fetchParams(useDefault: boolean) {
    setLoading(true);
    setErrorMsg(null);
    setRawObj(null);
    setPretty("");
    try {
      const ika = await ensureIkaInitialized();
      let params;
      if (!useDefault && dWalletID) {
        const dw = await ika.getDWallet(dWalletID);
        params = await ika.getProtocolPublicParameters(dw);
      } else {
        params = await ika.getProtocolPublicParameters();
      }
      setRawObj(params);
      setPretty(toPrintableJSON(params));
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    } finally { setLoading(false);}    
  }

  return (<section className="space-y-4">
    <h2 className="text-lg font-semibold">Protocol Public Parameters</h2>
    <CodeBlock code={`// Using dWallet instance\nconst dw = await ika.getDWallet(dWalletID);\nconst params = await ika.getProtocolPublicParameters(dw);\n// Using configured encryption key\nconst defaultParams = await ika.getProtocolPublicParameters();`}/>
    <div className="flex flex-wrap items-center gap-3">
      <Input placeholder="Optional dWallet ID (0x...)" value={dWalletID} onChange={(e)=>setDWalletID(e.target.value.trim())} />
      <Button disabled={loading || !dWalletID} onClick={()=>fetchParams(false)}>{loading?"Loading...":"Fetch (dWallet)"}</Button>
      <Button variant="secondary" disabled={loading} onClick={()=>fetchParams(true)}>{loading?"Loading...":"Fetch (Default)"}</Button>
    </div>
    {errorMsg && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm"><strong>Error:</strong> {errorMsg}</div>}
    {pretty && <div className="rounded-xl border p-4 bg-muted/40"><div className="mb-2 text-sm text-muted-foreground">Parameters:</div><div className="overflow-auto text-sm leading-6"><ReactJson src={rawObj} theme="monokai" collapsed={1} enableClipboard displayDataTypes={false}/></div></div>}
  </section>);
}
