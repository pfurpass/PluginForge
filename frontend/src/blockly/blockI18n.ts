// DE → EN translations for block labels, dropdown options and tooltips.
// Applied at block-definition time when locale is 'en'. Strings not in this
// table fall back to the original German.
//
// To add a new translation, just add the German string as key with the
// English version as value. The translator walks all message0/message1/
// tooltip / dropdown-label fields and substitutes whole-string matches.

export const DE_TO_EN: Record<string, string> = {
  // ============ EVENT HAT BLOCKS ============
  'wenn Spieler %1 den Server betritt': 'when player %1 joins',
  'wenn Spieler den Server verlässt': 'when player leaves',
  'wenn Spieler im Chat schreibt': 'when player chats',
  'wenn Block abgebaut wird': 'when block is broken',
  'wenn Block platziert wird': 'when block is placed',
  'wenn Spieler stirbt': 'when player dies',
  'wenn Spieler sich bewegt': 'when player moves',
  'wenn Spieler interagiert (Rechtsklick)': 'when player interacts (right-click)',
  'wenn Spieler respawned': 'when player respawns',
  'wenn Spieler F drückt (Hand swap)': 'when player swaps hands (F)',
  'wenn Spieler Item droppt (Q)': 'when player drops item (Q)',
  'wenn sich Hunger ändert': 'when food level changes',
  'bevor Spieler Command ausführt': 'when player runs command (preprocess)',
  'wenn Entity stirbt': 'when entity dies',
  'wenn Entity Schaden bekommt': 'when entity takes damage',
  'wenn Spieler im Inventar klickt': 'when player clicks in inventory',
  'wenn Spieler Item aufhebt': 'when player picks up item',
  'wenn sich Wetter ändert': 'when weather changes',
  'wenn Spieler einloggt (Velocity)': 'when player logs in (Velocity)',
  'wenn Server angepingt wird (BungeeCord)': 'when server is pinged (BungeeCord)',
  'beim Server-Start': 'on server start',
  'tue %1': 'do %1',
  'tue': 'do',
  'mache': 'do',
  'falls': 'if',

  // Event readers
  'Chat-Nachricht': 'chat message',
  'Block-%1': 'block %1',
  'eingegebener Command (Text)': 'entered command (text)',
  'breche Event ab (z.B. verhindere Item-Verschieben)': 'cancel event (e.g. prevent item move)',
  'angeklickter Slot': 'clicked slot',
  'angeklicktes Item': 'clicked item',
  'Titel des Menüs': 'menu title',
  'gehaltenes Item': 'held item',
  'angeklickter Block %1': 'clicked block %1',

  // ============ PLAYER ============
  'Spieler (Event)': 'Player (Event)',
  'Name von %1': 'name of %1',
  'sende %1 an %2': 'send %1 to %2',
  'sende an alle Spieler %1': 'broadcast to all players %1',
  'teleportiere %1 zu x %2 y %3 z %4': 'teleport %1 to x %2 y %3 z %4',
  'gib %1 Stück %2 an %3': 'give %1 of %2 to %3',
  'setze Leben von %1 auf %2': 'set health of %1 to %2',
  'setze Hunger von %1 auf %2': 'set food level of %1 to %2',
  'setze Spielmodus von %1 auf %2': 'set gamemode of %1 to %2',
  'kicke %1 mit Grund %2': 'kick %1 with reason %2',
  'spiele Sound %1 für %2': 'play sound %1 for %2',
  'sende %1 zu Server %2': 'send %1 to server %2',
  '%1 von %2': '%1 of %2',
  'leere Inventar von %1': 'clear inventory of %1',
  'gib %1 an %2': 'give %1 to %2',
  'setze Item in Hand von %1 auf %2': 'set held item of %1 to %2',
  'setze %1 von %2 auf %3': 'set %1 of %2 to %3',
  'Item in Hand von %1': 'held item of %1',
  'Leben von %1': 'health of %1',
  'Hunger von %1': 'food of %1',
  'setze XP-Level von %1 auf %2': 'set XP level of %1 to %2',
  'gib %1 XP an %2': 'give %1 XP to %2',
  'lasse %1 fliegen %2': 'let %1 fly %2',
  'setze Laufgeschwindigkeit von %1 auf %2': 'set walk speed of %1 to %2',
  'gib %1 Effekt %2 für %3 Sekunden Stufe %4': 'give %1 effect %2 for %3 seconds, level %4',
  'entferne Effekt %1 von %2': 'remove effect %1 from %2',
  'UUID von %1': 'UUID of %1',
  'Welt-Name von %1': 'world name of %1',
  'Spieler mit Namen %1': 'player named %1',
  'Anzahl Online-Spieler': 'online player count',
  'sende an %1 Title %2 Subtitle %3': 'send to %1 title %2 subtitle %3',
  'sende ActionBar %1 an %2': 'send actionbar %1 to %2',
  'setze Tab-Header %1 Footer %2 für %3': 'set tab header %1 footer %2 for %3',
  'setze Kompass-Ziel von %1 auf x %2 y %3 z %4': 'set compass target of %1 to x %2 y %3 z %4',
  'schubse %1 mit x %2 y %3 z %4': 'push %1 with x %2 y %3 z %4',
  'setze Cooldown für %1 auf %2 (%3 Ticks)': 'set cooldown for %1 on %2 (%3 ticks)',
  'verstecke andere Spieler vor %1': 'hide other players from %1',
  'zeige andere Spieler für %1': 'show other players for %1',
  'lass %1 Befehl /%2 ausführen': 'make %1 run command /%2',

  // ============ WORLD ============
  'setze Block bei x %1 y %2 z %3 auf %4': 'set block at x %1 y %2 z %3 to %4',
  'lasse Blitz einschlagen bei %1 x %2 y %3 z %4': 'strike lightning at %1 x %2 y %3 z %4',
  'spawne %1 bei x %2 y %3 z %4': 'spawn %1 at x %2 y %3 z %4',
  'setze Zeit auf %1': 'set time to %1',
  'setze Wetter auf %1': 'set weather to %1',
  'broadcast Nachricht %1': 'broadcast message %1',
  'Blocktyp bei x %1 y %2 z %3': 'block type at x %1 y %2 z %3',
  'droppe %1 bei x %2 y %3 z %4': 'drop %1 at x %2 y %3 z %4',
  'Explosion Stärke %1 bei x %2 y %3 z %4': 'explosion strength %1 at x %2 y %3 z %4',
  'spawne Partikel %1 bei x %2 y %3 z %4 (%5 Stück)': 'spawn particle %1 at x %2 y %3 z %4 (%5 count)',
  'setze Spawn auf x %1 y %2 z %3': 'set spawn to x %1 y %2 z %3',

  // ============ ITEMS ============
  'erstelle Item %1 × %2': 'create item %1 × %2',
  'setze Name von %1 auf %2': 'set name of %1 to %2',
  'füge Lore-Zeile %1 zu %2 hinzu': 'add lore line %1 to %2',
  'verzaubere %1 mit %2 Stufe %3': 'enchant %1 with %2 level %3',
  'mache %1 unzerstörbar': 'make %1 unbreakable',
  'Anzeigename von %1': 'display name of %1',
  'Material-Typ von %1': 'material type of %1',
  'Anzahl von %1': 'amount of %1',
  '%1 ist Typ %2': '%1 is type %2',
  'markiere %1 mit Schlüssel %2 = %3': 'mark %1 with key %2 = %3',
  '%1 ist markiert mit %2': '%1 is marked with %2',
  'Markierung %2 von %1': 'marker %2 of %1',
  'Material %1': 'material %1',

  // ============ GUI ============
  'erstelle Menü Größe %1 Titel %2': 'create menu size %1 title %2',
  'lege in Menü %1 in Slot %2 das Item %3': 'put in menu %1 at slot %2 item %3',
  'öffne Menü %1 für %2': 'open menu %1 for %2',
  'schließe Menü von %1': 'close menu of %1',
  'fülle Ränder von %1 mit %2': 'fill borders of %1 with %2',

  // ============ SCOREBOARD / BOSSBAR ============
  'erstelle Sidebar für %1 mit Titel %2': 'create sidebar for %1 with title %2',
  'setze in Sidebar von %1 Zeile %2 auf %3': 'set sidebar of %1 line %2 to %3',
  'entferne Sidebar von %1': 'remove sidebar of %1',
  'zeige BossBar %1 in %2 (Fortschritt %3) für %4': 'show bossbar %1 in %2 (progress %3) to %4',
  'verstecke BossBar von %1': 'hide bossbar of %1',

  // ============ COMMANDS / SCHEDULER ============
  'definiere Command /%1': 'define command /%1',
  'Beschreibung %1': 'description %1',
  'Sender (Command)': 'sender (command)',
  'Argument %1': 'argument %1',
  'Anzahl Argumente': 'argument count',
  'warte %1 Ticks dann': 'wait %1 ticks then',
  'wiederhole alle %1 Ticks': 'repeat every %1 ticks',

  // ============ CONFIG ============
  'Config String %1': 'config string %1',
  'Config Zahl %1': 'config number %1',
  'setze Config %1 auf %2': 'set config %1 to %2',
  'Config speichern': 'save config',

  // ============ PERMISSIONS ============
  'hat %1 Berechtigung %2': '%1 has permission %2',
  '%1 ist OP': '%1 is OP',

  // ============ NETWORK ============
  'alle Server-Namen': 'all server names',
  'aktueller Server von %1': 'current server of %1',

  // ============ TEXT / MATH ============
  '%1 enthält %2': '%1 contains %2',
  'in %1 ersetze %2 durch %3': 'in %1 replace %2 with %3',
  '%1 in %2': '%1 to %2',
  'färbe Text %1 in %2': 'color text %1 in %2',
  'runde %1': 'round %1',
  'Rest von %1 ÷ %2': 'remainder of %1 ÷ %2',

  // ============ FLOW / LOGIC ============
  'beende Ausführung (return)': 'end execution (return)',
  'gib zurück %1': 'return %1',

  // ============ EVENT-CONTEXT ============
  'setze Join-Nachricht auf %1': 'set join message to %1',
  'verstecke Join-Nachricht (Standard ausschalten)': 'hide join message (disable default)',
  'setze Quit-Nachricht auf %1': 'set quit message to %1',
  'verstecke Quit-Nachricht': 'hide quit message',
  'setze Tod-Nachricht auf %1': 'set death message to %1',
  'behalte Inventar nach Tod %1': 'keep inventory on death %1',
  'behalte XP nach Tod %1': 'keep XP on death %1',
  'setze Chat-Nachricht auf %1': 'set chat message to %1',
  'setze Chat-Format auf %1': 'set chat format to %1',
  'ist Rechtsklick': 'is right-click',
  'ist Linksklick': 'is left-click',
  'klickte in Luft': 'clicked in air',
  'Inventar: ist Linksklick': 'inventory: is left-click',
  'Inventar: ist Rechtsklick': 'inventory: is right-click',
  'Inventar: ist Shift-Klick': 'inventory: is shift-click',
  'setze fallendes XP auf %1': 'set XP drop to %1',
  'setze Drop-Items beim Block-Abbau auf nichts': 'clear block-break drops',
  'Schaden-Menge': 'damage amount',
  'setze Schaden-Menge auf %1': 'set damage amount to %1',
  'Schaden-Ursache': 'damage cause',
  'setze ausgeführten Befehl auf /%1': 'set executed command to /%1',

  // ============ CONSOLE ============
  'Konsolen-Log: %1': 'console log: %1',
  'führe als Konsole aus: /%1': 'run as console: /%1',

  // ============ DROPDOWN OPTIONS ============
  // Materials
  'Diamant': 'Diamond',
  'Diamantschwert': 'Diamond Sword',
  'Diamantbrustpanzer': 'Diamond Chestplate',
  'Diamantelm': 'Diamond Helmet',
  'Diamanthose': 'Diamond Leggings',
  'Diamantstiefel': 'Diamond Boots',
  'Eisenschwert': 'Iron Sword',
  'Holzschwert': 'Wooden Sword',
  'Apfel': 'Apple',
  'Goldener Apfel': 'Golden Apple',
  'Brot': 'Bread',
  'Cookie': 'Cookie',
  'Kuchen': 'Cake',
  'Holz': 'Oak Log',
  'Stein': 'Stone',
  'Bruchstein': 'Cobblestone',
  'Gras': 'Grass Block',
  'Erde': 'Dirt',
  'Sand': 'Sand',
  'Glas': 'Glass',
  'Diamantblock': 'Diamond Block',
  'Goldblock': 'Gold Block',
  'Eisenblock': 'Iron Block',
  'Wasser-Eimer': 'Water Bucket',
  'Lava-Eimer': 'Lava Bucket',
  'Pfeil': 'Arrow',
  'Bogen': 'Bow',
  'Karotte': 'Carrot',
  'Kartoffel': 'Potato',
  'Weizen': 'Wheat',
  'Endperle': 'Ender Pearl',
  'Enderauge': 'Eye of Ender',
  'Buch': 'Book',
  'Verzaubertes Buch': 'Enchanted Book',
  'Trank': 'Potion',
  'Goldbarren': 'Gold Ingot',
  'Eisenbarren': 'Iron Ingot',
  'Smaragd': 'Emerald',
  'Netherit-Schwert': 'Netherite Sword',
  'Elytren': 'Elytra',

  // Game modes
  'Überleben': 'Survival',
  'Kreativ': 'Creative',
  'Abenteuer': 'Adventure',
  'Zuschauer': 'Spectator',

  // Slots
  'Helm': 'Helmet',
  'Brustpanzer': 'Chestplate',
  'Hose': 'Leggings',
  'Stiefel': 'Boots',

  // Time
  'Tag': 'Day',
  'Mittag': 'Noon',
  'Nacht': 'Night',
  'Mitternacht': 'Midnight',

  // Weather
  'Klar': 'Clear',
  'Regen': 'Rain',
  'Sturm': 'Storm',

  // Boss bar colors
  'Pink': 'Pink',
  'Blau': 'Blue',
  'Rot': 'Red',
  'Grün': 'Green',
  'Gelb': 'Yellow',
  'Lila': 'Purple',
  'Weiß': 'White',
  'Schwarz': 'Black',
  'Gold': 'Gold',
  'Hellblau': 'Aqua',
  'Grau': 'Gray',

  // Sounds
  'Level Up': 'Level Up',
  'Erfolg': 'Success',
  'Klick': 'Click',
  'Glocke': 'Bell',
  'Endermann': 'Enderman',
  'Explosion': 'Explosion',

  // Entities
  'Zombie': 'Zombie',
  'Skelett': 'Skeleton',
  'Creeper': 'Creeper',
  'Kuh': 'Cow',
  'Schwein': 'Pig',
  'Schaf': 'Sheep',
  'Enderdrache': 'Ender Dragon',
  'Ghast': 'Ghast',
  'Wither': 'Wither',

  // Potion effects
  'Geschwindigkeit': 'Speed',
  'Langsamkeit': 'Slowness',
  'Sprungkraft': 'Jump Boost',
  'Regeneration': 'Regeneration',
  'Stärke': 'Strength',
  'Schwäche': 'Weakness',
  'Unsichtbarkeit': 'Invisibility',
  'Nachtsicht': 'Night Vision',
  'Wasseratmung': 'Water Breathing',
  'Feuerresistenz': 'Fire Resistance',
  'Vergiftung': 'Poison',
  'Glühen': 'Glowing',
  'Sättigung': 'Saturation',

  // Enchants
  'Schärfe': 'Sharpness',
  'Schutz': 'Protection',
  'Effizienz': 'Efficiency',
  'Glück': 'Fortune',
  'Behutsamkeit': 'Silk Touch',
  'Haltbarkeit': 'Unbreaking',
  'Feuerschutz': 'Fire Protection',
  'Pfeilschaden': 'Power',
  'Flammenpfeil': 'Flame',
  'Unendlich': 'Infinity',
  'Plünderung': 'Looting',

  // Particles
  'Flamme': 'Flame',
  'Herz': 'Heart',
  'Note': 'Note',
  'Rauch': 'Smoke',
  'Hexerei': 'Witch',
  'Tropfen Wasser': 'Dripping Water',
  'Portal': 'Portal',
  'Glücklich': 'Happy Villager',
  'Wütend': 'Angry Villager',
  'Cloud': 'Cloud',
  'Verzauberungstisch': 'Enchant',

  // Boolean dropdowns
  'ja': 'yes',
  'nein': 'no',

  // Case
  'Großbuchstaben': 'Uppercase',
  'Kleinbuchstaben': 'Lowercase',

  // Sizes
  '9 (1 Reihe)': '9 (1 row)',
  '18 (2 Reihen)': '18 (2 rows)',
  '27 (3 Reihen)': '27 (3 rows)',
  '36 (4 Reihen)': '36 (4 rows)',
  '45 (5 Reihen)': '45 (5 rows)',
  '54 (6 Reihen)': '54 (6 rows)',
};

