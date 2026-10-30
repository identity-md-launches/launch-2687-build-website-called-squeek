export type Activity = {
  id: string;
  kind: 'transfer' | 'contract';
  title: string;
  status: 'Confirmed' | 'Failed' | 'Sample';
  value: string;
  timestamp: string | null;
  block: number | null;
  from?: string;
  to?: string;
};

export const SAMPLE_ACTIVITY: Activity[] = [
  { id: 'sample-batch-0042', kind: 'contract', title: 'Work settlement', status: 'Sample', value: '0 ETH', timestamp: null, block: null },
  { id: 'sample-transfer-0003', kind: 'transfer', title: 'Test ETH transfer', status: 'Sample', value: '0.002 ETH', timestamp: null, block: null },
  { id: 'sample-wheel-0041', kind: 'contract', title: 'Wheel checkpoint', status: 'Sample', value: '0 ETH', timestamp: null, block: null },
  { id: 'sample-batch-0041', kind: 'contract', title: 'Work settlement', status: 'Sample', value: '0 ETH', timestamp: null, block: null },
  { id: 'sample-transfer-0002', kind: 'transfer', title: 'Test ETH transfer', status: 'Sample', value: '0.001 ETH', timestamp: null, block: null },
];

export const API_URL = 'https://eth-sepolia.blockscout.com/api/v2/transactions?filter=validated';
export const EXPLORER_URL = 'https://eth-sepolia.blockscout.com';

type ApiTransaction = {
  hash?: unknown;
  transaction_types?: unknown;
  status?: unknown;
  value?: unknown;
  timestamp?: unknown;
  block_number?: unknown;
  from?: { hash?: unknown };
  to?: { hash?: unknown } | null;
};

export function parseTransactions(data: unknown): Activity[] {
  if (!data || typeof data !== 'object' || !('items' in data) || !Array.isArray(data.items)) throw new Error('Unexpected activity response');
  return (data.items as ApiTransaction[]).filter((tx) => typeof tx.hash === 'string' && /^0x[\da-f]{64}$/i.test(tx.hash))
    .slice(0, 20).map((tx) => {
      const types = Array.isArray(tx.transaction_types) ? tx.transaction_types : [];
      const contract = types.includes('contract_call') || types.includes('contract_creation');
      const value = typeof tx.value === 'string' && /^\d+$/.test(tx.value) ? Number(BigInt(tx.value)) / 1e18 : 0;
      return {
        id: tx.hash as string,
        kind: contract ? 'contract' : 'transfer',
        title: types.includes('contract_creation') ? 'Contract creation' : contract ? 'Contract call' : 'ETH transfer',
        status: tx.status === 'ok' ? 'Confirmed' : 'Failed',
        value: `${value === 0 ? '0' : value < 0.00001 ? '<0.00001' : value.toLocaleString('en-US', { maximumFractionDigits: 5 })} ETH`,
        timestamp: typeof tx.timestamp === 'string' && Number.isFinite(Date.parse(tx.timestamp)) ? tx.timestamp : null,
        block: typeof tx.block_number === 'number' ? tx.block_number : null,
        from: typeof tx.from?.hash === 'string' ? tx.from.hash : undefined,
        to: typeof tx.to?.hash === 'string' ? tx.to.hash : undefined,
      };
    });
}

export function shortHash(hash: string) { return hash.startsWith('sample-') ? hash.replace('sample-', '') : `${hash.slice(0, 8)}…${hash.slice(-6)}`; }

export function timeAgo(timestamp: string | null, now: number) {
  if (!timestamp) return 'Illustration';
  const seconds = Math.max(0, Math.floor((now - Date.parse(timestamp)) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
