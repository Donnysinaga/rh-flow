import fs from 'fs';
import path from 'path';

export interface IndexerState {
  latestIndexedBlock: number;
  rpcHeadBlock: number;
  blockLag: number;
  lastSuccessfulSync: string | null;
  status: 'LIVE' | 'SYNCING' | 'DEGRADED' | 'OFFLINE';
  processedBlocks: number;
  errors: number;
  startedAt: string | null;
}

const STATE_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(STATE_DIR, 'indexer-state.json');

const DEFAULT_STATE: IndexerState = {
  latestIndexedBlock: 0,
  rpcHeadBlock: 0,
  blockLag: 0,
  lastSuccessfulSync: null,
  status: 'OFFLINE',
  processedBlocks: 0,
  errors: 0,
  startedAt: null,
};

export function loadState(): IndexerState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return { ...DEFAULT_STATE, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return { ...DEFAULT_STATE };
}

export function saveState(state: IndexerState): void {
  try {
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

export function getStatus(state: IndexerState): IndexerState['status'] {
  if (!state.lastSuccessfulSync) return 'OFFLINE';
  
  const lastSyncTime = new Date(state.lastSuccessfulSync).getTime();
  const now = Date.now();
  
  if (state.errors > 0 || (now - lastSyncTime > 5 * 60 * 1000)) {
    return 'DEGRADED';
  }
  
  if (state.blockLag > 5) {
    return 'SYNCING';
  }
  
  return 'LIVE';
}
