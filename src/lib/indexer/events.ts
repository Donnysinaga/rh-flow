import fs from 'fs';
import path from 'path';

export interface StoredEvent {
  type: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: string;
  data: any;
}

const EVENTS_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(EVENTS_DIR, 'events.json');
const MAX_RECENT_EVENTS = 200;

let recentEvents: StoredEvent[] = [];
let loaded = false;

export function loadEvents(): void {
  if (loaded) return;
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const data = fs.readFileSync(EVENTS_FILE, 'utf-8');
      recentEvents = JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load events:', error);
    recentEvents = [];
  }
  loaded = true;
}

export function saveEvents(): void {
  try {
    if (!fs.existsSync(EVENTS_DIR)) {
      fs.mkdirSync(EVENTS_DIR, { recursive: true });
    }
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(recentEvents, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save events:', error);
  }
}

export function addEvents(newEvents: StoredEvent[]): void {
  loadEvents();
  recentEvents = [...newEvents, ...recentEvents].slice(0, MAX_RECENT_EVENTS);
  saveEvents();
}

export function getRecentEvents(type?: string, limit: number = 50): StoredEvent[] {
  loadEvents();
  let filtered = recentEvents;
  if (type) {
    filtered = filtered.filter(e => e.type === type);
  }
  return filtered.slice(0, limit);
}
