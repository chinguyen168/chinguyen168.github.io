import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
import { visiblePosts } from '../lib/post-utils';
import { profile } from '../data/profile';
export async function GET(context: APIContext) {
  const posts = visiblePosts([
    ...(await getPosts('blog', false)),
    ...(await getPosts('til', false)),
  ]);
  return rss({
    title: `${profile.name} — Blogs & TIL`,
    description: profile.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postUrl(post),
      categories: post.data.tags,
    })),
  });
}
