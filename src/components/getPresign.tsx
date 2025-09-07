import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import ReactJson from "react-json-view";
import { ensureIkaInitialized } from "@/lib/ika";
import { toPrintableJSON } from "@/utils/printableJson";

export default function GetPresign() {
  const [presignID, setPresignID] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawObj, setRawObj] = useState<any>(null);
  const [pretty, setPretty] = useState<string>("");

  async function fetchDWallet() {
    setLoading(true);
    setErrorMsg(null);
    setRawObj(null);
    setPretty("");

    try {
      const ika = await ensureIkaInitialized();
      const dWallet = await ika.getPresign(presignID);

      setRawObj(dWallet);
      setPretty(toPrintableJSON(dWallet));
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">DWallet Queryer</h2>
      <CodeBlock
        code={`// Core SDK call\nconst presign = await ika.getPresign(presignID);`}
      />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Enter Presign ID (e.g., 0x...)"
          value={presignID}
          onChange={(e) => setPresignID(e.target.value)}
        />
        <Button onClick={fetchDWallet} disabled={!presignID || loading}>
          {loading ? "Querying..." : "Fetch Presign"}
        </Button>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {pretty && (
        <div className="rounded-xl border p-4 bg-muted/40">
          <div className="mb-2 text-sm text-muted-foreground">PreSign Info:</div>
          <div className="overflow-auto text-sm leading-6">
            {rawObj && (
              <ReactJson
                src={rawObj}
                theme="monokai"
                collapsed={1}
                enableClipboard={true}
                displayDataTypes={false}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
