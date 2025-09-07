import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import ReactJson from "react-json-view";
import { ensureIkaInitialized } from "@/lib/ika";
import { toPrintableJSON } from "@/utils/printableJson";

export default function GetActiveEncryptionKey() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawObj, setRawObj] = useState<any>(null);
  const [pretty, setPretty] = useState<string>("");

  async function fetchKey() {
    setLoading(true);
    setErrorMsg(null);
    setRawObj(null);
    setPretty("");
    try {
      const ika = await ensureIkaInitialized();
      const key = await ika.getActiveEncryptionKey(address);
      setRawObj(key);
      setPretty(toPrintableJSON(key));
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Get Active Encryption Key</h2>
      <CodeBlock code={`// Core SDK call\nconst key = await ika.getActiveEncryptionKey(address);`}/>
      <div className="flex items-center gap-3">
        <Input placeholder="Enter owner address (0x...)" value={address} onChange={(e)=>setAddress(e.target.value.trim())} />
        <Button disabled={!address || loading} onClick={fetchKey}>{loading?"Querying...":"Fetch"}</Button>
      </div>
      {errorMsg && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm"><strong>Error:</strong> {errorMsg}</div>}
      {pretty && (
        <div className="rounded-xl border p-4 bg-muted/40">
          <div className="mb-2 text-sm text-muted-foreground">Active Encryption Key:</div>
            <div className="overflow-auto text-sm leading-6">
              <ReactJson src={rawObj} theme="monokai" collapsed={1} enableClipboard displayDataTypes={false} />
            </div>
        </div>
      )}
    </section>
  );
}
