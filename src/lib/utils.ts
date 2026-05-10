import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate base64 token using lz-string for sharing
import LZString from 'lz-string';
import { Project } from './types';

export function encodeProjectToToken(project: Project): string {
  const json = JSON.stringify(project);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeTokenToProject(token: string): Project | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(token);
    if (!json) return null;
    return JSON.parse(json) as Project;
  } catch (e) {
    console.error('Failed to decode project token', e);
    return null;
  }
}
