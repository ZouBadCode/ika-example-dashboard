import DWalletActiveWatcher from "@/components/dWalletActiveWatcher";
export const meta = {
  title: "DWallet Active Watcher",
  // 自訂路徑，不寫也可，預設 "/tools/dwallet-queryer"
  // path: "/tools/dwallet-queryer",
  order: 7,
};

export default function DWalletActiveWatcherPage() {
  return <DWalletActiveWatcher />;
}