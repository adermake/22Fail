#!/usr/bin/env bash
# PreToolUse guard. Enforces two rules that permission settings cannot express:
#
#   1. Nothing outside the project folder. File tools are checked by their target path;
#      Bash/PowerShell commands are scanned for absolute paths in the command text.
#      Allowed roots: the project, Claude's memory store, Claude's temp scratchpad.
#
#   2. Git is READ-ONLY. Only inspection subcommands (status/diff/log/show/...) are allowed;
#      every mutating subcommand is denied outright.
#
# Verdict protocol: print a permissionDecision=deny JSON object to block the call, or exit
# silently to let it through. A deny here is a hard block (cannot be approved interactively).
#
# Limits, stated plainly: Bash checking is TEXT inspection, so a path assembled at runtime
# (e.g. from $env:USERPROFILE) is not caught. This is a guardrail against mistakes, not a
# sandbox against a determined process.

set -u

# Normalise for comparison: backslashes -> slashes, lowercase, MSYS "/c/x" -> "c:/x",
# strip trailing slash.
canon() {
  local s
  s=$(printf '%s' "$1" | tr '\\' '/' | tr '[:upper:]' '[:lower:]')
  case "$s" in
    /[a-z]/*) s="${s:1:1}:${s:2}" ;;
    /[a-z])   s="${s:1:1}:" ;;
  esac
  printf '%s' "${s%/}"
}

# Emit the verdict via jq so the reason is correctly JSON-escaped. Building this string by
# hand is a trap: a Windows path like C:\Users\... produces an invalid \U escape, the verdict
# fails to parse, and the call is silently ALLOWED.
#
# The wording matters as much as the block itself: this message is what a model reads, and it
# is written to redirect it toward asking the user rather than probing for a way around.
deny() {
  local msg
  msg="BLOCKED by the user's automated guard: $1

This is not a transient error, a bug, or something you did wrong. The user deliberately configured this restriction and has asked that models uphold it rather than work around it.

Do NOT attempt to circumvent this guard. That includes: retrying with a different path spelling, building the path at runtime from an environment variable, switching to another tool or shell, encoding the command, or editing .git directly.

If you genuinely need this action to finish the task, STOP and ask the user in plain language: say what you need, and why. They will run it for you if it is warranted. Asking is the expected path here - it is not a failure."

  jq -nc --arg r "$msg" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}

payload=$(cat)

# Fail CLOSED: if the payload cannot be parsed we must not wave the call through,
# otherwise a malformed payload becomes a bypass.
tool=$(printf '%s' "$payload" | jq -r '.tool_name // empty' 2>/dev/null) \
  || deny "guard could not parse the tool call (failing closed)"

PROJECT=$(canon "${CLAUDE_PROJECT_DIR:-$PWD}")
MEMORY=$(canon "${HOME:-${USERPROFILE:-}}/.claude/projects")
SCRATCH=$(canon "${TEMP:-${TMP:-/tmp}}/claude")

in_scope() {
  local p="$1" root
  for root in "$PROJECT" "$MEMORY" "$SCRATCH"; do
    [ -z "$root" ] && continue
    case "$p" in "$root"|"$root"/*) return 0 ;; esac
  done
  return 1
}

# Git internals live INSIDE the project, so the path boundary alone would not protect them —
# editing .git directly is the obvious way to defeat read-only git. Matches ".git" only as a
# whole path segment, so .gitignore / .gitattributes remain freely editable.
GITMSG="Version control is read-only in this project: the user performs all commits, pushes, branch changes and history operations themselves so they stay in control of the repository."
GIT_INTERNAL_REASON="that path is inside the repository's .git directory. $GITMSG Editing repository internals by hand is not an acceptable substitute."
is_git_internal() {
  case "$1" in
    */.git|*/.git/*|.git|.git/*) return 0 ;;
  esac
  return 1
}

# ── File tools: check the target path ────────────────────────────────────────
case "$tool" in
  Read|Edit|Write|NotebookEdit|Glob|Grep)
    target=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .tool_input.notebook_path // .tool_input.path // empty' 2>/dev/null) \
      || deny "guard could not read the target path (failing closed)"
    [ -z "$target" ] && exit 0
    np=$(canon "$target")
    case "$np" in
      *..*) deny "the path '$target' uses traversal ('..'). The user requires plain, in-project paths." ;;
    esac
    # Relative paths resolve against the project cwd, so they are in scope by definition.
    case "$np" in
      /*|[a-z]:/*) ;;
      *) is_git_internal "$np" && deny "$GIT_INTERNAL_REASON"; exit 0 ;;
    esac
    is_git_internal "$np" && deny "$GIT_INTERNAL_REASON"
    in_scope "$np" \
      || deny "'$target' is outside the project folder. The user does not want you reading or writing anything outside this project."
    exit 0
    ;;
esac

# ── Shell: git read-only gate, then path scan ────────────────────────────────
case "$tool" in
  Bash|PowerShell) ;;
  *) exit 0 ;;
esac

cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null) \
  || deny "guard could not read the command (failing closed)"
[ -z "$cmd" ] && exit 0

# Flatten quotes/separators so tokens are easy to scan.
flat=$(printf '%s' "$cmd" | tr '"'\''`' '   ')

# --- git: allow inspection only -------------------------------------------------
# Find each `git ...` invocation and vet its subcommand.
while IFS= read -r inv; do
  [ -z "$inv" ] && continue
  # Drop the leading `git` and any global flags (-c foo=bar, -C dir, --no-pager, ...).
  rest=$(printf '%s' "$inv" | sed -E 's/^[[:space:]]*git[[:space:]]+//')
  while :; do
    case "$rest" in
      -c[[:space:]]*|-C[[:space:]]*) rest=$(printf '%s' "$rest" | sed -E 's/^-[cC][[:space:]]+[^[:space:]]+[[:space:]]*//') ;;
      --no-pager*|--paginate*)       rest=$(printf '%s' "$rest" | sed -E 's/^--[a-z-]+[[:space:]]*//') ;;
      *) break ;;
    esac
  done
  sub=$(printf '%s' "$rest" | awk '{print $1}')
  args=$(printf '%s' "$rest" | sed -E 's/^[^[:space:]]+[[:space:]]*//')

  case "$sub" in
    ""|--version|--help) ;;
    status|diff|log|show|blame|describe|shortlog|rev-parse|rev-list|ls-files|ls-tree|cat-file|name-rev|symbolic-ref|whatchanged|grep|difftool|merge-base|check-ignore|verify-commit) ;;
    branch)
      # Listing only: reject deletes/renames/creates.
      printf '%s' "$args" | grep -qiE '(^|[[:space:]])(-d|-D|-m|-M|-c|-C|--delete|--move|--copy|--set-upstream|--edit-description|-f|--force)([[:space:]]|$)' \
        && deny "'branch' is being used here to modify branches. $GITMSG"
      printf '%s' "$args" | grep -qE '(^|[[:space:]])[^-][^[:space:]]*' \
        && deny "'branch' is being used here to modify branches. $GITMSG"
      ;;
    tag)
      printf '%s' "$args" | grep -qE '^[[:space:]]*(-l|--list|-n[0-9]*)?[[:space:]]*$' \
        || deny "'tag' is being used here to create or delete tags. $GITMSG"
      ;;
    stash)
      printf '%s' "$args" | grep -qE '^[[:space:]]*(list|show)([[:space:]]|$)' \
        || deny "'stash' is being used here to modify the stash. $GITMSG"
      ;;
    remote)
      printf '%s' "$args" | grep -qE '^[[:space:]]*(-v|--verbose|show)?[[:space:]]*[^[:space:]]*[[:space:]]*$' \
        || deny "'remote' is being used here to modify remotes. $GITMSG"
      printf '%s' "$args" | grep -qiE '(^|[[:space:]])(add|remove|rm|rename|set-url|prune)([[:space:]]|$)' \
        && deny "'remote' is being used here to modify remotes. $GITMSG"
      ;;
    config)
      printf '%s' "$args" | grep -qE '(^|[[:space:]])(--get|--get-all|--list|-l)([[:space:]]|$)' \
        || deny "'config' is being used here to write configuration. $GITMSG"
      ;;
    *) deny "'$sub' modifies the repository. $GITMSG" ;;
  esac
