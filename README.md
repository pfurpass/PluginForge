> 🇬🇧 You are here · 🇩🇪 [Deutsche README](README.de.md)

<div align="center">

# 🔨 PluginForge

**A visual builder for Minecraft Java plugins.**
Drag blocks together like in Scratch — get production-ready Java code and a
runnable `.jar` for **Paper · Spigot · Velocity · BungeeCord**.
No Java knowledge required.

![PluginForge Screenshot](img/image.png)

</div>

---

## ✨ What you get

- **Live code preview** — generated Java with syntax highlighting updates as you build
- **17 block categories** + 10 dynamic event-context categories that pop in when the matching event block is on the canvas
- **Four target platforms**: Paper 1.21, Spigot, Velocity, BungeeCord — code generation is platform-aware
- **Lobby-grade tooling**: GUI menus, scoreboards, boss bars, titles/action bars, persistent item markers (for navigator-compass patterns), hide-players, push velocity, cooldowns
- **Project-ZIP export** for local `mvn package`, or one-click **Build JAR** through the bundled compile service
- **Bilingual** — German and English block labels (full UI + block names)
- **Save & load** via LocalStorage or portable `.mcpb.json` files

---

## 🚀 Quickstart

### Option A — Docker Compose (recommended)

One command, full stack:

```bash
docker compose up --build
```

→ Open http://localhost:8080

> **Heads-up:** if you still have the legacy `docker-compose` (Python v1.x),
> it has incompatibilities with Docker 24+. Install the new plugin:
> `sudo apt-get install docker-compose-plugin` and use `docker compose`
> (with a space).

### Option B — Local dev environment

Fastest iteration loop if you're hacking on PluginForge itself.
Requirements: **Node 20+**, **Java 21**, **Maven 3.9+**.

```bash
# Terminal 1 — frontend with hot reload
cd frontend
npm install
npm run dev               # → http://localhost:5173

# Terminal 2 — build service (optional, powers the "Build JAR" button)
cd backend
npm install
npm start                 # → http://localhost:8787
```

### Option C — Frontend only

You can run PluginForge without the build service. Click **Project ZIP** →
unzip → `mvn package` locally. If the service isn't reachable, the editor
shows a fallback modal that walks you through this.

---

## 🧱 Block categories

| Icon | Category | Highlights |
|------|----------|------------|
| ⚡ | **Events** | Join, Quit, Death, Chat, Block Break/Place, Interact, Inventory Click, Item Pickup, Damage, Respawn, Hand-Swap, Drop, Weather, Server-Start |
| 🧑 | **Player** | Send message, teleport, give item, set health/food/level/XP, title/action bar/tab, compass target, push velocity, cooldown, hide/show, potion effects, sound, kick |
| 🌍 | **World** | Set/get block, spawn entity, lightning, time/weather, drop item, explosion, particles, set spawn |
| 🎒 | **Items** | Create (dropdown + free material name), display name/lore/enchantments/unbreakable, persistent marker, material check |
| 📋 | **GUI / Menus** | Create inventory (1–6 rows), set slot, open/close, fill borders |
| 📊 | **Scoreboard** | Sidebar with title, set line, clear |
| 🎯 | **BossBar** | Show (title/color/progress), hide |
| ⌘ | **Commands** | Custom command with description, sender, argument access |
| 🔀 | **Logic** | if/else, comparisons, AND/OR/NOT, boolean, return |
| 📦 | **Variables** | Global variables |
| ⏱ | **Scheduler** | Wait ticks, repeat ticks |
| ⚙ | **Config** | Read/write/save `config.yml` |
| 🔐 | **Permissions** | hasPermission, isOp |
| 🌐 | **Network** | (Velocity/Bungee) server switch, server list |
| 🖥 | **Console** | Console log, run command as console/player |
| ✏ | **Text** | 2/3/4/5-slot joins, color (10 chat colors), contains/replace/case |
| 🔢 | **Math** | Arithmetic, random, round, modulo |

**Plus dynamic categories:** drop `when player joins` on the canvas and
**📩 Join-Event** appears with `set join message` / `hide join message`.
Same for Quit, Death, Chat, Interact, Inventory-Click, Block-Break/Place,
Damage, Command-Preprocess.

---

## 📦 Examples

Available from the start screen under **Examples**:

