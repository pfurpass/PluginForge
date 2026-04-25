import { useState } from 'react';
import { useProject, hasSavedProject } from '../store/project';
import { PLATFORM_API_VERSIONS, PLATFORM_LABELS, PLATFORM_DEFAULT_API } from '../types';
import type { Platform } from '../types';
import { t, getLang, setLang } from '../i18n';
import { EXAMPLES } from '../examples';
import type { Project } from '../types';

export function StartScreen() {
  const newProject = useProject((s) => s.newProject);
  const loadLocal = useProject((s) => s.loadLocal);
  const setProject = useProject((s) => s.setProject);
  const [showSetup, setShowSetup] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [, force] = useState(0);

  const switchLang = (l: 'de' | 'en') => {
    setLang(l);
    force((n) => n + 1);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3 text-white">{t('app_title')}</h1>
          <p className="text-mc-muted text-lg">{t('app_subtitle')}</p>
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => switchLang('de')}
            className={`px-3 py-1 rounded text-xs ${getLang() === 'de' ? 'bg-mc-accent text-white' : 'bg-mc-panel text-mc-muted'}`}
          >
            DE
          </button>
          <button
            onClick={() => switchLang('en')}
            className={`px-3 py-1 rounded text-xs ${getLang() === 'en' ? 'bg-mc-accent text-white' : 'bg-mc-panel text-mc-muted'}`}
          >
            EN
          </button>
        </div>

        {!showSetup && !showExamples && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowSetup(true)}
              className="bg-mc-accent hover:bg-mc-accent2 text-white p-6 rounded-lg font-semibold text-left transition-colors"
            >
              <div className="text-2xl mb-2">+</div>
              <div>{t('start_new')}</div>
            </button>
            <button
              onClick={() => loadLocal()}
              disabled={!hasSavedProject()}
              className="bg-mc-panel hover:bg-mc-panel2 text-white p-6 rounded-lg font-semibold text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">↻</div>
              <div>{t('start_load')}</div>
            </button>
            <button
              onClick={() => setShowExamples(true)}
              className="bg-mc-panel hover:bg-mc-panel2 text-white p-6 rounded-lg font-semibold text-left transition-colors"
            >
              <div className="text-2xl mb-2">★</div>
              <div>{t('start_examples')}</div>
            </button>
          </div>
        )}

        {showSetup && <SetupForm onCancel={() => setShowSetup(false)} onCreate={newProject} />}
        {showExamples && (
          <ExamplesList
            onCancel={() => setShowExamples(false)}
            onPick={(p) => setProject(p)}
          />
        )}
      </div>
    </div>
  );
}

function SetupForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (platform: Platform, meta: any) => void;
}) {
  const [platform, setPlatform] = useState<Platform>('paper');
  const [apiVersion, setApiVersion] = useState(PLATFORM_DEFAULT_API.paper);
  const [name, setName] = useState('MyPlugin');
  const [author, setAuthor] = useState('me');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('A plugin built with PluginForge');
  const [pkg, setPkg] = useState('com.example.myplugin');

  return (
    <div className="bg-mc-panel rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{t('setup_title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={t('setup_platform')}>
          <select
            value={platform}
            onChange={(e) => {
              const p = e.target.value as Platform;
              setPlatform(p);
              setApiVersion(PLATFORM_DEFAULT_API[p]);
            }}
            className="bg-mc-panel2 border border-mc-border rounded px-3 py-2 w-full text-white"
          >
            {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('setup_api_version')}>
          <select
            value={apiVersion}
            onChange={(e) => setApiVersion(e.target.value)}
            className="bg-mc-panel2 border border-mc-border rounded px-3 py-2 w-full text-white"
          >
            {PLATFORM_API_VERSIONS[platform].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('setup_plugin_name')}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-mc-panel2 border border-mc-border rounded px-3 py-2 w-full text-white"
          />
        </Field>
        <Field label={t('setup_author')}>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="bg-mc-panel2 border border-mc-border rounded px-3 py-2 w-full text-white"
          />
        </Field>
        <Field label={t('setup_version')}>
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="bg-mc-panel2 border border-mc-border rounded px-3 py-2 w-full text-white"
          />
        </Field>
        <Field label={t('setup_package')}>
          <input
            value={pkg}
            onChange={(e) => setPkg(e.target.value)}
            className="bg-mc-panel2 border border-mc-border rounded px-3 py-2 w-full text-white font-mono text-sm"
          />
        </Field>
        <Field label={t('setup_description')} className="md:col-span-2">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="bg-mc-panel2 border border-mc-border rounded px-3 py-2 w-full text-white"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-mc-panel2 hover:bg-mc-border rounded text-white"
        >
          {t('setup_cancel')}
        </button>
        <button
          onClick={() =>
            onCreate(platform, {
              name,
              author,
              version,
              description,
              mainPackage: pkg,
              apiVersion,
            })
          }
          className="px-4 py-2 bg-mc-accent hover:bg-mc-accent2 rounded text-white font-semibold"
        >
          {t('setup_create')}
        </button>
      </div>
    </div>
  );
}

function ExamplesList({
  onCancel,
  onPick,
}: {
  onCancel: () => void;
  onPick: (p: Project) => void;
}) {
  return (
    <div className="bg-mc-panel rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{t('start_examples')}</h2>
      <div className="grid grid-cols-1 gap-3">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onPick(ex.build())}
            className="text-left bg-mc-panel2 hover:bg-mc-border rounded p-4 transition-colors"
          >
            <div className="font-semibold text-white">{ex.title()}</div>
            <div className="text-sm text-mc-muted mt-1">{ex.description()}</div>
            <div className="text-xs text-mc-accent mt-2">
              {PLATFORM_LABELS[ex.platform]}
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-mc-panel2 hover:bg-mc-border rounded text-white"
        >
          {t('setup_cancel')}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm text-mc-muted mb-1">{label}</span>
      {children}
    </label>
  );
}
