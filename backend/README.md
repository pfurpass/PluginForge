# PluginForge — Build Service

Optionaler Backend-Service für den **PluginForge-Baukasten**. Nimmt das vom
Frontend generierte Maven-Projekt-ZIP entgegen, kompiliert es serverseitig
mit Maven und liefert die fertige `.jar` zurück.

> Du kannst PluginForge auch komplett **ohne** diesen Service benutzen —
> dann lädt das Frontend statt einer `.jar` direkt das Maven-Projekt-ZIP
> herunter, und du führst `mvn package` lokal aus. Dieser Service spart dir
> diesen letzten Schritt.

## Lokal starten

Voraussetzung: Java 21 + Maven 3.9+ + Node 20+ auf PATH.

```bash
npm install
npm start
# läuft auf :8787
```

## Docker (sandboxed — empfohlen für Produktivbetrieb)

```bash
docker build -t pluginforge-build .
docker run --rm -p 8787:8787 --memory=1g --cpus=2 pluginforge-build
```

## API

`POST /build` — multipart form
- `source`: ZIP eines Maven-Projekts (muss ein `pom.xml` irgendwo enthalten)
- `platform`: `paper` | `spigot` | `velocity` | `bungee`

Bei Erfolg → kompilierte `.jar`. Bei Fehler → plain-text Maven-Log.

## Hardening-Checkliste (Produktion)

Da dieser Service beliebigen User-Code per Maven kompiliert, ist Sandboxing
Pflicht:

- [ ] Inside Docker laufen lassen mit `--memory`, `--cpus`, `--pids-limit`, `--read-only`
- [ ] Netzwerk-Capabilities außer Mavens HTTPS rausnehmen
- [ ] Per-IP Rate-Limit (z.B. `express-rate-limit`) und Request-Quoten
- [ ] Upload-Größe niedriger als die aktuellen 10 MB cappen falls Missbrauch auftaucht
- [ ] Non-Root-User, keine Shell
- [ ] Maven-Repos auf einen vertrauenswürdigen Mirror pinnen

## Verhältnis zum Baukasten

```
Frontend (Browser, Blockly-Baukasten)
     ↓ ZIP
Backend (dieser Service, Maven)
     ↓ JAR
Spieler (kopiert in plugins/-Ordner)
```

Das Frontend ist der **Baukasten** — wo Plugins per Drag & Drop entstehen.
Dieses Backend ist nur der **Compile-Schritt** — eine kleine, isolierte
Pipeline, die fertige Block-Diagramme zu lauffähigen `.jar`s macht. Der
Baukasten funktioniert auch komplett ohne dieses Backend (siehe
„Projekt-ZIP"-Knopf im Frontend).

Siehe `../README.md` für die Gesamt-Übersicht.
