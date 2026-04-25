import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type * as Blockly from 'blockly/core';
import type { Platform, PluginMeta } from '../types';
import { generateGeneratorOutput } from '../blockly/generators';
import { assembleMainJava, sanitizeClass } from '../blockly/generators/assemble';
import {
  pomXml,
  pluginYml,
  configYml,
  readme,
} from './templates';

export async function buildProjectZip(
  workspace: Blockly.Workspace,
  platform: Platform,
  meta: PluginMeta
): Promise<Blob> {
  const out = generateGeneratorOutput(workspace, platform);
  const java = assembleMainJava(platform, meta, out);

  const zip = new JSZip();
  const artifactId = meta.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const root = artifactId;

  zip.file(`${root}/pom.xml`, pomXml(platform, meta));
  zip.file(`${root}/README.md`, readme(meta, platform));

  const className = sanitizeClass(meta.name);
  const javaPath = meta.mainPackage.replace(/\./g, '/');
  zip.file(`${root}/src/main/java/${javaPath}/${className}.java`, java);

  // resources
  if (platform === 'paper' || platform === 'spigot') {
    zip.file(`${root}/src/main/resources/plugin.yml`, pluginYml(platform, meta, out));
    zip.file(`${root}/src/main/resources/config.yml`, configYml());
  } else if (platform === 'velocity') {
    // Velocity uses @Plugin annotation, no plugin.yml needed
  } else if (platform === 'bungee') {
    zip.file(`${root}/src/main/resources/plugin.yml`, pluginYml(platform, meta, out));
  }

  // .gitignore
  zip.file(
    `${root}/.gitignore`,
    `target/\n.idea/\n*.iml\n.vscode/\n.classpath\n.project\n.settings/\n`
  );

  return zip.generateAsync({ type: 'blob' });
}

export async function downloadProjectZip(
  workspace: Blockly.Workspace,
  platform: Platform,
  meta: PluginMeta
) {
  const blob = await buildProjectZip(workspace, platform, meta);
  const artifactId = meta.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  saveAs(blob, `${artifactId}-source.zip`);
}
