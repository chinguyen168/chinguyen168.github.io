import { getCollection, type CollectionEntry } from 'astro:content';
import { visiblePosts } from './post-utils';
export type Post = CollectionEntry<'blog'> | CollectionEntry<'til'>;
export type PostCollection = 'blog' | 'til';
export async function getPosts(
  collection: PostCollection,
  includeDrafts = import.meta.env.DEV,
): Promise<Post[]> {
  return visiblePosts(await getCollection(collection), includeDrafts);
}
export function postUrl(post: Post): string {
  return `/${post.collection}/${post.id}/`;
}
