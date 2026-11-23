# Vanilia agent notes

## Git

- Default branch is `master` (renamed from `main` on 2026-11-23). Branch from `origin/master` and target PRs at it.
- GitHub (`origin`, `peterszarvas94/vanilla-wysiwyg`) is the only remote. One worktree and one PR per task.

## Deployment

- Live site: https://vanilia.peterszarvas.hu (the old `wysiwyg.peterszarvas.hu` domain is retired).
- Coolify app `Vanilia` (`iompqyo5c6n63lljt8rwjrm4`) on the hub Coolify, Dockerfile build, public GitHub source, branch `master`.
- There is no deploy webhook: merging does not deploy. After a merge run `coolify deploy uuid iompqyo5c6n63lljt8rwjrm4` and check the site.
- Hosted install snippets (README, `templates/home.html`, `templates/docs.html`) point at `https://vanilia.peterszarvas.hu/dist/…`. Update them together if the domain changes.

## Build

- The editor is TypeScript in `src/`, built with Vite+ (`vp`). Squire is pinned in `package.json` (`squire-rte`) and bundled into `dist/vanilia-editor.js`.
- After changing `src/`, run `npm run build` and commit `dist/`: the Docker image has no Node and serves the committed build.
- Site JavaScript is Datastar plugins in `static/site.js`. Pages load everything through the import map and one module script in `templates/_layout.html`.

## Checks (no CI, run locally)

- `npm run check` (`vp check`: oxfmt, oxlint, type check)
- `npm test` (`vp test`)
- `go vet ./... && go test ./...`
- No frontend tests; verify UI by hand with screenshots.
