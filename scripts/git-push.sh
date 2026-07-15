#!/usr/bin/env bash
# 繞過 Cursor 內建終端機的 askpass（會導致 401），透過 gh 瀏覽器驗證後推送
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

GITHUB_USER="${GITHUB_USER:-bob1127}"

# Cursor / VS Code 會注入 askpass，常導致 Missing or invalid credentials 401
unset GIT_ASKPASS SSH_ASKPASS VSCODE_GIT_ASKPASS_NODE VSCODE_GIT_ASKPASS_EXTRA_ARGS VSCODE_GIT_ASKPASS_MAIN 2>/dev/null || true

BRANCH="${1:-$(git branch --show-current)}"

echo ""
echo "📤 推送至 origin/${BRANCH}"
echo ""

if [[ -n "${CURSOR_TRACE_ID:-}" ]] || [[ "${TERM_PROGRAM:-}" == "vscode" ]]; then
  echo "⚠️  若在 Cursor 內失敗，請改用 macOS「終端機」App 執行:"
  echo "     cd \"$REPO_ROOT\" && npm run push"
  echo ""
fi

# 確認 gh 已登入正確帳號
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ 未安裝 gh。請先執行: brew install gh && npm run change"
  exit 1
fi

if ! LOGIN_USER="$(gh api user -q .login 2>/dev/null || true)"; then
  LOGIN_USER=""
fi

if [[ -z "$LOGIN_USER" ]]; then
  echo "❌ GitHub 尚未登入或 token 失效。"
  echo "   請先執行: npm run change"
  echo "   （會開啟瀏覽器，輸入驗證碼完成登入）"
  exit 1
fi

if [[ "$LOGIN_USER" != "$GITHUB_USER" ]]; then
  echo "❌ 目前 gh 登入為「$LOGIN_USER」，需要「$GITHUB_USER」。"
  echo "   請執行: npm run change"
  exit 1
fi

# 確保本專案使用 gh 憑證
HELPER="$(git config --local --get-all credential.https://github.com.helper 2>/dev/null || true)"
if [[ "$HELPER" != *"gh auth git-credential"* ]]; then
  git config --local --unset-all credential.https://github.com.helper 2>/dev/null || true
  git config --local credential.https://github.com.helper '!gh auth git-credential'
fi

echo "✓ 使用 GitHub 帳號: $LOGIN_USER"
echo ""

exec git push -u origin "$BRANCH"
