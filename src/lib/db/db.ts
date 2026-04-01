import Dexie, { type Table } from 'dexie';

export interface MorionNode {
  id: string;
  type: 'thought' | 'video' | 'image' | 'insight' | 'idea';
  content: string;
  tags: string[];
  createdAt: number;
  // Node coordinates could be stored here or via another table,
  // but for simplicity we'll store layout info directly.
  positionX: number;
  positionY: number;
}

export interface MorionEdge {
  id: string;
  source: string;
  target: string;
}

export class MorionDatabase extends Dexie {
  nodes!: Table<MorionNode>;
  edges!: Table<MorionEdge>;

  constructor() {
    super('MorionBrain');
    this.version(1).stores({
      nodes: 'id, type, createdAt, *tags', // Indexed fields
      edges: 'id, source, target'
    });
  }
}

export const db = new MorionDatabase();
