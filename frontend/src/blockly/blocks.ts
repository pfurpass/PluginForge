import * as Blockly from 'blockly/core';
import { translateBlockArray } from './blockI18n';
import { getLang } from '../i18n';

const COLOR = {
  events: 45,
  player: 210,
  world: 120,
  logic: 30,
  variables: 0,
  commands: 285,
  scheduler: 180,
  config: 200,
  permissions: 330,
  network: 260,
  items: 30,
  entities: 100,
  gui: 250,
  scoreboard: 60,
  bossbar: 350,
  ui: 195,
};

const MATERIAL_OPTIONS: [string, string][] = [
  ['Diamant', 'DIAMOND'],
  ['Diamantschwert', 'DIAMOND_SWORD'],
  ['Diamantbrustpanzer', 'DIAMOND_CHESTPLATE'],
  ['Diamantelm', 'DIAMOND_HELMET'],
  ['Diamanthose', 'DIAMOND_LEGGINGS'],
  ['Diamantstiefel', 'DIAMOND_BOOTS'],
  ['Eisenschwert', 'IRON_SWORD'],
  ['Holzschwert', 'WOODEN_SWORD'],
  ['Apfel', 'APPLE'],
  ['Goldener Apfel', 'GOLDEN_APPLE'],
  ['Brot', 'BREAD'],
  ['Cookie', 'COOKIE'],
  ['Kuchen', 'CAKE'],
  ['Holz', 'OAK_LOG'],
  ['Stein', 'STONE'],
  ['Bruchstein', 'COBBLESTONE'],
  ['Gras', 'GRASS_BLOCK'],
  ['Erde', 'DIRT'],
  ['Sand', 'SAND'],
  ['Glas', 'GLASS'],
  ['Diamantblock', 'DIAMOND_BLOCK'],
  ['Goldblock', 'GOLD_BLOCK'],
  ['Eisenblock', 'IRON_BLOCK'],
  ['Wasser-Eimer', 'WATER_BUCKET'],
  ['Lava-Eimer', 'LAVA_BUCKET'],
  ['Pfeil', 'ARROW'],
  ['Bogen', 'BOW'],
  ['Karotte', 'CARROT'],
  ['Kartoffel', 'POTATO'],
  ['Weizen', 'WHEAT'],
  ['TNT', 'TNT'],
  ['Endperle', 'ENDER_PEARL'],
  ['Enderauge', 'ENDER_EYE'],
  ['Buch', 'BOOK'],
  ['Verzaubertes Buch', 'ENCHANTED_BOOK'],
  ['Trank', 'POTION'],
  ['Goldbarren', 'GOLD_INGOT'],
  ['Eisenbarren', 'IRON_INGOT'],
  ['Smaragd', 'EMERALD'],
  ['Netherit-Schwert', 'NETHERITE_SWORD'],
  ['Elytren', 'ELYTRA'],
];

const POTION_EFFECTS: [string, string][] = [
  ['Geschwindigkeit', 'SPEED'],
  ['Langsamkeit', 'SLOWNESS'],
  ['Sprungkraft', 'JUMP_BOOST'],
  ['Regeneration', 'REGENERATION'],
  ['Stärke', 'STRENGTH'],
  ['Schwäche', 'WEAKNESS'],
  ['Unsichtbarkeit', 'INVISIBILITY'],
  ['Nachtsicht', 'NIGHT_VISION'],
  ['Wasseratmung', 'WATER_BREATHING'],
  ['Feuerresistenz', 'FIRE_RESISTANCE'],
  ['Vergiftung', 'POISON'],
  ['Glühen', 'GLOWING'],
  ['Sättigung', 'SATURATION'],
];

const ENCHANT_OPTIONS: [string, string][] = [
  ['Schärfe', 'SHARPNESS'],
  ['Schutz', 'PROTECTION'],
  ['Effizienz', 'EFFICIENCY'],
  ['Glück', 'FORTUNE'],
  ['Behutsamkeit', 'SILK_TOUCH'],
  ['Haltbarkeit', 'UNBREAKING'],
  ['Feuerschutz', 'FIRE_PROTECTION'],
  ['Pfeilschaden', 'POWER'],
  ['Flammenpfeil', 'FLAME'],
  ['Unendlich', 'INFINITY'],
  ['Plünderung', 'LOOTING'],
];

const PARTICLE_OPTIONS: [string, string][] = [
  ['Flamme', 'FLAME'],
  ['Herz', 'HEART'],
  ['Note', 'NOTE'],
  ['Rauch', 'SMOKE'],
  ['Explosion', 'EXPLOSION'],
  ['Hexerei', 'WITCH'],
  ['Tropfen Wasser', 'DRIPPING_WATER'],
  ['Portal', 'PORTAL'],
  ['Glücklich', 'HAPPY_VILLAGER'],
  ['Wütend', 'ANGRY_VILLAGER'],
  ['Cloud', 'CLOUD'],
  ['Verzauberungstisch', 'ENCHANT'],
];

