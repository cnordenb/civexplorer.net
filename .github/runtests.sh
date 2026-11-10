#!/usr/bin/env bash
chrome="${CHROME:-google-chrome}"
port="${PORT:-8123}"
limit=150
light=1
dark=0
console=':CONSOLE[^]]*] "tests: '
root="$(pwd -W 2> /dev/null || pwd)"
served="http://localhost:$port/index.html?test"
opened="file://$([ "${root:0:1}" = / ] || printf /)$root/index.html?test"
windows="1920,1080 1000,1000 720,1280"
schemes="$light $dark"

serve() {
  node -e '
    const http = require("node:http");
    const fs = require("node:fs");
    const path = require("node:path");
    const TYPES = {
      ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
      ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".ttf": "font/ttf", ".ico": "image/x-icon",
    };
    http.createServer((request, response) => {
      const file = path.join(process.cwd(), decodeURIComponent(new URL(request.url, "http://localhost").pathname));
      fs.readFile(file, (error, body) => {
        const type = TYPES[path.extname(file)] ?? "application/octet-stream";
        response.writeHead(error ? 404 : 200, { "Content-Type": type });
        response.end(error ? "" : body);
      });
    }).listen(Number(process.argv[1]));
  ' "$port" &
  server=$!
  for attempt in $(seq 50); do
    curl -sf -o /dev/null "$served" && return 0
    sleep 0.2
  done
  echo "The test server did not start on port $port."
  return 1
}

run() {
  local address="$1" label="$2" scheme="$3" size="$4" ended=timeout log profile pid report
  log="$(mktemp)"
  profile="$(mktemp -d)"
  "$chrome" --headless=new --no-sandbox --disable-gpu --allow-file-access-from-files \
    --blink-settings=preferredColorScheme="$scheme" --window-size="$size" --enable-logging=stderr --v=0 \
    --user-data-dir="$profile" "$address" 2> "$log" &
  pid=$!
  for second in $(seq "$limit"); do
    if grep -qE "${console}(passed|failed)\"" "$log"; then ended=verdict; break; fi
    if ! kill -0 "$pid" 2> /dev/null; then ended=exited; break; fi
    sleep 1
  done
  kill "$pid" 2> /dev/null
  wait "$pid" 2> /dev/null
  report="$(sed -n "s/^.*${console}\(.*\)\", source: .*\$/\1/p" "$log")"
  echo "== $label, $([ "$scheme" = "$light" ] && echo light || echo dark) colours, window ${size/,/ by }"
  case "$ended" in
    verdict) printf '%s\n' "$report" ;;
    exited) echo "Chrome closed before the tests gave a verdict."; grep ':CONSOLE' "$log" | tail -n 20 ;;
    timeout) echo "The tests gave no verdict in $limit seconds."; grep ':CONSOLE' "$log" | tail -n 20 ;;
  esac
  [ "$(printf '%s\n' "$report" | tail -n 1)" = passed ]
}

[ -n "$CI" ] && "$chrome" --version
status=0
if [ "$1" = file ]; then
  run "$opened" file "$light" 1920,1080 || status=1
  exit $status
fi
[ "$1" = quick ] && windows="1920,1080" && schemes="$light"
serve || exit 1
for scheme in $schemes; do
  for size in $windows; do
    run "$served" http "$scheme" "$size" || status=1
  done
done
kill "$server" 2> /dev/null
[ "$1" = quick ] || run "$opened" file "$light" 1920,1080 || status=1
exit $status
