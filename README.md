# PluginForge — Build Service

Compiles uploaded Maven project ZIPs into `.jar` files.

## Local

Requires Java 21 + Maven 3.9+ + Node 20+ on PATH.

```bash
npm install
npm start
# listens on :8787
```

## Docker (sandboxed)

```bash
docker build -t mcpb-build .
docker run --rm -p 8787:8787 --memory=1g --cpus=2 mcpb-build
```

## API

`POST /build` — multipart form
- `source`: zip of a Maven project (must contain a `pom.xml` somewhere)
- `platform`: `paper` | `spigot` | `velocity` | `bungee`

Returns the compiled `.jar` on success, plain-text Maven log on failure.

## Hardening checklist (production)

- [ ] Run inside Docker with `--memory`, `--cpus`, `--pids-limit`, `--read-only`
- [ ] Drop network capabilities except for Maven's outbound HTTPS
- [ ] Per-IP rate limit (e.g. `express-rate-limit`) and request quotas
- [ ] Cap upload size lower than the current 10 MB if abuse is observed
- [ ] Run as non-root user, no shell
- [ ] Pin Maven repos to a trusted mirror
