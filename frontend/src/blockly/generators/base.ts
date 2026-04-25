import * as Blockly from 'blockly/core';
import type { Platform } from '../../types';

/**
 * Build a Java code generator for a given platform.
 * The generator walks the Blockly workspace and produces a class body
 * (event handler methods, command-executor methods, helper fields).
 */
export interface GeneratorOutput {
  imports: Set<string>;
  fields: string[];
  listeners: string[]; // event handler methods
  commands: CommandDef[];
  onEnable: string[];
  onDisable: string[];
  helpers: Set<string>; // ids: 'withMeta' | 'withItem'
}

export interface CommandDef {
  name: string;
  description: string;
  body: string; // command executor body
}

export type ScopeFrame =
  | { kind: 'event'; playerExpr: string }
  | { kind: 'command' };

export interface GenContext {
  out: GeneratorOutput;
  platform: Platform;
  uid: () => string;
  scope: ScopeFrame[];
}

const ORDER_NONE = 99;

function quoteString(s: string): string {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

export function createGenerator(platform: Platform): {
  generate: (ws: Blockly.Workspace) => GeneratorOutput;
} {
  const generator = new Blockly.Generator('Java_' + platform);

  // Set up indentation
  (generator as any).INDENT = '    ';

  // Output container — refilled per generation
  let ctx: GenContext;

  generator.scrub_ = function (block: any, code: string, opt_thisOnly?: boolean) {
    const next = block.nextConnection && block.nextConnection.targetBlock();
    let nextCode = '';
    if (next && !opt_thisOnly) {
      nextCode = (generator as any).blockToCode(next);
    }
    return code + nextCode;
  };

  // Coerce any expression to a Java String at the call site. If the expression
  // is already a quoted literal we pass it through; otherwise wrap with
  // String.valueOf(...) so Number/Boolean/Object inputs become strings.
  const asStr = (expr: string): string => {
    const t = expr.trim();
    if (t === '""' || (t.startsWith('"') && t.endsWith('"') && !t.slice(1, -1).includes('"')))
      return expr;
    return `String.valueOf(${expr})`;
  };
  // Coerce any expression to a Java double at the call site so users can plug
  // String reporters / variables / config-values into Number slots.
  const asNum = (expr: string): string => {
    const t = expr.trim();
    // Numeric literal — no wrap needed.
    if (/^-?\d+(\.\d+)?[fFdDlL]?$/.test(t)) return expr;
    // Already a primitive cast — pass through.
    if (/^\((int|long|double|float|short|byte)\)/.test(t)) return expr;
    ctx.out.helpers.add('num');
    return `__num(${expr})`;
  };

  // Helper for generators to emit value blocks
  const valueOrDefault = (
    block: Blockly.Block,
    name: string,
    def: string,
    type: 'String' | 'Number' | 'Player' | 'Boolean' | 'any' = 'any'
  ): string => {
    const v = (generator as any).valueToCode(block, name, ORDER_NONE);
    if (v && v.length) {
      // For String contexts, coerce non-string inputs (Numbers, Booleans, etc.)
      // automatically so users can plug any reporter into "text" slots.
      if (type === 'String') return asStr(v);
      // For Number contexts, wrap unknown expressions in __num(...) so any
      // reporter (variables, config strings, item amounts, …) compiles.
      if (type === 'Number') return asNum(v);
      return v;
    }
    if (type === 'String') return '""';
    if (type === 'Number') return def || '0';
    if (type === 'Boolean') return 'false';
    if (type === 'Player') return defaultPlayerExpr();
    return def;
  };

  const stmt = (block: Blockly.Block, name: string): string => {
    return (generator as any).statementToCode(block, name) || '';
  };

  // Track whether we're currently generating inside an event handler or a
  // command executor, so context-sensitive readers (like "Spieler (Event)")
  // can resolve to the right symbol.
  const currentFrame = (): ScopeFrame | null =>
    ctx.scope[ctx.scope.length - 1] ?? null;
  const currentScope = (): 'event' | 'command' | null =>
    currentFrame()?.kind ?? null;
  const withEventScope = <T>(playerExpr: string, fn: () => T): T => {
    ctx.scope.push({ kind: 'event', playerExpr });
    try {
      return fn();
    } finally {
      ctx.scope.pop();
    }
  };
  const withCommandScope = <T>(fn: () => T): T => {
    ctx.scope.push({ kind: 'command' });
    try {
      return fn();
    } finally {
      ctx.scope.pop();
    }
  };
  // Backwards-compat shim — used by some generators that take a kind.
  const withScope = <T>(kind: 'event' | 'command', fn: () => T): T =>
    kind === 'command'
      ? withCommandScope(fn)
      : withEventScope('event.getPlayer()', fn);

  const defaultPlayerExpr = (): string => {
    const frame = currentFrame();
    if (frame?.kind === 'command') return senderAsPlayerExpr();
    if (frame?.kind === 'event') return frame.playerExpr;
    return 'null';
  };

  const senderAsPlayerExpr = (): string => {
    if (platform === 'paper' || platform === 'spigot') {
      return '(sender instanceof org.bukkit.entity.Player ? (org.bukkit.entity.Player) sender : null)';
    }
    if (platform === 'velocity') {
      return '(source instanceof com.velocitypowered.api.proxy.Player ? (com.velocitypowered.api.proxy.Player) source : null)';
    }
    if (platform === 'bungee') {
      return '(sender instanceof net.md_5.bungee.api.connection.ProxiedPlayer ? (net.md_5.bungee.api.connection.ProxiedPlayer) sender : null)';
    }
    return 'null';
  };

  // ============ EVENT HAT BLOCKS ============
  // Each one collects a listener method into ctx.out.listeners
  const emitListener = (handlerName: string, eventClass: string, body: string) => {
    addImport(ctx.out, eventClass);
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.event.EventHandler');
      addImport(ctx.out, 'org.bukkit.event.Listener');
    } else if (platform === 'velocity') {
      addImport(ctx.out, 'com.velocitypowered.api.event.Subscribe');
    } else if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.event.EventHandler');
      addImport(ctx.out, 'net.md_5.bungee.api.plugin.Listener');
    }
    const annotation =
      platform === 'velocity' ? '@Subscribe' : '@EventHandler';
    const method = `${annotation}\npublic void ${handlerName}(${shortName(eventClass)} event) {\n${indent(body)}\n}\n`;
    ctx.out.listeners.push(method);
  };

  generator.forBlock['event_player_join'] = function (block: any) {
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    const cls = eventClass('player_join', platform);
    emitListener('on' + ctx.uid(), cls, body);
    return '';
  };
  generator.forBlock['event_player_quit'] = function (block: any) {
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    const cls = eventClass('player_quit', platform);
    emitListener('on' + ctx.uid(), cls, body);
    return '';
  };
  generator.forBlock['event_player_chat'] = function (block: any) {
    // BungeeCord ChatEvent uses getSender() not getPlayer().
    const playerExpr =
      platform === 'bungee'
        ? '(event.getSender() instanceof net.md_5.bungee.api.connection.ProxiedPlayer ? (net.md_5.bungee.api.connection.ProxiedPlayer) event.getSender() : null)'
        : 'event.getPlayer()';
    const body = withEventScope(playerExpr, () => stmt(block, 'DO'));
    const cls = eventClass('player_chat', platform);
    emitListener('on' + ctx.uid(), cls, body);
    return '';
  };
  generator.forBlock['event_block_break'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'org.bukkit.event.block.BlockBreakEvent', body);
    return '';
  };
  generator.forBlock['event_block_place'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'org.bukkit.event.block.BlockPlaceEvent', body);
    return '';
  };
  generator.forBlock['event_player_death'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    // PlayerDeathEvent — getEntity() is the dying Player.
    const body = withEventScope('event.getEntity()', () => stmt(block, 'DO'));
    emitListener(
      'on' + ctx.uid(),
      'org.bukkit.event.entity.PlayerDeathEvent',
      body
    );
    return '';
  };
  generator.forBlock['event_player_move'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'org.bukkit.event.player.PlayerMoveEvent', body);
    return '';
  };
  generator.forBlock['event_server_start'] = function (block: any) {
    const body = stmt(block, 'DO');
    ctx.out.onEnable.push(body);
    return '';
  };

  // ============ PLAYER ============
  generator.forBlock['player_event'] = function () {
    const frame = currentFrame();
    if (frame?.kind === 'command') return [senderAsPlayerExpr(), ORDER_NONE];
    if (frame?.kind === 'event') return [frame.playerExpr, ORDER_NONE];
    // Outside any scope — best-effort: pick the first online player.
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return ['Bukkit.getOnlinePlayers().stream().findFirst().orElse(null)', ORDER_NONE];
    }
    return ['null', ORDER_NONE];
  };
  generator.forBlock['player_get_name'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    return [`${p}.getName()`, ORDER_NONE];
  };
  generator.forBlock['player_send_message'] = function (block: any) {
    const msg = valueOrDefault(block, 'MESSAGE', '""', 'String');
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `${p}.sendMessage(Component.text(${msg}));\n`;
    }
    if (platform === 'velocity') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `${p}.sendMessage(Component.text(${msg}));\n`;
    }
    if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.api.chat.TextComponent');
      return `${p}.sendMessage(new TextComponent(${msg}));\n`;
    }
    return `${p}.sendMessage(${msg});\n`;
  };
  generator.forBlock['player_broadcast'] = function (block: any) {
    const msg = valueOrDefault(block, 'MESSAGE', '""', 'String');
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `getServer().broadcast(Component.text(${msg}));\n`;
    }
    if (platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `Bukkit.broadcastMessage(${msg});\n`;
    }
    if (platform === 'velocity') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `server.sendMessage(Component.text(${msg}));\n`;
    }
    if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.api.ProxyServer');
      addImport(ctx.out, 'net.md_5.bungee.api.chat.TextComponent');
      return `ProxyServer.getInstance().broadcast(new TextComponent(${msg}));\n`;
    }
    return '';
  };
  generator.forBlock['player_teleport'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Location');
      return `${p}.teleport(new Location(${p}.getWorld(), ${x}, ${y}, ${z}));\n`;
    }
    return `// teleport not supported on ${platform}\n`;
  };
  generator.forBlock['player_give_item'] = function (block: any) {
    const amount = valueOrDefault(block, 'AMOUNT', '1', 'Number');
    const material = block.getFieldValue('MATERIAL');
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Material');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return `${p}.getInventory().addItem(new ItemStack(Material.${material}, ${amount}));\n`;
    }
    return `// give item not supported on ${platform}\n`;
  };
  generator.forBlock['player_set_health'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    const v = valueOrDefault(block, 'VALUE', '20', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      return `${p}.setHealth(${v});\n`;
    }
    return `// set health not supported on ${platform}\n`;
  };
  generator.forBlock['player_set_food'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    const v = valueOrDefault(block, 'VALUE', '20', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      return `${p}.setFoodLevel((int) Math.round(${v}));\n`;
    }
    return `// set food not supported on ${platform}\n`;
  };
  generator.forBlock['player_set_gamemode'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    const m = block.getFieldValue('MODE');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.GameMode');
      return `${p}.setGameMode(GameMode.${m});\n`;
    }
    return `// set gamemode not supported on ${platform}\n`;
  };
  generator.forBlock['player_kick'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    const r = valueOrDefault(block, 'REASON', '""', 'String');
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `${p}.kick(Component.text(${r}));\n`;
    }
    if (platform === 'spigot') {
      return `${p}.kickPlayer(${r});\n`;
    }
    if (platform === 'velocity') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `${p}.disconnect(Component.text(${r}));\n`;
    }
    if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.api.chat.TextComponent');
      return `${p}.disconnect(new TextComponent(${r}));\n`;
    }
    return '';
  };
  generator.forBlock['player_play_sound'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    const s = block.getFieldValue('SOUND');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Sound');
      return `${p}.playSound(${p}.getLocation(), Sound.${s}, 1.0f, 1.0f);\n`;
    }
    return `// play sound not supported on ${platform}\n`;
  };
  generator.forBlock['player_send_to_server'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    const s = valueOrDefault(block, 'SERVER', '""', 'String');
    if (platform === 'velocity') {
      return `server.getServer(${s}).ifPresent(srv -> ${p}.createConnectionRequest(srv).fireAndForget());\n`;
    }
    if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.api.ProxyServer');
      return `${p}.connect(ProxyServer.getInstance().getServerInfo(${s}));\n`;
    }
    return `// send to server only on velocity/bungee\n`;
  };
  generator.forBlock['player_location'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    const axis = block.getFieldValue('AXIS').toLowerCase();
    if (platform === 'paper' || platform === 'spigot') {
      return [`${p}.getLocation().get${axis.toUpperCase()}()`, ORDER_NONE];
    }
    return ['0', ORDER_NONE];
  };

  // ============ WORLD ============
  generator.forBlock['world_set_block'] = function (block: any) {
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    const m = block.getFieldValue('MATERIAL');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      addImport(ctx.out, 'org.bukkit.Material');
      return `Bukkit.getWorlds().get(0).getBlockAt((int)Math.round(${x}), (int)Math.round(${y}), (int)Math.round(${z})).setType(Material.${m});\n`;
    }
    return `// set block only on paper/spigot\n`;
  };
  generator.forBlock['world_strike_lightning'] = function (block: any) {
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      addImport(ctx.out, 'org.bukkit.Location');
      return `Bukkit.getWorlds().get(0).strikeLightning(new Location(Bukkit.getWorlds().get(0), ${x}, ${y}, ${z}));\n`;
    }
    return `// lightning only on paper/spigot\n`;
  };
  generator.forBlock['world_spawn_entity'] = function (block: any) {
    const e = block.getFieldValue('ENTITY');
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      addImport(ctx.out, 'org.bukkit.Location');
      addImport(ctx.out, 'org.bukkit.entity.EntityType');
      return `Bukkit.getWorlds().get(0).spawnEntity(new Location(Bukkit.getWorlds().get(0), ${x}, ${y}, ${z}), EntityType.${e});\n`;
    }
    return `// spawn entity only on paper/spigot\n`;
  };
  generator.forBlock['world_set_time'] = function (block: any) {
    const t = block.getFieldValue('TIME');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `Bukkit.getWorlds().get(0).setTime(${t}L);\n`;
    }
    return `// time only on paper/spigot\n`;
  };
  generator.forBlock['world_set_weather'] = function (block: any) {
    const w = block.getFieldValue('WEATHER');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      const code =
        w === 'CLEAR'
          ? `Bukkit.getWorlds().get(0).setStorm(false);\nBukkit.getWorlds().get(0).setThundering(false);\n`
          : w === 'RAIN'
          ? `Bukkit.getWorlds().get(0).setStorm(true);\nBukkit.getWorlds().get(0).setThundering(false);\n`
          : `Bukkit.getWorlds().get(0).setStorm(true);\nBukkit.getWorlds().get(0).setThundering(true);\n`;
      return code;
    }
    return `// weather only on paper/spigot\n`;
  };
  generator.forBlock['world_broadcast'] = function (block: any) {
    const msg = valueOrDefault(block, 'MESSAGE', '""', 'String');
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `getServer().broadcast(Component.text(${msg}));\n`;
    }
    if (platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `Bukkit.broadcastMessage(${msg});\n`;
    }
    if (platform === 'velocity') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `server.sendMessage(Component.text(${msg}));\n`;
    }
    if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.api.ProxyServer');
      addImport(ctx.out, 'net.md_5.bungee.api.chat.TextComponent');
      return `ProxyServer.getInstance().broadcast(new TextComponent(${msg}));\n`;
    }
    return '';
  };

  // ============ COMMANDS ============
  generator.forBlock['command_define'] = function (block: any) {
    const name = block.getFieldValue('NAME');
    const desc = block.getFieldValue('DESC');
    const body = withCommandScope(() => stmt(block, 'DO'));
    ctx.out.commands.push({ name, description: desc, body });
    return '';
  };
  generator.forBlock['command_sender'] = function () {
    if (platform === 'paper' || platform === 'spigot') {
      return ['(sender instanceof org.bukkit.entity.Player ? (org.bukkit.entity.Player) sender : null)', ORDER_NONE];
    }
    if (platform === 'velocity') {
      return ['(source instanceof com.velocitypowered.api.proxy.Player ? (com.velocitypowered.api.proxy.Player) source : null)', ORDER_NONE];
    }
    if (platform === 'bungee') {
      return ['(sender instanceof net.md_5.bungee.api.connection.ProxiedPlayer ? (net.md_5.bungee.api.connection.ProxiedPlayer) sender : null)', ORDER_NONE];
    }
    return ['null', ORDER_NONE];
  };
  generator.forBlock['command_arg'] = function (block: any) {
    const i = valueOrDefault(block, 'INDEX', '0', 'Number');
    return [`(args.length > (int)(${i}) ? args[(int)(${i})] : "")`, ORDER_NONE];
  };
  generator.forBlock['command_arg_count'] = function () {
    return ['args.length', ORDER_NONE];
  };

  // ============ SCHEDULER ============
  generator.forBlock['scheduler_wait'] = function (block: any) {
    const ticks = valueOrDefault(block, 'TICKS', '20', 'Number');
    const body = stmt(block, 'DO');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `Bukkit.getScheduler().runTaskLater(this, () -> {\n${indent(body)}\n}, (long)(${ticks}));\n`;
    }
    if (platform === 'velocity') {
      addImport(ctx.out, 'java.util.concurrent.TimeUnit');
      return `server.getScheduler().buildTask(this, () -> {\n${indent(body)}\n}).delay((long)(${ticks}) * 50, TimeUnit.MILLISECONDS).schedule();\n`;
    }
    if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.api.ProxyServer');
      addImport(ctx.out, 'java.util.concurrent.TimeUnit');
      return `ProxyServer.getInstance().getScheduler().schedule(this, () -> {\n${indent(body)}\n}, (long)(${ticks}) * 50, TimeUnit.MILLISECONDS);\n`;
    }
    return '';
  };
  generator.forBlock['scheduler_repeat'] = function (block: any) {
    const ticks = valueOrDefault(block, 'TICKS', '20', 'Number');
    const body = stmt(block, 'DO');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `Bukkit.getScheduler().runTaskTimer(this, () -> {\n${indent(body)}\n}, 0L, (long)(${ticks}));\n`;
    }
    if (platform === 'velocity') {
      addImport(ctx.out, 'java.util.concurrent.TimeUnit');
      return `server.getScheduler().buildTask(this, () -> {\n${indent(body)}\n}).repeat((long)(${ticks}) * 50, TimeUnit.MILLISECONDS).schedule();\n`;
    }
    if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.api.ProxyServer');
      addImport(ctx.out, 'java.util.concurrent.TimeUnit');
      return `ProxyServer.getInstance().getScheduler().schedule(this, () -> {\n${indent(body)}\n}, 0L, (long)(${ticks}) * 50, TimeUnit.MILLISECONDS);\n`;
    }
    return '';
  };

  // ============ CONFIG ============
  generator.forBlock['config_get_string'] = function (block: any) {
    const k = block.getFieldValue('KEY');
    if (platform === 'paper' || platform === 'spigot') {
      return [`getConfig().getString(${quoteString(k)}, "")`, ORDER_NONE];
    }
    return [`""`, ORDER_NONE];
  };
  generator.forBlock['config_get_int'] = function (block: any) {
    const k = block.getFieldValue('KEY');
    if (platform === 'paper' || platform === 'spigot') {
      return [`getConfig().getInt(${quoteString(k)}, 0)`, ORDER_NONE];
    }
    return [`0`, ORDER_NONE];
  };
  generator.forBlock['config_set'] = function (block: any) {
    const k = block.getFieldValue('KEY');
    const v = valueOrDefault(block, 'VALUE', '""');
    if (platform === 'paper' || platform === 'spigot') {
      return `getConfig().set(${quoteString(k)}, ${v});\n`;
    }
    return `// config not supported on ${platform}\n`;
  };
  generator.forBlock['config_save'] = function () {
    if (platform === 'paper' || platform === 'spigot') {
      return `saveConfig();\n`;
    }
    return '';
  };

  // ============ PERMISSIONS ============
  generator.forBlock['permission_check'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    const perm = block.getFieldValue('PERM');
    return [`${p}.hasPermission(${quoteString(perm)})`, ORDER_NONE];
  };
  generator.forBlock['permission_is_op'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', 'event.getPlayer()', 'Player');
    return [`${p}.isOp()`, ORDER_NONE];
  };

  // ============ NETWORK ============
  generator.forBlock['network_get_servers'] = function () {
    if (platform === 'velocity') {
      return [`server.getAllServers().stream().map(s -> s.getServerInfo().getName()).toArray(String[]::new)`, ORDER_NONE];
    }
    if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.api.ProxyServer');
      return [`ProxyServer.getInstance().getServers().keySet().toArray(new String[0])`, ORDER_NONE];
    }
    return [`new String[0]`, ORDER_NONE];
  };

  // ============ Reader helpers ============
  generator.forBlock['event_chat_message'] = function () {
    if (currentScope() !== 'event') return [`""`, ORDER_NONE];
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer');
      return [`PlainTextComponentSerializer.plainText().serialize(event.message())`, ORDER_NONE];
    }
    if (platform === 'spigot') {
      return [`event.getMessage()`, ORDER_NONE];
    }
    return [`""`, ORDER_NONE];
  };
  generator.forBlock['event_block_location'] = function (block: any) {
    if (currentScope() !== 'event') return ['0', ORDER_NONE];
    const axis = block.getFieldValue('AXIS').toLowerCase();
    if (platform === 'paper' || platform === 'spigot') {
      return [`event.getBlock().get${axis.toUpperCase()}()`, ORDER_NONE];
    }
    return ['0', ORDER_NONE];
  };

  // ============ ITEMS ============
  generator.forBlock['item_create'] = function (block: any) {
    const amount = valueOrDefault(block, 'AMOUNT', '1', 'Number');
    const material = block.getFieldValue('MATERIAL');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Material');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [`new ItemStack(Material.${material}, (int)Math.round(${amount}))`, ORDER_NONE];
    }
    return ['null', ORDER_NONE];
  };
  generator.forBlock['item_set_name'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    const name = valueOrDefault(block, 'NAME', '""', 'String');
    if (platform === 'paper') {
      ctx.out.helpers.add('withMeta');
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [`__withMeta((${item}), m -> m.displayName(Component.text(${name})))`, ORDER_NONE];
    }
    if (platform === 'spigot') {
      ctx.out.helpers.add('withMeta');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      addImport(ctx.out, 'org.bukkit.inventory.meta.ItemMeta');
      return [`__withMeta((${item}), m -> m.setDisplayName(${name}))`, ORDER_NONE];
    }
    return [`(${item})`, ORDER_NONE];
  };
  generator.forBlock['item_add_lore'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    const lore = valueOrDefault(block, 'LORE', '""', 'String');
    if (platform === 'paper') {
      ctx.out.helpers.add('withMeta');
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      addImport(ctx.out, 'java.util.ArrayList');
      addImport(ctx.out, 'java.util.List');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [
        `__withMeta((${item}), m -> { List<Component> ll = new ArrayList<>(m.lore() != null ? m.lore() : new ArrayList<>()); ll.add(Component.text(${lore})); m.lore(ll); })`,
        ORDER_NONE,
      ];
    }
    if (platform === 'spigot') {
      ctx.out.helpers.add('withMeta');
      addImport(ctx.out, 'java.util.ArrayList');
      addImport(ctx.out, 'java.util.List');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [
        `__withMeta((${item}), m -> { List<String> ll = new ArrayList<>(m.getLore() != null ? m.getLore() : new ArrayList<>()); ll.add(${lore}); m.setLore(ll); })`,
        ORDER_NONE,
      ];
    }
    return [`(${item})`, ORDER_NONE];
  };
  generator.forBlock['item_add_enchant'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    const ench = block.getFieldValue('ENCHANT');
    const lvl = valueOrDefault(block, 'LEVEL', '1', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      ctx.out.helpers.add('withItem');
      addImport(ctx.out, 'org.bukkit.NamespacedKey');
      addImport(ctx.out, 'org.bukkit.Registry');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      const key = enchantToKey(ench);
      return [
        `__withItem((${item}), it -> { var __e = Registry.ENCHANTMENT.get(NamespacedKey.minecraft("${key}")); if (__e != null) it.addUnsafeEnchantment(__e, (int)Math.round(${lvl})); })`,
        ORDER_NONE,
      ];
    }
    return [`(${item})`, ORDER_NONE];
  };
  generator.forBlock['item_unbreakable'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    if (platform === 'paper' || platform === 'spigot') {
      ctx.out.helpers.add('withMeta');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [`__withMeta((${item}), m -> m.setUnbreakable(true))`, ORDER_NONE];
    }
    return [`(${item})`, ORDER_NONE];
  };
  generator.forBlock['item_get_name'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    if (platform === 'paper') {
      ctx.out.helpers.add('itemName');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [`__itemName((${item}))`, ORDER_NONE];
    }
    if (platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [
        `(((ItemStack)(${item})) != null && ((ItemStack)(${item})).hasItemMeta() && ((ItemStack)(${item})).getItemMeta().hasDisplayName() ? ((ItemStack)(${item})).getItemMeta().getDisplayName() : (((ItemStack)(${item})) != null ? ((ItemStack)(${item})).getType().name() : ""))`,
        ORDER_NONE,
      ];
    }
    return [`""`, ORDER_NONE];
  };
  generator.forBlock['item_get_type'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [
        `(((ItemStack)(${item})) != null ? ((ItemStack)(${item})).getType().name() : "")`,
        ORDER_NONE,
      ];
    }
    return [`""`, ORDER_NONE];
  };
  generator.forBlock['item_get_amount'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [
        `(((ItemStack)(${item})) != null ? ((ItemStack)(${item})).getAmount() : 0)`,
        ORDER_NONE,
      ];
    }
    return [`0`, ORDER_NONE];
  };
  generator.forBlock['item_is_type'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    const m = block.getFieldValue('MATERIAL');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Material');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [
        `(((ItemStack)(${item})) != null && ((ItemStack)(${item})).getType() == Material.${m})`,
        ORDER_NONE,
      ];
    }
    return [`false`, ORDER_NONE];
  };

  // ============ PLAYER (advanced) ============
  generator.forBlock['player_give_itemstack'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return `${p}.getInventory().addItem((ItemStack)(${item}));\n`;
    }
    return '';
  };
  generator.forBlock['player_set_held_item'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const item = valueOrDefault(block, 'ITEM', 'null');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return `${p}.getInventory().setItemInMainHand((ItemStack)(${item}));\n`;
    }
    return '';
  };
  generator.forBlock['player_set_armor'] = function (block: any) {
    const slot = block.getFieldValue('SLOT'); // helmet/chestplate/leggings/boots
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const item = valueOrDefault(block, 'ITEM', 'null');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      const setter =
        slot === 'helmet'
          ? 'setHelmet'
          : slot === 'chestplate'
          ? 'setChestplate'
          : slot === 'leggings'
          ? 'setLeggings'
          : 'setBoots';
      return `${p}.getInventory().${setter}((ItemStack)(${item}));\n`;
    }
    return '';
  };
  generator.forBlock['player_clear_inventory'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      return `${p}.getInventory().clear();\n`;
    }
    return '';
  };
  generator.forBlock['player_get_held_item'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      return [`${p}.getInventory().getItemInMainHand()`, ORDER_NONE];
    }
    return ['null', ORDER_NONE];
  };
  generator.forBlock['player_get_health'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') return [`${p}.getHealth()`, ORDER_NONE];
    return ['0', ORDER_NONE];
  };
  generator.forBlock['player_get_food'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') return [`${p}.getFoodLevel()`, ORDER_NONE];
    return ['0', ORDER_NONE];
  };
  generator.forBlock['player_set_level'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const lvl = valueOrDefault(block, 'LEVEL', '0', 'Number');
    if (platform === 'paper' || platform === 'spigot') return `${p}.setLevel((int)Math.round(${lvl}));\n`;
    return '';
  };
  generator.forBlock['player_give_xp'] = function (block: any) {
    const amt = valueOrDefault(block, 'AMOUNT', '1', 'Number');
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') return `${p}.giveExp((int)Math.round(${amt}));\n`;
    return '';
  };
  generator.forBlock['player_set_flying'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const state = block.getFieldValue('STATE');
    if (platform === 'paper' || platform === 'spigot') {
      return `${p}.setAllowFlight(${state});\n${p}.setFlying(${state});\n`;
    }
    return '';
  };
  generator.forBlock['player_set_walk_speed'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const sp = valueOrDefault(block, 'SPEED', '0.2', 'Number');
    if (platform === 'paper' || platform === 'spigot') return `${p}.setWalkSpeed((float)(${sp}));\n`;
    return '';
  };
  generator.forBlock['player_add_potion_effect'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const eff = block.getFieldValue('EFFECT');
    const sec = valueOrDefault(block, 'SECONDS', '10', 'Number');
    const amp = valueOrDefault(block, 'AMPLIFIER', '1', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.potion.PotionEffect');
      addImport(ctx.out, 'org.bukkit.potion.PotionEffectType');
      return `${p}.addPotionEffect(new PotionEffect(PotionEffectType.${eff}, (int)Math.round(${sec}) * 20, (int)Math.max(0, Math.round(${amp}) - 1)));\n`;
    }
    return '';
  };
  generator.forBlock['player_remove_potion_effect'] = function (block: any) {
    const eff = block.getFieldValue('EFFECT');
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.potion.PotionEffectType');
      return `${p}.removePotionEffect(PotionEffectType.${eff});\n`;
    }
    return '';
  };
  generator.forBlock['player_get_uuid'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    return [`${p}.getUniqueId().toString()`, ORDER_NONE];
  };
  generator.forBlock['player_get_world_name'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      return [`${p}.getWorld().getName()`, ORDER_NONE];
    }
    if (platform === 'velocity') {
      return [`${p}.getCurrentServer().map(s -> s.getServerInfo().getName()).orElse("")`, ORDER_NONE];
    }
    return [`""`, ORDER_NONE];
  };
  generator.forBlock['player_get_by_name'] = function (block: any) {
    const n = valueOrDefault(block, 'NAME', '""', 'String');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return [`Bukkit.getPlayerExact(${n})`, ORDER_NONE];
    }
    if (platform === 'velocity') {
      return [`server.getPlayer(${n}).orElse(null)`, ORDER_NONE];
    }
    if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.api.ProxyServer');
      return [`ProxyServer.getInstance().getPlayer(${n})`, ORDER_NONE];
    }
    return ['null', ORDER_NONE];
  };
  generator.forBlock['players_online'] = function () {
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return [`Bukkit.getOnlinePlayers().size()`, ORDER_NONE];
    }
    if (platform === 'velocity') return [`server.getPlayerCount()`, ORDER_NONE];
    if (platform === 'bungee') {
      addImport(ctx.out, 'net.md_5.bungee.api.ProxyServer');
      return [`ProxyServer.getInstance().getOnlineCount()`, ORDER_NONE];
    }
    return ['0', ORDER_NONE];
  };

  // ============ WORLD (advanced) ============
  generator.forBlock['world_get_block_type'] = function (block: any) {
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return [
        `Bukkit.getWorlds().get(0).getBlockAt((int)Math.round(${x}), (int)Math.round(${y}), (int)Math.round(${z})).getType().name()`,
        ORDER_NONE,
      ];
    }
    return [`""`, ORDER_NONE];
  };
  generator.forBlock['world_drop_item'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      addImport(ctx.out, 'org.bukkit.Location');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return `Bukkit.getWorlds().get(0).dropItemNaturally(new Location(Bukkit.getWorlds().get(0), ${x}, ${y}, ${z}), (ItemStack)(${item}));\n`;
    }
    return '';
  };
  generator.forBlock['world_create_explosion'] = function (block: any) {
    const power = valueOrDefault(block, 'POWER', '4', 'Number');
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `Bukkit.getWorlds().get(0).createExplosion(${x}, ${y}, ${z}, (float)(${power}));\n`;
    }
    return '';
  };
  generator.forBlock['world_play_particle'] = function (block: any) {
    const part = block.getFieldValue('PARTICLE');
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    const cnt = valueOrDefault(block, 'COUNT', '10', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      addImport(ctx.out, 'org.bukkit.Particle');
      return `Bukkit.getWorlds().get(0).spawnParticle(Particle.${part}, ${x}, ${y}, ${z}, (int)Math.round(${cnt}));\n`;
    }
    return '';
  };

  // ============ EVENTS (advanced) ============
  generator.forBlock['event_player_interact'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    // PlayerInteractEvent has getPlayer() — default expression is fine.
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'org.bukkit.event.player.PlayerInteractEvent', body);
    return '';
  };
  generator.forBlock['event_entity_death'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    // EntityDeathEvent.getEntity() is LivingEntity, not Player. Fall back to
    // killer (often the player) or null-cast chain.
    const playerExpr =
      '(event.getEntity().getKiller() instanceof org.bukkit.entity.Player ? event.getEntity().getKiller() : null)';
    const body = withEventScope(playerExpr, () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'org.bukkit.event.entity.EntityDeathEvent', body);
    return '';
  };
  generator.forBlock['event_entity_damage'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    // The damaged entity might be a player.
    const playerExpr =
      '(event.getEntity() instanceof org.bukkit.entity.Player ? (org.bukkit.entity.Player) event.getEntity() : null)';
    const body = withEventScope(playerExpr, () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'org.bukkit.event.entity.EntityDamageEvent', body);
    return '';
  };
  generator.forBlock['event_inventory_click'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    // InventoryClickEvent has getWhoClicked() returning HumanEntity.
    const playerExpr =
      '(event.getWhoClicked() instanceof org.bukkit.entity.Player ? (org.bukkit.entity.Player) event.getWhoClicked() : null)';
    const body = withEventScope(playerExpr, () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'org.bukkit.event.inventory.InventoryClickEvent', body);
    return '';
  };
  generator.forBlock['event_item_picked_up'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    const playerExpr =
      '(event.getEntity() instanceof org.bukkit.entity.Player ? (org.bukkit.entity.Player) event.getEntity() : null)';
    const body = withEventScope(playerExpr, () => stmt(block, 'DO'));
    emitListener(
      'on' + ctx.uid(),
      'org.bukkit.event.entity.EntityPickupItemEvent',
      body
    );
    return '';
  };
  generator.forBlock['event_player_login'] = function (block: any) {
    if (platform !== 'velocity') return '';
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'com.velocitypowered.api.event.connection.LoginEvent', body);
    return '';
  };
  generator.forBlock['event_proxy_ping'] = function (block: any) {
    if (platform !== 'bungee') return '';
    // ProxyPingEvent has no player at all.
    const body = withEventScope('null', () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'net.md_5.bungee.api.event.ProxyPingEvent', body);
    return '';
  };

  // ============ TEXT (advanced) ============
  generator.forBlock['text_contains'] = function (block: any) {
    const t = valueOrDefault(block, 'TEXT', '""', 'String');
    const n = valueOrDefault(block, 'NEEDLE', '""', 'String');
    return [`(${t}).contains(${n})`, ORDER_NONE];
  };
  generator.forBlock['text_replace_simple'] = function (block: any) {
    const t = valueOrDefault(block, 'TEXT', '""', 'String');
    const f = valueOrDefault(block, 'FROM', '""', 'String');
    const r = valueOrDefault(block, 'TO', '""', 'String');
    return [`(${t}).replace((CharSequence)(${f}), (CharSequence)(${r}))`, ORDER_NONE];
  };
  generator.forBlock['text_change_case'] = function (block: any) {
    const t = valueOrDefault(block, 'TEXT', '""', 'String');
    const c = block.getFieldValue('CASE');
    return [`(${t}).${c === 'UPPER' ? 'toUpperCase' : 'toLowerCase'}()`, ORDER_NONE];
  };
  generator.forBlock['text_color'] = function (block: any) {
    const t = valueOrDefault(block, 'TEXT', '""', 'String');
    const color = block.getFieldValue('COLOR');
    if (platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.ChatColor');
      return [`(ChatColor.${color} + ${t})`, ORDER_NONE];
    }
    // For Paper/Velocity/Bungee return a §-prefixed string (works in legacy contexts).
    const codes: Record<string, string> = {
      RED: 'c', GREEN: 'a', BLUE: '9', YELLOW: 'e', GOLD: '6',
      AQUA: 'b', LIGHT_PURPLE: 'd', WHITE: 'f', GRAY: '7', BLACK: '0',
    };
    return [`("\\u00A7${codes[color] ?? 'f'}" + ${t})`, ORDER_NONE];
  };

  // ============ MATH (advanced) ============
  generator.forBlock['math_round_simple'] = function (block: any) {
    const v = valueOrDefault(block, 'VALUE', '0', 'Number');
    return [`Math.round(${v})`, ORDER_NONE];
  };
  generator.forBlock['math_modulo_simple'] = function (block: any) {
    const a = valueOrDefault(block, 'A', '0', 'Number');
    const b = valueOrDefault(block, 'B', '1', 'Number');
    return [`((${a}) % (${b}))`, ORDER_NONE];
  };

  // ============ NETWORK (advanced) ============
  generator.forBlock['network_get_current_server'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'velocity') {
      return [`${p}.getCurrentServer().map(s -> s.getServerInfo().getName()).orElse("")`, ORDER_NONE];
    }
    if (platform === 'bungee') {
      return [`(${p}.getServer() != null ? ${p}.getServer().getInfo().getName() : "")`, ORDER_NONE];
    }
    return [`""`, ORDER_NONE];
  };

  // ============ GUI / INVENTORY MENU ============
  generator.forBlock['gui_create_inventory'] = function (block: any) {
    const size = block.getFieldValue('SIZE');
    const title = valueOrDefault(block, 'TITLE', '""', 'String');
    if (platform === 'paper') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return [`Bukkit.createInventory(null, ${size}, Component.text(${title}))`, ORDER_NONE];
    }
    if (platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return [`Bukkit.createInventory(null, ${size}, ${title})`, ORDER_NONE];
    }
    return ['null', ORDER_NONE];
  };
  generator.forBlock['gui_set_slot'] = function (block: any) {
    const gui = valueOrDefault(block, 'GUI', 'null');
    const slot = valueOrDefault(block, 'SLOT', '0', 'Number');
    const item = valueOrDefault(block, 'ITEM', 'null');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.inventory.Inventory');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return `((Inventory)(${gui})).setItem((int)Math.round(${slot}), (ItemStack)(${item}));\n`;
    }
    return '';
  };
  generator.forBlock['gui_open_for_player'] = function (block: any) {
    const gui = valueOrDefault(block, 'GUI', 'null');
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.inventory.Inventory');
      return `${p}.openInventory((Inventory)(${gui}));\n`;
    }
    return '';
  };
  generator.forBlock['gui_close_for_player'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') return `${p}.closeInventory();\n`;
    return '';
  };
  generator.forBlock['gui_fill_borders'] = function (block: any) {
    const gui = valueOrDefault(block, 'GUI', 'null');
    const item = valueOrDefault(block, 'ITEM', 'null');
    if (platform === 'paper' || platform === 'spigot') {
      ctx.out.helpers.add('fillBorders');
      addImport(ctx.out, 'org.bukkit.inventory.Inventory');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return `__fillBorders((Inventory)(${gui}), (ItemStack)(${item}));\n`;
    }
    return '';
  };
  generator.forBlock['event_clicked_slot'] = function () {
    if (currentScope() !== 'event') return ['0', ORDER_NONE];
    return [`event.getRawSlot()`, ORDER_NONE];
  };
  generator.forBlock['event_clicked_item'] = function () {
    if (currentScope() !== 'event') return ['null', ORDER_NONE];
    // Resolve the contextual item across the common event types:
    //   - InventoryClickEvent → getCurrentItem()
    //   - PlayerInteractEvent → getItem() (the item in hand)
    //   - EntityPickupItemEvent → getItem().getItemStack()
    //   - PlayerDropItemEvent → getItemDrop().getItemStack()
    return [
      `(((Object) event) instanceof org.bukkit.event.inventory.InventoryClickEvent __ic ? __ic.getCurrentItem() : ((Object) event) instanceof org.bukkit.event.player.PlayerInteractEvent __pi ? __pi.getItem() : ((Object) event) instanceof org.bukkit.event.entity.EntityPickupItemEvent __ep ? __ep.getItem().getItemStack() : ((Object) event) instanceof org.bukkit.event.player.PlayerDropItemEvent __pd ? __pd.getItemDrop().getItemStack() : null)`,
      ORDER_NONE,
    ];
  };
  generator.forBlock['event_inventory_title'] = function () {
    if (currentScope() !== 'event') return [`""`, ORDER_NONE];
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer');
      return [
        `(((Object) event) instanceof org.bukkit.event.inventory.InventoryEvent __iet ? PlainTextComponentSerializer.plainText().serialize(__iet.getView().title()) : "")`,
        ORDER_NONE,
      ];
    }
    if (platform === 'spigot') {
      return [
        `(((Object) event) instanceof org.bukkit.event.inventory.InventoryEvent __iet ? __iet.getView().getTitle() : "")`,
        ORDER_NONE,
      ];
    }
    return [`""`, ORDER_NONE];
  };
  generator.forBlock['event_set_cancelled'] = function () {
    if (currentScope() !== 'event') return '';
    return `if (((Object) event) instanceof org.bukkit.event.Cancellable __cevt) __cevt.setCancelled(true);\n`;
  };
  generator.forBlock['flow_return'] = function () {
    // Bare return — picks the right form based on enclosing scope.
    if (currentScope() === 'command') return `return true;\n`;
    return `return;\n`;
  };
  // ============ EVENT-SPECIFIC ============
  // PlayerJoinEvent
  generator.forBlock['event_join_set_message'] = function (block: any) {
    const m = valueOrDefault(block, 'MESSAGE', '""', 'String');
    if (currentScope() !== 'event') return '';
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `if (((Object) event) instanceof org.bukkit.event.player.PlayerJoinEvent __pje) __pje.joinMessage(Component.text(${m}));\n`;
    }
    if (platform === 'spigot') {
      return `if (((Object) event) instanceof org.bukkit.event.player.PlayerJoinEvent __pje) __pje.setJoinMessage(${m});\n`;
    }
    return '';
  };
  generator.forBlock['event_join_clear_message'] = function () {
    if (currentScope() !== 'event') return '';
    if (platform === 'paper') {
      return `if (((Object) event) instanceof org.bukkit.event.player.PlayerJoinEvent __pje) __pje.joinMessage(null);\n`;
    }
    if (platform === 'spigot') {
      return `if (((Object) event) instanceof org.bukkit.event.player.PlayerJoinEvent __pje) __pje.setJoinMessage(null);\n`;
    }
    return '';
  };

  // PlayerQuitEvent
  generator.forBlock['event_quit_set_message'] = function (block: any) {
    const m = valueOrDefault(block, 'MESSAGE', '""', 'String');
    if (currentScope() !== 'event') return '';
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `if (((Object) event) instanceof org.bukkit.event.player.PlayerQuitEvent __pqe) __pqe.quitMessage(Component.text(${m}));\n`;
    }
    if (platform === 'spigot') {
      return `if (((Object) event) instanceof org.bukkit.event.player.PlayerQuitEvent __pqe) __pqe.setQuitMessage(${m});\n`;
    }
    return '';
  };
  generator.forBlock['event_quit_clear_message'] = function () {
    if (currentScope() !== 'event') return '';
    if (platform === 'paper') {
      return `if (((Object) event) instanceof org.bukkit.event.player.PlayerQuitEvent __pqe) __pqe.quitMessage(null);\n`;
    }
    if (platform === 'spigot') {
      return `if (((Object) event) instanceof org.bukkit.event.player.PlayerQuitEvent __pqe) __pqe.setQuitMessage(null);\n`;
    }
    return '';
  };

  // PlayerDeathEvent
  generator.forBlock['event_death_set_message'] = function (block: any) {
    const m = valueOrDefault(block, 'MESSAGE', '""', 'String');
    if (currentScope() !== 'event') return '';
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `if (((Object) event) instanceof org.bukkit.event.entity.PlayerDeathEvent __pde) __pde.deathMessage(Component.text(${m}));\n`;
    }
    if (platform === 'spigot') {
      return `if (((Object) event) instanceof org.bukkit.event.entity.PlayerDeathEvent __pde) __pde.setDeathMessage(${m});\n`;
    }
    return '';
  };
  generator.forBlock['event_death_set_keep_inventory'] = function (block: any) {
    const s = block.getFieldValue('STATE');
    if (currentScope() !== 'event') return '';
    return `if (((Object) event) instanceof org.bukkit.event.entity.PlayerDeathEvent __pde) __pde.setKeepInventory(${s});\n`;
  };
  generator.forBlock['event_death_set_keep_xp'] = function (block: any) {
    const s = block.getFieldValue('STATE');
    if (currentScope() !== 'event') return '';
    return `if (((Object) event) instanceof org.bukkit.event.entity.PlayerDeathEvent __pde) __pde.setKeepLevel(${s});\n`;
  };

  // PlayerChatEvent
  generator.forBlock['event_chat_set_message'] = function (block: any) {
    const m = valueOrDefault(block, 'MESSAGE', '""', 'String');
    if (currentScope() !== 'event') return '';
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `if (((Object) event) instanceof io.papermc.paper.event.player.AsyncChatEvent __ace) __ace.message(Component.text(${m}));\n`;
    }
    if (platform === 'spigot') {
      return `if (((Object) event) instanceof org.bukkit.event.player.AsyncPlayerChatEvent __ace) __ace.setMessage(${m});\n`;
    }
    return '';
  };
  generator.forBlock['event_chat_set_format'] = function (block: any) {
    const f = valueOrDefault(block, 'FORMAT', '""', 'String');
    if (currentScope() !== 'event') return '';
    if (platform === 'spigot') {
      return `if (((Object) event) instanceof org.bukkit.event.player.AsyncPlayerChatEvent __ace) __ace.setFormat(${f});\n`;
    }
    return `// Chat format setting only supported on Spigot legacy API\n`;
  };

  // PlayerInteractEvent
  generator.forBlock['event_interact_is_right_click'] = function () {
    if (currentScope() !== 'event') return ['false', ORDER_NONE];
    return [
      `(((Object) event) instanceof org.bukkit.event.player.PlayerInteractEvent __pie && __pie.getAction().toString().contains("RIGHT"))`,
      ORDER_NONE,
    ];
  };
  generator.forBlock['event_interact_is_left_click'] = function () {
    if (currentScope() !== 'event') return ['false', ORDER_NONE];
    return [
      `(((Object) event) instanceof org.bukkit.event.player.PlayerInteractEvent __pie && __pie.getAction().toString().contains("LEFT"))`,
      ORDER_NONE,
    ];
  };
  generator.forBlock['event_interact_is_air'] = function () {
    if (currentScope() !== 'event') return ['false', ORDER_NONE];
    return [
      `(((Object) event) instanceof org.bukkit.event.player.PlayerInteractEvent __pie && __pie.getAction().toString().contains("AIR"))`,
      ORDER_NONE,
    ];
  };

  // InventoryClickEvent
  generator.forBlock['event_inv_is_left_click'] = function () {
    if (currentScope() !== 'event') return ['false', ORDER_NONE];
    return [
      `(((Object) event) instanceof org.bukkit.event.inventory.InventoryClickEvent __ice && __ice.isLeftClick())`,
      ORDER_NONE,
    ];
  };
  generator.forBlock['event_inv_is_right_click'] = function () {
    if (currentScope() !== 'event') return ['false', ORDER_NONE];
    return [
      `(((Object) event) instanceof org.bukkit.event.inventory.InventoryClickEvent __ice && __ice.isRightClick())`,
      ORDER_NONE,
    ];
  };
  generator.forBlock['event_inv_is_shift_click'] = function () {
    if (currentScope() !== 'event') return ['false', ORDER_NONE];
    return [
      `(((Object) event) instanceof org.bukkit.event.inventory.InventoryClickEvent __ice && __ice.isShiftClick())`,
      ORDER_NONE,
    ];
  };

  // BlockBreakEvent
  generator.forBlock['event_break_set_exp'] = function (block: any) {
    const x = valueOrDefault(block, 'EXP', '0', 'Number');
    if (currentScope() !== 'event') return '';
    return `if (((Object) event) instanceof org.bukkit.event.block.BlockBreakEvent __bbe) __bbe.setExpToDrop((int)Math.round(${x}));\n`;
  };
  generator.forBlock['event_break_set_drops'] = function () {
    if (currentScope() !== 'event') return '';
    return `if (((Object) event) instanceof org.bukkit.event.block.BlockBreakEvent __bbe) __bbe.setDropItems(false);\n`;
  };

  // EntityDamageEvent
  generator.forBlock['event_damage_get'] = function () {
    if (currentScope() !== 'event') return ['0', ORDER_NONE];
    return [
      `(((Object) event) instanceof org.bukkit.event.entity.EntityDamageEvent __ede ? __ede.getDamage() : 0.0)`,
      ORDER_NONE,
    ];
  };
  generator.forBlock['event_damage_set'] = function (block: any) {
    const a = valueOrDefault(block, 'AMOUNT', '0', 'Number');
    if (currentScope() !== 'event') return '';
    return `if (((Object) event) instanceof org.bukkit.event.entity.EntityDamageEvent __ede) __ede.setDamage(${a});\n`;
  };
  generator.forBlock['event_damage_get_cause'] = function () {
    if (currentScope() !== 'event') return [`""`, ORDER_NONE];
    return [
      `(((Object) event) instanceof org.bukkit.event.entity.EntityDamageEvent __ede ? __ede.getCause().name() : "")`,
      ORDER_NONE,
    ];
  };

  // PlayerCommandPreprocessEvent
  generator.forBlock['event_command_set_text'] = function (block: any) {
    const c = valueOrDefault(block, 'CMD', '""', 'String');
    if (currentScope() !== 'event') return '';
    return `if (((Object) event) instanceof org.bukkit.event.player.PlayerCommandPreprocessEvent __pcp) __pcp.setMessage("/" + ${c});\n`;
  };

  generator.forBlock['flow_return_value'] = function (block: any) {
    const v = (generator as any).valueToCode(block, 'VALUE', ORDER_NONE);
    if (currentScope() === 'command') {
      // Command executor returns boolean — coerce other types sensibly.
      if (!v || !v.length) return `return true;\n`;
      return `return Boolean.parseBoolean(String.valueOf(${v}));\n`;
    }
    // Event handlers are void — drop the value, just return.
    return `return;\n`;
  };

  // ============ UI: TITLE / ACTIONBAR / TAB ============
  generator.forBlock['player_send_title'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const title = valueOrDefault(block, 'TITLE', '""', 'String');
    const sub = valueOrDefault(block, 'SUBTITLE', '""', 'String');
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      addImport(ctx.out, 'net.kyori.adventure.title.Title');
      return `${p}.showTitle(Title.title(Component.text(${title}), Component.text(${sub})));\n`;
    }
    if (platform === 'spigot') {
      return `${p}.sendTitle(${title}, ${sub}, 10, 60, 10);\n`;
    }
    if (platform === 'velocity') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      addImport(ctx.out, 'net.kyori.adventure.title.Title');
      return `${p}.showTitle(Title.title(Component.text(${title}), Component.text(${sub})));\n`;
    }
    return '';
  };
  generator.forBlock['player_send_actionbar'] = function (block: any) {
    const msg = valueOrDefault(block, 'MESSAGE', '""', 'String');
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `${p}.sendActionBar(Component.text(${msg}));\n`;
    }
    if (platform === 'spigot') {
      addImport(ctx.out, 'net.md_5.bungee.api.ChatMessageType');
      addImport(ctx.out, 'net.md_5.bungee.api.chat.TextComponent');
      return `${p}.spigot().sendMessage(ChatMessageType.ACTION_BAR, new TextComponent(${msg}));\n`;
    }
    if (platform === 'velocity') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `${p}.sendActionBar(Component.text(${msg}));\n`;
    }
    return '';
  };
  generator.forBlock['player_send_tab'] = function (block: any) {
    const h = valueOrDefault(block, 'HEADER', '""', 'String');
    const f = valueOrDefault(block, 'FOOTER', '""', 'String');
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `${p}.sendPlayerListHeaderAndFooter(Component.text(${h}), Component.text(${f}));\n`;
    }
    if (platform === 'spigot') {
      return `${p}.setPlayerListHeaderFooter(${h}, ${f});\n`;
    }
    if (platform === 'velocity') {
      addImport(ctx.out, 'net.kyori.adventure.text.Component');
      return `${p}.sendPlayerListHeaderAndFooter(Component.text(${h}), Component.text(${f}));\n`;
    }
    return '';
  };
  generator.forBlock['player_set_compass_target'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Location');
      return `${p}.setCompassTarget(new Location(${p}.getWorld(), ${x}, ${y}, ${z}));\n`;
    }
    return '';
  };
  generator.forBlock['player_set_velocity'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.util.Vector');
      return `${p}.setVelocity(new Vector(${x}, ${y}, ${z}));\n`;
    }
    return '';
  };
  generator.forBlock['player_set_cooldown'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const m = block.getFieldValue('MATERIAL');
    const t = valueOrDefault(block, 'TICKS', '20', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Material');
      return `${p}.setCooldown(Material.${m}, (int)Math.round(${t}));\n`;
    }
    return '';
  };
  generator.forBlock['player_hide_others'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `for (org.bukkit.entity.Player __o : Bukkit.getOnlinePlayers()) { if (!__o.equals(${p})) ${p}.hidePlayer(this, __o); }\n`;
    }
    return '';
  };
  generator.forBlock['player_show_others'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `for (org.bukkit.entity.Player __o : Bukkit.getOnlinePlayers()) { ${p}.showPlayer(this, __o); }\n`;
    }
    return '';
  };

  // ============ SCOREBOARD ============
  generator.forBlock['scoreboard_create'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const t = valueOrDefault(block, 'TITLE', '""', 'String');
    if (platform === 'paper' || platform === 'spigot') {
      ctx.out.helpers.add('scoreboard');
      return `__createSidebar(${p}, ${t});\n`;
    }
    return '';
  };
  generator.forBlock['scoreboard_set_line'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const line = valueOrDefault(block, 'LINE', '0', 'Number');
    const text = valueOrDefault(block, 'TEXT', '""', 'String');
    if (platform === 'paper' || platform === 'spigot') {
      ctx.out.helpers.add('scoreboard');
      return `__setSidebarLine(${p}, (int)Math.round(${line}), ${text});\n`;
    }
    return '';
  };
  generator.forBlock['scoreboard_clear'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `${p}.setScoreboard(Bukkit.getScoreboardManager().getNewScoreboard());\n`;
    }
    return '';
  };

  // ============ BOSSBAR ============
  generator.forBlock['bossbar_show'] = function (block: any) {
    const t = valueOrDefault(block, 'TITLE', '""', 'String');
    const c = block.getFieldValue('COLOR');
    const prog = valueOrDefault(block, 'PROGRESS', '1.0', 'Number');
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      ctx.out.helpers.add('bossbar');
      return `__showBossBar(${p}, ${t}, "${c}", ${prog});\n`;
    }
    return '';
  };
  generator.forBlock['bossbar_hide'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    if (platform === 'paper' || platform === 'spigot') {
      ctx.out.helpers.add('bossbar');
      return `__hideBossBar(${p});\n`;
    }
    return '';
  };

  // ============ ITEM PERSISTENT-DATA MARKERS ============
  generator.forBlock['item_set_marker'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    const key = block.getFieldValue('KEY');
    const value = valueOrDefault(block, 'VALUE', '""', 'String');
    if (platform === 'paper' || platform === 'spigot') {
      ctx.out.helpers.add('withMeta');
      ctx.out.helpers.add('pdcKey');
      addImport(ctx.out, 'org.bukkit.persistence.PersistentDataType');
      return [
        `__withMeta((${item}), m -> m.getPersistentDataContainer().set(__pdcKey("${key}"), PersistentDataType.STRING, ${value}))`,
        ORDER_NONE,
      ];
    }
    return [`(${item})`, ORDER_NONE];
  };
  generator.forBlock['item_has_marker'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    const key = block.getFieldValue('KEY');
    if (platform === 'paper' || platform === 'spigot') {
      ctx.out.helpers.add('pdcKey');
      addImport(ctx.out, 'org.bukkit.persistence.PersistentDataType');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [
        `((${item}) != null && ((ItemStack)(${item})).hasItemMeta() && ((ItemStack)(${item})).getItemMeta().getPersistentDataContainer().has(__pdcKey("${key}"), PersistentDataType.STRING))`,
        ORDER_NONE,
      ];
    }
    return ['false', ORDER_NONE];
  };
  generator.forBlock['item_get_marker'] = function (block: any) {
    const item = valueOrDefault(block, 'ITEM', 'null');
    const key = block.getFieldValue('KEY');
    if (platform === 'paper' || platform === 'spigot') {
      ctx.out.helpers.add('pdcKey');
      addImport(ctx.out, 'org.bukkit.persistence.PersistentDataType');
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      return [
        `(((ItemStack)(${item})) != null && ((ItemStack)(${item})).hasItemMeta() ? ((ItemStack)(${item})).getItemMeta().getPersistentDataContainer().getOrDefault(__pdcKey("${key}"), PersistentDataType.STRING, "") : "")`,
        ORDER_NONE,
      ];
    }
    return [`""`, ORDER_NONE];
  };

  // ============ MATERIAL FLEXIBILITY ============
  generator.forBlock['material_from_name'] = function (block: any) {
    const n = block.getFieldValue('NAME');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Material');
      return [`Material.valueOf("${n.toUpperCase().replace(/[^A-Z0-9_]/g, '')}")`, ORDER_NONE];
    }
    return [`null`, ORDER_NONE];
  };
  generator.forBlock['item_create_dynamic'] = function (block: any) {
    const amt = valueOrDefault(block, 'AMOUNT', '1', 'Number');
    const mat = valueOrDefault(block, 'MATERIAL', 'org.bukkit.Material.STONE');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.inventory.ItemStack');
      addImport(ctx.out, 'org.bukkit.Material');
      return [
        `new ItemStack((Material)(${mat}), (int)Math.round(${amt}))`,
        ORDER_NONE,
      ];
    }
    return ['null', ORDER_NONE];
  };

  // ============ ADDITIONAL EVENTS ============
  generator.forBlock['event_player_respawn'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'org.bukkit.event.player.PlayerRespawnEvent', body);
    return '';
  };
  generator.forBlock['event_player_swap_hand'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    emitListener(
      'on' + ctx.uid(),
      'org.bukkit.event.player.PlayerSwapHandItemsEvent',
      body
    );
    return '';
  };
  generator.forBlock['event_player_drop_item'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'org.bukkit.event.player.PlayerDropItemEvent', body);
    return '';
  };
  generator.forBlock['event_player_food_change'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    const body = withEventScope(
      '(event.getEntity() instanceof org.bukkit.entity.Player ? (org.bukkit.entity.Player)event.getEntity() : null)',
      () => stmt(block, 'DO')
    );
    emitListener(
      'on' + ctx.uid(),
      'org.bukkit.event.entity.FoodLevelChangeEvent',
      body
    );
    return '';
  };
  generator.forBlock['event_weather_change'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    const body = withEventScope('null', () => stmt(block, 'DO'));
    emitListener('on' + ctx.uid(), 'org.bukkit.event.weather.WeatherChangeEvent', body);
    return '';
  };
  generator.forBlock['event_player_command_preprocess'] = function (block: any) {
    if (platform === 'velocity' || platform === 'bungee') return '';
    const body = withEventScope('event.getPlayer()', () => stmt(block, 'DO'));
    emitListener(
      'on' + ctx.uid(),
      'org.bukkit.event.player.PlayerCommandPreprocessEvent',
      body
    );
    return '';
  };
  generator.forBlock['event_held_item'] = function () {
    if (currentScope() !== 'event') return ['null', ORDER_NONE];
    if (platform === 'paper' || platform === 'spigot') {
      return [
        `(((Object) event) instanceof org.bukkit.event.player.PlayerInteractEvent __pie ? __pie.getItem() : null)`,
        ORDER_NONE,
      ];
    }
    return ['null', ORDER_NONE];
  };
  generator.forBlock['event_clicked_block_x'] = function (block: any) {
    if (currentScope() !== 'event') return ['0', ORDER_NONE];
    const axis = block.getFieldValue('AXIS').toUpperCase();
    if (platform === 'paper' || platform === 'spigot') {
      return [
        `(((Object) event) instanceof org.bukkit.event.player.PlayerInteractEvent __pie && __pie.getClickedBlock() != null ? __pie.getClickedBlock().get${axis}() : 0)`,
        ORDER_NONE,
      ];
    }
    return ['0', ORDER_NONE];
  };
  generator.forBlock['event_command_text'] = function () {
    if (currentScope() !== 'event') return [`""`, ORDER_NONE];
    if (platform === 'paper' || platform === 'spigot') {
      return [
        `(((Object) event) instanceof org.bukkit.event.player.PlayerCommandPreprocessEvent __pcp ? __pcp.getMessage() : "")`,
        ORDER_NONE,
      ];
    }
    return [`""`, ORDER_NONE];
  };

  // ============ SPAWN / CONSOLE ============
  generator.forBlock['world_set_spawn'] = function (block: any) {
    const x = valueOrDefault(block, 'X', '0', 'Number');
    const y = valueOrDefault(block, 'Y', '0', 'Number');
    const z = valueOrDefault(block, 'Z', '0', 'Number');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `Bukkit.getWorlds().get(0).setSpawnLocation((int)Math.round(${x}), (int)Math.round(${y}), (int)Math.round(${z}));\n`;
    }
    return '';
  };
  generator.forBlock['console_log'] = function (block: any) {
    const m = valueOrDefault(block, 'MESSAGE', '""', 'String');
    if (platform === 'paper' || platform === 'spigot') return `getLogger().info(${m});\n`;
    if (platform === 'velocity' || platform === 'bungee') return `logger.info(${m});\n`;
    return '';
  };
  generator.forBlock['console_run_command'] = function (block: any) {
    const c = valueOrDefault(block, 'CMD', '""', 'String');
    if (platform === 'paper' || platform === 'spigot') {
      addImport(ctx.out, 'org.bukkit.Bukkit');
      return `Bukkit.dispatchCommand(Bukkit.getConsoleSender(), ${c});\n`;
    }
    return '';
  };
  generator.forBlock['player_run_command'] = function (block: any) {
    const p = valueOrDefault(block, 'PLAYER', '', 'Player');
    const c = valueOrDefault(block, 'CMD', '""', 'String');
    if (platform === 'paper' || platform === 'spigot') return `${p}.performCommand(${c});\n`;
    return '';
  };

  // ============ STANDARD BLOCKLY BLOCKS (translated to Java) ============
  generator.forBlock['controls_if'] = function (block: any) {
    let n = 0;
    let code = '';
    let condition: string;
    let branch: string;
    do {
      condition =
        (generator as any).valueToCode(block, 'IF' + n, ORDER_NONE) || 'false';
      branch = stmt(block, 'DO' + n);
      code +=
        (n === 0 ? '' : 'else ') + `if (${condition}) {\n${indent(branch)}\n}`;
      n++;
    } while (block.getInput('IF' + n));
    if (block.getInput('ELSE')) {
      branch = stmt(block, 'ELSE');
      code += ` else {\n${indent(branch)}\n}`;
    }
    return code + '\n';
  };
  generator.forBlock['logic_compare'] = function (block: any) {
    const opKey = block.getFieldValue('OP');
    // For EQ/NEQ: an empty slot most often means "compare to empty string"
    // (e.g. `if config-string == ""`). Default to `""` rather than `0`.
    const isEqOp = opKey === 'EQ' || opKey === 'NEQ';
    const a = valueOrDefault(block, 'A', isEqOp ? '""' : '0');
    const b = valueOrDefault(block, 'B', isEqOp ? '""' : '0');
    // Use Objects.equals for EQ/NEQ — works for primitives (auto-box) AND
    // strings/objects, which `==` does not.
    if (isEqOp) {
      addImport(ctx.out, 'java.util.Objects');
      const inner = `Objects.equals(${a}, ${b})`;
      return [opKey === 'EQ' ? inner : `!${inner}`, ORDER_NONE];
    }
    const ops: any = { LT: '<', LTE: '<=', GT: '>', GTE: '>=' };
    return [`(${a}) ${ops[opKey]} (${b})`, ORDER_NONE];
  };
  generator.forBlock['logic_operation'] = function (block: any) {
    const op = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
    const a = valueOrDefault(block, 'A', 'false', 'Boolean');
    const b = valueOrDefault(block, 'B', 'false', 'Boolean');
    return [`(${a}) ${op} (${b})`, ORDER_NONE];
  };
  generator.forBlock['logic_negate'] = function (block: any) {
    const a = valueOrDefault(block, 'BOOL', 'false', 'Boolean');
    return [`!(${a})`, ORDER_NONE];
  };
  generator.forBlock['logic_boolean'] = function (block: any) {
    return [block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false', ORDER_NONE];
  };
  generator.forBlock['logic_null'] = function () {
    return ['null', ORDER_NONE];
  };
  generator.forBlock['math_number'] = function (block: any) {
    return [String(Number(block.getFieldValue('NUM'))), ORDER_NONE];
  };
  generator.forBlock['math_arithmetic'] = function (block: any) {
    const ops: any = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', POWER: 'POW' };
    const op = ops[block.getFieldValue('OP')];
    const a = valueOrDefault(block, 'A', '0', 'Number');
    const b = valueOrDefault(block, 'B', '0', 'Number');
    if (op === 'POW') return [`Math.pow(${a}, ${b})`, ORDER_NONE];
    return [`(${a}) ${op} (${b})`, ORDER_NONE];
  };
  generator.forBlock['math_random_int'] = function (block: any) {
    const a = valueOrDefault(block, 'FROM', '0', 'Number');
    const b = valueOrDefault(block, 'TO', '100', 'Number');
    return [`(int)(Math.random() * ((${b}) - (${a}) + 1) + (${a}))`, ORDER_NONE];
  };
  generator.forBlock['text'] = function (block: any) {
    return [quoteString(block.getFieldValue('TEXT')), ORDER_NONE];
  };
  generator.forBlock['text_join'] = function (block: any) {
    const n = (block as any).itemCount_ ?? 0;
    if (n === 0) return ['""', ORDER_NONE];
    if (n === 1) {
      const v = (generator as any).valueToCode(block, 'ADD0', ORDER_NONE) || '""';
      return [`String.valueOf(${v})`, ORDER_NONE];
    }
    const parts: string[] = [];
    for (let i = 0; i < n; i++) {
      parts.push((generator as any).valueToCode(block, 'ADD' + i, ORDER_NONE) || '""');
    }
    return [parts.map((p) => `String.valueOf(${p})`).join(' + '), ORDER_NONE];
  };
  generator.forBlock['text_length'] = function (block: any) {
    const v = valueOrDefault(block, 'VALUE', '""', 'String');
    return [`(${v}).length()`, ORDER_NONE];
  };

  // Variables — generate Java field declarations + assignments
  generator.forBlock['variables_get'] = function (block: any) {
    const name = sanitizeIdent(block.getField('VAR')!.getText());
    return [name, ORDER_NONE];
  };
  generator.forBlock['variables_set'] = function (block: any) {
    const name = sanitizeIdent(block.getField('VAR')!.getText());
    const value = valueOrDefault(block, 'VALUE', '0');
    if (!ctx.out.fields.find((f) => f.includes(' ' + name + ' '))) {
      ctx.out.fields.push(`private Object ${name} = null;`);
    }
    return `${name} = ${value};\n`;
  };

  return {
    generate(workspace: Blockly.Workspace): GeneratorOutput {
      let counter = 0;
      const out: GeneratorOutput = {
        imports: new Set<string>(),
        fields: [],
        listeners: [],
        commands: [],
        onEnable: [],
        onDisable: [],
        helpers: new Set<string>(),
      };
      ctx = {
        out,
        platform,
        uid: () => 'Handler' + (++counter),
        scope: [],
      };
      (generator as any).init?.(workspace);
      // Walk all top-level (event) blocks
      const top = workspace.getTopBlocks(true);
      for (const block of top) {
        (generator as any).blockToCode(block);
      }
      return out;
    },
  };
}

