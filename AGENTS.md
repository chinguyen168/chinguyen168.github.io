# Working on nguyen.dev

This repository is Nguyen Phung's personal site: profile, projects, blogs, and TIL notes. Keep the implementation manageable for one software engineer and preserve plain Markdown authoring.

## Before changing files

- Read `docs/development.md` when setting up locally, authoring content, changing publication behavior, or working on deployment. It contains frontmatter examples, image handling, draft rules, and Pages configuration.
- Read `package.json` for the current commands and dependencies; use the Node version in `.nvmrc` and install with `npm ci`.
- Keep `README.md` public-facing: a useful introduction to Nguyen, interests, projects, and writing for visitors browsing GitHub. Put contributor instructions in `docs/development.md` and agent-specific rules here.

## Implementation boundaries

- Use Astro and TypeScript with static output. Prefer shared Astro components and small browser enhancements over adding a client framework or CMS.
- Maintain personal facts in `src/data/profile.ts` and projects in `src/data/projects.ts`. Use owner-provided facts; ask for missing employer, dates, or experience rather than inventing them.
- Keep post metadata validation in `src/content.config.ts`, publication access in `src/lib/posts.ts`, and shared publication utilities in `src/lib/post-utils.ts`. Reuse these paths when adding feeds, listings, or routes so drafts cannot leak into production.
- Preserve the left navigation, `nguyen.dev` wordmark, Blogs label, and separate sun/moon controls. Light background is `#f8f7f3`; dark uses the existing forest palette. Theme tokens live in `src/styles/tokens.css`; retain the `np-theme` preference key.
- Keep navigation and article content usable without JavaScript. Maintain accessible labels, keyboard controls, responsive layouts, and readable Markdown/code in both themes.
- Keep published slugs stable. Preview new content as drafts; publishing or changing the default draft policy requires an explicit content decision.
- Production origin is `https://nguyenphung.dev`. The wordmark does not imply a domain change. Preserve the GitHub Pages deployment and existing license notice.

## Verification and delivery

- For documentation-only edits, run `npm run format:check` and verify referenced local paths exist.
- For code, configuration, or content changes, run `npm run check`, `npm test`, `npm run build`, and `npm run format:check`. Tests build isolated fixtures and must leave authored content untouched.
- For visual changes, also inspect desktop and mobile layouts in both themes; compilation alone does not verify the UI.
- Work on a feature branch targeting `master`. Merging to `master` deploys the public site; keep deployment authorization explicit in the current task.
- Report what changed, checks performed, and any remaining work. Keep generated build output and machine-specific credentials/configuration outside commits.
