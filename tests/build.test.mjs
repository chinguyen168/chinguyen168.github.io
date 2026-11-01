import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  readdir,
  rm,
  symlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const project = fileURLToPath(new URL('../', import.meta.url));

async function readTree(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await readTree(path)));
    else files.push(path);
  }
  return files;
}

// Build an isolated copy, so tests never publish or edit the author's actual posts.
test(
  'static build publishes Markdown and excludes draft content everywhere',
  { timeout: 120000 },
  async () => {
    const root = await mkdtemp(join(tmpdir(), 'nguyen-build-'));
    try {
      for (const name of [
        'src',
        'public',
        'astro.config.mjs',
        'tsconfig.json',
        'package.json',
      ])
        await cp(join(project, name), join(root, name), { recursive: true });
      await symlink(
        join(project, 'node_modules'),
        join(root, 'node_modules'),
        'dir',
      );
      const blog = join(root, 'src/content/blog');
      await mkdir(join(blog, 'images'), { recursive: true });
      await writeFile(
        join(blog, 'images/example.svg'),
        '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="green"/></svg>',
      );
      await writeFile(
        join(blog, 'published-fixture.md'),
        `---\ntitle: Published fixture\ndescription: A real static article fixture\npubDate: 2026-10-25\ntags: [Java, Testing]\ndraft: false\n---\n\n## Clear contract\n\nReadable body without JavaScript.\n\n\`\`\`java\nOptional<String> value = Optional.empty();\n\`\`\`\n\n| Key | Value |\n| --- | --- |\n| lang | Java |\n\n![Local example](./images/example.svg)\n`,
      );
      await writeFile(
        join(blog, 'private-fixture.md'),
        '---\ntitle: PRIVATE_SENTINEL_DO_NOT_SHIP\ndescription: PRIVATE_BODY_DO_NOT_SHIP\npubDate: 2026-10-25\ndraft: true\n---\nPRIVATE_BODY_DO_NOT_SHIP',
      );
      const build = () =>
        exec(
          process.execPath,
          [join(project, 'node_modules/astro/bin/astro.mjs'), 'build'],
          {
            cwd: root,
            env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
            maxBuffer: 4e6,
          },
        );
      await build();
      const files = await readTree(join(root, 'dist'));
      const html = await readFile(
        join(root, 'dist/blog/published-fixture/index.html'),
        'utf8',
      );
      assert.match(html, /Readable body without JavaScript/);
      assert.match(html, /id="clear-contract"/);
      assert.match(html, /href="#clear-contract"/);
      assert.match(html, /<table/);
      assert.match(html, /Local example/);
      assert.match(html, /astro-code/);
      assert.match(
        html,
        /rel="canonical" href="https:\/\/nguyenphung.dev\/blog\/published-fixture\/"/,
      );
      assert.match(html, /property="og:title"/);
      assert.match(
        html,
        /name="description" content="A real static article fixture"/,
      );
      assert.match(
        await readFile(join(root, 'dist/blog/index.html'), 'utf8'),
        /Published fixture/,
      );
      assert.match(
        await readFile(join(root, 'dist/rss.xml'), 'utf8'),
        /\/blog\/published-fixture\//,
      );
      assert.match(
        await readFile(join(root, 'dist/sitemap-0.xml'), 'utf8'),
        /\/blog\/published-fixture\//,
      );
      assert.match(
        await readFile(join(root, 'dist/404.html'), 'utf8'),
        /noindex/,
      );
      assert.ok(!files.some((path) => path.includes('private-fixture')));
      assert.ok(
        !files.some((path) => path.includes('designing-a-small-java-api')),
      );
      for (const path of files.filter((path) =>
        /\.(html|xml|json|js)$/.test(path),
      )) {
        assert.doesNotMatch(
          await readFile(path, 'utf8'),
          /PRIVATE_SENTINEL_DO_NOT_SHIP|PRIVATE_BODY_DO_NOT_SHIP/,
          path,
        );
      }
      await writeFile(
        join(blog, 'invalid-fixture.md'),
        '---\ntitle: Invalid metadata\npubDate: not-a-date\n---\nBroken',
      );
      await assert.rejects(
        build(),
        (error) =>
          /invalid-fixture|Invalid metadata/.test(
            error.stdout + error.stderr,
          ) && /description|pubDate/.test(error.stdout + error.stderr),
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);
