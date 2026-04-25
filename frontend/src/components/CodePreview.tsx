import { useEffect, useMemo, useState } from 'react';
import { t } from '../i18n';

interface Props {
  code: string;
}

export function CodePreview({ code }: Props) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(id);
  }, [copied]);

  const html = useMemo(() => highlightJava(code), [code]);
  const lines = useMemo(() => code.split('\n').length, [code]);

  return (
    <div className="flex flex-col h-full min-w-0 bg-[#1e1f22] border-l border-mc-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-mc-border bg-[#232529] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-mc-green animate-pulse shrink-0" />
          <div className="text-sm font-semibold text-white truncate">{t('preview_title')}</div>
          <span className="text-xs text-mc-muted ml-2 shrink-0">{lines} Zeilen</span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
          }}
          className="text-xs px-3 py-1.5 bg-mc-accent hover:bg-mc-accent2 rounded-md text-white font-medium transition-colors shrink-0 ml-2"
        >
          {copied ? '✓ ' + t('copied') : '⎘ ' + t('copy')}
        </button>
      </div>
      <div className="flex-1 min-w-0 min-h-0 overflow-auto">
        <pre className="m-0 p-4 text-[12.5px] leading-[1.65] font-mono whitespace-pre">
          <code
            className="code-java"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </pre>
      </div>
    </div>
  );
}

const KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
  'package', 'private', 'protected', 'public', 'return', 'short', 'static',
  'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null',
  'var', 'record', 'sealed', 'non-sealed', 'permits', 'yield',
]);

const TYPES = new Set([
  'String', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Object',
  'Component', 'Material', 'Location', 'ItemStack', 'Player', 'Sound',
  'GameMode', 'EntityType', 'Bukkit', 'JavaPlugin', 'Listener', 'EventHandler',
  'PlayerJoinEvent', 'PlayerQuitEvent', 'BlockBreakEvent', 'BlockPlaceEvent',
  'PlayerMoveEvent', 'PlayerDeathEvent', 'AsyncChatEvent', 'AsyncPlayerChatEvent',
  'CommandSender', 'Command', 'CommandExecutor', 'TimeUnit', 'ProxyServer',
  'TextComponent', 'Plugin', 'ProxyInitializeEvent', 'PostLoginEvent',
  'PlainTextComponentSerializer', 'Math', 'Override', 'Subscribe', 'Inject',
  'ProxiedPlayer', 'Logger',
]);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightJava(src: string): string {
  if (!src) return '';
  const out: string[] = [];
  let i = 0;
  const n = src.length;

  while (i < n) {
    const c = src[i];

    // Block comment
    if (c === '/' && src[i + 1] === '*') {
      let j = i + 2;
      while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++;
      j = Math.min(j + 2, n);
      out.push(`<span class="tk-cm">${escapeHtml(src.slice(i, j))}</span>`);
      i = j;
      continue;
    }
    // Line comment
    if (c === '/' && src[i + 1] === '/') {
      let j = i;
      while (j < n && src[j] !== '\n') j++;
      out.push(`<span class="tk-cm">${escapeHtml(src.slice(i, j))}</span>`);
      i = j;
      continue;
    }
    // String literal
    if (c === '"') {
      let j = i + 1;
      while (j < n && src[j] !== '"') {
        if (src[j] === '\\' && j + 1 < n) j += 2;
        else j++;
      }
      j = Math.min(j + 1, n);
      out.push(`<span class="tk-str">${escapeHtml(src.slice(i, j))}</span>`);
      i = j;
      continue;
    }
    // Annotation
    if (c === '@' && /[A-Za-z]/.test(src[i + 1] ?? '')) {
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      out.push(`<span class="tk-an">${escapeHtml(src.slice(i, j))}</span>`);
      i = j;
      continue;
    }
    // Number
    if (/[0-9]/.test(c) && (i === 0 || !/[A-Za-z_]/.test(src[i - 1]))) {
      let j = i;
      while (j < n && /[0-9.eELfFdD_]/.test(src[j])) j++;
      out.push(`<span class="tk-num">${escapeHtml(src.slice(i, j))}</span>`);
      i = j;
      continue;
    }
    // Identifier / keyword
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++;
      const word = src.slice(i, j);
      // Detect method call: word followed by '('
      const next = src[j];
      let cls = '';
      if (KEYWORDS.has(word)) cls = 'tk-kw';
      else if (TYPES.has(word)) cls = 'tk-type';
      else if (next === '(') cls = 'tk-fn';
      else if (/^[A-Z]/.test(word)) cls = 'tk-type';

      if (cls) out.push(`<span class="${cls}">${escapeHtml(word)}</span>`);
      else out.push(escapeHtml(word));
      i = j;
      continue;
    }

    out.push(escapeHtml(c));
    i++;
  }

  return out.join('');
}
