import { create } from 'zustand';
import type { Project, Platform, PluginMeta } from '../types';
import { PLATFORM_DEFAULT_API } from '../types';

const STORAGE_KEY = 'mcpb_project';

interface ProjectState {
  project: Project | null;
  setProject: (p: Project | null) => void;
  newProject: (platform: Platform, meta: PluginMeta) => void;
  updateWorkspace: (xml: string) => void;
  updateMeta: (meta: Partial<PluginMeta>) => void;
  saveLocal: () => void;
  loadLocal: () => Project | null;
  clearLocal: () => void;
}

export const useProject = create<ProjectState>((set, get) => ({
  project: null,
  setProject: (p) => set({ project: p }),
  newProject: (platform, meta) => {
    const now = Date.now();
    const project: Project = {
      platform,
      meta: { ...meta, apiVersion: meta.apiVersion || PLATFORM_DEFAULT_API[platform] },
      workspaceXml: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
      createdAt: now,
      updatedAt: now,
    };
    set({ project });
  },
  updateWorkspace: (xml) => {
    const p = get().project;
    if (!p) return;
    set({ project: { ...p, workspaceXml: xml, updatedAt: Date.now() } });
  },
  updateMeta: (meta) => {
    const p = get().project;
    if (!p) return;
    set({ project: { ...p, meta: { ...p.meta, ...meta }, updatedAt: Date.now() } });
  },
  saveLocal: () => {
    const p = get().project;
    if (!p) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  },
  loadLocal: () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const p = JSON.parse(raw) as Project;
      set({ project: p });
      return p;
    } catch {
      return null;
    }
  },
  clearLocal: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ project: null });
  },
}));

export function hasSavedProject(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}
