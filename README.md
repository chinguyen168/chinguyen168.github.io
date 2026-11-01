# nguyen.dev

Nguyen Phung’s personal website, built with Astro and TypeScript. Blog posts and TIL notes are plain Markdown files. The site builds to static HTML and can be hosted anywhere that serves static files.

## Quick start

Use Node **22.23.4 or newer** and npm **9.6.5 or newer**. The development version is pinned in `.nvmrc` (Node 26.7.0).

```sh
# Optional, if you use nvm
nvm use

npm ci
npm run dev
```

Open the local URL printed by Astro (normally http://localhost:4321). Changes to pages, styles, data, and Markdown refresh the preview. Stop with Ctrl+C.

## Write a post

```sh
npm run new:blog -- "Understanding Java Optional"
# or
npm run new:til -- "Switch to the previous Git branch"
```

The command prints the new file path. It uses the current date in Vietnam, creates a draft, and will not overwrite an existing post. You can also create a `.md` file yourself:

```md
---
title: 'Understanding Java Optional'
description: 'When to use orElseGet and why it matters.'
pubDate: 2026-10-25
tags: [Java, Spring]
draft: true
---

Start with the idea you want to share.

## An example

Write the explanation here.
```

- Blog posts live in `src/content/blog/`; TIL notes live in `src/content/til/`.
- Use lowercase, hyphenated filenames. `understanding-java-optional.md` becomes `/blog/understanding-java-optional/`. Keep filenames stable after publication.
- `title`, `description`, and `pubDate` are required. Dates use `YYYY-MM-DD`; optional `updatedDate` records a meaningful revision.
- `tags` defaults to an empty list. `draft` defaults to **true** if omitted.
- Use `sample: true` only for illustrative content. The three migrated examples are sample drafts, not published articles.
- Do not repeat the title as an H1 in the body; the article layout supplies it. H2/H3 headings get stable anchor IDs and appear in “On this page.”
- Fenced code blocks accept a language such as `java`, `sh`, or `typescript`. Markdown also supports tables, lists, blockquotes, and links.
- Reading time and newest-first listings are automatic. Blog and TIL filters search titles, descriptions, and tags.

### Images

Keep images in a subfolder beside your posts, and reference them with a relative Markdown path:

```text
src/content/blog/
  understanding-java-optional.md
  images/
    optional-flow.png
```

```md
![Flow from an Optional value to a fallback](./images/optional-flow.png)
```

Astro processes local content images during the build. Use meaningful alt text. Shared files can go in `public/images/` and be referenced as `/images/name.png`.

### Draft and publish workflow

1. Generate a draft and edit the Markdown in your preferred editor.
2. Run `npm run dev` to preview it. Drafts carry a visible label and a `noindex` directive.
3. Replace the starter description, review the content, and set `draft: false`.
4. Run `npm run check`, `npm test`, and `npm run build`.
5. Run `npm run preview` to review the exact production output, then upload `dist/` to your chosen static host.

Drafts are excluded from production pages, listings, filter data, redirects, sitemap, and RSS. RSS excludes drafts even during development. This is a build-time publishing workflow: a future `pubDate` does **not** schedule publication; `draft` controls inclusion.

The production site initially has empty blog/TIL collections because all migrated posts are examples. Local development displays those drafts so you can review the layouts. Add your own post to populate production.

The browser Writing Desk has been removed. Any old browser-only drafts must be exported from the old prototype before retiring that copy; they are not automatically imported into this repository.

## Structure

```text
src/
  components/       Shared sidebar, theme buttons, post cards, filters
  layouts/          Page shell, metadata, article layout
  pages/            File-based routes and RSS endpoint
  content/
    blog/           Markdown articles
    til/            Markdown notes
  content.config.ts Validated content schemas
  data/             Profile, experience, project information
  lib/              Content access, publication policy, reading time
  scripts/          Small browser enhancements
  styles/           Theme tokens, global styles, Markdown typography
scripts/            New-post command
public/             Files copied unchanged to the site
tests/             Content, generator, and isolated build tests
```

Change your name, role, biography, GitHub link, interests, or experience in `src/data/profile.ts`; project details are in `src/data/projects.ts`. The homepage’s playful Java snippet is presentation copy in `src/pages/index.astro`.

Change the two palettes in `src/styles/tokens.css`. Shared typography and layout live in `global.css`; article formatting lives in `prose.css`. Component-specific rules are scoped inside `.astro` components. There is no React dependency or client-side HTML router.

The default theme is dark. Sun and moon buttons store the selection under the existing `np-theme` browser preference. Navigation, content, and heading links work without JavaScript; the theme buttons and filters are progressive enhancements.

## Commands

| Command                       | Purpose                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                 | Live development with drafts                                       |
| `npm run check`               | Astro/TypeScript and content validation                            |
| `npm test`                    | Publication policy, generator, and isolated production build tests |
| `npm run build`               | Generate static production output in `dist/`                       |
| `npm run preview`             | Serve the production build locally                                 |
| `npm run format`              | Format Astro, TypeScript, Markdown, and configuration              |
| `npm run format:check`        | Check formatting without rewriting                                 |
| `npm run new:blog -- "Title"` | Create a Markdown blog draft                                       |
| `npm run new:til -- "Title"`  | Create a Markdown TIL draft                                        |

The build tests copy the project into a temporary directory and create fixture posts there. They never edit your authored content. Temporary files are removed when the test finishes.

## Search foundations and hosting

Every page includes a title, description, canonical URL, and social-sharing metadata. Published posts render as complete HTML with author, dates, headings, and code. `/rss.xml` combines published blogs and TILs; `/sitemap-index.xml` is generated during builds.

The production origin defaults to `https://nguyenphung.dev`. `nguyen.dev` is the visual wordmark, not a domain migration. To build for another origin:

```sh
SITE_URL=https://example.com npm run build
```

Deploy `dist/` to the root of the chosen domain. Configure your host to serve `404.html` for missing pages. This project has no Sites integration or hosting credentials. The GitHub Pages workflow below deploys after the source is placed in the website repository and Pages is configured. The live site has not been modified by the local rebuild.

Recognized old root hash links (`#home`, `#about`, `#projects`, `#writing`, `#til`, and published `#post/<slug>` links) navigate to their new routes. `#desk` leads to Blogs. Draft links resolve only in local development.

Google Fonts currently supplies DM Sans and DM Mono, with system fallbacks when offline. Self-host fonts later if needed. Advanced structured data, AI-specific discovery, crawler policy, and analytics are intentionally deferred.

## GitHub Pages deployment

Target repository: <https://github.com/chinguyen168/chinguyen168.github.io>.
Production domain: <https://nguyenphung.dev>.

This is a fresh Astro rebuild of the old project listing page. No Jekyll content migration is required. Projects are maintained in `src/data/projects.ts`.

### First release

1. In a checkout of the existing website repository, create an `astro-rebuild` branch from `master`.
2. Replace the old Jekyll source with this project's source, including `.github/`, dotfiles, and `package-lock.json`. Keep the checkout's `.git` directory and existing license notice. Do not copy this local project's `.git`, `node_modules`, `.astro`, or `dist` directories. The old root `CNAME` is replaced by `public/CNAME`.
3. Commit and open a pull request targeting `master`. The workflow validates formatting, types, tests, and the production build. Pull requests do not deploy.
4. When ready to release, in **Settings → Pages**, select **GitHub Actions** as the build source. Keep the custom domain `nguyenphung.dev` and HTTPS enabled. The domain already points at GitHub Pages, so a host change is not needed; verify the existing DNS rather than replacing it.
5. Merge the reviewed rebuild into `master`. The workflow uploads only `dist/` and deploys it to GitHub Pages. Check the workflow result and visit the domain.

The repository currently uses `master`; deployment intentionally follows that branch. If you rename the production branch, update the workflow triggers and both `refs/heads/master` conditions.

`site` already uses the custom domain, and no Astro `base` prefix is needed. `public/CNAME` is copied into `dist/CNAME`; the custom domain must also remain configured in GitHub's Pages settings.

### Later updates

Create or edit Markdown, preview locally, set `draft: false`, and push through a pull request to `master`. Passing changes deploy automatically after merging. Drafts stay out of the generated website, but Markdown source in a public GitHub repository is public, including drafts.

To roll back, revert the rebuild commit on `master` and restore the previous Pages publishing source if reverting to Jekyll. Existing history remains available in the original repository.
