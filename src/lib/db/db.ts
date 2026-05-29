import Dexie, { type Table } from 'dexie';

export interface MorionNode {
  id: string;
  type: 'thought' | 'video' | 'image' | 'insight' | 'idea' | 'source';
  content: string;
  tags: string[];
  createdAt: number;
  positionX: number;
  positionY: number;
  sourceUrl?: string;
  notebook: string;
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
    this.version(2).stores({
      nodes: 'id, type, createdAt, notebook, *tags',
      edges: 'id, source, target',
    });
  }
}

export const db = new MorionDatabase();
