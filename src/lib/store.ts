import { useState, useEffect } from 'react';
import { Project, Note, Phase } from './types';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';

const STORAGE_KEY = 'builderpad_projects';

class EventEmitter {
  private listeners: Set<() => void> = new Set();
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const storeEmitter = new EventEmitter();
const channel = new BroadcastChannel('builderpad_sync');
channel.onmessage = () => {
  loadFromDB();
};

let memoryProjects: Project[] = [];
let isDbLoaded = false;

async function loadFromDB() {
  try {
    const old = localStorage.getItem(STORAGE_KEY);
    if (old) {
      try {
        const parsed = JSON.parse(old);
        await localforage.setItem(STORAGE_KEY, parsed);
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    const data = await localforage.getItem<Project[]>(STORAGE_KEY);
    memoryProjects = data || [];
    isDbLoaded = true;
    storeEmitter.emit();
  } catch (e) {
    console.error('Failed to load from DB', e);
    isDbLoaded = true;
    storeEmitter.emit();
  }
}

// Initial load
loadFromDB();

async function saveToDB(projects: Project[]) {
  try {
    memoryProjects = projects;
    storeEmitter.emit();
    await localforage.setItem(STORAGE_KEY, projects);
    channel.postMessage('sync');
  } catch (err) {
    console.error('Failed to save to DB', err);
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      alert("Storage quota exceeded. Please delete some files or projects.");
    } else if (String(err).includes('QuotaExceeded')) {
      alert("Storage quota exceeded. Please delete some files or projects.");
    }
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(memoryProjects);
  const [isLoaded, setIsLoaded] = useState(isDbLoaded);

  useEffect(() => {
    const handleSync = () => {
      setProjects(memoryProjects);
      setIsLoaded(isDbLoaded);
    };
    
    // ensure latest state if it loaded before effect
    handleSync();

    const unsubscribe = storeEmitter.subscribe(handleSync);
    return () => unsubscribe();
  }, []);

  const createProject = (name: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      isPublic: false,
      notes: [],
      phases: [],
      todos: [],
      files: [],
      credentials: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    saveToDB([...memoryProjects, newProject]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updated = memoryProjects.map(p => {
      if (p.id === id) {
        return { ...p, ...updates, updatedAt: Date.now() };
      }
      return p;
    });
    saveToDB(updated);
  };

  const deleteProject = (id: string) => {
    saveToDB(memoryProjects.filter(p => p.id !== id));
  };
  
  const getProject = (id: string) => memoryProjects.find(p => p.id === id);

  return { projects, createProject, updateProject, deleteProject, getProject, isLoaded };
}
