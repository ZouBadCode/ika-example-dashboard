import GetPresign from "@/components/getPresign";
export const meta = {
  title: "Get Presign",
  // 自訂路徑，不寫也可，預設 "/tools/dwallet-queryer"
  // path: "/tools/dwallet-queryer",
  order: 4,
};

export default function DWalletQueryerPage() {
  return <GetPresign />;
}