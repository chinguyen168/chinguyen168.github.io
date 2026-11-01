# Development and publishing

Use this guide to work on the Astro site or publish Markdown posts. Public profile information belongs in the root README and on the website.

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
- Use `sample: true` only for illustrative content. The bundled examples are sample drafts, not published articles.
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
5. Run `npm run preview` to review the exact production output, then submit the source changes through a pull request to `master`. Merging triggers deployment.

Drafts are excluded from production pages, listings, filter data, redirects, sitemap, and RSS. RSS excludes drafts even during development. This is a build-time publishing workflow: a future `pubDate` does **not** schedule publication; `draft` controls inclusion.

Bundled example posts remain drafts. Local development displays them so you can review the layouts; add your own published content to populate production.

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

## Hosting and metadata

Production: <https://nguyenphung.dev>. Repository: <https://github.com/chinguyen168/chinguyen168.github.io>.

The site is static HTML, deployed to GitHub Pages by `.github/workflows/deploy.yml`. Pull requests targeting `master` run validation; pushes to `master` and manual runs on `master` can deploy. Review the workflow for the current checks and permissions. Only `dist/` is uploaded. Use a feature branch and pull request for changes; merging to `master` publishes them.

In **Settings → Pages**, use **GitHub Actions**, set the custom domain to `nguyenphung.dev`, and enable **Enforce HTTPS**. With Actions publishing, GitHub ignores `CNAME` files for domain configuration: configure the domain in Pages settings. `public/CNAME` is retained as a record of the intended domain. See [GitHub's custom-domain guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

`astro.config.mjs` defaults to `https://nguyenphung.dev`; no repository path prefix is used. `nguyen.dev` is the wordmark, not a domain change. To build for another origin, set `SITE_URL` and update the deployment environment consistently:

```sh
SITE_URL=https://example.com npm run build
```

Pages include titles, descriptions, canonical URLs, and social metadata. Published Markdown renders to complete HTML. `/rss.xml` combines blogs and TILs; `/sitemap-index.xml` is generated at build time. Missing pages use `404.html`.

Drafts are excluded from the generated website, but draft Markdown committed to this public repository is public source. Keep sensitive or private writing outside the repository.

Recognized old root hash links (`#home`, `#about`, `#projects`, `#writing`, `#til`, and published `#post/<slug>` links) navigate to their new routes. `#desk` leads to Blogs. Draft links resolve only in local development.

After deployment, check the workflow result, the custom-domain homepage, navigation, and any changed article URLs. Revert a faulty change through a new commit or pull request to `master`; the workflow deploys the reverted source.

Google Fonts supplies DM Sans and DM Mono, with system fallbacks. Advanced structured data, AI-specific discovery, crawler policy, and analytics remain future work.

## Browser tests

Install Chromium once after `npm ci`, then run the focused browser suite:

```sh
npx playwright install chromium
npm run test:browser
```

Playwright builds a temporary copy with deterministic published blog/TIL fixtures, serves it on `127.0.0.1:4322`, and removes it after the run. Your posts and local preview on port 4321 remain untouched. Tests exercise desktop and mobile Chromium, theme selection and persistence, blocked storage, filtering and result announcements, and navigation without JavaScript. Failed runs retain traces and screenshots under `test-results/`. CI installs Chromium and runs this suite before deployment.
