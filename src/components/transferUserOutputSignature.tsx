import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { ensureIkaInitialized } from '@/lib/ika';
import { getUserShareEncryptionKeys } from '@/lib/userShareKeysStore';

export default function TransferUserOutputSignature() {
  const [dWalletId, setDWalletId] = useState('');
  const [shareId, setShareId] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [sigHex, setSigHex] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setSigHex(''); setError(null); setLoading(true);
    try {
      const keys = getUserShareEncryptionKeys();
      if (!keys) throw new Error('No keys loaded.');
      const ika = await ensureIkaInitialized();
  const dWallet = await ika.getDWallet(dWalletId.trim());
      const encryptedShare = await ika.getEncryptedUserSecretKeyShare(shareId.trim());
      const sourceEncryptionKey = await ika.getActiveEncryptionKey(senderAddress.trim());
      // Handle possible naming differences in SDK (doc typo safeguard).
      const anyKeys: any = keys;
      const fn = anyKeys.getUserOutputSignatureForTransferreddWallet || anyKeys.getUserOutputSignatureForTransferredDWallet || anyKeys.getUserOutputSignatureForTransferredWallet;
      if (!fn) throw new Error('SDK method for transfer user output signature not found');
  const sig: Uint8Array = await fn.call(keys, dWallet, encryptedShare, sourceEncryptionKey);
  const hex = '0x' + Array.from(sig).map(b=>b.toString(16).padStart(2,'0')).join('');
  setSigHex(hex);
    } catch (e: any) { setError(e.message || String(e)); } finally { setLoading(false); }
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold'>Transfer dWallet Authorization Signature</h2>
      <CodeBlock code={`const dWallet = await ika.getdWallet(id);\nconst encryptedShare = await ika.getEncryptedUserSecretKeyShare(shareId);\nconst srcEncKey = await ika.getActiveEncryptionKey(senderAddr);\nconst sig = await userShareKeys.getUserOutputSignatureForTransferreddWallet(dWallet, encryptedShare, srcEncKey);`} />
      <div className='flex flex-col gap-2'>
        <Input placeholder='Transferred dWallet Id' value={dWalletId} onChange={e=>setDWalletId(e.target.value)} />
        <Input placeholder='Encrypted Share Id' value={shareId} onChange={e=>setShareId(e.target.value)} />
        <Input placeholder='Sender Address (0x...)' value={senderAddress} onChange={e=>setSenderAddress(e.target.value)} />
        <Button disabled={!dWalletId || !shareId || !senderAddress || loading} onClick={run}>{loading ? 'Signing...' : 'Sign Transfer'}</Button>
      </div>
      {error && <div className='border border-red-300 bg-red-50 p-2 rounded text-xs'>{error}</div>}
      {sigHex && <div className='text-xs break-all border rounded p-2 bg-muted/40'>Signature: {sigHex}</div>}
    </div>
  );
}
