import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import ReactJson from "react-json-view";
import { ensureIkaInitialized } from "@/lib/ika";
import { toPrintableJSON } from "@/utils/printableJson";

export default function GetNetworkEncryptionKey() {
  const [keyID, setKeyID] = useState("");
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
      const key = await ika.getNetworkEncryptionKey(keyID);
      setRawObj(key);
      setPretty(toPrintableJSON(key));
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.toLowerCase().includes("not found")) {
        setErrorMsg(`Encryption key not found: ${keyID}`);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (<section className="space-y-4">
    <h2 className="text-lg font-semibold">Get Network Encryption Key</h2>
    <CodeBlock code={`// Core SDK call with error handling\ntry {\n  const key = await ika.getNetworkEncryptionKey(encryptionKeyID);\n} catch (e) { /* ObjectNotFoundError */ }`}/>
    <div className="flex items-center gap-3">
      <Input placeholder="Enter Encryption Key ID (0x...)" value={keyID} onChange={(e)=>setKeyID(e.target.value.trim())} />
      <Button onClick={fetchKey} disabled={!keyID||loading}>{loading?"Querying...":"Fetch"}</Button>
    </div>
    {errorMsg && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm"><strong>Error:</strong> {errorMsg}</div>}
    {pretty && <div className="rounded-xl border p-4 bg-muted/40"><div className="mb-2 text-sm text-muted-foreground">Encryption Key:</div><div className="overflow-auto text-sm leading-6"><ReactJson src={rawObj} theme="monokai" collapsed={1} enableClipboard displayDataTypes={false}/></div></div>}
  </section>);
}
