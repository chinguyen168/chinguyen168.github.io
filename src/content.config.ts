import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const postSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  draft: z.boolean().default(true),
  sample: z.boolean().default(false),
});

export const collections = {
  blog: defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
    schema: postSchema,
  }),
  til: defineCollection({
    loader: glob({ base: './src/content/til', pattern: '**/*.md' }),
    schema: postSchema,
  }),
};