done <<EOF
$(printf '%s' "$flat" | grep -oE '(^|[&|;(])[[:space:]]*git[[:space:]]+[^&|;)]*' | sed -E 's/^[&|;([:space:]]+//')
EOF

# --- repository internals: no direct .git manipulation --------------------------
# Matches ".git" only as a whole path segment, so .gitignore / .gitattributes are unaffected.
if printf '%s' "$flat" | grep -qE '(^|[[:space:]/\\=])\.git([/\\]|[[:space:]]|$)'; then
  deny "$GIT_INTERNAL_REASON"
fi

# --- paths: nothing outside the allowed roots -----------------------------------
while IFS= read -r cand; do
  [ -z "$cand" ] && continue
  case "$cand" in
    ~*) cand="${HOME:-${USERPROFILE:-}}${cand#\~}" ;;
  esac
  cp=$(canon "$cand")
  # Ignore bare drive roots and MSYS tool paths like /usr/bin, /dev/null, /tmp.
  case "$cp" in
    /usr/*|/bin/*|/dev/*|/tmp|/tmp/*|/etc/*|/proc/*) continue ;;
  esac
  case "$cp" in
    /*|[a-z]:/*) ;;
    *) continue ;;
  esac
  is_git_internal "$cp" && deny "$GIT_INTERNAL_REASON"
  in_scope "$cp" \
    || deny "this command references '$cand', which is outside the project folder. The user does not want you reading or writing anything outside this project."
done <<EOF
$(printf '%s' "$flat" | grep -oE '([A-Za-z]:[\\/][^[:space:],;|&)]*|~/[^[:space:],;|&)]*)' || true)
EOF

exit 0
