import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import ReactJson from "react-json-view";
import { ensureIkaInitialized } from "@/lib/ika";
import { toPrintableJSON } from "@/utils/printableJson";

export default function GetAllNetworkEncryptionKeys() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawObj, setRawObj] = useState<any[]>([]);
  const [pretty, setPretty] = useState<string>("");

  async function fetchAll() {
    setLoading(true);
    setErrorMsg(null);
    setRawObj([]);
    setPretty("");
    try {
      const ika = await ensureIkaInitialized();
      const keys = await ika.getAllNetworkEncryptionKeys();
      setRawObj(keys);
      setPretty(toPrintableJSON(keys));
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (<section className="space-y-4">
    <h2 className="text-lg font-semibold">All Network Encryption Keys</h2>
    <CodeBlock code={`// Core SDK call\nconst keys = await ika.getAllNetworkEncryptionKeys();`}/>
    <Button onClick={fetchAll} disabled={loading}>{loading?"Querying...":"Fetch All"}</Button>
    {errorMsg && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm"><strong>Error:</strong> {errorMsg}</div>}
    {pretty && (
      <div className="rounded-xl border p-4 bg-muted/40">
        <div className="mb-2 text-sm text-muted-foreground">Encryption Keys ({rawObj.length})</div>
        <div className="overflow-auto text-sm leading-6">
          <ReactJson src={rawObj} theme="monokai" collapsed={1} enableClipboard displayDataTypes={false}/>
        </div>
      </div>) }
  </section>);
}