export function defineBlocks() {
  const lang = getLang();
  const blockArray: any[] = [
    // ============ EVENTS ============
    {
      type: 'event_player_join',
      message0: 'wenn Spieler %1 den Server betritt',
      args0: [{ type: 'field_label', text: '⚑', class: 'event-icon' }],
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
      tooltip: 'Wird ausgeführt, wenn ein Spieler den Server betritt.',
    },
    {
      type: 'event_player_quit',
      message0: 'wenn Spieler den Server verlässt',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_player_chat',
      message0: 'wenn Spieler im Chat schreibt',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_block_break',
      message0: 'wenn Block abgebaut wird',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_block_place',
      message0: 'wenn Block platziert wird',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_player_death',
      message0: 'wenn Spieler stirbt',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_player_move',
      message0: 'wenn Spieler sich bewegt',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_server_start',
      message0: 'beim Server-Start',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },

    // ============ PLAYER ============
    {
      type: 'player_event',
      message0: 'Spieler (Event)',
      output: 'Player',
      colour: COLOR.player,
      tooltip: 'Den Spieler aus dem aktuellen Event holen.',
    },
    {
      type: 'player_get_name',
      message0: 'Name von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      output: 'String',
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_send_message',
      message0: 'sende %1 an %2',
      args0: [
        { type: 'input_value', name: 'MESSAGE' },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_broadcast',
      message0: 'sende an alle Spieler %1',
      args0: [{ type: 'input_value', name: 'MESSAGE' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_teleport',
      message0: 'teleportiere %1 zu x %2 y %3 z %4',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_give_item',
      message0: 'gib %1 Stück %2 an %3',
      args0: [
        { type: 'input_value', name: 'AMOUNT' },
        {
          type: 'field_dropdown',
          name: 'MATERIAL',
          options: [
            ['Diamant', 'DIAMOND'],
            ['Diamantschwert', 'DIAMOND_SWORD'],
            ['Apfel', 'APPLE'],
            ['Goldener Apfel', 'GOLDEN_APPLE'],
            ['Brot', 'BREAD'],
            ['Cookie', 'COOKIE'],
            ['Holz', 'OAK_LOG'],
            ['Stein', 'STONE'],
            ['Gras', 'GRASS_BLOCK'],
            ['Erde', 'DIRT'],
            ['Wasser-Eimer', 'WATER_BUCKET'],
            ['Pfeil', 'ARROW'],
            ['Bogen', 'BOW'],
            ['Karotte', 'CARROT'],
            ['TNT', 'TNT'],
            ['Endperle', 'ENDER_PEARL'],
          ],
        },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_set_health',
      message0: 'setze Leben von %1 auf %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'VALUE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_set_food',
      message0: 'setze Hunger von %1 auf %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'VALUE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_set_gamemode',
      message0: 'setze Spielmodus von %1 auf %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        {
          type: 'field_dropdown',
          name: 'MODE',
          options: [
            ['Überleben', 'SURVIVAL'],
            ['Kreativ', 'CREATIVE'],
            ['Abenteuer', 'ADVENTURE'],
            ['Zuschauer', 'SPECTATOR'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_kick',
      message0: 'kicke %1 mit Grund %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'REASON' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_play_sound',
      message0: 'spiele Sound %1 für %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'SOUND',
          options: [
            ['Level Up', 'ENTITY_PLAYER_LEVELUP'],
            ['Erfolg', 'UI_TOAST_CHALLENGE_COMPLETE'],
            ['Klick', 'UI_BUTTON_CLICK'],
            ['Glocke', 'BLOCK_BELL_USE'],
            ['Endermann', 'ENTITY_ENDERMAN_TELEPORT'],
            ['Explosion', 'ENTITY_GENERIC_EXPLODE'],
          ],
        },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_send_to_server',
      message0: 'sende %1 zu Server %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'SERVER' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.network,
      inputsInline: true,
    },

    // ============ WORLD ============
    {
      type: 'world_set_block',
      message0: 'setze Block bei x %1 y %2 z %3 auf %4',
      args0: [
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
        {
          type: 'field_dropdown',
          name: 'MATERIAL',
          options: [
            ['Stein', 'STONE'],
            ['Gras', 'GRASS_BLOCK'],
            ['Erde', 'DIRT'],
            ['Holz', 'OAK_LOG'],
            ['Diamant', 'DIAMOND_BLOCK'],
            ['Gold', 'GOLD_BLOCK'],
            ['TNT', 'TNT'],
            ['Wasser', 'WATER'],
            ['Lava', 'LAVA'],
            ['Luft', 'AIR'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.world,
      inputsInline: true,
    },
    {
      type: 'world_strike_lightning',
      message0: 'lasse Blitz einschlagen bei %1 x %2 y %3 z %4',
      args0: [
        { type: 'field_label', text: '' },
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.world,
      inputsInline: true,
    },
    {
      type: 'world_spawn_entity',
      message0: 'spawne %1 bei x %2 y %3 z %4',
      args0: [
        {
          type: 'field_dropdown',
          name: 'ENTITY',
          options: [
            ['Zombie', 'ZOMBIE'],
            ['Skelett', 'SKELETON'],
            ['Creeper', 'CREEPER'],
            ['Kuh', 'COW'],
            ['Schwein', 'PIG'],
            ['Schaf', 'SHEEP'],
            ['Enderdrache', 'ENDER_DRAGON'],
            ['Ghast', 'GHAST'],
            ['Wither', 'WITHER'],
          ],
        },
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.world,
      inputsInline: true,
    },
    {
      type: 'world_set_time',
      message0: 'setze Zeit auf %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'TIME',
          options: [
            ['Tag', '1000'],
            ['Mittag', '6000'],
            ['Nacht', '13000'],
            ['Mitternacht', '18000'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.world,
    },
    {
      type: 'world_set_weather',
      message0: 'setze Wetter auf %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'WEATHER',
          options: [
            ['Klar', 'CLEAR'],
            ['Regen', 'RAIN'],
            ['Sturm', 'STORM'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.world,
    },
    {
      type: 'world_broadcast',
      message0: 'broadcast Nachricht %1',
      args0: [{ type: 'input_value', name: 'MESSAGE' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.world,
      inputsInline: true,
    },

    // ============ COMMANDS ============
    {
      type: 'command_define',
      message0: 'definiere Command /%1',
      args0: [{ type: 'field_input', name: 'NAME', text: 'mycommand' }],
      message1: 'Beschreibung %1',
      args1: [{ type: 'field_input', name: 'DESC', text: '' }],
      message2: 'tue %1',
      args2: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.commands,
      tooltip: 'Definiert einen Server-Command.',
    },
    {
      type: 'command_sender',
      message0: 'Sender (Command)',
      output: 'Player',
      colour: COLOR.commands,
    },
    {
      type: 'command_arg',
      message0: 'Argument %1',
      args0: [{ type: 'input_value', name: 'INDEX' }],
      output: 'String',
      colour: COLOR.commands,
      inputsInline: true,
    },
    {
      type: 'command_arg_count',
      message0: 'Anzahl Argumente',
      output: 'Number',
      colour: COLOR.commands,
    },

    // ============ SCHEDULER ============
    {
      type: 'scheduler_wait',
      message0: 'warte %1 Ticks dann',
      args0: [{ type: 'input_value', name: 'TICKS' }],
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.scheduler,
      inputsInline: true,
    },
    {
      type: 'scheduler_repeat',
      message0: 'wiederhole alle %1 Ticks',
      args0: [{ type: 'input_value', name: 'TICKS' }],
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.scheduler,
      inputsInline: true,
    },

    // ============ CONFIG ============
    {
      type: 'config_get_string',
      message0: 'Config String %1',
      args0: [{ type: 'field_input', name: 'KEY', text: 'mykey' }],
      output: 'String',
      colour: COLOR.config,
    },
    {
      type: 'config_get_int',
      message0: 'Config Zahl %1',
      args0: [{ type: 'field_input', name: 'KEY', text: 'mykey' }],
      output: 'Number',
      colour: COLOR.config,
    },
    {
      type: 'config_set',
      message0: 'setze Config %1 auf %2',
      args0: [
        { type: 'field_input', name: 'KEY', text: 'mykey' },
        { type: 'input_value', name: 'VALUE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.config,
      inputsInline: true,
    },
    {
      type: 'config_save',
      message0: 'Config speichern',
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.config,
    },

    // ============ PERMISSIONS ============
    {
      type: 'permission_check',
      message0: 'hat %1 Berechtigung %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'field_input', name: 'PERM', text: 'myplugin.use' },
      ],
      output: 'Boolean',
      colour: COLOR.permissions,
      inputsInline: true,
    },
    {
      type: 'permission_is_op',
      message0: '%1 ist OP',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      output: 'Boolean',
      colour: COLOR.permissions,
      inputsInline: true,
    },

    // ============ NETWORK (Velocity / Bungee) ============
    {
      type: 'network_get_servers',
      message0: 'alle Server-Namen',
      output: 'Array',
      colour: COLOR.network,
    },

    // ============ HELPERS / READERS ============
    {
      type: 'event_chat_message',
      message0: 'Chat-Nachricht',
      output: 'String',
      colour: COLOR.events,
    },
    {
      type: 'event_block_location',
      message0: 'Block-%1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'AXIS',
          options: [
            ['X', 'X'],
            ['Y', 'Y'],
            ['Z', 'Z'],
          ],
        },
      ],
      output: 'Number',
      colour: COLOR.events,
    },
    {
      type: 'player_location',
      message0: '%1 von %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'AXIS',
          options: [
            ['X', 'X'],
            ['Y', 'Y'],
            ['Z', 'Z'],
          ],
        },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      output: 'Number',
      colour: COLOR.player,
      inputsInline: true,
    },

    // ============ ITEMS ============
    {
      type: 'item_create',
      message0: 'erstelle Item %1 × %2',
      args0: [
        { type: 'input_value', name: 'AMOUNT' },
        { type: 'field_dropdown', name: 'MATERIAL', options: MATERIAL_OPTIONS },
      ],
      output: 'ItemStack',
      colour: COLOR.items,
      inputsInline: true,
    },
    {
      type: 'item_set_name',
      message0: 'setze Name von %1 auf %2',
      args0: [
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
        { type: 'input_value', name: 'NAME' },
      ],
      output: 'ItemStack',
      colour: COLOR.items,
      inputsInline: true,
    },
    {
      type: 'item_add_lore',
      message0: 'füge Lore-Zeile %1 zu %2 hinzu',
      args0: [
        { type: 'input_value', name: 'LORE' },
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
      ],
      output: 'ItemStack',
      colour: COLOR.items,
      inputsInline: true,
    },
    {
      type: 'item_add_enchant',
      message0: 'verzaubere %1 mit %2 Stufe %3',
      args0: [
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
        { type: 'field_dropdown', name: 'ENCHANT', options: ENCHANT_OPTIONS },
        { type: 'input_value', name: 'LEVEL' },
      ],
      output: 'ItemStack',
      colour: COLOR.items,
      inputsInline: true,
    },
    {
      type: 'item_unbreakable',
      message0: 'mache %1 unzerstörbar',
      args0: [{ type: 'input_value', name: 'ITEM', check: 'ItemStack' }],
      output: 'ItemStack',
      colour: COLOR.items,
      inputsInline: true,
    },
    {
      type: 'item_get_name',
      message0: 'Anzeigename von %1',
      args0: [{ type: 'input_value', name: 'ITEM', check: 'ItemStack' }],
      output: 'String',
      colour: COLOR.items,
      inputsInline: true,
      tooltip:
        'Liest den Anzeigename des Items (vom Spieler vergebener Name oder Material-Name).',
    },
    {
      type: 'item_get_type',
      message0: 'Material-Typ von %1',
      args0: [{ type: 'input_value', name: 'ITEM', check: 'ItemStack' }],
      output: 'String',
      colour: COLOR.items,
      inputsInline: true,
      tooltip:
        'Gibt den Bukkit-Material-Namen zurück (z.B. "DIAMOND_SWORD", "COMPASS").',
    },
    {
      type: 'item_get_amount',
      message0: 'Anzahl von %1',
      args0: [{ type: 'input_value', name: 'ITEM', check: 'ItemStack' }],
      output: 'Number',
      colour: COLOR.items,
      inputsInline: true,
    },
    {
      type: 'item_is_type',
      message0: '%1 ist Typ %2',
      args0: [
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
        { type: 'field_dropdown', name: 'MATERIAL', options: MATERIAL_OPTIONS },
      ],
      output: 'Boolean',
      colour: COLOR.items,
      inputsInline: true,
      tooltip: 'Prüft ob das Item ein bestimmtes Material ist (z.B. Kompass).',
    },

    // ============ PLAYER (advanced) ============
    {
      type: 'player_give_itemstack',
      message0: 'gib %1 an %2',
      args0: [
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_set_held_item',
      message0: 'setze Item in Hand von %1 auf %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_set_armor',
      message0: 'setze %1 von %2 auf %3',
      args0: [
        {
          type: 'field_dropdown',
          name: 'SLOT',
          options: [
            ['Helm', 'helmet'],
            ['Brustpanzer', 'chestplate'],
            ['Hose', 'leggings'],
            ['Stiefel', 'boots'],
          ],
        },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_clear_inventory',
      message0: 'leere Inventar von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_get_held_item',
      message0: 'Item in Hand von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      output: 'ItemStack',
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_get_health',
      message0: 'Leben von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      output: 'Number',
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_get_food',
      message0: 'Hunger von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      output: 'Number',
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_set_level',
      message0: 'setze XP-Level von %1 auf %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'LEVEL' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_give_xp',
      message0: 'gib %1 XP an %2',
      args0: [
        { type: 'input_value', name: 'AMOUNT' },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_set_flying',
      message0: 'lasse %1 fliegen %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        {
          type: 'field_dropdown',
          name: 'STATE',
          options: [
            ['ja', 'true'],
            ['nein', 'false'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_set_walk_speed',
      message0: 'setze Laufgeschwindigkeit von %1 auf %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'SPEED' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_add_potion_effect',
      message0: 'gib %1 Effekt %2 für %3 Sekunden Stufe %4',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'field_dropdown', name: 'EFFECT', options: POTION_EFFECTS },
        { type: 'input_value', name: 'SECONDS' },
        { type: 'input_value', name: 'AMPLIFIER' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_remove_potion_effect',
      message0: 'entferne Effekt %1 von %2',
      args0: [
        { type: 'field_dropdown', name: 'EFFECT', options: POTION_EFFECTS },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_get_uuid',
      message0: 'UUID von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      output: 'String',
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_get_world_name',
      message0: 'Welt-Name von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      output: 'String',
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_get_by_name',
      message0: 'Spieler mit Namen %1',
      args0: [{ type: 'input_value', name: 'NAME' }],
      output: 'Player',
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'players_online',
      message0: 'Anzahl Online-Spieler',
      output: 'Number',
      colour: COLOR.player,
    },

    // ============ WORLD (advanced) ============
    {
      type: 'world_get_block_type',
      message0: 'Blocktyp bei x %1 y %2 z %3',
      args0: [
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
      ],
      output: 'String',
      colour: COLOR.world,
      inputsInline: true,
    },
    {
      type: 'world_drop_item',
      message0: 'droppe %1 bei x %2 y %3 z %4',
      args0: [
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.world,
      inputsInline: true,
    },
    {
      type: 'world_create_explosion',
      message0: 'Explosion Stärke %1 bei x %2 y %3 z %4',
      args0: [
        { type: 'input_value', name: 'POWER' },
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.world,
      inputsInline: true,
    },
    {
      type: 'world_play_particle',
      message0: 'spawne Partikel %1 bei x %2 y %3 z %4 (%5 Stück)',
      args0: [
        { type: 'field_dropdown', name: 'PARTICLE', options: PARTICLE_OPTIONS },
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
        { type: 'input_value', name: 'COUNT' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.world,
      inputsInline: true,
    },

    // ============ EVENTS (advanced) ============
    {
      type: 'event_player_interact',
      message0: 'wenn Spieler interagiert (Rechtsklick)',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_entity_death',
      message0: 'wenn Entity stirbt',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_entity_damage',
      message0: 'wenn Entity Schaden bekommt',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_inventory_click',
      message0: 'wenn Spieler im Inventar klickt',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_item_picked_up',
      message0: 'wenn Spieler Item aufhebt',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_player_login',
      message0: 'wenn Spieler einloggt (Velocity)',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_proxy_ping',
      message0: 'wenn Server angepingt wird (BungeeCord)',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },

    // ============ TEXT (advanced) ============
    {
      type: 'text_contains',
      message0: '%1 enthält %2',
      args0: [
        { type: 'input_value', name: 'TEXT' },
        { type: 'input_value', name: 'NEEDLE' },
      ],
      output: 'Boolean',
      colour: 160,
      inputsInline: true,
    },
    {
      type: 'text_replace_simple',
      message0: 'in %1 ersetze %2 durch %3',
      args0: [
        { type: 'input_value', name: 'TEXT' },
        { type: 'input_value', name: 'FROM' },
        { type: 'input_value', name: 'TO' },
      ],
      output: 'String',
      colour: 160,
      inputsInline: true,
    },
    {
      type: 'text_change_case',
      message0: '%1 in %2',
      args0: [
        { type: 'input_value', name: 'TEXT' },
        {
          type: 'field_dropdown',
          name: 'CASE',
          options: [
            ['Großbuchstaben', 'UPPER'],
            ['Kleinbuchstaben', 'LOWER'],
          ],
        },
      ],
      output: 'String',
      colour: 160,
      inputsInline: true,
    },
    {
      type: 'text_color',
      message0: 'färbe Text %1 in %2',
      args0: [
        { type: 'input_value', name: 'TEXT' },
        {
          type: 'field_dropdown',
          name: 'COLOR',
          options: [
            ['Rot', 'RED'],
            ['Grün', 'GREEN'],
            ['Blau', 'BLUE'],
            ['Gelb', 'YELLOW'],
            ['Gold', 'GOLD'],
            ['Hellblau', 'AQUA'],
            ['Lila', 'LIGHT_PURPLE'],
            ['Weiß', 'WHITE'],
            ['Grau', 'GRAY'],
            ['Schwarz', 'BLACK'],
          ],
        },
      ],
      output: 'String',
      colour: 160,
      inputsInline: true,
    },

    // ============ MATH (advanced) ============
    {
      type: 'math_round_simple',
      message0: 'runde %1',
      args0: [{ type: 'input_value', name: 'VALUE' }],
      output: 'Number',
      colour: 230,
    },
    {
      type: 'math_modulo_simple',
      message0: 'Rest von %1 ÷ %2',
      args0: [
        { type: 'input_value', name: 'A' },
        { type: 'input_value', name: 'B' },
      ],
      output: 'Number',
      colour: 230,
      inputsInline: true,
    },

    // ============ NETWORK ============
    {
      type: 'network_get_current_server',
      message0: 'aktueller Server von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      output: 'String',
      colour: COLOR.network,
      inputsInline: true,
    },

    // ============ GUI / INVENTORY MENU ============
    {
      type: 'gui_create_inventory',
      message0: 'erstelle Menü Größe %1 Titel %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'SIZE',
          options: [
            ['9 (1 Reihe)', '9'],
            ['18 (2 Reihen)', '18'],
            ['27 (3 Reihen)', '27'],
            ['36 (4 Reihen)', '36'],
            ['45 (5 Reihen)', '45'],
            ['54 (6 Reihen)', '54'],
          ],
        },
        { type: 'input_value', name: 'TITLE' },
      ],
      output: 'Inventory',
      colour: COLOR.gui,
      inputsInline: true,
      tooltip: 'Erstellt ein leeres Menü-Inventar (Chest-Style).',
    },
    {
      type: 'gui_set_slot',
      message0: 'lege in Menü %1 in Slot %2 das Item %3',
      args0: [
        { type: 'input_value', name: 'GUI', check: 'Inventory' },
        { type: 'input_value', name: 'SLOT' },
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.gui,
      inputsInline: true,
      tooltip:
        'Platziert ein Item an einer bestimmten Slot-Position im Menü. Slot 0 = oben links. Brauchst zuerst ein "erstelle Menü …" als Menü-Wert.',
    },
    {
      type: 'gui_open_for_player',
      message0: 'öffne Menü %1 für %2',
      args0: [
        { type: 'input_value', name: 'GUI', check: 'Inventory' },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.gui,
      inputsInline: true,
    },
    {
      type: 'gui_close_for_player',
      message0: 'schließe Menü von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.gui,
      inputsInline: true,
    },
    {
      type: 'gui_fill_borders',
      message0: 'fülle Ränder von %1 mit %2',
      args0: [
        { type: 'input_value', name: 'GUI', check: 'Inventory' },
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.gui,
      inputsInline: true,
    },
    {
      type: 'event_clicked_slot',
      message0: 'angeklickter Slot',
      output: 'Number',
      colour: COLOR.events,
      tooltip: 'Nur in "wenn Spieler im Inventar klickt".',
    },
    {
      type: 'event_clicked_item',
      message0: 'angeklicktes Item',
      output: 'ItemStack',
      colour: COLOR.events,
    },
    {
      type: 'event_inventory_title',
      message0: 'Titel des Menüs',
      output: 'String',
      colour: COLOR.events,
    },
    {
      type: 'event_set_cancelled',
      message0: 'breche Event ab (z.B. verhindere Item-Verschieben)',
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
      tooltip:
        'Verhindert, dass das Event ausgeführt wird (z.B. Block abbauen, Item nehmen).',
    },
    {
      type: 'flow_return',
      message0: 'beende Ausführung (return)',
      previousStatement: null,
      // No nextStatement — nothing can come after; the rest would be unreachable.
      colour: COLOR.logic,
      tooltip:
        'Bricht den aktuellen Event-Handler oder Command sofort ab. Nützlich nach if-Checks.',
    },
    {
      type: 'flow_return_value',
      message0: 'gib zurück %1',
      args0: [{ type: 'input_value', name: 'VALUE' }],
      previousStatement: null,
      colour: COLOR.logic,
      inputsInline: true,
      tooltip:
        'Gibt einen Wert zurück. In Commands: true/false (true = wurde behandelt).',
    },

    // ============ EVENT-SPEZIFISCHE BLÖCKE ============
    // Diese Blöcke ergeben nur Sinn im Kontext bestimmter Events.
    // Die Toolbox blendet sie automatisch ein, wenn der passende Event-Block
    // im Workspace liegt (siehe Workspace.tsx).

    // --- PlayerJoinEvent ---
    {
      type: 'event_join_set_message',
      message0: 'setze Join-Nachricht auf %1',
      args0: [{ type: 'input_value', name: 'MESSAGE' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
      inputsInline: true,
      tooltip:
        'Ersetzt die Standard-Join-Nachricht. Nur im "wenn Spieler den Server betritt"-Block.',
    },
    {
      type: 'event_join_clear_message',
      message0: 'verstecke Join-Nachricht (Standard ausschalten)',
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
    },

    // --- PlayerQuitEvent ---
    {
      type: 'event_quit_set_message',
      message0: 'setze Quit-Nachricht auf %1',
      args0: [{ type: 'input_value', name: 'MESSAGE' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
      inputsInline: true,
    },
    {
      type: 'event_quit_clear_message',
      message0: 'verstecke Quit-Nachricht',
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
    },

    // --- PlayerDeathEvent ---
    {
      type: 'event_death_set_message',
      message0: 'setze Tod-Nachricht auf %1',
      args0: [{ type: 'input_value', name: 'MESSAGE' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
      inputsInline: true,
    },
    {
      type: 'event_death_set_keep_inventory',
      message0: 'behalte Inventar nach Tod %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'STATE',
          options: [
            ['ja', 'true'],
            ['nein', 'false'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
    },
    {
      type: 'event_death_set_keep_xp',
      message0: 'behalte XP nach Tod %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'STATE',
          options: [
            ['ja', 'true'],
            ['nein', 'false'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
    },

    // --- PlayerChatEvent ---
    {
      type: 'event_chat_set_message',
      message0: 'setze Chat-Nachricht auf %1',
      args0: [{ type: 'input_value', name: 'MESSAGE' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
      inputsInline: true,
    },
    {
      type: 'event_chat_set_format',
      message0: 'setze Chat-Format auf %1',
      args0: [{ type: 'input_value', name: 'FORMAT' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
      inputsInline: true,
      tooltip:
        'Format z.B. "<%1$s> %2$s" — %1=Spielername, %2=Nachricht. Nur Spigot.',
    },

    // --- PlayerInteractEvent ---
    {
      type: 'event_interact_is_right_click',
      message0: 'ist Rechtsklick',
      output: 'Boolean',
      colour: COLOR.events,
    },
    {
      type: 'event_interact_is_left_click',
      message0: 'ist Linksklick',
      output: 'Boolean',
      colour: COLOR.events,
    },
    {
      type: 'event_interact_is_air',
      message0: 'klickte in Luft',
      output: 'Boolean',
      colour: COLOR.events,
    },

    // --- InventoryClickEvent ---
    {
      type: 'event_inv_is_left_click',
      message0: 'Inventar: ist Linksklick',
      output: 'Boolean',
      colour: COLOR.events,
    },
    {
      type: 'event_inv_is_right_click',
      message0: 'Inventar: ist Rechtsklick',
      output: 'Boolean',
      colour: COLOR.events,
    },
    {
      type: 'event_inv_is_shift_click',
      message0: 'Inventar: ist Shift-Klick',
      output: 'Boolean',
      colour: COLOR.events,
    },

    // --- BlockBreakEvent ---
    {
      type: 'event_break_set_exp',
      message0: 'setze fallendes XP auf %1',
      args0: [{ type: 'input_value', name: 'EXP' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
      inputsInline: true,
    },
    {
      type: 'event_break_set_drops',
      message0: 'setze Drop-Items beim Block-Abbau auf nichts',
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
      tooltip: 'Verhindert dass beim Abbauen Items droppen.',
    },

    // --- EntityDamageEvent ---
    {
      type: 'event_damage_get',
      message0: 'Schaden-Menge',
      output: 'Number',
      colour: COLOR.events,
    },
    {
      type: 'event_damage_set',
      message0: 'setze Schaden-Menge auf %1',
      args0: [{ type: 'input_value', name: 'AMOUNT' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
      inputsInline: true,
    },
    {
      type: 'event_damage_get_cause',
      message0: 'Schaden-Ursache',
      output: 'String',
      colour: COLOR.events,
      tooltip:
        'z.B. "FALL", "FIRE", "ENTITY_ATTACK", "DROWNING", "VOID", "POISON".',
    },

    // --- PlayerCommandPreprocessEvent ---
    {
      type: 'event_command_set_text',
      message0: 'setze ausgeführten Befehl auf /%1',
      args0: [{ type: 'input_value', name: 'CMD' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.events,
      inputsInline: true,
    },

    // ============ UI: TITLE / ACTIONBAR / TAB ============
    {
      type: 'player_send_title',
      message0: 'sende an %1 Title %2 Subtitle %3',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'TITLE' },
        { type: 'input_value', name: 'SUBTITLE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.ui,
      inputsInline: true,
    },
    {
      type: 'player_send_actionbar',
      message0: 'sende ActionBar %1 an %2',
      args0: [
        { type: 'input_value', name: 'MESSAGE' },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.ui,
      inputsInline: true,
    },
    {
      type: 'player_send_tab',
      message0: 'setze Tab-Header %1 Footer %2 für %3',
      args0: [
        { type: 'input_value', name: 'HEADER' },
        { type: 'input_value', name: 'FOOTER' },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.ui,
      inputsInline: true,
    },
    {
      type: 'player_set_compass_target',
      message0: 'setze Kompass-Ziel von %1 auf x %2 y %3 z %4',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.ui,
      inputsInline: true,
    },
    {
      type: 'player_set_velocity',
      message0: 'schubse %1 mit x %2 y %3 z %4',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_set_cooldown',
      message0: 'setze Cooldown für %1 auf %2 (%3 Ticks)',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'field_dropdown', name: 'MATERIAL', options: MATERIAL_OPTIONS },
        { type: 'input_value', name: 'TICKS' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_hide_others',
      message0: 'verstecke andere Spieler vor %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
    {
      type: 'player_show_others',
      message0: 'zeige andere Spieler für %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },

    // ============ SCOREBOARD ============
    {
      type: 'scoreboard_create',
      message0: 'erstelle Sidebar für %1 mit Titel %2',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'TITLE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.scoreboard,
      inputsInline: true,
    },
    {
      type: 'scoreboard_set_line',
      message0: 'setze in Sidebar von %1 Zeile %2 auf %3',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'LINE' },
        { type: 'input_value', name: 'TEXT' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.scoreboard,
      inputsInline: true,
    },
    {
      type: 'scoreboard_clear',
      message0: 'entferne Sidebar von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.scoreboard,
      inputsInline: true,
    },

    // ============ BOSSBAR ============
    {
      type: 'bossbar_show',
      message0: 'zeige BossBar %1 in %2 (Fortschritt %3) für %4',
      args0: [
        { type: 'input_value', name: 'TITLE' },
        {
          type: 'field_dropdown',
          name: 'COLOR',
          options: [
            ['Pink', 'PINK'],
            ['Blau', 'BLUE'],
            ['Rot', 'RED'],
            ['Grün', 'GREEN'],
            ['Gelb', 'YELLOW'],
            ['Lila', 'PURPLE'],
            ['Weiß', 'WHITE'],
          ],
        },
        { type: 'input_value', name: 'PROGRESS' },
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.bossbar,
      inputsInline: true,
    },
    {
      type: 'bossbar_hide',
      message0: 'verstecke BossBar von %1',
      args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.bossbar,
      inputsInline: true,
    },

    // ============ PERSISTENT DATA (Item Marker für Navigator) ============
    {
      type: 'item_set_marker',
      message0: 'markiere %1 mit Schlüssel %2 = %3',
      args0: [
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
        { type: 'field_input', name: 'KEY', text: 'navigator' },
        { type: 'input_value', name: 'VALUE' },
      ],
      output: 'ItemStack',
      colour: COLOR.items,
      inputsInline: true,
      tooltip: 'Setzt unsichtbare Markierung — nützlich um Lobby-Items zu erkennen.',
    },
    {
      type: 'item_has_marker',
      message0: '%1 ist markiert mit %2',
      args0: [
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
        { type: 'field_input', name: 'KEY', text: 'navigator' },
      ],
      output: 'Boolean',
      colour: COLOR.items,
      inputsInline: true,
    },
    {
      type: 'item_get_marker',
      message0: 'Markierung %2 von %1',
      args0: [
        { type: 'input_value', name: 'ITEM', check: 'ItemStack' },
        { type: 'field_input', name: 'KEY', text: 'navigator' },
      ],
      output: 'String',
      colour: COLOR.items,
      inputsInline: true,
    },

    // ============ MATERIAL FLEXIBILITY ============
    {
      type: 'material_from_name',
      message0: 'Material %1',
      args0: [{ type: 'field_input', name: 'NAME', text: 'DIAMOND_SWORD' }],
      output: 'Material',
      colour: COLOR.items,
      tooltip:
        'Beliebiges Material per Name (z.B. NETHERITE_HOE, BARRIER, PLAYER_HEAD).',
    },
    {
      type: 'item_create_dynamic',
      message0: 'erstelle Item %1 × %2',
      args0: [
        { type: 'input_value', name: 'AMOUNT' },
        { type: 'input_value', name: 'MATERIAL', check: 'Material' },
      ],
      output: 'ItemStack',
      colour: COLOR.items,
      inputsInline: true,
    },

    // ============ ADDITIONAL EVENTS ============
    {
      type: 'event_player_respawn',
      message0: 'wenn Spieler respawned',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_player_swap_hand',
      message0: 'wenn Spieler F drückt (Hand swap)',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_player_drop_item',
      message0: 'wenn Spieler Item droppt (Q)',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_player_food_change',
      message0: 'wenn sich Hunger ändert',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_weather_change',
      message0: 'wenn sich Wetter ändert',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_player_command_preprocess',
      message0: 'bevor Spieler Command ausführt',
      message1: 'tue %1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COLOR.events,
    },
    {
      type: 'event_held_item',
      message0: 'gehaltenes Item',
      output: 'ItemStack',
      colour: COLOR.events,
    },
    {
      type: 'event_clicked_block_x',
      message0: 'angeklickter Block %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'AXIS',
          options: [
            ['X', 'X'],
            ['Y', 'Y'],
            ['Z', 'Z'],
          ],
        },
      ],
      output: 'Number',
      colour: COLOR.events,
    },
    {
      type: 'event_command_text',
      message0: 'eingegebener Command (Text)',
      output: 'String',
      colour: COLOR.events,
    },

    // ============ SPAWN / LOCATION / CONSOLE ============
    {
      type: 'world_set_spawn',
      message0: 'setze Spawn auf x %1 y %2 z %3',
      args0: [
        { type: 'input_value', name: 'X' },
        { type: 'input_value', name: 'Y' },
        { type: 'input_value', name: 'Z' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.world,
      inputsInline: true,
    },
    {
      type: 'console_log',
      message0: 'Konsolen-Log: %1',
      args0: [{ type: 'input_value', name: 'MESSAGE' }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      inputsInline: true,
    },
    {
      type: 'console_run_command',
      message0: 'führe als Konsole aus: /%1',
      args0: [{ type: 'input_value', name: 'CMD' }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      inputsInline: true,
      tooltip: 'Führt einen Befehl mit Konsolen-Rechten aus.',
    },
    {
      type: 'player_run_command',
      message0: 'lass %1 Befehl /%2 ausführen',
      args0: [
        { type: 'input_value', name: 'PLAYER', check: 'Player' },
        { type: 'input_value', name: 'CMD' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR.player,
      inputsInline: true,
    },
  ];

  // Translate block labels in-place if user picked English. Strings without
  // a translation entry fall back to German.
  translateBlockArray(blockArray, lang);
  Blockly.common.defineBlocksWithJsonArray(blockArray);

  // Blockly's stock `logic_compare` has an `onchange` handler that disconnects
  // mismatched-type comparisons (e.g. ItemStack == String). For our use case
  // — where `Objects.equals` handles any combination — that's just hostile UX.
  // Replace it with a no-op so users can plug any block into either slot.
  const lc = (Blockly as any).Blocks['logic_compare'];
  if (lc && lc.onchange) lc.onchange = function () {};
}
