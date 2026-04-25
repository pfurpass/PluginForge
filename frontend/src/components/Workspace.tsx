import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import { useProject } from '../store/project';
import { BlocklyEditor } from './BlocklyEditor';
import { CodePreview } from './CodePreview';
import { Toolbar } from './Toolbar';
import { generateMainJava } from '../blockly/generators';

const PANEL_KEY = 'mcpb_code_panel_width';
const PANEL_MIN = 320;
const PANEL_MAX_FRAC = 0.75; // never let the canvas drop below 25 % of the row
const PANEL_DEFAULT = 520;

export function Workspace() {
  const project = useProject((s) => s.project)!;
  const updateWorkspace = useProject((s) => s.updateWorkspace);

  const [xml, setXml] = useState(project.workspaceXml);
  const [code, setCode] = useState(
    '// Ziehe einen Event-Block (gelb) auf das Canvas — der generierte Code\n// erscheint hier live.'
  );
  const [showCode, setShowCode] = useState(true);

  const isEmpty = useMemo(() => {
    if (!xml) return true;
    // crude check: empty workspace XML is "<xml ...></xml>" with no <block>
    return !/\<block\s/.test(xml);
  }, [xml]);

  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        const ws = Blockly.getMainWorkspace();
        if (!ws) return;
        const java = generateMainJava(ws, project.platform, project.meta);
        setCode(java);
      } catch (e: any) {
        setCode('// Fehler: ' + (e?.message ?? String(e)));
      }
    }, 200);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [xml, project.platform, project.meta]);

  useEffect(() => {
    updateWorkspace(xml);
  }, [xml, updateWorkspace]);

  // Resizable code-panel width — persisted to localStorage.
  const rowRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    const stored = Number(localStorage.getItem(PANEL_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : PANEL_DEFAULT;
  });

  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startW: panelWidth };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [panelWidth]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const rowWidth = rowRef.current?.getBoundingClientRect().width ?? window.innerWidth;
      const delta = e.clientX - drag.startX;
      const next = Math.max(
        PANEL_MIN,
        Math.min(rowWidth * PANEL_MAX_FRAC, drag.startW - delta)
      );
      setPanelWidth(next);
      // Blockly needs to recompute its SVG size when the canvas width changes.
      const ws = Blockly.getMainWorkspace();
      if (ws) Blockly.svgResize(ws as Blockly.WorkspaceSvg);
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem(PANEL_KEY, String(Math.round(panelWidth)));
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [panelWidth]);

  const resetWidth = useCallback(() => {
    setPanelWidth(PANEL_DEFAULT);
    localStorage.setItem(PANEL_KEY, String(PANEL_DEFAULT));
    const ws = Blockly.getMainWorkspace();
    if (ws) Blockly.svgResize(ws as Blockly.WorkspaceSvg);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
      <Toolbar onToggleCode={() => setShowCode((s) => !s)} showCode={showCode} />
      <div ref={rowRef} className="flex-1 flex relative bg-[#1e1f22] min-w-0 min-h-0">
        <div className="flex-1 relative min-w-0">
          <BlocklyEditor
            // Remount on project swap (new project / load / JSON import) so
            // initialXml is re-applied; createdAt is stable during editing
            // (we only bump updatedAt on every change), so this doesn't reset
            // the editor while you work.
            key={project.createdAt}
            platform={project.platform}
            initialXml={project.workspaceXml}
            onChange={setXml}
          />
          {isEmpty && <EmptyHint />}
        </div>
        {showCode && (
          <>
            <div
              onMouseDown={onDragStart}
              onDoubleClick={resetWidth}
              title="Ziehen zum Verschieben · Doppelklick: Standard"
              className="group relative w-1 hover:w-1.5 cursor-col-resize bg-mc-border hover:bg-mc-accent transition-all flex-none"
              style={{ touchAction: 'none' }}
            >
              <div className="absolute inset-y-0 -left-2 -right-2" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-10 rounded-full bg-mc-muted/40 group-hover:bg-white/80 pointer-events-none transition-colors" />
            </div>
            <div className="flex-none" style={{ width: `${panelWidth}px` }}>
              <CodePreview code={code} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="text-center max-w-sm animate-pulse-soft">
        <div className="text-6xl mb-4 opacity-40">⚡</div>
        <div className="text-mc-text font-semibold text-lg mb-2">
          Leere Leinwand
        </div>
        <div className="text-mc-muted text-sm leading-relaxed">
          Klick links auf <span className="text-mc-yellow font-medium">⚡ Events</span> und ziehe
          einen Block hierher — z.B. <em>"wenn Spieler den Server betritt"</em>.
          <br />
          <br />
          Darunter snappen alle weiteren Aktionen wie Puzzleteile.
        </div>
      </div>
    </div>
  );
}
