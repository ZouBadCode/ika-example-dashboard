import PresignCompletedWatcher from "@/components/getPresignActiveWatcher";
export const meta = {
  title: "Get Presign Active Watcher",
  // 自訂路徑，不寫也可，預設 "/tools/dwallet-queryer"
  // path: "/tools/dwallet-queryer",
  order: 8,
};

export default function DWalletQueryerPage() {
  return <PresignCompletedWatcher />;
}