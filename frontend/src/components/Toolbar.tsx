import { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import { saveAs } from 'file-saver';
import { useProject } from '../store/project';
import { t } from '../i18n';
import { downloadProjectZip, buildProjectZip } from '../export/projectZip';
import { PLATFORM_LABELS } from '../types';

interface Props {
  onToggleCode: () => void;
  showCode: boolean;
}

// Build-service base URL. In docker-compose the frontend nginx reverse-proxies
// /build → backend, so we use a relative URL (empty base). For local dev the
// Vite server has no proxy, so default to the backend's localhost port.
const BACKEND_URL = (
  (import.meta as any).env?.VITE_BACKEND_URL ?? 'http://localhost:8787'
).replace(/\/+$/, '');

export function Toolbar({ onToggleCode, showCode }: Props) {
  const project = useProject((s) => s.project)!;
  const setProject = useProject((s) => s.setProject);
  const saveLocal = useProject((s) => s.saveLocal);
  const [busy, setBusy] = useState<null | string>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [buildModal, setBuildModal] = useState<null | {
    kind: 'no-backend' | 'failed';
    detail?: string;
  }>(null);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Probe the backend once so the JAR button can show its status
  useEffect(() => {
    const ctl = new AbortController();
    fetch(`${BACKEND_URL}/health`, { signal: ctl.signal })
      .then((r) => setBackendOk(r.ok))
      .catch(() => setBackendOk(false));
    return () => ctl.abort();
  }, []);

  const flash = (kind: 'ok' | 'err', text: string) => {
    setMsg({ kind, text });
    setTimeout(() => setMsg(null), 2500);
  };

  const handleZip = async () => {
    setBusy('zip');
    try {
      const ws = Blockly.getMainWorkspace();
      if (!ws) return;
      await downloadProjectZip(ws, project.platform, project.meta);
      flash('ok', '✓ ZIP heruntergeladen');
    } catch (e: any) {
      flash('err', 'Fehler: ' + (e?.message ?? String(e)));
    } finally {
      setBusy(null);
    }
  };

  const handleBuildJar = async () => {
    if (backendOk === false) {
      setBuildModal({ kind: 'no-backend' });
      return;
    }
    setBusy('jar');
    try {
      const ws = Blockly.getMainWorkspace();
      if (!ws) return;
      const blob = await buildProjectZip(ws, project.platform, project.meta);

      const fd = new FormData();
      fd.append('source', new File([blob], 'src.zip', { type: 'application/zip' }));
      fd.append('platform', project.platform);

      const res = await fetch(`${BACKEND_URL}/build`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const err = await res.text();
        setBuildModal({ kind: 'failed', detail: err });
        return;
      }
      const jar = await res.blob();
      const artifactId = project.meta.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      saveAs(jar, `${artifactId}-${project.meta.version}.jar`);
      flash('ok', '✓ ' + t('build_success'));
    } catch (e: any) {
      // TypeError: Failed to fetch → backend down
      const m = e?.message ?? String(e);
      if (m.includes('Failed to fetch') || m.includes('NetworkError')) {
        setBackendOk(false);
        setBuildModal({ kind: 'no-backend' });
      } else {
        setBuildModal({ kind: 'failed', detail: m });
      }
    } finally {
      setBusy(null);
    }
  };

  const handleSave = () => {
    saveLocal();
    flash('ok', '✓ Gespeichert');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `${project.meta.name}.mcpb.json`);
  };

  const handleImport = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      setProject(parsed);
      flash('ok', '✓ Importiert');
    } catch {
      flash('err', 'Ungültige Datei');
    }
  };

  return (
    <>
      <div className="bg-gradient-to-b from-[#26282d] to-[#1f2125] border-b border-mc-border px-4 py-2.5 flex items-center gap-2 shadow-md">
        <button
          onClick={() => useProject.getState().setProject(null)}
          className="text-sm px-3 py-1.5 bg-[#2f3239] hover:bg-[#3a3d44] rounded-md text-mc-text border border-transparent hover:border-mc-border transition-all"
        >
          ← {t('toolbar_back')}
        </button>

        <div className="flex items-center gap-3 ml-3 pl-3 border-l border-mc-border">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-mc-accent to-mc-accent2 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {project.meta.name.charAt(0).toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-white font-semibold text-sm">{project.meta.name}</div>
            <div className="text-xs text-mc-muted">
              {PLATFORM_LABELS[project.platform]} · v{project.meta.apiVersion}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {msg && (
          <div
            className={`text-xs px-3 py-1.5 rounded-md font-medium ${
              msg.kind === 'ok'
                ? 'bg-mc-green/20 text-mc-green'
                : 'bg-mc-red/20 text-mc-red'
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="flex items-center gap-1 ml-2">
          <IconBtn title={t('toolbar_save')} onClick={handleSave}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          </IconBtn>
          <IconBtn title={t('toolbar_export_json')} onClick={handleExportJson}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </IconBtn>
          <IconBtn title={t('toolbar_import_json')} onClick={handleImport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </IconBtn>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.mcpb.json"
          className="hidden"
          onChange={handleFile}
        />

        <button
          onClick={onToggleCode}
          className={`text-sm px-3 py-1.5 rounded-md font-medium transition-all ml-2 ${
            showCode
              ? 'bg-mc-accent text-white shadow-md shadow-mc-accent/20'
              : 'bg-[#2f3239] hover:bg-[#3a3d44] text-mc-text'
          }`}
        >
          {'< />'} {t('toolbar_show_code')}
        </button>
        <button
          onClick={handleZip}
          disabled={!!busy}
          className="text-sm px-4 py-1.5 bg-[#2f3239] hover:bg-[#3a3d44] rounded-md text-white font-medium disabled:opacity-60 transition-all border border-mc-border"
        >
          {busy === 'zip' ? '...' : '⬇  ' + t('toolbar_download_zip')}
        </button>
        <button
          onClick={handleBuildJar}
          disabled={!!busy}
          className={`relative text-sm px-4 py-1.5 rounded-md text-white font-semibold disabled:opacity-60 transition-all shadow-md ${
            backendOk === false
              ? 'bg-mc-yellow/80 hover:bg-mc-yellow text-black shadow-mc-yellow/20'
              : 'bg-mc-green hover:opacity-90 shadow-mc-green/30'
          }`}
          title={
            backendOk === false
              ? 'Build-Service nicht erreichbar — klick für Anleitung'
              : 'JAR auf dem Build-Service kompilieren'
          }
        >
          {busy === 'jar' ? (
            <span className="flex items-center gap-2">
              <Spinner /> {t('building')}
            </span>
          ) : (
            <>⚒  {t('toolbar_build_jar')}</>
          )}
          {backendOk === null && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-mc-muted" />
          )}
          {backendOk === true && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white shadow-sm" />
          )}
        </button>
      </div>

      {buildModal && (
        <BuildErrorModal
          modal={buildModal}
          onClose={() => setBuildModal(null)}
          onDownloadZipFallback={async () => {
            setBuildModal(null);
            await handleZip();
          }}
        />
      )}
    </>
  );
}

function IconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 text-mc-muted hover:text-white hover:bg-[#2f3239] rounded-md transition-colors"
    >
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function BuildErrorModal({
  modal,
  onClose,
  onDownloadZipFallback,
}: {
  modal: { kind: 'no-backend' | 'failed'; detail?: string };
  onClose: () => void;
  onDownloadZipFallback: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-mc-panel border border-mc-border rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-mc-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                modal.kind === 'no-backend' ? 'bg-mc-yellow/20' : 'bg-mc-red/20'
              }`}
            >
              <span className={modal.kind === 'no-backend' ? 'text-mc-yellow' : 'text-mc-red'}>
                {modal.kind === 'no-backend' ? '⚠' : '✕'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">
              {modal.kind === 'no-backend'
                ? 'Build-Service nicht erreichbar'
                : 'Build fehlgeschlagen'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-mc-muted hover:text-white text-xl leading-none w-8 h-8 rounded hover:bg-[#2f3239]"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {modal.kind === 'no-backend' ? (
            <>
              <p className="text-mc-text leading-relaxed">
                Der lokale Build-Service auf{' '}
                <code className="bg-[#1e1f22] px-1.5 py-0.5 rounded text-mc-accent text-sm">
                  localhost:8787
                </code>{' '}
                läuft nicht. Du hast zwei Optionen:
              </p>

              <div className="bg-[#1e1f22] border border-mc-border rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-mc-muted mb-2">
                    Option 1 · Schnell
                  </div>
                  <div className="text-sm text-white font-medium mb-1">
                    Projekt-ZIP herunterladen + lokal bauen
                  </div>
                  <pre className="text-xs bg-[#0f1012] rounded p-2 mt-2 text-mc-text overflow-x-auto">
{`unzip ${'<dein-plugin>'}-source.zip
cd ${'<dein-plugin>'}
mvn package
# → target/${'<dein-plugin>'}-1.0.0.jar`}
                  </pre>
                  <button
                    onClick={onDownloadZipFallback}
                    className="mt-3 px-4 py-2 bg-mc-accent hover:bg-mc-accent2 rounded-md text-white text-sm font-medium"
                  >
                    ⬇  Projekt-ZIP jetzt herunterladen
                  </button>
                </div>
              </div>

              <div className="bg-[#1e1f22] border border-mc-border rounded-lg p-4">
                <div className="text-xs uppercase tracking-wide text-mc-muted mb-2">
                  Option 2 · Build-Service starten
                </div>
                <div className="text-sm text-white font-medium mb-2">
                  Im Repo-Root in einem zweiten Terminal:
                </div>
                <pre className="text-xs bg-[#0f1012] rounded p-2 text-mc-text overflow-x-auto">
{`cd backend
npm install
npm start
# → läuft auf :8787`}
                </pre>
                <div className="text-xs text-mc-muted mt-2">
                  Voraussetzung: Java 21 und Maven 3.9+ auf PATH.
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-mc-text">
                Der Build-Service hat einen Fehler zurückgegeben. Maven-Ausgabe:
              </p>
              <pre className="text-xs bg-[#0f1012] border border-mc-border rounded-lg p-3 text-mc-text overflow-auto max-h-80 whitespace-pre-wrap">
                {modal.detail || 'Unbekannter Fehler.'}
              </pre>
            </>
          )}
        </div>

        <div className="px-6 py-3 border-t border-mc-border bg-[#1e1f22] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2f3239] hover:bg-[#3a3d44] rounded-md text-white text-sm"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
