#!/usr/bin/env bash

set -euo pipefail

context_version="2026-07-15.2"
allow_untracked=false

usage() {
  cat <<'EOF'
Usage: scripts/verify-ai-context.sh [--allow-untracked]

Validate the website's clone-portable AI context. Strict mode also requires
every context file to be tracked by Git. Use --allow-untracked only while
creating new context files before they are staged or committed.
EOF
}

for argument in "$@"; do
  case "$argument" in
    --allow-untracked)
      allow_untracked=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown argument: %s\n' "$argument" >&2
      usage >&2
      exit 2
      ;;
  esac
done

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$repo_root"

failures=0

pass() {
  printf 'ok - %s\n' "$1"
}

fail() {
  printf 'not ok - %s\n' "$1" >&2
  failures=$((failures + 1))
}

assert_contains() {
  local file="$1"
  local expected="$2"
  local description="$3"

  if grep -Fq -- "$expected" "$file"; then
    pass "$description"
  else
    fail "$description ($file is missing: $expected)"
  fi
}

required_files=(
  ".gitattributes"
  ".nvmrc"
  ".agents/skills/verify-gamblock-change/SKILL.md"
  ".agents/skills/verify-gamblock-change/agents/openai.yaml"
  ".cursor/rules/gamblock-ai.mdc"
  ".cursorrules"
  ".github/copilot-instructions.md"
  ".github/workflows/ci.yml"
  "AGENTS.md"
  "CLAUDE.md"
  "COPILOT.md"
  "GEMINI.md"
  "README.md"
  "docs/ai/README.md"
  "docs/ai/manifest.yaml"
  "package-lock.json"
  "package.json"
  "scripts/verify-ai-context.sh"
)

required_paths=(
  "app/[locale]/(auth)"
  "app/[locale]/(dashboard)"
  "app/[locale]/(landing)"
  "components/common/PageTransition.tsx"
  "components/dashboard"
  "components/landing"
  "hooks"
  "lib/api-client.ts"
  "middleware.ts"
  "routes.ts"
)

for file in "${required_files[@]}"; do
  if [[ -s "$file" ]]; then
    pass "required context file exists: $file"
  else
    fail "required context file is missing or empty: $file"
  fi
done

for path in "${required_paths[@]}"; do
  if [[ -e "$path" ]]; then
    pass "documented source path exists: $path"
  else
    fail "documented source path is missing: $path"
  fi

  assert_contains \
    "docs/ai/manifest.yaml" \
    "- \"$path\"" \
    "manifest inventories source path: $path"
done

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if [[ "$allow_untracked" == true ]]; then
    pass "Git tracking check skipped by --allow-untracked"
  else
    for file in "${required_files[@]}"; do
      if git ls-files --error-unmatch -- "$file" >/dev/null 2>&1; then
        pass "required context file is tracked: $file"
      else
        fail "required context file is not tracked: $file"
      fi
    done
  fi
else
  pass "Git metadata unavailable; tracking check not applicable"
fi

for file in AGENTS.md docs/ai/README.md docs/ai/manifest.yaml; do
  assert_contains "$file" "$context_version" "context version matches in $file"
done

begin_count="$(grep -Fc '<!-- BEGIN:nextjs-agent-rules -->' AGENTS.md || true)"
end_count="$(grep -Fc '<!-- END:nextjs-agent-rules -->' AGENTS.md || true)"
first_line="$(sed -n '1p' AGENTS.md)"
if [[ "$begin_count" == "1" && "$end_count" == "1" && "$first_line" == '<!-- BEGIN:nextjs-agent-rules -->' ]]; then
  pass "generated Next.js agent-rules block is preserved"
else
  fail "generated Next.js agent-rules block must appear once at the top of AGENTS.md"
fi

assert_contains "CLAUDE.md" "@./AGENTS.md" "Claude imports canonical instructions"
assert_contains "CLAUDE.md" "@./docs/ai/README.md" "Claude imports the AI context guide"
assert_contains "GEMINI.md" "@./AGENTS.md" "Gemini imports canonical instructions"
assert_contains "GEMINI.md" "@./docs/ai/README.md" "Gemini imports the AI context guide"
assert_contains ".github/copilot-instructions.md" "AGENTS.md" "Copilot points to canonical instructions"
assert_contains ".cursor/rules/gamblock-ai.mdc" "alwaysApply: true" "Cursor rule is always applied"
assert_contains ".cursor/rules/gamblock-ai.mdc" "@AGENTS.md" "Cursor imports canonical instructions"
assert_contains ".cursorrules" ".cursor/rules/gamblock-ai.mdc" "legacy Cursor file points to modern rules"
assert_contains "COPILOT.md" ".github/copilot-instructions.md" "legacy Copilot file points to standard instructions"

stale_paths=(
  "app/(app)/"
  "components/marketing/"
  "components/feedback/PageTransition.tsx"
)

for stale_path in "${stale_paths[@]}"; do
  if grep -Fn -- "$stale_path" AGENTS.md README.md docs/ai/README.md >/dev/null; then
    fail "canonical documentation still contains stale path: $stale_path"
  else
    pass "canonical documentation excludes stale path: $stale_path"
  fi
done

assert_contains ".github/workflows/ci.yml" "npm run verify:ai-context" "CI runs the context verifier"
assert_contains ".github/workflows/ci.yml" "npm run typecheck" "CI uses the package typecheck script"
assert_contains ".github/workflows/ci.yml" "npm run e2e" "CI uses the package e2e script"

if node <<'NODE'
const pkg = require('./package.json');

const expectedScripts = {
  e2e: 'playwright test',
  typecheck: 'tsc --noEmit',
  'verify:ai-context': 'bash scripts/verify-ai-context.sh',
  verify: 'npm run verify:ai-context && npm run lint',
};

const errors = [];
if (pkg.packageManager !== 'npm@10.9.2') {
  errors.push(`packageManager must be npm@10.9.2, received ${pkg.packageManager}`);
}
for (const [name, command] of Object.entries(expectedScripts)) {
  if (pkg.scripts?.[name] !== command) {
    errors.push(`scripts.${name} must be ${JSON.stringify(command)}`);
  }
}
if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
NODE
then
  pass "package.json declares canonical npm and verification scripts"
else
  fail "package.json does not match the AI-context package contract"
fi

if grep -Fq -- "../" docs/ai/manifest.yaml; then
  fail "manifest contains a parent-directory dependency and is not standalone"
else
  pass "manifest has no parent-directory dependency"
fi

if ((failures > 0)); then
  printf '\nAI context verification failed with %d error(s).\n' "$failures" >&2
  exit 1
fi

printf '\nAI context verification passed (context_version=%s).\n' "$context_version"
