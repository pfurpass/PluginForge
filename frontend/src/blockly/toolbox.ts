import type { Platform } from '../types';
import { t } from '../i18n';

const PLATFORM_DISABLED: Record<string, Platform[]> = {
  // Blocks not available on these platforms
  event_block_break: ['velocity', 'bungee'],
  event_block_place: ['velocity', 'bungee'],
  event_player_death: ['velocity', 'bungee'],
  event_player_move: ['velocity', 'bungee'],
  event_player_interact: ['velocity', 'bungee'],
  event_entity_death: ['velocity', 'bungee'],
  event_entity_damage: ['velocity', 'bungee'],
  event_inventory_click: ['velocity', 'bungee'],
  event_item_picked_up: ['velocity', 'bungee'],
  event_player_login: ['paper', 'spigot', 'bungee'],
  event_proxy_ping: ['paper', 'spigot', 'velocity'],
  player_teleport: ['velocity', 'bungee'],
  player_give_item: ['velocity', 'bungee'],
  player_give_itemstack: ['velocity', 'bungee'],
  player_set_held_item: ['velocity', 'bungee'],
  player_set_armor: ['velocity', 'bungee'],
  player_clear_inventory: ['velocity', 'bungee'],
  player_get_held_item: ['velocity', 'bungee'],
  player_set_health: ['velocity', 'bungee'],
  player_set_food: ['velocity', 'bungee'],
  player_get_health: ['velocity', 'bungee'],
  player_get_food: ['velocity', 'bungee'],
  player_set_level: ['velocity', 'bungee'],
  player_give_xp: ['velocity', 'bungee'],
  player_set_flying: ['velocity', 'bungee'],
  player_set_walk_speed: ['velocity', 'bungee'],
  player_add_potion_effect: ['velocity', 'bungee'],
  player_remove_potion_effect: ['velocity', 'bungee'],
  player_set_gamemode: ['velocity', 'bungee'],
  player_play_sound: ['velocity', 'bungee'],
  player_location: ['velocity', 'bungee'],
  world_set_block: ['velocity', 'bungee'],
  world_strike_lightning: ['velocity', 'bungee'],
  world_spawn_entity: ['velocity', 'bungee'],
  world_set_time: ['velocity', 'bungee'],
  world_set_weather: ['velocity', 'bungee'],
  world_broadcast: ['velocity', 'bungee'],
  world_get_block_type: ['velocity', 'bungee'],
  world_drop_item: ['velocity', 'bungee'],
  world_create_explosion: ['velocity', 'bungee'],
  world_play_particle: ['velocity', 'bungee'],
  event_block_location: ['velocity', 'bungee'],
  config_get_string: ['velocity', 'bungee'],
  config_get_int: ['velocity', 'bungee'],
  config_set: ['velocity', 'bungee'],
  config_save: ['velocity', 'bungee'],
  player_send_to_server: ['paper', 'spigot'],
  network_get_servers: ['paper', 'spigot'],
  network_get_current_server: ['paper', 'spigot'],
  // Items category — Bukkit-only
  item_create: ['velocity', 'bungee'],
  item_set_name: ['velocity', 'bungee'],
  item_add_lore: ['velocity', 'bungee'],
  item_add_enchant: ['velocity', 'bungee'],
  item_unbreakable: ['velocity', 'bungee'],
  item_get_name: ['velocity', 'bungee'],
  item_get_type: ['velocity', 'bungee'],
  item_get_amount: ['velocity', 'bungee'],
  item_is_type: ['velocity', 'bungee'],
  item_set_marker: ['velocity', 'bungee'],
  item_has_marker: ['velocity', 'bungee'],
  item_get_marker: ['velocity', 'bungee'],
  material_from_name: ['velocity', 'bungee'],
  item_create_dynamic: ['velocity', 'bungee'],
  // GUI / Inventory menus — Bukkit-only
  gui_create_inventory: ['velocity', 'bungee'],
  gui_set_slot: ['velocity', 'bungee'],
  gui_open_for_player: ['velocity', 'bungee'],
  gui_close_for_player: ['velocity', 'bungee'],
  gui_fill_borders: ['velocity', 'bungee'],
  // Scoreboard / BossBar — Bukkit-only
  scoreboard_create: ['velocity', 'bungee'],
  scoreboard_set_line: ['velocity', 'bungee'],
  scoreboard_clear: ['velocity', 'bungee'],
  bossbar_show: ['velocity', 'bungee'],
  bossbar_hide: ['velocity', 'bungee'],
  // UI extras
  player_send_actionbar: ['bungee'],
  player_send_tab: ['bungee'],
  player_set_compass_target: ['velocity', 'bungee'],
  player_set_velocity: ['velocity', 'bungee'],
  player_set_cooldown: ['velocity', 'bungee'],
  player_hide_others: ['velocity', 'bungee'],
  player_show_others: ['velocity', 'bungee'],
  player_run_command: ['velocity', 'bungee'],
  // Bukkit-only events
  event_player_respawn: ['velocity', 'bungee'],
  event_player_swap_hand: ['velocity', 'bungee'],
  event_player_drop_item: ['velocity', 'bungee'],
  event_player_food_change: ['velocity', 'bungee'],
  event_weather_change: ['velocity', 'bungee'],
  event_player_command_preprocess: ['velocity', 'bungee'],
  event_held_item: ['velocity', 'bungee'],
  event_clicked_block_x: ['velocity', 'bungee'],
  event_command_text: ['velocity', 'bungee'],
  world_set_spawn: ['velocity', 'bungee'],
  console_run_command: ['velocity', 'bungee'],
};

