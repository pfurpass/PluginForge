export type Platform = 'paper' | 'spigot' | 'velocity' | 'bungee';

export interface PluginMeta {
  name: string;
  author: string;
  version: string;
  description: string;
  mainPackage: string;
  apiVersion: string;
}

export interface Project {
  platform: Platform;
  meta: PluginMeta;
  workspaceXml: string;
  createdAt: number;
  updatedAt: number;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  paper: 'Paper',
  spigot: 'Spigot',
  velocity: 'Velocity',
  bungee: 'BungeeCord',
};

export const PLATFORM_API_VERSIONS: Record<Platform, string[]> = {
  paper: ['1.21', '1.20.6', '1.20.4'],
  spigot: ['1.21', '1.20.6', '1.20.4', '1.19.4'],
  velocity: ['3.3.0', '3.2.0'],
  bungee: ['1.21', '1.20'],
};

export const PLATFORM_DEFAULT_API: Record<Platform, string> = {
  paper: '1.21',
  spigot: '1.21',
  velocity: '3.3.0',
  bungee: '1.21',
};
