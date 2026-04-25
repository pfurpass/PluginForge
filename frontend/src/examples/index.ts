import type { Platform, Project } from '../types';
import { PLATFORM_DEFAULT_API } from '../types';
import { t } from '../i18n';
import { welcomeXml } from './welcome';
import { teleportXml } from './teleport';
import { minigameXml } from './minigame';

export interface Example {
  id: string;
  platform: Platform;
  title: () => string;
  description: () => string;
  build: () => Project;
}

function exampleProject(
  platform: Platform,
  meta: {
    name: string;
    author?: string;
    version?: string;
    description: string;
    mainPackage: string;
  },
  xml: string
): Project {
  const now = Date.now();
  return {
    platform,
    meta: {
      name: meta.name,
      author: meta.author ?? 'PluginForge',
      version: meta.version ?? '1.0.0',
      description: meta.description,
      mainPackage: meta.mainPackage,
      apiVersion: PLATFORM_DEFAULT_API[platform],
    },
    workspaceXml: xml,
    createdAt: now,
    updatedAt: now,
  };
}

export const EXAMPLES: Example[] = [
  {
    id: 'welcome',
    platform: 'paper',
    title: () => t('example_welcome'),
    description: () =>
      'Begrüßt jeden Spieler mit einer Nachricht und gibt Diamanten beim Joinen.',
    build: () =>
      exampleProject(
        'paper',
        {
          name: 'WelcomePlugin',
          description: 'Welcomes joining players',
          mainPackage: 'com.example.welcome',
        },
        welcomeXml
      ),
  },
  {
    id: 'teleport',
    platform: 'paper',
    title: () => t('example_teleport'),
    description: () =>
      'Definiert einen /spawn-Command, der den Spieler nach 0,100,0 teleportiert.',
    build: () =>
      exampleProject(
        'paper',
        {
          name: 'TeleportCommand',
          description: 'A /spawn command',
          mainPackage: 'com.example.teleport',
        },
        teleportXml
      ),
  },
  {
    id: 'minigame',
    platform: 'paper',
    title: () => t('example_minigame'),
    description: () =>
      'Mini-Spiel: bei Block-Abbau 50% Chance auf Blitzeinschlag.',
    build: () =>
      exampleProject(
        'paper',
        {
          name: 'LightningGame',
          description: 'Lightning mini-game',
          mainPackage: 'com.example.lightning',
        },
        minigameXml
      ),
  },
];
