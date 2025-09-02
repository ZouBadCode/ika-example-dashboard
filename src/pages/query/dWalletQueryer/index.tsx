import DWalletQueryer from "@/components/dWalletQueryer";
export const meta = {
  title: "DWallet Queryer",
  // 自訂路徑，不寫也可，預設 "/tools/dwallet-queryer"
  // path: "/tools/dwallet-queryer",
  order: 1,
};

export default function DWalletQueryerPage() {
  return <DWalletQueryer />;
}