function visible(blockType: string, platform: Platform): boolean {
  const disabled = PLATFORM_DISABLED[blockType];
  if (!disabled) return true;
  return !disabled.includes(platform);
}

function block(type: string, platform: Platform): any | null {
  if (!visible(type, platform)) return null;
  return { kind: 'block', type };
}

function shadow(type: string, value: any): any {
  return {
    shadow: { type, fields: value },
  };
}

function numberShadow(value = 0): any {
  return { shadow: { type: 'math_number', fields: { NUM: value } } };
}

function textShadow(value = ''): any {
  return { shadow: { type: 'text', fields: { TEXT: value } } };
}

function blockWith(type: string, inputs: Record<string, any>, platform: Platform): any | null {
  if (!visible(type, platform)) return null;
  return { kind: 'block', type, inputs };
}

/**
 * Per-event-type "context" categories — only shown when the matching event hat
 * block is on the canvas. Lets users see exactly what's available to read or
 * tweak inside a given event handler (e.g. "set join message" only for
 * PlayerJoinEvent).
 */
function eventContextCategory(eventType: string, platform: Platform): any | null {
  // Bukkit-only events
  const bukkit = platform === 'paper' || platform === 'spigot';

  if (eventType === 'event_player_join' && bukkit) {
    return {
      kind: 'category',
      name: '📩 Join-Event',
      colour: '45',
      contents: [
        { kind: 'block', type: 'event_join_set_message' },
        { kind: 'block', type: 'event_join_clear_message' },
      ],
    };
  }
  if (eventType === 'event_player_quit' && bukkit) {
    return {
      kind: 'category',
      name: '👋 Quit-Event',
      colour: '45',
      contents: [
        { kind: 'block', type: 'event_quit_set_message' },
        { kind: 'block', type: 'event_quit_clear_message' },
      ],
    };
  }
  if (eventType === 'event_player_death' && bukkit) {
    return {
      kind: 'category',
      name: '💀 Death-Event',
      colour: '45',
      contents: [
        { kind: 'block', type: 'event_death_set_message' },
        { kind: 'block', type: 'event_death_set_keep_inventory' },
        { kind: 'block', type: 'event_death_set_keep_xp' },
      ],
    };
  }
  if (eventType === 'event_player_chat' && bukkit) {
    const contents: any[] = [
      { kind: 'block', type: 'event_chat_set_message' },
      { kind: 'block', type: 'event_chat_message' },
    ];
    if (platform === 'spigot') {
      contents.push({ kind: 'block', type: 'event_chat_set_format' });
    }
    return {
      kind: 'category',
      name: '💬 Chat-Event',
      colour: '45',
      contents,
    };
  }
  if (eventType === 'event_player_interact' && bukkit) {
    return {
      kind: 'category',
      name: '👆 Interact-Event',
      colour: '45',
      contents: [
        { kind: 'block', type: 'event_interact_is_right_click' },
        { kind: 'block', type: 'event_interact_is_left_click' },
        { kind: 'block', type: 'event_interact_is_air' },
        { kind: 'block', type: 'event_held_item' },
        { kind: 'block', type: 'event_clicked_block_x' },
      ],
    };
  }
  if (eventType === 'event_inventory_click' && bukkit) {
    return {
      kind: 'category',
      name: '🖱 Inv-Click-Event',
      colour: '45',
      contents: [
        { kind: 'block', type: 'event_clicked_slot' },
        { kind: 'block', type: 'event_clicked_item' },
        { kind: 'block', type: 'event_inventory_title' },
        { kind: 'block', type: 'event_inv_is_left_click' },
        { kind: 'block', type: 'event_inv_is_right_click' },
        { kind: 'block', type: 'event_inv_is_shift_click' },
      ],
    };
  }
  if (eventType === 'event_block_break' && bukkit) {
    return {
      kind: 'category',
      name: '⛏ Break-Event',
      colour: '45',
      contents: [
        { kind: 'block', type: 'event_block_location' },
        { kind: 'block', type: 'event_break_set_exp' },
        { kind: 'block', type: 'event_break_set_drops' },
      ],
    };
  }
  if (eventType === 'event_block_place' && bukkit) {
    return {
      kind: 'category',
      name: '🧱 Place-Event',
      colour: '45',
      contents: [{ kind: 'block', type: 'event_block_location' }],
    };
  }
  if (eventType === 'event_entity_damage' && bukkit) {
    return {
      kind: 'category',
      name: '💥 Damage-Event',
      colour: '45',
      contents: [
        { kind: 'block', type: 'event_damage_get' },
        { kind: 'block', type: 'event_damage_set' },
        { kind: 'block', type: 'event_damage_get_cause' },
      ],
    };
  }
  if (eventType === 'event_player_command_preprocess' && bukkit) {
    return {
      kind: 'category',
      name: '⌨ Command-Preprocess',
      colour: '45',
      contents: [
        { kind: 'block', type: 'event_command_text' },
        { kind: 'block', type: 'event_command_set_text' },
      ],
    };
  }
  return null;
}