| Example | What it demonstrates |
|---------|----------------------|
| **Welcome plugin** | Greets joining players, gives a diamond, broadcasts |
| **Teleport command** | `/spawn` teleports the sender |
| **Mini-game** | 50 % chance of lightning strike on block break |

For each: **Examples** → pick → **Project ZIP** → `mvn package` → drop the
`.jar` into `paper-server/plugins/` → start server.

---

## 🏗 Architecture

```
┌─────────────────┐    XML    ┌──────────────────┐
│   Blockly UI    │──────────▶│  Code generator  │  (per platform)
└─────────────────┘           │ base + assemble  │
                              └────────┬─────────┘
                                       │ Java + plugin.yml + pom.xml
                                       ▼
                              ┌──────────────────┐
                              │ JSZip in browser │  →  download .zip
                              └────────┬─────────┘
                                       │ POST /build (optional)
                                       ▼
                              ┌──────────────────┐
                              │  Node + Maven    │  →  built .jar
                              │   (backend/)     │
                              └──────────────────┘
```

```
open-coding/
├── frontend/        ← React + TypeScript + Vite + Blockly
│   ├── src/blockly/      Custom blocks + Java generators
│   ├── src/components/   UI (StartScreen, Workspace, BlocklyEditor, …)
│   ├── src/export/       Maven templates + JSZip exporter
│   ├── Dockerfile        Multi-stage: Node build + Nginx serve
│   └── nginx.conf        Reverse-proxies /build → backend
├── backend/         ← Node + Express + Maven (compile service)
│   ├── server.js         POST /build → returns .jar
│   └── Dockerfile        Java 21 + Maven 3.9 + Node 20
├── docker-compose.yml
├── README.md  (this file)
├── README.de.md
└── .gitignore
```

The **code generator** (`frontend/src/blockly/generators/base.ts`) is
platform-aware: each block emits Java that matches the target API (e.g.
Adventure `Component.text()` on Paper, plain-string `sendMessage()` on
Spigot).

**Type coercion** in the generator wraps automatically:
- String slots → `String.valueOf(...)` for Numbers/Booleans/Objects
- Number slots → `__num(...)` helper for robust String → double conversion
- Player slots → context-aware (`event.getPlayer()` /
  `event.getWhoClicked()` / sender-cast / …)

---

## 🔧 Extending

### Add a new block

Touch three files:

1. **`frontend/src/blockly/blocks.ts`** — block definition (JSON):
   ```ts
   {
     type: 'player_jump',
     message0: 'lass %1 springen',
     args0: [{ type: 'input_value', name: 'PLAYER', check: 'Player' }],
     previousStatement: null, nextStatement: null,
     colour: COLOR.player, inputsInline: true,
   }
   ```

2. **`frontend/src/blockly/generators/base.ts`** — Java generator:
   ```ts
   generator.forBlock['player_jump'] = function (block) {
     const p = valueOrDefault(block, 'PLAYER', '', 'Player');
     if (platform === 'paper' || platform === 'spigot') {
       addImport(ctx.out, 'org.bukkit.util.Vector');
       return `${p}.setVelocity(new Vector(0, 0.5, 0));\n`;
     }
     return '';
   };
   ```

3. **`frontend/src/blockly/toolbox.ts`** — toolbox entry, plus a
   `PLATFORM_DISABLED` row if the block isn't available everywhere.

### Add an English translation

Add the German source string + English equivalent to
`frontend/src/blockly/blockI18n.ts`. Strings without an entry fall back to
German.

### Support a new platform

Add a `Platform` variant in `frontend/src/types/index.ts`, then
`assembleXxx()` in `assemble.ts`, a `pomXml()` template in `templates.ts`,
plus per-block platform branches in the generator.

---

## 🛡 Security (production deployments)

The **build service compiles arbitrary user code with Maven**. Sandbox it.

```bash
docker run --rm \
  -p 8787:8787 \
  --memory=1g --cpus=2 \
  --pids-limit=200 \
  --read-only --tmpfs /tmp:rw,size=512m \
  pluginforge-build
```

Plus:
- Per-IP rate limiting (e.g. `express-rate-limit`)
- Tighten the upload cap below the current 10 MB if you see abuse
- Pin Maven repos to a trusted mirror
- Run as a non-root user, no shell

See [`backend/README.md`](backend/README.md) for the full hardening
checklist.

---

## 📜 License

MIT
