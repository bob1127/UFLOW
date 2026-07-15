#!/usr/bin/env bash
# 將本專案 Git 改為 HTTPS + 瀏覽器裝置驗證碼（gh auth login -w）
# 用法: npm run change  或  ./change  或在 Cursor 輸入 /change

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

GITHUB_USER="${GITHUB_USER:-bob1127}"
GITHUB_REPO="${GITHUB_REPO:-UFLOW}"
REMOTE_URL="https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

echo ""
echo "🔐 切換本專案 Git → HTTPS + 瀏覽器驗證碼"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! command -v gh >/dev/null 2>&1; then
  echo "❌ 未安裝 GitHub CLI。請先執行:"
  echo "     brew install gh"
  exit 1
fi

# 1. 確保 remote 為 HTTPS
CURRENT_URL="$(git remote get-url origin 2>/dev/null || echo "")"
git remote set-url origin "$REMOTE_URL"
echo "✓ origin: ${CURRENT_URL:-<未設定>}"
echo "       → $REMOTE_URL"
echo ""

# 2. 清除 Keychain 中舊的 github.com 憑證（避免與 gh 衝突）
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

# 3. 移除錯誤的 gh 帳號（僅登出 kejiweibai17-source，不動其他全域設定）
if gh auth status -h github.com -u kejiweibai17-source &>/dev/null; then
  gh auth logout -h github.com -u kejiweibai17-source 2>/dev/null || true
  echo "✓ 已登出錯誤帳號 kejiweibai17-source"
  echo ""
fi

# 4. 檢查是否已以正確帳號登入且 token 有效
needs_login=true
LOGIN_USER=""
if LOGIN_USER="$(gh api user -q .login 2>/dev/null || true)"; then
  :
fi
if [[ -n "$LOGIN_USER" && "$LOGIN_USER" == "$GITHUB_USER" ]]; then
  needs_login=false
  echo "✓ GitHub CLI 已登入: ${LOGIN_USER} (token 有效)"
  echo ""
elif [[ -n "$LOGIN_USER" ]]; then
  echo "⚠️  目前 gh 登入為「${LOGIN_USER}」，需要改為「${GITHUB_USER}」"
  gh auth logout -h github.com -u "$LOGIN_USER" 2>/dev/null || true
  LOGIN_USER=""
  echo ""
fi

# 5. 瀏覽器裝置驗證碼登入
if [[ "$needs_login" == true ]]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "接下來會啟動「瀏覽器 + 驗證碼」登入流程："
  echo ""
  echo "  1. 終端機會顯示一組驗證碼（例如 ABCD-1234）"
  echo "  2. 瀏覽器會開啟 https://github.com/login/device"
  echo "  3. 輸入驗證碼，並用 $GITHUB_USER 帳號授權"
  echo ""
  echo "⚠️  請在 macOS「終端機」App 執行此步驟（Cursor 內建終端機可能無法互動）"
  echo ""

  if [[ -t 0 ]]; then
    read -r -p "按 Enter 開始瀏覽器登入… " _
  else
    echo "（非互動模式，直接開始瀏覽器登入）"
    echo ""
  fi

  unset GIT_ASKPASS SSH_ASKPASS VSCODE_GIT_ASKPASS_NODE VSCODE_GIT_ASKPASS_EXTRA_ARGS VSCODE_GIT_ASKPASS_MAIN 2>/dev/null || true

  gh auth login -h github.com -p https -w -s repo

  LOGIN_USER="$(gh api user -q .login 2>/dev/null || true)"
  if [[ -z "$LOGIN_USER" || "$LOGIN_USER" != "$GITHUB_USER" ]]; then
    echo ""
    echo "❌ 登入失敗或帳號不符（目前: ${LOGIN_USER:-未登入}，需要: ${GITHUB_USER}）。"
    echo "   請重新執行 npm run change 並選擇正確帳號。"
    exit 1
  fi
  echo ""
  echo "✓ 瀏覽器登入成功: ${LOGIN_USER}"
  echo ""
fi

# 6. 本專案讓 git push 透過 gh 取得憑證（不需手動貼 PAT）
git config --local --unset-all credential.https://github.com.helper 2>/dev/null || true
git config --local credential.https://github.com.helper '!gh auth git-credential'
echo "✓ 本專案 credential → gh auth git-credential"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "完成！現在可以推送："
echo ""
echo "       npm run push"
echo ""
echo "  建議在 macOS「終端機」App 執行。"
echo "  憑證由 gh 管理，之後 push 不必再輸入 PAT。"
echo ""
