# Vanilia agent notes

## Git

- Default branch is `master` (renamed from `main` on 2026-11-23). Branch from `origin/master` and target PRs at it.
- GitHub (`origin`, `peterszarvas94/vanilia`, renamed from `vanilla-wysiwyg` on 2026-11-23) is the primary; push and open PRs there only. One worktree and one PR per task.
- Forgejo (`git.erdohat.com/peterszarvas/vanilia`) is a read-only mirror, synced from GitHub every minute by the homelab `github-forgejo-sync` timer. Never push to it.

## Deployment

- Live site: https://vanilia.peterszarvas.hu (the old `wysiwyg.peterszarvas.hu` domain is retired).
- Coolify app `Vanilia` (`iompqyo5c6n63lljt8rwjrm4`) in the `Vanilia` project on the hub Coolify, Dockerfile build, native **Forgejo** source (`peterszarvas/vanilia`), branch `master`.
- Pushes to `master` deploy automatically: the mirror pushes to Forgejo within a minute, and Forgejo's signed push hook triggers Coolify. Check the site after merging. To redeploy by hand: `coolify deploy uuid iompqyo5c6n63lljt8rwjrm4`.
- Hosted install snippets (README, `templates/home.html`, `templates/docs.html`) point at `https://vanilia.peterszarvas.hu/dist/…`. Update them together if the domain changes.

## Build

- The editor is TypeScript in `src/`, built with Vite+ (`vp`) into an ES module (`dist/vanilia-editor.js`, with types) and a classic script (`dist/vanilia-editor.iife.js`, `window.Vanilia`). Squire is pinned in `package.json` (`squire-rte`) and bundled into `dist/vanilia-editor.js`.
- After changing `src/`, run `npm run build` and commit `dist/`: the Docker image has no Node and serves the committed build.
- Site JavaScript is Datastar plugins in `static/site.js`. Pages load everything through the import map and one module script in `templates/_layout.html`.
- Pages link `/static`, `/dist` and `/assets` files through `{{asset "/path"}}` (content-hash `?v=`, see `cmd/server/assets.go`): fingerprinted URLs are cached as immutable, plain ones revalidate. Never hard-code those paths in page templates.

## Checks (no CI, run locally)

- `npm run check` (`vp check`: oxfmt, oxlint, type check)
- `npm test` (`vp test`)
- `go vet ./... && go test ./...`
- No frontend tests; verify UI by hand with screenshots.
