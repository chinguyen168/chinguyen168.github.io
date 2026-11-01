import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPost, slugify } from '../scripts/new-post.mjs';
import {
  visiblePosts,
  readingTime,
  formatDate,
} from '../src/lib/post-utils.ts';

test('published posts exclude drafts and sort newest first without mutating input', () => {
  const posts = [
    { id: 'old', data: { draft: false, pubDate: new Date('2024-01-01') } },
    { id: 'secret', data: { draft: true, pubDate: new Date('2026-01-01') } },
    { id: 'new', data: { draft: false, pubDate: new Date('2025-01-01') } },
  ];
  assert.deepEqual(
    visiblePosts(posts).map((p) => p.id),
    ['new', 'old'],
  );
  assert.deepEqual(
    visiblePosts(posts, true).map((p) => p.id),
    ['secret', 'new', 'old'],
  );
  assert.equal(posts[0].id, 'old');
  assert.deepEqual(visiblePosts([]), []);
});

test('reading time handles Markdown and dates do not shift with the local timezone', () => {
  assert.equal(readingTime(''), '1 min read');
  assert.equal(readingTime('word '.repeat(201)), '2 min read');
  assert.equal(
    readingTime('[Read this](https://example.com) ![image](./photo.png)'),
    '1 min read',
  );
  assert.equal(formatDate(new Date('2026-10-25T00:00:00Z')), 'Oct 25, 2026');
});

test('new post command creates compatible drafts and never overwrites a file', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nguyen-post-'));
  try {
    const options = {
      root,
      collection: 'blog',
      title: 'Java: "Optional" & Nguyễn',
      now: new Date('2026-10-24T18:00:00Z'),
    };
    const path = await createPost(options);
    const source = await readFile(path, 'utf8');
    assert.ok(path.endsWith('java-optional-nguyen.md'));
    assert.match(source, /pubDate: 2026-10-25/);
    assert.match(source, /draft: true/);
    assert.match(source, /description:/);
    await assert.rejects(createPost(options), /already exists/);
    assert.equal(await readFile(path, 'utf8'), source);
    await assert.rejects(
      createPost({ ...options, title: '' }),
      /Provide a title/,
    );
    await assert.rejects(
      createPost({ ...options, collection: '../outside' }),
      /Choose blog or til/,
    );
    assert.equal(slugify('Đọc Java'), 'doc-java');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
