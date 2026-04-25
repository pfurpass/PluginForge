import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import yauzl from 'yauzl';

const app = express();
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const BUILD_TIMEOUT_MS = 5 * 60 * 1000; // 5 min

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/build', upload.single('source'), async (req, res) => {
  if (!req.file) return res.status(400).send('missing source zip');
  const platform = req.body.platform || 'paper';

  const dir = await mkdtemp(path.join(tmpdir(), 'mcpb-'));
  try {
    await unzipBuffer(req.file.buffer, dir);
    // Find the inner project root (directory containing pom.xml)
    const projectRoot = await findProjectRoot(dir);
    if (!projectRoot) {
      return res.status(400).send('no pom.xml found in zip');
    }

    const result = await runMaven(projectRoot, BUILD_TIMEOUT_MS);
    if (result.code !== 0) {
      return res
        .status(500)
        .type('text/plain')
        .send(
          `Maven build failed (exit ${result.code}):\n\n` +
            result.stdout.slice(-4000) +
            '\n---\n' +
            result.stderr.slice(-4000)
        );
    }

    // Find the produced jar
    const targetDir = path.join(projectRoot, 'target');
    const files = await readdir(targetDir);
    const jar = files.find((f) => f.endsWith('.jar') && !f.endsWith('-sources.jar'));
    if (!jar) {
      return res.status(500).send('No jar produced');
    }

    res.setHeader('Content-Type', 'application/java-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${jar}"`);
    createReadStream(path.join(targetDir, jar)).pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).send('Build error: ' + (e?.message ?? String(e)));
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
});

function unzipBuffer(buf, dest) {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buf, { lazyEntries: true }, (err, zip) => {
      if (err) return reject(err);
      zip.readEntry();
      zip.on('entry', async (entry) => {
        if (/\/$/.test(entry.fileName)) {
          await mkdir(path.join(dest, entry.fileName), { recursive: true }).catch(() => {});
          zip.readEntry();
        } else {
          // Path-traversal guard
          const target = path.normalize(path.join(dest, entry.fileName));
          if (!target.startsWith(dest)) {
            zip.readEntry();
            return;
          }
          await mkdir(path.dirname(target), { recursive: true }).catch(() => {});
          zip.openReadStream(entry, (e2, rs) => {
            if (e2) return reject(e2);
            const ws = createWriteStream(target);
            rs.pipe(ws);
            ws.on('close', () => zip.readEntry());
            ws.on('error', reject);
          });
        }
      });
      zip.on('end', resolve);
      zip.on('error', reject);
    });
  });
}

async function findProjectRoot(dir) {
  // BFS for first directory containing pom.xml
  const queue = [dir];
  while (queue.length) {
    const cur = queue.shift();
    const entries = await readdir(cur, { withFileTypes: true }).catch(() => []);
    if (entries.some((e) => e.isFile() && e.name === 'pom.xml')) return cur;
    for (const e of entries) {
      if (e.isDirectory()) queue.push(path.join(cur, e.name));
    }
  }
  return null;
}

function runMaven(cwd, timeoutMs) {
  return new Promise((resolve) => {
    const mvn = spawn('mvn', ['-q', '-B', 'package'], {
      cwd,
      env: { ...process.env, MAVEN_OPTS: '-Xmx512m' },
    });
    let stdout = '';
    let stderr = '';
    let killed = false;
    const timer = setTimeout(() => {
      killed = true;
      mvn.kill('SIGKILL');
    }, timeoutMs);
    mvn.stdout.on('data', (d) => (stdout += d.toString()));
    mvn.stderr.on('data', (d) => (stderr += d.toString()));
    mvn.on('error', (err) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: stderr + '\n' + err.message });
    });
    mvn.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        code: killed ? 124 : code ?? -1,
        stdout,
        stderr: killed ? stderr + '\n[killed: timeout]' : stderr,
      });
    });
  });
}

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`PluginForge build service listening on :${port}`);
});
