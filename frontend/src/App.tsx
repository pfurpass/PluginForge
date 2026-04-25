import { useEffect, useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { Workspace } from './components/Workspace';
import { useProject } from './store/project';

export default function App() {
  const project = useProject((s) => s.project);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    setBooted(true);
  }, []);

  if (!booted) return null;

  return (
    <div className="h-screen w-screen flex flex-col bg-mc-bg text-mc-text overflow-hidden">
      {project ? <Workspace /> : <StartScreen />}
    </div>
  );
}
