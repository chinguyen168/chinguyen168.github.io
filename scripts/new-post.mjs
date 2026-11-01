import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';

export function slugify(title) {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createPost({
  root,
  collection,
  title,
  now = new Date(),
}) {
  if (!['blog', 'til'].includes(collection))
    throw new Error('Choose blog or til.');
  if (!title?.trim())
    throw new Error(
      'Provide a title, e.g. npm run new:blog -- "My first post"',
    );
  const slug = slugify(title);
  if (!slug)
    throw new Error(
      'The title must include letters or numbers for its filename.',
    );
  const folder = join(root, 'src', 'content', collection);
  await mkdir(folder, { recursive: true });
  const path = join(folder, `${slug}.md`);
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const content = `---\ntitle: ${JSON.stringify(title.trim())}\ndescription: "Add a short summary for readers and search results."\npubDate: ${date}\ntags: []\ndraft: true\n---\n\nWrite your ${collection === 'blog' ? 'article' : 'note'} here.\n`;
  try {
    await writeFile(path, content, { flag: 'wx' });
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new Error(
        `A post already exists: ${path}. Choose a different title or edit that file.`,
      );
    throw error;
  }
  return path;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const path = await createPost({
      root: fileURLToPath(new URL('../', import.meta.url)),
      collection: process.argv[2],
      title: process.argv.slice(3).join(' '),
    });
    console.log(
      `Created draft: ${path}\nRun npm run dev to preview it. Set draft: false when ready to publish.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
