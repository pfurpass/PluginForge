import * as Blockly from 'blockly/core';
import type { Platform, PluginMeta } from '../../types';
import { createGenerator } from './base';
import { assembleMainJava, sanitizeClass } from './assemble';

export function generateMainJava(
  workspace: Blockly.Workspace,
  platform: Platform,
  meta: PluginMeta
): string {
  const gen = createGenerator(platform);
  const out = gen.generate(workspace);
  return assembleMainJava(platform, meta, out);
}

export function generateGeneratorOutput(
  workspace: Blockly.Workspace,
  platform: Platform
) {
  return createGenerator(platform).generate(workspace);
}

export { sanitizeClass };
