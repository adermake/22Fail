#!/usr/bin/env bash
# Test battery for guard.sh. Run with: bash .claude/guard-test.sh
# Validates BOTH the verdict and that the verdict is parseable JSON — an unescaped
# Windows path once produced invalid JSON, which Claude Code silently treated as "allow".

cd "$(dirname "$0")/.." || exit 1
export CLAUDE_PROJECT_DIR="c:/Users/adermake/Documents/22FailApp"
G=".claude/guard.sh"
pass=0; fail=0

pf() { jq -nc --arg t "$1" --arg p "$2" '{tool_name:$t,tool_input:{file_path:$p}}'; }
pc() { jq -nc --arg c "$1" '{tool_name:"Bash",tool_input:{command:$c}}'; }

chk() { # label, payload, expect
  local out got
  out=$(printf '%s' "$2" | bash "$G" 2>&1)
  if [ -n "$out" ]; then
    if ! printf '%s' "$out" | jq -e . >/dev/null 2>&1; then
      echo "  FAIL $1 -> INVALID JSON verdict :: $out"; fail=$((fail+1)); return
    fi
    got=$(printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision')
    [ "$got" = "deny" ] && got=DENY || got=ALLOW
  else
    got=ALLOW
  fi
  if [ "$got" = "$3" ]; then echo "  ok   $1 -> $got"; pass=$((pass+1))
  else echo "  FAIL $1 -> got $got want $3 :: $out"; fail=$((fail+1)); fi
}

G_="g""it"   # split so this file's own text can't trip the guard if ever scanned

echo "== should ALLOW =="
chk "project file"      "$(pf Write 'C:\Users\adermake\Documents\22FailApp\frontend\src\x.ts')" ALLOW
chk "relative path"     "$(pf Read 'frontend/src/x.ts')" ALLOW
chk "memory dir"        "$(pf Write 'C:\Users\adermake\.claude\projects\foo\memory\a.md')" ALLOW
chk "scratchpad"        "$(pf Write 'C:\Users\adermake\AppData\Local\Temp\claude\x\y.txt')" ALLOW
chk "build in project"  "$(pc 'cd c:/Users/adermake/Documents/22FailApp/frontend && npx ng build')" ALLOW
chk "npm run build"     "$(pc 'npm run build')" ALLOW
chk "vcs status"        "$(pc "$G_ status")" ALLOW
chk "vcs log and diff"  "$(pc "$G_ log --oneline -5 && $G_ diff HEAD")" ALLOW
chk "vcs branch list"   "$(pc "$G_ branch -a")" ALLOW
chk "vcs stash list"    "$(pc "$G_ stash list")" ALLOW
# Regression: a vcs verb appearing inside an echoed string is not an invocation.
chk "verb inside echo"  "$(pc "$G_ status --short | head -5; echo \"--- $G_ status: OK ---\"")" ALLOW
chk "verb in a message" "$(pc "echo \"remember to $G_ push later\"")" ALLOW
# .gitignore / .gitattributes are ordinary project files, not repository internals.
chk "edit gitignore"    "$(pf Edit 'C:\Users\adermake\Documents\22FailApp\.gitignore')" ALLOW
chk "cat gitignore"     "$(pc 'cat .gitignore')" ALLOW

echo "== should DENY =="
chk "desktop list"      "$(pc "powershell -Command \"Get-ChildItem 'C:\\Users\\adermake\\Desktop'\"")" DENY
chk "desktop delete"    "$(pc 'powershell -Command "Remove-Item C:\Users\adermake\Desktop\ping sounds -Recurse -Force"')" DENY
chk "ssh key read"      "$(pf Read 'C:\Users\adermake\.ssh\id_rsa')" DENY
chk "write to desktop"  "$(pf Write 'C:\Users\adermake\Desktop\x.txt')" DENY
chk "path traversal"    "$(pf Read '../../../Windows/system.ini')" DENY
chk "cat ssh via bash"  "$(pc 'cat ~/.ssh/id_rsa')" DENY
chk "node rm outside"   "$(pc 'node -e "x" C:\Users\adermake\Desktop')" DENY
chk "vcs push"          "$(pc "$G_ push origin main")" DENY
chk "vcs commit"        "$(pc "$G_ commit -m x")" DENY
chk "vcs add"           "$(pc "$G_ add .")" DENY
chk "vcs reset hard"    "$(pc "$G_ reset --hard HEAD~1")" DENY
chk "vcs branch delete" "$(pc "$G_ branch -D feature")" DENY
chk "vcs rebase"        "$(pc "$G_ rebase -i main")" DENY
chk "vcs clean"         "$(pc "$G_ clean -fd")" DENY
chk "vcs stash drop"    "$(pc "$G_ stash drop")" DENY
chk "chained force"     "$(pc "npm test && $G_ push -f")" DENY
chk "malformed payload" '{"tool_name":"Read","tool_input":{"file_path":"C:\Users"}}' DENY
# Repository internals: the obvious way to defeat read-only version control.
chk "edit .git/config"  "$(pf Write 'C:\Users\adermake\Documents\22FailApp\.git\config')" DENY
chk "rel .git write"    "$(pf Write '.git/HEAD')" DENY
chk "rm -rf .git"       "$(pc 'rm -rf .git')" DENY
chk "redirect to .git"  "$(pc 'echo ref > .git/HEAD')" DENY

echo "== message quality =="
out=$(pc 'rm -rf .git' | bash "$G" | jq -r '.hookSpecificOutput.permissionDecisionReason')
for phrase in "automated guard" "deliberately configured" "Do NOT attempt to circumvent" "ask the user"; do
  case "$out" in
    *"$phrase"*) echo "  ok   message contains: $phrase"; pass=$((pass+1)) ;;
    *) echo "  FAIL message missing: $phrase"; fail=$((fail+1)) ;;
  esac
done

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
