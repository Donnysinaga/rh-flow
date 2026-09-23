import { loadState, saveState, IndexerState } from './state';
import { processBlocks } from './processor';
import { addEvents, StoredEvent } from './events';

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

export async function runOnce(): Promise<IndexerState> {
  if (isRunning) {
    return loadState();
  }
  
  isRunning = true;
  let state = loadState();
  
  if (!state.startedAt) {
    state.startedAt = new Date().toISOString();
  }
  
  try {
    const result = await processBlocks(state);
    state = result.state;
    
    if (result.events.length > 0) {
      const storedEvents: StoredEvent[] = result.events.map(e => ({
        type: e.type,
        blockNumber: e.blockNumber,
        transactionHash: e.transactionHash,
        timestamp: e.timestamp || new Date().toISOString(),
        data: e.data
      }));
      addEvents(storedEvents);
    }
    
    saveState(state);
  } catch (error) {
    console.error('Indexer runOnce error:', error);
  } finally {
    isRunning = false;
  }
  
  return state;
}

export function startInterval(intervalMs: number = 5000): void {
  if (intervalId) {
    console.warn('Indexer is already running');
    return;
  }
  
  console.log(`Starting indexer with interval ${intervalMs}ms`);
  intervalId = setInterval(() => {
    runOnce().catch(err => console.error('Error in indexer interval:', err));
  }, intervalMs);
}

export function stopInterval(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Indexer stopped');
  }
}

export function isIndexerRunning(): boolean {
  return isRunning || intervalId !== null;
}
