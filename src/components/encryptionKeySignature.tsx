import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { getUserShareEncryptionKeys } from '@/lib/userShareKeysStore';

export default function EncryptionKeySignature() {
  const [sigHex, setSigHex] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true); setError(null); setSigHex('');
    try {
      const keys = getUserShareEncryptionKeys();
      if (!keys) throw new Error('No keys loaded. Go to Manage page first.');
  const sig = await keys.getEncryptionKeySignature();
  const hex = '0x' + Array.from(sig).map(b=>b.toString(16).padStart(2,'0')).join('');
  setSigHex(hex);
    } catch (e: any) { setError(e.message || String(e)); } finally { setLoading(false); }
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold'>Encryption Key Ownership Signature</h2>
      <CodeBlock code={`// Sign your own encryption key to prove ownership\nconst signature = await userShareKeys.getEncryptionKeySignature();`} />
      <Button onClick={run} disabled={loading}>{loading ? 'Signing...' : 'Create Signature'}</Button>
      {error && <div className='border border-red-300 bg-red-50 p-2 rounded text-xs'>{error}</div>}
      {sigHex && <div className='text-xs break-all border rounded p-2 bg-muted/40'>Signature: {sigHex}</div>}
    </div>
  );
}
