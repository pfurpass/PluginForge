import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as De from 'blockly/msg/de';
import * as En from 'blockly/msg/en';
import { defineBlocks } from '../blockly/blocks';
import { buildToolbox } from '../blockly/toolbox';
import { getLang } from '../i18n';
import type { Platform } from '../types';

let blocksDefined = false;

interface Props {
  platform: Platform;
  initialXml: string;
  onChange: (xml: string) => void;
}

export function BlocklyEditor({ platform, initialXml, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!blocksDefined) {
      Blockly.setLocale((getLang() === 'en' ? En : De) as any);
      defineBlocks();
      // Lock the flyout (toolbox preview panel) to scale 1 — by default it
      // mirrors the workspace zoom, which makes blocks in the side panel
      // grow/shrink when the user zooms the canvas.
      const VFly = (Blockly as any).VerticalFlyout;
      const HFly = (Blockly as any).HorizontalFlyout;
      const FLYOUT_SCALE = 0.75;
      if (VFly?.prototype) VFly.prototype.getFlyoutScale = function () { return FLYOUT_SCALE; };
      if (HFly?.prototype) HFly.prototype.getFlyoutScale = function () { return FLYOUT_SCALE; };
      blocksDefined = true;
    }

    const theme = Blockly.Theme.defineTheme('mcDark', {
      name: 'mcDark',
      base: Blockly.Themes.Classic,
      componentStyles: {
        workspaceBackgroundColour: '#1e1f22',
        toolboxBackgroundColour: '#232529',
        toolboxForegroundColour: '#e3e5e8',
        flyoutBackgroundColour: '#232529',
        flyoutForegroundColour: '#e3e5e8',
        flyoutOpacity: 1,
        scrollbarColour: '#4f535a',
        insertionMarkerColour: '#5865f2',
        insertionMarkerOpacity: 0.45,
        markerColour: '#5865f2',
        cursorColour: '#5865f2',
        scrollbarOpacity: 0.6,
        selectedGlowColour: '#5865f2',
        selectedGlowOpacity: 0.5,
      },
      fontStyle: {
        family: "'Inter', system-ui, sans-serif",
        weight: '500',
        size: 12,
      },
    });

    const ws = Blockly.inject(ref.current, {
      toolbox: buildToolbox(platform),
      grid: { spacing: 24, length: 1, colour: '#2c2e33', snap: true },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.95,
        maxScale: 2,
        minScale: 0.4,
        scaleSpeed: 1.1,
        pinch: true,
      },
      trashcan: true,
      sounds: false,
      renderer: 'zelos',
      theme,
      move: { scrollbars: true, drag: true, wheel: false },
    });

    if (initialXml && initialXml.length > 30) {
      try {
        const dom = Blockly.utils.xml.textToDom(initialXml);
        Blockly.Xml.domToWorkspace(dom, ws);
      } catch (e) {
        console.warn('Failed to load workspace XML', e);
      }
    }

    // Track which event hat blocks are present so we can append matching
    // context-categories ("Join-Event", "Inv-Click-Event", …) to the toolbox.
    let activeEvents = new Set<string>();
    const refreshActiveEvents = () => {
      const next = new Set<string>();
      for (const b of ws.getTopBlocks(false)) {
        if (b.type.startsWith('event_')) next.add(b.type);
      }
      // Cheap set-equality: same size + every member present in old.
      if (
        next.size !== activeEvents.size ||
        ![...next].every((x) => activeEvents.has(x))
      ) {
        activeEvents = next;
        ws.updateToolbox(buildToolbox(platform, activeEvents));
      }
    };

    const listener = (e: any) => {
      // Only re-scan top-blocks on structural events to avoid useless work.
      if (
        e?.type === Blockly.Events.BLOCK_CREATE ||
        e?.type === Blockly.Events.BLOCK_DELETE ||
        e?.type === Blockly.Events.BLOCK_MOVE
      ) {
        refreshActiveEvents();
      }
      const xml = Blockly.Xml.workspaceToDom(ws);
      onChange(Blockly.Xml.domToText(xml));
    };
    ws.addChangeListener(listener);
    // Initial pass after XML load so existing event blocks light up their cats.
    refreshActiveEvents();

    const onResize = () => Blockly.svgResize(ws);
    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      window.removeEventListener('resize', onResize);
      ws.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  return <div ref={ref} className="absolute inset-0" />;
}
