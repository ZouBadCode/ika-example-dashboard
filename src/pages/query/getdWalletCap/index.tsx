import GetDWalletCaps from "@/components/getdWalletCap";
export const meta = {
  title: "Get DWalletCap",
  // 自訂路徑，不寫也可，預設 "/tools/dwallet-queryer"
  // path: "/tools/dwallet-queryer",
  order: 3,
};

export default function DWalletQueryerPage() {
  return <GetDWalletCaps />;
}