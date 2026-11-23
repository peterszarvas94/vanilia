#!/usr/bin/env bash
# Start and stop the Vanilla WYSIWYG (Go + Datastar) dev server persistently in the background.
# Usage: scripts/dev-server.sh {start|stop|restart|status|logs}
set -euo pipefail

script_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
root="$(git -C "${T3CODE_WORKTREE_PATH:-$PWD}" rev-parse --show-toplevel 2>/dev/null || true)"
[[ -f "${root}/go.mod" ]] || root="$script_root"
state="$root/.dev"
logfile="$state/log"
bin="$state/server"
port="${PORT:-4173}"
unit="vanilla-wysiwyg-dev-${port}"

host="$(tailscale status --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log(JSON.parse(s)?.Self?.HostName||"")}catch{}})' 2>/dev/null || true)"
host="${host:-$(hostname -s)}"
url="http://${host}:${port}/"

running() {
  systemctl --user is-active --quiet "${unit}.service" 2>/dev/null
}

cmd_start() {
  if running; then
    echo "Already running: $url"
    return 0
  fi
  mkdir -p "$state"
  go -C "$root" build -o "$bin" ./cmd/server
  systemctl --user reset-failed "${unit}.service" 2>/dev/null || true
  systemd-run --user \
    --unit="$unit" \
    --description="Vanilla WYSIWYG Dev Server ($port)" \
    --working-directory="$root" \
    --setenv="PORT=$port" \
    --setenv="BIND=[::]:$port" \
    --property="StandardOutput=append:$logfile" \
    --property="StandardError=append:$logfile" \
    "$bin" >/dev/null

  for _ in $(seq 30); do
    if curl -fsS -o /dev/null --max-time 2 "http://127.0.0.1:${port}/healthz" 2>/dev/null; then
      echo "Running: $url"
      echo "Logs: $logfile"
      return 0
    fi
    sleep 0.2
  done
  tail -n 30 "$logfile" >&2 || true
  echo "Failed to start dev server" >&2
  exit 1
}

cmd_stop() {
  if running; then
    systemctl --user stop "${unit}.service"
    echo "Stopped."
  else
    echo "Not running."
  fi
}

cmd_status() {
  if running; then
    echo "Running: $url"
  else
    echo "Not running."
    return 1
  fi
}

case "${1:-}" in
  start) cmd_start ;;
  stop) cmd_stop ;;
  restart) cmd_stop && cmd_start ;;
  status) cmd_status ;;
  logs) [[ -f $logfile ]] || { echo "No log yet"; exit 1; }; exec tail -n 50 -f "$logfile" ;;
  *) echo "Usage: $0 {start|stop|restart|status|logs}"; exit 1 ;;
esac
