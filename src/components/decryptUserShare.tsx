import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { ensureIkaInitialized } from '@/lib/ika';
import { getUserShareEncryptionKeys } from '@/lib/userShareKeysStore';
import { toPrintableJSON } from '@/utils/printableJson';

export default function DecryptUserShare() {
  const [dWalletId, setDWalletId] = useState('');
  const [shareId, setShareId] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setResult(''); setError(null); setLoading(true);
    try {
      const keys = getUserShareEncryptionKeys();
      if (!keys) throw new Error('No keys loaded.');
      const ika = await ensureIkaInitialized();
  const dWallet = await ika.getDWallet(dWalletId.trim());
      const encryptedShare = await ika.getEncryptedUserSecretKeyShare(shareId.trim());
      const protocolParameters = await ika.getProtocolPublicParameters(dWallet);
      const { verifiedPublicOutput, secretShare } = await keys.decryptUserShare(dWallet, encryptedShare, protocolParameters);
      setResult(toPrintableJSON({ verifiedPublicOutputLength: verifiedPublicOutput.length, secretShareLength: secretShare.length }));
    } catch (e: any) { setError(e.message || String(e)); } finally { setLoading(false); }
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold'>Decrypt User Secret Key Share</h2>
      <CodeBlock code={`const dWallet = await ika.getdWallet(dWalletId);\nconst encryptedShare = await ika.getEncryptedUserSecretKeyShare(shareId);\nconst protocolParameters = await ika.getProtocolPublicParameters(dWallet);\nconst { verifiedPublicOutput, secretShare } = await userShareKeys.decryptUserShare(dWallet, encryptedShare, protocolParameters);`} />
      <div className='flex flex-col gap-2'>
        <Input placeholder='dWallet Id' value={dWalletId} onChange={e=>setDWalletId(e.target.value)} />
        <Input placeholder='Encrypted Share Id' value={shareId} onChange={e=>setShareId(e.target.value)} />
        <Button disabled={!dWalletId || !shareId || loading} onClick={run}>{loading ? 'Decrypting...' : 'Decrypt'}</Button>
      </div>
      {error && <div className='border border-red-300 bg-red-50 p-2 rounded text-xs'>{error}</div>}
      {result && !error && <div className='text-xs border rounded p-2 bg-muted/40 whitespace-pre-wrap'>{result}</div>}
    </div>
  );
}
