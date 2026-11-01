import { cp, mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Exercise real production HTML with deterministic posts; never edit authored content.
const project = fileURLToPath(new URL('../../', import.meta.url));
const root = await mkdtemp(join(tmpdir(), 'nguyen-browser-'));
const astro = join(project, 'node_modules/astro/bin/astro.mjs');
let child;
async function stop() {
  if (child && child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await once(child, 'exit');
  }
  await rm(root, { recursive: true, force: true });
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => void stop().finally(() => process.exit(0)));
}
function run(args) {
  child = spawn(process.execPath, [astro, ...args], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  return once(child, 'exit');
}
try {
  for (const name of [
    'src',
    'public',
    'astro.config.mjs',
    'tsconfig.json',
    'package.json',
  ]) {
    await cp(join(project, name), join(root, name), { recursive: true });
  }
  await symlink(
    join(project, 'node_modules'),
    join(root, 'node_modules'),
    'dir',
  );
  await rm(join(root, 'src/content'), { recursive: true });
  for (const collection of ['blog', 'til']) {
    const folder = join(root, 'src/content', collection);
    await mkdir(folder, { recursive: true });
    for (const [slug, title, tag] of [
      ['java-contracts', 'Java contracts', 'Java'],
      ['java-performance', 'Java performance', 'Java'],
      ['git-shortcuts', 'Git shortcuts', 'Git'],
    ]) {
      await writeFile(
        join(folder, `${slug}.md`),
        `---\ntitle: ${title}\ndescription: ${title} explained\npubDate: 2026-01-01\ntags: [${tag}]\ndraft: false\n---\n\nA browser test article.\n`,
      );
    }
  }
  const [code] = await run(['build']);
  if (code !== 0) throw new Error(`Browser fixture build failed (${code})`);
  const [previewCode] = await run([
    'preview',
    '--ignore-lock',
    '--host',
    '127.0.0.1',
    '--port',
    '4322',
  ]);
  process.exitCode = previewCode ?? 1;
} finally {
  await stop();
}