/** Translate a single label string. Returns the EN equivalent or the
 *  original if no translation exists. */
export function trBlockLabel(de: string, lang: 'de' | 'en'): string {
  if (lang !== 'en') return de;
  return DE_TO_EN[de] ?? de;
}

/** Walk a Blockly JSON-block-array and translate its visible strings in
 *  place. Touches `message0`/`message1`/…, dropdown labels, and tooltips. */
export function translateBlockArray(arr: any[], lang: 'de' | 'en'): void {
  if (lang !== 'en') return;
  for (const b of arr) {
    if (typeof b.message0 === 'string') b.message0 = trBlockLabel(b.message0, lang);
    if (typeof b.message1 === 'string') b.message1 = trBlockLabel(b.message1, lang);
    if (typeof b.message2 === 'string') b.message2 = trBlockLabel(b.message2, lang);
    if (typeof b.tooltip === 'string') b.tooltip = trBlockLabel(b.tooltip, lang);
    for (const k of ['args0', 'args1', 'args2'] as const) {
      const args = b[k];
      if (!Array.isArray(args)) continue;
      for (const arg of args) {
        if (arg.type === 'field_dropdown' && Array.isArray(arg.options)) {
          arg.options = arg.options.map(([label, value]: [string, string]) => [
            trBlockLabel(label, lang),
            value,
          ]);
        }
        if (arg.type === 'field_label' && typeof arg.text === 'string') {
          arg.text = trBlockLabel(arg.text, lang);
        }
      }
    }
  }
}
