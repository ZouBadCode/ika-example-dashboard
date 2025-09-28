import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { ensureIkaInitialized } from '@/lib/ika';
import { getUserShareEncryptionKeys } from '@/lib/userShareKeysStore';

function hexToBytes(hex: string) {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (h.length % 2 !== 0) throw new Error('Bad hex');
  const out = new Uint8Array(h.length/2);
  for (let i=0;i<h.length;i+=2) out[i/2] = parseInt(h.slice(i,i+2),16);
  return out;
}

export default function UserOutputSignature() {
  const [dWalletId, setDWalletId] = useState('');
  const [userPublicOutputHex, setUserPublicOutputHex] = useState('');
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
      const publicOutput = hexToBytes(userPublicOutputHex.trim());
  const sig = await keys.getUserOutputSignature(dWallet, publicOutput);
  const hex = '0x' + Array.from(sig).map(b=>b.toString(16).padStart(2,'0')).join('');
  setSigHex(hex);
    } catch (e: any) { setError(e.message || String(e)); } finally { setLoading(false); }
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold'>User Output Authorization Signature</h2>
      <CodeBlock code={`const dWallet = await ika.getdWallet(dWalletId);\nconst signature = await userShareKeys.getUserOutputSignature(dWallet, userPublicOutput);`} />
      <div className='flex flex-col gap-2'>
        <Input placeholder='dWallet Id' value={dWalletId} onChange={e=>setDWalletId(e.target.value)} />
        <Input placeholder='User Public Output (hex 0x...)' value={userPublicOutputHex} onChange={e=>setUserPublicOutputHex(e.target.value)} />
        <Button disabled={!dWalletId || !userPublicOutputHex || loading} onClick={run}>{loading ? 'Signing...' : 'Sign'}</Button>
      </div>
      {error && <div className='border border-red-300 bg-red-50 p-2 rounded text-xs'>{error}</div>}
      {sigHex && <div className='text-xs break-all border rounded p-2 bg-muted/40'>Signature: {sigHex}</div>}
    </div>
  );
}
