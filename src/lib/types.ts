export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Phase {
  id: string;
  title: string;
  content: string;
  isDone: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Todo {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
  createdAt: number;
}

export interface Credential {
  id: string;
  title: string;
  keys: CredentialKey[];
  createdAt: number;
  updatedAt: number;
}

export interface CredentialKey {
  id: string;
  key: string;
  value: string;
  isVisible: boolean;
}

export interface DiagramNode {
  id: string;
  type: 'process' | 'decision' | 'start' | 'end' | 'note' | 'database' | 'api' | 'function' | 'io' | 'text';
  position: { x: number; y: number };
  data: {
    label: string;
    color?: string;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface Diagram {
  id: string;
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport?: { x: number; y: number; zoom: number };
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  isPublic: boolean;
  notes: Note[];
  phases: Phase[];
  todos?: Todo[];
  files?: ProjectFile[];
  credentials?: Credential[];
  diagrams?: Diagram[];
  logo?: string;
  favicon?: string;
  createdAt: number;
  updatedAt: number;
}
