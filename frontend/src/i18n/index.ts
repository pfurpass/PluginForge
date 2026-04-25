import { de } from './de';
import { en } from './en';

export type Lang = 'de' | 'en';
export type Dict = typeof de;

const DICTS: Record<Lang, Dict> = { de, en };

let current: Lang = (localStorage.getItem('mcpb_lang') as Lang) || 'de';

export function setLang(l: Lang) {
  current = l;
  localStorage.setItem('mcpb_lang', l);
  // Block labels are baked into Blockly at module init, so a full reload is
  // the simplest way to apply a language switch consistently.
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

export function getLang(): Lang {
  return current;
}

export function t(key: keyof Dict): string {
  return DICTS[current][key] ?? DICTS.de[key] ?? String(key);
}
