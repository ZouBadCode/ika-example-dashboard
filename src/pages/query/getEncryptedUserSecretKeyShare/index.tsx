import GetEncryptedUserSecretKeyShare from "@/components/getEncryptedUserSecretKeyShare";
export const meta = {
  title: "Get EncryptedUserSecretKeyShare",
  // 自訂路徑，不寫也可，預設 "/tools/dwallet-queryer"
  // path: "/tools/dwallet-queryer",
  order: 6,
};

export default function DWalletBatchQueryerPage() {
  return <GetEncryptedUserSecretKeyShare />;
}