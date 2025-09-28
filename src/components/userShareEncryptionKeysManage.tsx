import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CodeBlock } from '@/components/ui/code-block';
import { toPrintableJSON } from '@/utils/printableJson';
import { Curve, UserShareEncryptionKeys } from '@ika.xyz/sdk';
import { getUserShareEncryptionKeys, setUserShareEncryptionKeys, tryLoadPersistedKeys } from '@/lib/userShareKeysStore';

function hexToBytes(hex: string) {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (h.length % 2 !== 0) throw new Error('Invalid hex length');
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < h.length; i += 2) out[i/2] = parseInt(h.slice(i,i+2), 16);
  return out;
}

export default function UserShareEncryptionKeysManage() {
  const [seedHex, setSeedHex] = useState('');
  const [serializedHex, setSerializedHex] = useState('');
  const [keysObj, setKeysObj] = useState<UserShareEncryptionKeys | null>(getUserShareEncryptionKeys());
  const [info, setInfo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [persist, setPersist] = useState(true);

  // Try load persisted on mount.
  useEffect(() => {
    if (!keysObj) {
      const restored = tryLoadPersistedKeys(UserShareEncryptionKeys.fromShareEncryptionKeysBytes);
      if (restored) {
        setKeysObj(restored);
        setInfo('Restored keys from localStorage.');
      }
    }
  }, [keysObj]);

  const randomSeed = useCallback(() => {
    const seed = new Uint8Array(32);
    crypto.getRandomValues(seed);
    setSeedHex('0x' + Array.from(seed).map(b=>b.toString(16).padStart(2,'0')).join(''));
  }, []);

  const createFromSeed = useCallback(async () => {
    setError(null);
    setInfo('');
    try {
      const seed = hexToBytes(seedHex.trim());
      if (seed.length !== 32) throw new Error('Seed must be 32 bytes');
      // fromRootSeedKey is async (SDK design)
      const keysInstance = await UserShareEncryptionKeys.fromRootSeedKey(seed, Curve.SECP256K1);
      setUserShareEncryptionKeys(keysInstance, persist);
      setKeysObj(keysInstance);
      setInfo('Created keys from seed.');
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }, [seedHex, persist]);

  const importSerialized = useCallback(() => {
    setError(null);
    setInfo('');
    try {
      const bytes = hexToBytes(serializedHex.trim());
      const keysInstance = UserShareEncryptionKeys.fromShareEncryptionKeysBytes(bytes);
      setUserShareEncryptionKeys(keysInstance, persist);
      setKeysObj(keysInstance);
      setInfo('Imported serialized keys.');
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }, [serializedHex, persist]);

  const exportSerialized = useCallback(() => {
    if (!keysObj) return;
    try {
      const bytes = keysObj.toShareEncryptionKeysBytes();
      const hex = '0x' + Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
      setSerializedHex(hex);
      setInfo('Exported current keys to hex.');
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }, [keysObj]);

  const clearKeys = useCallback(() => {
    setUserShareEncryptionKeys(null, false);
    setKeysObj(null);
    setInfo('Cleared keys from memory.');
  }, []);

  const toHex = (u8: Uint8Array) => '0x' + Array.from(u8).map(b=>b.toString(16).padStart(2,'0')).join('');
  const pkHex = keysObj ? toHex(keysObj.getSigningPublicKeyBytes()) : '';
  const suiAddress = keysObj ? keysObj.getSuiAddress() : '';

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold'>User Share Encryption Keys - Manage</h2>
      <p className='text-sm text-muted-foreground'>Generate or import keys. These are highly sensitive – demo only (not production secure storage).</p>
      <div className='space-y-3 border p-4 rounded-md'>
        <h3 className='font-medium'>1. From Root Seed</h3>
        <CodeBlock code={`const seed = new Uint8Array(32);\ncrypto.getRandomValues(seed);\nconst userShareKeys = UserShareEncryptionKeys.fromRootSeedKey(seed, Curve.SECP256K1);`} />
        <div className='flex gap-2 flex-wrap'>
          <Input placeholder='32-byte seed hex (0x...)' value={seedHex} onChange={e=>setSeedHex(e.target.value)} className='flex-1'/>
          <Button type='button' onClick={randomSeed}>Random</Button>
          <Button type='button' disabled={!seedHex} onClick={createFromSeed}>Create</Button>
        </div>
      </div>
      <div className='space-y-3 border p-4 rounded-md'>
        <h3 className='font-medium'>2. Import / Export Serialized</h3>
        <CodeBlock code={`// Serialize\nconst bytes = userShareKeys.toShareEncryptionKeysBytes();\n// Restore later\nconst restored = UserShareEncryptionKeys.fromShareEncryptionKeysBytes(bytes);`} />
        <div className='flex gap-2 flex-wrap'>
          <Input placeholder='Serialized keys hex (0x...)' value={serializedHex} onChange={e=>setSerializedHex(e.target.value)} className='flex-1' />
          <Button type='button' onClick={importSerialized} disabled={!serializedHex}>Import</Button>
          <Button type='button' onClick={exportSerialized} disabled={!keysObj}>Export Current</Button>
        </div>
        <label className='flex items-center gap-2 text-xs'>
          <input type='checkbox' checked={persist} onChange={e=>setPersist(e.target.checked)} /> Persist to localStorage
        </label>
      </div>
      <div className='space-y-2 border p-4 rounded-md'>
        <h3 className='font-medium'>3. Current Key Info</h3>
        {keysObj ? (
          <div className='space-y-2 text-sm'>
            <div><strong>Sui Address:</strong> {suiAddress}</div>
            <div><strong>Signing Public Key (hex):</strong> <span className='break-all'>{pkHex}</span></div>
            <div className='flex gap-2'>
              <Button size='sm' variant='secondary' onClick={clearKeys}>Clear</Button>
            </div>
            <details className='mt-2'>
              <summary className='cursor-pointer text-xs text-muted-foreground'>Show object (debug)</summary>
              <CodeBlock small code={toPrintableJSON({ suiAddress, pkHex })} />
            </details>
          </div>
        ) : <div className='text-xs text-muted-foreground'>No keys loaded.</div>}
      </div>
      {error && <div className='border border-red-300 bg-red-50 text-red-800 rounded-md p-2 text-sm'>Error: {error}</div>}
      {info && !error && <div className='border border-green-300 bg-green-50 text-green-800 rounded-md p-2 text-sm'>{info}</div>}
    </div>
  );
}
