import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { getUserShareEncryptionKeys } from '@/lib/userShareKeysStore';

function hexToBytes(hex: string) {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (h.length % 2 !== 0) throw new Error('Bad hex');
  const out = new Uint8Array(h.length/2);
  for (let i=0;i<h.length;i+=2) out[i/2] = parseInt(h.slice(i,i+2),16);
  return out;
}

export default function VerifySignature() {
  const [message, setMessage] = useState('Hello, Ika!');
  const [signatureHex, setSignatureHex] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setResult(null); setError(null); setLoading(true);
    try {
      const keys = getUserShareEncryptionKeys();
      if (!keys) throw new Error('No keys loaded.');
      const msgBytes = new TextEncoder().encode(message);
      const sig = hexToBytes(signatureHex.trim());
      const ok = await keys.verifySignature(msgBytes, sig);
      setResult(ok ? 'VALID' : 'INVALID');
    } catch (e: any) { setError(e.message || String(e)); } finally { setLoading(false); }
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold'>Verify Signature</h2>
      <CodeBlock code={`const message = new TextEncoder().encode('Hello, Ika!');\nconst isValid = await userShareKeys.verifySignature(message, signature);`} />
      <div className='flex flex-col gap-2'>
        <Input placeholder='Message' value={message} onChange={e=>setMessage(e.target.value)} />
        <Input placeholder='Signature hex (0x...)' value={signatureHex} onChange={e=>setSignatureHex(e.target.value)} />
        <Button disabled={!signatureHex || loading} onClick={run}>{loading ? 'Verifying...' : 'Verify'}</Button>
      </div>
      {error && <div className='border border-red-300 bg-red-50 p-2 rounded text-xs'>{error}</div>}
      {result && !error && <div className='text-xs border rounded p-2 bg-muted/40'>Result: {result}</div>}
    </div>
  );
}
