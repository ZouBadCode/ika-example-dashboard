import GetPartialUserSignature from "@/components/getPartialUserSignature";
export const meta = {
  title: "Get Partial User Signature",
  // 自訂路徑，不寫也可，預設 "/tools/dwallet-queryer"
  // path: "/tools/dwallet-queryer",
  order: 5,
};

export default function DWalletBatchQueryerPage() {
  return <GetPartialUserSignature />;
}