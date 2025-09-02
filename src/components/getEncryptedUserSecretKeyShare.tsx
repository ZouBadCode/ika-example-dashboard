import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactJson from "react-json-view";
import { ensureIkaInitialized } from "@/lib/ika";
import { toPrintableJSON } from "@/utils/printableJson";

export default function GetEncryptedUserSecretKeyShare() {
  const [encryptedUserSecretKeyShare, setEncryptedUserSecretKeyShare] = useState("");
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
      const dWallet = await ika.getEncryptedUserSecretKeyShare(encryptedUserSecretKeyShare);

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

      <div className="flex items-center gap-3">
        <Input
          placeholder="Enter Encrypted User Secret Key Share"
          value={encryptedUserSecretKeyShare}
          onChange={(e) => setEncryptedUserSecretKeyShare(e.target.value)}
        />
        <Button onClick={fetchDWallet} disabled={!encryptedUserSecretKeyShare || loading}>
          {loading ? "Querying..." : "Fetch Encrypted User Secret Key Share"}
        </Button>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {pretty && (
        <div className="rounded-xl border p-4 bg-muted/40">
          <div className="mb-2 text-sm text-muted-foreground">EncryptedUserSecretKeyShare Info:</div>
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
