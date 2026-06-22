#!/usr/bin/env bash
# 繞過 Cursor 內建終端機的 askpass（會導致 401），改用系統原生密碼提示
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Cursor / VS Code 會注入 askpass，常導致 Missing or invalid credentials 401
unset GIT_ASKPASS SSH_ASKPASS VSCODE_GIT_ASKPASS_NODE VSCODE_GIT_ASKPASS_EXTRA_ARGS VSCODE_GIT_ASKPASS_MAIN 2>/dev/null || true

BRANCH="${1:-$(git branch --show-current)}"

echo ""
echo "📤 推送至 origin/${BRANCH}（已停用 Cursor askpass）"
echo ""

if [[ -n "${CURSOR_TRACE_ID:-}" ]] || [[ "${TERM_PROGRAM:-}" == "vscode" ]]; then
  echo "⚠️  若在 Cursor 內仍無法跳出帳密視窗，請改用 macOS「終端機」App 執行:"
  echo "     cd \"$REPO_ROOT\" && npm run push"
  echo ""
fi

exec git push -u origin "$BRANCH"