function eventClass(kind: string, platform: Platform): string {
  if (platform === 'paper' || platform === 'spigot') {
    if (kind === 'player_join') return 'org.bukkit.event.player.PlayerJoinEvent';
    if (kind === 'player_quit') return 'org.bukkit.event.player.PlayerQuitEvent';
    if (kind === 'player_chat')
      return platform === 'paper'
        ? 'io.papermc.paper.event.player.AsyncChatEvent'
        : 'org.bukkit.event.player.AsyncPlayerChatEvent';
  }
  if (platform === 'velocity') {
    if (kind === 'player_join') return 'com.velocitypowered.api.event.connection.PostLoginEvent';
    if (kind === 'player_quit') return 'com.velocitypowered.api.event.connection.DisconnectEvent';
    if (kind === 'player_chat') return 'com.velocitypowered.api.event.player.PlayerChatEvent';
  }
  if (platform === 'bungee') {
    if (kind === 'player_join') return 'net.md_5.bungee.api.event.PostLoginEvent';
    if (kind === 'player_quit') return 'net.md_5.bungee.api.event.PlayerDisconnectEvent';
    if (kind === 'player_chat') return 'net.md_5.bungee.api.event.ChatEvent';
  }
  return 'java.lang.Object';
}

function shortName(fqn: string): string {
  return fqn.substring(fqn.lastIndexOf('.') + 1);
}

function addImport(out: GeneratorOutput, fqn: string) {
  if (fqn.startsWith('java.lang.')) return;
  out.imports.add(fqn);
}

function indent(s: string): string {
  if (!s) return '';
  return s
    .split('\n')
    .map((l) => (l ? '    ' + l : l))
    .join('\n');
}

function sanitizeIdent(name: string): string {
  let n = (name || 'var').replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^[0-9]/.test(n)) n = '_' + n;
  return n;
}

function enchantToKey(name: string): string {
  // Map our internal enchant names to Minecraft NamespacedKey ids.
  const map: Record<string, string> = {
    SHARPNESS: 'sharpness',
    PROTECTION: 'protection',
    EFFICIENCY: 'efficiency',
    FORTUNE: 'fortune',
    SILK_TOUCH: 'silk_touch',
    UNBREAKING: 'unbreaking',
    FIRE_PROTECTION: 'fire_protection',
    POWER: 'power',
    FLAME: 'flame',
    INFINITY: 'infinity',
    LOOTING: 'looting',
  };
  return map[name] ?? name.toLowerCase();
}
