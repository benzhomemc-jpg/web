const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, '.mongodb-data');
const PORT = 27018;

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const done = (value) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(500);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

function findMongod() {
  const cmd = process.platform === 'win32' ? 'where' : 'which';
  const found = spawnSync(cmd, ['mongod'], { encoding: 'utf8', shell: true });
  if (found.status === 0 && found.stdout.trim()) {
    return found.stdout.trim().split(/\r?\n/)[0];
  }

  if (process.platform === 'win32') {
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
    const serverRoot = path.join(programFiles, 'MongoDB', 'Server');
    if (fs.existsSync(serverRoot)) {
      const versions = fs.readdirSync(serverRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
      for (const version of versions) {
        const candidate = path.join(serverRoot, version, 'bin', 'mongod.exe');
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }
  return null;
}

function startWeb() {
  const nextBin = require.resolve('next/dist/bin/next', { paths: [ROOT] });

  return spawn(process.execPath, [nextBin, 'dev'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });
}

(async () => {
  let mongo = null;

  if (await portOpen(PORT)) {
    console.log(`[DB] MongoDB is already running on 127.0.0.1:${PORT}`);
  } else {
    const mongod = findMongod();
    if (!mongod) {
      console.error('\n[DB] MongoDB Community Server was not found.');
      console.error('[DB] Install MongoDB Community Server, then run: npm run dev:all\n');
      process.exit(1);
    }

    fs.mkdirSync(DB_PATH, { recursive: true });
    console.log(`[DB] Starting MongoDB: ${mongod}`);
    console.log(`[DB] Data folder: ${DB_PATH}`);

    mongo = spawn(mongod, [
      '--dbpath', DB_PATH,
      '--bind_ip', '127.0.0.1',
      '--port', String(PORT),
    ], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: false,
    });

    const startedAt = Date.now();
    while (!(await portOpen(PORT))) {
      if (mongo.exitCode !== null) {
        console.error('[DB] mongod stopped before it became ready.');
        process.exit(mongo.exitCode || 1);
      }
      if (Date.now() - startedAt > 15000) {
        console.error('[DB] MongoDB did not become ready within 15 seconds.');
        mongo.kill();
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    console.log(`[DB] MongoDB ready on 127.0.0.1:${PORT}`);
  }

  const web = startWeb();

  const shutdown = () => {
    if (web && web.exitCode === null) web.kill('SIGINT');
    if (mongo && mongo.exitCode === null) mongo.kill('SIGINT');
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  web.on('exit', (code) => {
    if (mongo && mongo.exitCode === null) mongo.kill('SIGINT');
    process.exit(code || 0);
  });
})();
