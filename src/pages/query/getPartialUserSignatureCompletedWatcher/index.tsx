import PartialUserSignatureCompletedWatcher from "@/components/getPartialUserSignatureCompletedWatcher";
export const meta = {
    title: "Get PartialUserSignature Active Watcher",
    // 自訂路徑，不寫也可，預設 "/tools/dwallet-queryer"
    // path: "/tools/dwallet-queryer",
    order: 9,
    };

    export default function PartialUserSignatureCompletedWatcherPage() {
    return <PartialUserSignatureCompletedWatcher />;
    }