export function buildToolbox(platform: Platform, activeEvents?: Set<string>): any {
  const events: any = {
    kind: 'category',
    name: '⚡  ' + t('category_events'),
    colour: '45',
    contents: [
      block('event_player_join', platform),
      block('event_player_quit', platform),
      block('event_player_chat', platform),
      block('event_block_break', platform),
      block('event_block_place', platform),
      block('event_player_death', platform),
      block('event_player_move', platform),
      block('event_player_interact', platform),
      block('event_player_respawn', platform),
      block('event_player_swap_hand', platform),
      block('event_player_drop_item', platform),
      block('event_player_food_change', platform),
      block('event_player_command_preprocess', platform),
      block('event_entity_death', platform),
      block('event_entity_damage', platform),
      block('event_inventory_click', platform),
      block('event_item_picked_up', platform),
      block('event_weather_change', platform),
      block('event_player_login', platform),
      block('event_proxy_ping', platform),
      block('event_server_start', platform),
      block('event_set_cancelled', platform),
      block('event_chat_message', platform),
      block('event_command_text', platform),
      block('event_block_location', platform),
      block('event_clicked_block_x', platform),
      block('event_clicked_slot', platform),
      block('event_clicked_item', platform),
      block('event_inventory_title', platform),
      block('event_held_item', platform),
    ].filter(Boolean),
  };

  const player: any = {
    kind: 'category',
    name: '🧑  ' + t('category_player'),
    colour: '210',
    contents: [
      block('player_event', platform),
      block('player_get_name', platform),
      blockWith(
        'player_send_message',
        { MESSAGE: textShadow('Hallo!'), PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith('player_broadcast', { MESSAGE: textShadow('Server-Nachricht') }, platform),
      blockWith(
        'player_teleport',
        {
          PLAYER: { block: { type: 'player_event' } },
          X: numberShadow(0),
          Y: numberShadow(100),
          Z: numberShadow(0),
        },
        platform
      ),
      blockWith(
        'player_give_item',
        { AMOUNT: numberShadow(1), PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_set_health',
        { PLAYER: { block: { type: 'player_event' } }, VALUE: numberShadow(20) },
        platform
      ),
      blockWith(
        'player_set_food',
        { PLAYER: { block: { type: 'player_event' } }, VALUE: numberShadow(20) },
        platform
      ),
      blockWith(
        'player_set_gamemode',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_kick',
        { PLAYER: { block: { type: 'player_event' } }, REASON: textShadow('bye') },
        platform
      ),
      blockWith(
        'player_play_sound',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_send_to_server',
        { PLAYER: { block: { type: 'player_event' } }, SERVER: textShadow('lobby') },
        platform
      ),
      blockWith(
        'player_location',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_give_itemstack',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_set_held_item',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_set_armor',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_clear_inventory',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_get_held_item',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_get_health',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_get_food',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_set_level',
        { PLAYER: { block: { type: 'player_event' } }, LEVEL: numberShadow(1) },
        platform
      ),
      blockWith(
        'player_give_xp',
        { AMOUNT: numberShadow(10), PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_set_flying',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_set_walk_speed',
        { PLAYER: { block: { type: 'player_event' } }, SPEED: numberShadow(0.2) },
        platform
      ),
      blockWith(
        'player_add_potion_effect',
        {
          PLAYER: { block: { type: 'player_event' } },
          SECONDS: numberShadow(30),
          AMPLIFIER: numberShadow(1),
        },
        platform
      ),
      blockWith(
        'player_remove_potion_effect',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_get_uuid',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_get_world_name',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith('player_get_by_name', { NAME: textShadow('Notch') }, platform),
      block('players_online', platform),
      blockWith(
        'player_send_title',
        {
          PLAYER: { block: { type: 'player_event' } },
          TITLE: textShadow('Willkommen!'),
          SUBTITLE: textShadow('Viel Spaß'),
        },
        platform
      ),
      blockWith(
        'player_send_actionbar',
        { PLAYER: { block: { type: 'player_event' } }, MESSAGE: textShadow('Hallo') },
        platform
      ),
      blockWith(
        'player_send_tab',
        {
          PLAYER: { block: { type: 'player_event' } },
          HEADER: textShadow('=== Lobby ==='),
          FOOTER: textShadow('mc.example.de'),
        },
        platform
      ),
      blockWith(
        'player_set_compass_target',
        {
          PLAYER: { block: { type: 'player_event' } },
          X: numberShadow(0),
          Y: numberShadow(100),
          Z: numberShadow(0),
        },
        platform
      ),
      blockWith(
        'player_set_velocity',
        {
          PLAYER: { block: { type: 'player_event' } },
          X: numberShadow(0),
          Y: numberShadow(1.2),
          Z: numberShadow(0),
        },
        platform
      ),
      blockWith(
        'player_set_cooldown',
        { PLAYER: { block: { type: 'player_event' } }, TICKS: numberShadow(40) },
        platform
      ),
      blockWith(
        'player_hide_others',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_show_others',
        { PLAYER: { block: { type: 'player_event' } } },
        platform
      ),
      blockWith(
        'player_run_command',
        {
          PLAYER: { block: { type: 'player_event' } },
          CMD: textShadow('say hi'),
        },
        platform
      ),
    ].filter(Boolean),
  };

  const world: any = {
    kind: 'category',
    name: '🌍  ' + t('category_world'),
    colour: '120',
    contents: [
      blockWith(
        'world_set_block',
        { X: numberShadow(0), Y: numberShadow(64), Z: numberShadow(0) },
        platform
      ),
      blockWith(
        'world_strike_lightning',
        { X: numberShadow(0), Y: numberShadow(64), Z: numberShadow(0) },
        platform
      ),
      blockWith(
        'world_spawn_entity',
        { X: numberShadow(0), Y: numberShadow(70), Z: numberShadow(0) },
        platform
      ),
      block('world_set_time', platform),
      block('world_set_weather', platform),
      blockWith('world_broadcast', { MESSAGE: textShadow('Hallo Welt!') }, platform),
      blockWith(
        'world_get_block_type',
        { X: numberShadow(0), Y: numberShadow(64), Z: numberShadow(0) },
        platform
      ),
      blockWith(
        'world_drop_item',
        { X: numberShadow(0), Y: numberShadow(64), Z: numberShadow(0) },
        platform
      ),
      blockWith(
        'world_create_explosion',
        {
          POWER: numberShadow(4),
          X: numberShadow(0),
          Y: numberShadow(64),
          Z: numberShadow(0),
        },
        platform
      ),
      blockWith(
        'world_play_particle',
        {
          X: numberShadow(0),
          Y: numberShadow(64),
          Z: numberShadow(0),
          COUNT: numberShadow(10),
        },
        platform
      ),
      blockWith(
        'world_set_spawn',
        { X: numberShadow(0), Y: numberShadow(64), Z: numberShadow(0) },
        platform
      ),
    ].filter(Boolean),
  };

  const items: any =
    platform === 'paper' || platform === 'spigot'
      ? {
          kind: 'category',
          name: '🎒  Items',
          colour: '30',
          contents: [
            blockWith('item_create', { AMOUNT: numberShadow(1) }, platform),
            blockWith(
              'item_create_dynamic',
              {
                AMOUNT: numberShadow(1),
                MATERIAL: { block: { type: 'material_from_name' } },
              },
              platform
            ),
            block('material_from_name', platform),
            blockWith(
              'item_set_name',
              { NAME: textShadow('Mein Item') },
              platform
            ),
            blockWith('item_add_lore', { LORE: textShadow('cool') }, platform),
            blockWith('item_add_enchant', { LEVEL: numberShadow(1) }, platform),
            block('item_unbreakable', platform),
            block('item_get_name', platform),
            block('item_get_type', platform),
            block('item_get_amount', platform),
            block('item_is_type', platform),
            blockWith(
              'item_set_marker',
              { VALUE: textShadow('lobby') },
              platform
            ),
            block('item_has_marker', platform),
            block('item_get_marker', platform),
          ].filter(Boolean),
        }
      : null;

  const gui: any =
    platform === 'paper' || platform === 'spigot'
      ? {
          kind: 'category',
          name: '📋  GUI / Menüs',
          colour: '250',
          contents: [
            blockWith(
              'gui_create_inventory',
              { TITLE: textShadow('Lobby Navigator') },
              platform
            ),
            blockWith('gui_set_slot', { SLOT: numberShadow(0) }, platform),
            block('gui_open_for_player', platform),
            block('gui_close_for_player', platform),
            block('gui_fill_borders', platform),
          ].filter(Boolean),
        }
      : null;

  const scoreboard: any =
    platform === 'paper' || platform === 'spigot'
      ? {
          kind: 'category',
          name: '📊  Scoreboard',
          colour: '60',
          contents: [
            blockWith(
              'scoreboard_create',
              { TITLE: textShadow('=== Info ===') },
              platform
            ),
            blockWith(
              'scoreboard_set_line',
              { LINE: numberShadow(0), TEXT: textShadow('Welt: spawn') },
              platform
            ),
            block('scoreboard_clear', platform),
          ].filter(Boolean),
        }
      : null;

  const bossbar: any =
    platform === 'paper' || platform === 'spigot'
      ? {
          kind: 'category',
          name: '🎯  BossBar',
          colour: '350',
          contents: [
            blockWith(
              'bossbar_show',
              {
                TITLE: textShadow('Lobby — willkommen'),
                PROGRESS: numberShadow(1),
              },
              platform
            ),
            block('bossbar_hide', platform),
          ].filter(Boolean),
        }
      : null;

  const console: any =
    platform === 'paper' || platform === 'spigot'
      ? {
          kind: 'category',
          name: '🖥  Konsole',
          colour: '200',
          contents: [
            { kind: 'block', type: 'console_log', inputs: { MESSAGE: textShadow('Hallo Konsole') } },
            block('console_run_command', platform),
          ].filter(Boolean),
        }
      : null;

  const logic: any = {
    kind: 'category',
    name: '🔀  ' + t('category_logic'),
    colour: '30',
    contents: [
      { kind: 'block', type: 'controls_if' },
      // Pre-filled with empty text on both sides so the slots are visible and
      // tappable. Users can drag any other reporter on top to replace.
      {
        kind: 'block',
        type: 'logic_compare',
        inputs: { A: textShadow(''), B: textShadow('') },
      },
      { kind: 'block', type: 'logic_operation' },
      { kind: 'block', type: 'logic_negate' },
      { kind: 'block', type: 'logic_boolean' },
      { kind: 'block', type: 'flow_return' },
      { kind: 'block', type: 'flow_return_value' },
    ],
  };

  const variables: any = {
    kind: 'category',
    name: '📦  ' + t('category_variables'),
    colour: '0',
    custom: 'VARIABLE',
  };

  const commands: any = {
    kind: 'category',
    name: '⌘  ' + t('category_commands'),
    colour: '285',
    contents: [
      block('command_define', platform),
      block('command_sender', platform),
      blockWith('command_arg', { INDEX: numberShadow(0) }, platform),
      block('command_arg_count', platform),
    ].filter(Boolean),
  };

  const scheduler: any = {
    kind: 'category',
    name: '⏱  ' + t('category_scheduler'),
    colour: '180',
    contents: [
      blockWith('scheduler_wait', { TICKS: numberShadow(20) }, platform),
      blockWith('scheduler_repeat', { TICKS: numberShadow(20) }, platform),
    ].filter(Boolean),
  };

  const config: any =
    platform === 'paper' || platform === 'spigot'
      ? {
          kind: 'category',
          name: '⚙  ' + t('category_config'),
          colour: '200',
          contents: [
            block('config_get_string', platform),
            block('config_get_int', platform),
            blockWith('config_set', { VALUE: textShadow('value') }, platform),
            block('config_save', platform),
          ].filter(Boolean),
        }
      : null;

  const permissions: any = {
    kind: 'category',
    name: '🔐  ' + t('category_permissions'),
    colour: '330',
    contents: [
      blockWith('permission_check', { PLAYER: { block: { type: 'player_event' } } }, platform),
      blockWith('permission_is_op', { PLAYER: { block: { type: 'player_event' } } }, platform),
    ].filter(Boolean),
  };

  const network: any =
    platform === 'velocity' || platform === 'bungee'
      ? {
          kind: 'category',
          name: '🌐  ' + t('category_network'),
          colour: '260',
          contents: [
            block('player_send_to_server', platform),
            block('network_get_servers', platform),
            blockWith(
              'network_get_current_server',
              { PLAYER: { block: { type: 'player_event' } } },
              platform
            ),
          ].filter(Boolean),
        }
      : null;

  const text: any = {
    kind: 'category',
    name: '✏  ' + t('category_text'),
    colour: '160',
    contents: [
      { kind: 'block', type: 'text' },
      // Pre-configured join variants for 2 / 3 / 4 / 5 parts so users don't
      // need to discover Blockly's mutator gear icon.
      {
        kind: 'block',
        type: 'text_join',
        extraState: { itemCount: 2 },
        inputs: {
          ADD0: textShadow(''),
          ADD1: textShadow(''),
        },
      },
      {
        kind: 'block',
        type: 'text_join',
        extraState: { itemCount: 3 },
        inputs: {
          ADD0: textShadow(''),
          ADD1: textShadow(''),
          ADD2: textShadow(''),
        },
      },
      {
        kind: 'block',
        type: 'text_join',
        extraState: { itemCount: 4 },
        inputs: {
          ADD0: textShadow(''),
          ADD1: textShadow(''),
          ADD2: textShadow(''),
          ADD3: textShadow(''),
        },
      },
      {
        kind: 'block',
        type: 'text_join',
        extraState: { itemCount: 5 },
        inputs: {
          ADD0: textShadow(''),
          ADD1: textShadow(''),
          ADD2: textShadow(''),
          ADD3: textShadow(''),
          ADD4: textShadow(''),
        },
      },
      // Color a piece of text — essential for chat / titles. Wrap each piece
      // separately to mix colors in the same line.
      { kind: 'block', type: 'text_color', inputs: { TEXT: textShadow('Hallo') } },
      { kind: 'block', type: 'text_length' },
      {
        kind: 'block',
        type: 'text_contains',
        inputs: { TEXT: textShadow('Hallo Welt'), NEEDLE: textShadow('Welt') },
      },
      {
        kind: 'block',
        type: 'text_replace_simple',
        inputs: { TEXT: textShadow(''), FROM: textShadow(''), TO: textShadow('') },
      },
      { kind: 'block', type: 'text_change_case', inputs: { TEXT: textShadow('') } },
    ],
  };

  const math: any = {
    kind: 'category',
    name: '🔢  ' + t('category_math'),
    colour: '230',
    contents: [
      { kind: 'block', type: 'math_number' },
      { kind: 'block', type: 'math_arithmetic' },
      {
        kind: 'block',
        type: 'math_random_int',
        inputs: { FROM: numberShadow(1), TO: numberShadow(100) },
      },
      { kind: 'block', type: 'math_round_simple', inputs: { VALUE: numberShadow(0) } },
      {
        kind: 'block',
        type: 'math_modulo_simple',
        inputs: { A: numberShadow(10), B: numberShadow(3) },
      },
    ],
  };

  // Append event-context categories at the bottom, one per active event hat
  // block currently on the canvas.
  const eventContexts: any[] = [];
  if (activeEvents) {
    const seen = new Set<string>();
    for (const ev of activeEvents) {
      if (seen.has(ev)) continue;
      seen.add(ev);
      const cat = eventContextCategory(ev, platform);
      if (cat) eventContexts.push(cat);
    }
  }

  return {
    kind: 'categoryToolbox',
    contents: [
      events,
      player,
      world,
      items,
      gui,
      scoreboard,
      bossbar,
      commands,
      logic,
      variables,
      scheduler,
      config,
      permissions,
      network,
      console,
      text,
      math,
      ...(eventContexts.length
        ? [{ kind: 'sep' }, ...eventContexts]
        : []),
    ].filter(Boolean),
  };
}
