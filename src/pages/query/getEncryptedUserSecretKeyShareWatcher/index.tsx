import EncryptedUserSecretKeyShareWatcher from "@/components/getEncryptedUserSecretKeyShareWatcher";
export const meta = {
  title: "Get EncryptedUserSecretKeyShare Active Watcher",
  // 自訂路徑，不寫也可，預設 "/tools/dwallet-queryer"
  // path: "/tools/dwallet-queryer",
  order: 10,
};

export default function EncryptedUserSecretKeyShareWatcherPage() {
  return <EncryptedUserSecretKeyShareWatcher />;
}