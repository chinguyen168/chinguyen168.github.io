/** Keep publication policy shared across pages, listings, redirects, and feeds. */
export function visiblePosts<
  T extends { id: string; data: { draft: boolean; pubDate: Date } },
>(posts: T[], includeDrafts = false): T[] {
  return posts
    .filter((post) => includeDrafts || !post.data.draft)
    .sort(
      (a, b) =>
        b.data.pubDate.getTime() - a.data.pubDate.getTime() ||
        a.id.localeCompare(b.id),
    );
}

export function readingTime(markdown: string): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[#*`_>|~]/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
