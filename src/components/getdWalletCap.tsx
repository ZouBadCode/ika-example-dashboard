import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import ReactJson from "react-json-view";
import { ensureIkaInitialized } from "@/lib/ika";
import { toPrintableJSON } from "@/utils/printableJson";

export default function GetDWalletCaps() {
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [rawObj, setRawObj] = useState<any>(null);
    const [pretty, setPretty] = useState<string>("");

    async function fetchDWalletCaps() {
        setLoading(true);
        setErrorMsg(null);
        setRawObj(null);
        setPretty("");
        try {
            const ika = await ensureIkaInitialized();

            let cursor: string | null | undefined = undefined;
            const allCaps: any[] = [];

            do {
                const { dWalletCaps, cursor: nextCursor, hasNextPage } =
                    await ika.getOwnedDWalletCaps(address, cursor, 50);

                allCaps.push(...dWalletCaps);
                cursor = nextCursor;

                if (!hasNextPage) break;
            } while (cursor);

            setRawObj(allCaps);
            setPretty(toPrintableJSON(allCaps));
        } catch (err: any) {
            setErrorMsg(err?.message ?? String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold">DWallet Caps Queryer</h2>
            <CodeBlock
                code={`// Core paginated call\nconst { dWalletCaps, cursor, hasNextPage } = await ika.getOwnedDWalletCaps(address, cursor, 50);`}
            />

            <div className="flex items-center gap-3">
                <Input
                    placeholder="Enter owner address (e.g., 0x...)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <Button onClick={fetchDWalletCaps} disabled={!address || loading}>
                    {loading ? "Querying..." : "Fetch Owned Caps"}
                </Button>
            </div>

            {errorMsg && (
                <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm">
                    <strong>Error:</strong> {errorMsg}
                </div>
            )}

            {pretty && (
                <div className="rounded-xl border p-4 bg-muted/40">
                    <div className="mb-2 text-sm text-muted-foreground">Owned Caps:</div>
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
