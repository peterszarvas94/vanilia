# Vanilia agent notes

## Git

- Default branch is `master` (renamed from `main` on 2026-11-23). Branch from `origin/master` and target PRs at it.
- GitHub (`origin`, `peterszarvas94/vanilla-wysiwyg`) is the only remote. One worktree and one PR per task.

## Deployment

- Live site: https://vanilia.peterszarvas.hu (the old `wysiwyg.peterszarvas.hu` domain is retired).
- Coolify app `Vanilia` (`iompqyo5c6n63lljt8rwjrm4`) on the hub Coolify, Dockerfile build, public GitHub source, branch `master`.
- There is no deploy webhook: merging does not deploy. After a merge run `coolify deploy uuid iompqyo5c6n63lljt8rwjrm4` and check the site.
- Hosted install snippets (README, `templates/home.html`, `templates/docs.html`) point at `https://vanilia.peterszarvas.hu/dist/…`. Update them together if the domain changes.

## Checks (no CI, run locally)

- `go vet ./... && go test ./...`
- `node --test tests/unit/`
- `node scripts/pack.mjs --check` (rebuild `dist/` with `node scripts/pack.mjs` after changing `src/`)
- No frontend tests; verify UI by hand with screenshots.
