import DWalletBatchQueryer from "@/components/dWalletMultiQueryer";
export const meta = {
  title: "Batch Query",
  // 自訂路徑，不寫也可，預設 "/tools/dwallet-queryer"
  // path: "/tools/dwallet-queryer",
  order: 2,
};

export default function DWalletBatchQueryerPage() {
  return <DWalletBatchQueryer />;
}