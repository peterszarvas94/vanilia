# Docker & Coolify Deployment

```sh
docker build -t vanilla-wysiwyg .
docker run --rm -p 127.0.0.1:3000:3000 vanilla-wysiwyg
```

- Zero JS/CSS build step: the container compiles only the tiny Go + Datastar SSE server and copies the standalone ES modules (`src/`, `static/vendor/`, `assets/`, `templates/`).
- Runs as non-root UID/GID `10001:10001` on port `3000` (`GET /healthz` for health checks).
- Optional `BASE_PATH` env var if mounted under a subpath; leave unset for a dedicated subdomain such as `https://vanilia.peterszarvas.hu`.
- Session content and uploaded images are stored in bounded memory and reset on container restart.
