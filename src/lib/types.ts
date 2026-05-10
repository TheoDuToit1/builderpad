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

export interface Project {
  id: string;
  name: string;
  isPublic: boolean;
  notes: Note[];
  phases: Phase[];
  todos?: Todo[];
  files?: ProjectFile[];
  logo?: string;
  favicon?: string;
  createdAt: number;
  updatedAt: number;
}
