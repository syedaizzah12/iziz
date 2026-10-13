#!/bin/sh
# SessionStart: make the /motion-reel toolchain ready in a fresh cloud container.
# Only runs in Claude Code cloud sessions; on a laptop, use install.sh once instead.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
SKILL="$ROOT/.claude/skills/motion-reel"

# Playwright: reuse the preinstalled global copy and its Chromium. Never download browsers.
if [ ! -e "$SKILL/node_modules/playwright" ] && [ -d /opt/node22/lib/node_modules/playwright ]; then
  ln -sfn /opt/node22/lib/node_modules "$SKILL/node_modules"
fi

# Python audio libraries for music, beat grid, mix and review.
if ! python3 -c "import numpy, scipy, soundfile, librosa, PIL" 2>/dev/null; then
  python3 -m pip install -q -r "$ROOT/requirements.txt" >/dev/null 2>&1 \
    || python3 -m pip install -q --break-system-packages -r "$ROOT/requirements.txt" >/dev/null 2>&1 \
    || echo "motion-reel setup: pip install failed; run: python3 -m pip install -r requirements.txt"
fi
exit 0
