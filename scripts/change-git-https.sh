#!/usr/bin/env bash
# 將本專案 Git 改為 HTTPS + GitHub Personal Access Token (PAT) 驗證
# 用法: npm run change  或  ./change  或在 Cursor 輸入 /change

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

GITHUB_USER="${GITHUB_USER:-bob1127}"
GITHUB_REPO="${GITHUB_REPO:-UFLOW}"
REMOTE_URL="https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

echo ""
echo "🔐 切換本專案 Git → HTTPS + PAT 驗證碼"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 確保 remote 為 HTTPS
CURRENT_URL="$(git remote get-url origin 2>/dev/null || echo "")"
git remote set-url origin "$REMOTE_URL"
echo "✓ origin: $CURRENT_URL"
echo "       → $REMOTE_URL"
echo ""

# 2. 本專案僅用 Keychain 存 PAT（必須先清空，否則全域 gh 仍會注入 kejiweibai17-source）
git config --local --unset-all credential.https://github.com.helper 2>/dev/null || true
git config --local credential.https://github.com.helper ""
git config --local --add credential.https://github.com.helper osxkeychain
echo "✓ 本專案 credential → 僅 osxkeychain（已停用全域 gh 憑證）"
echo ""

# 3. 清除已快取的 GitHub HTTPS 憑證
erase_cred() {
  local user="${1:-}"
  if [[ -n "$user" ]]; then
    printf "protocol=https\nhost=github.com\nusername=%s\n\n" "$user" \
      | git credential-osxkeychain erase 2>/dev/null || true
  else
    printf "protocol=https\nhost=github.com\n\n" \
      | git credential-osxkeychain erase 2>/dev/null || true
  fi
}

erase_cred ""
erase_cred "kejiweibai17-source"
erase_cred "bob1127"
erase_cred "$GITHUB_USER"
echo "✓ 已清除 Keychain 中舊的 github.com 憑證"
echo ""

# 4. 顯示 gh CLI 狀態（僅提示，不自動登出）
if command -v gh >/dev/null 2>&1; then
  echo "ℹ️  全域 gh CLI 狀態（本專案 push 已不受 gh 帳號影響）："
  gh auth status 2>&1 | sed 's/^/   /' || true
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "下一步 — 使用 PAT 推送："
echo ""
echo "  1. 開啟 GitHub → Settings → Developer settings"
echo "     → Personal access tokens → Tokens (classic)"
echo "  2. Generate new token，勾選「repo」權限"
echo "  3. 複製產生的驗證碼（ghp_... 或 github_pat_...）"
echo "  4. 執行（請用此指令，勿在 Cursor 直接 git push）:"
echo ""
echo "       npm run push"
echo ""
echo "     出現提示時輸入:"
echo "       Username → $GITHUB_USER"
echo "       Password → <bob1127 的 PAT，不是登入密碼>"
echo ""
echo "  ⚠️  Cursor 內建終端機的 askpass 常導致 401，"
echo "     若 npm run push 仍失敗，請開 macOS「終端機」App 再執行一次。"
echo ""
echo "  Keychain 會記住憑證，之後 push 不必再輸入。"
echo ""
