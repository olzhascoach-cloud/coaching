#!/usr/bin/env bash
# Tests for deploy-receive.sh.
# Run: ./infra/scripts/test-deploy-receive.sh
# Exits non-zero if any test fails.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUT="$SCRIPT_DIR/deploy-receive.sh"

PASS=0
FAIL=0

# Clean up any sandbox on interrupt or exit
trap '[[ -n "${SANDBOX:-}" ]] && rm -rf "$SANDBOX"' EXIT INT TERM

assert_eq() {
    # $1=actual $2=expected $3=message
    if [[ "$1" == "$2" ]]; then
        PASS=$((PASS+1))
        echo "  PASS: $3"
    else
        FAIL=$((FAIL+1))
        echo "  FAIL: $3 (expected '$2', got '$1')"
    fi
}

assert_absent() {
    # $1=path $2=message
    if [[ ! -d "$1" ]]; then
        PASS=$((PASS+1))
        echo "  PASS: $2"
    else
        FAIL=$((FAIL+1))
        echo "  FAIL: $2 (path still exists: $1)"
    fi
}

assert_present() {
    # $1=path $2=message
    if [[ -d "$1" ]]; then
        PASS=$((PASS+1))
        echo "  PASS: $2"
    else
        FAIL=$((FAIL+1))
        echo "  FAIL: $2 (path missing: $1)"
    fi
}

setup_sandbox() {
    SANDBOX="$(mktemp -d)"
    mkdir -p "$SANDBOX/olzhas-coach.kz/prod/releases"
    mkdir -p "$SANDBOX/olzhas-coach.kz/preview/releases"
    mkdir -p "$SANDBOX/parusa.kz/prod/releases"
    mkdir -p "$SANDBOX/parusa.kz/preview/releases"
    export DEPLOY_BASE_DIR="$SANDBOX"
}

teardown_sandbox() {
    rm -rf "$SANDBOX"
    unset DEPLOY_BASE_DIR
}

# ---------- TEST: invalid domain rejected ----------
echo "TEST: invalid domain rejected"
setup_sandbox
"$SUT" evil.com prod 2026-04-07_120000 >/dev/null 2>&1
assert_eq "$?" "2" "exit code is 2 for unknown domain"
teardown_sandbox

# ---------- TEST: invalid env rejected ----------
echo "TEST: invalid env rejected"
setup_sandbox
"$SUT" olzhas-coach.kz staging 2026-04-07_120000 >/dev/null 2>&1
assert_eq "$?" "2" "exit code is 2 for unknown env"
teardown_sandbox

# ---------- TEST: timestamp with path traversal rejected ----------
echo "TEST: path traversal in timestamp rejected"
setup_sandbox
"$SUT" olzhas-coach.kz prod "../../etc" >/dev/null 2>&1
assert_eq "$?" "2" "exit code is 2 for path traversal"
teardown_sandbox

# ---------- TEST: timestamp with wrong format rejected ----------
echo "TEST: malformed timestamp rejected"
setup_sandbox
"$SUT" olzhas-coach.kz prod "2026-4-7_12000" >/dev/null 2>&1
assert_eq "$?" "2" "exit code is 2 for malformed timestamp"
teardown_sandbox

# ---------- TEST: timestamp with shell metacharacters rejected ----------
echo "TEST: timestamp with metacharacters rejected"
setup_sandbox
"$SUT" olzhas-coach.kz prod "2026-04-07_120000;rm" >/dev/null 2>&1
assert_eq "$?" "2" "exit code is 2 for shell metacharacters"
teardown_sandbox

# ---------- TEST: missing release directory rejected ----------
echo "TEST: missing release directory rejected"
setup_sandbox
"$SUT" olzhas-coach.kz prod 2026-04-07_120000 >/dev/null 2>&1
assert_eq "$?" "3" "exit code is 3 when release dir does not exist"
teardown_sandbox

# ---------- TEST: valid input swaps current symlink ----------
echo "TEST: valid input swaps current symlink"
setup_sandbox
mkdir -p "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-07_120000"
echo "release-A" > "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-07_120000/index.html"
"$SUT" olzhas-coach.kz prod 2026-04-07_120000 >/dev/null 2>&1
ACTUAL_EXIT="$?"
assert_eq "$ACTUAL_EXIT" "0" "exit code is 0 for valid deploy"
ACTUAL_CONTENT="$(cat "$SANDBOX/olzhas-coach.kz/prod/current/index.html" 2>/dev/null || echo MISSING)"
assert_eq "$ACTUAL_CONTENT" "release-A" "current/index.html serves the new release"

# Replace with a second release and re-run
mkdir -p "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-07_130000"
echo "release-B" > "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-07_130000/index.html"
"$SUT" olzhas-coach.kz prod 2026-04-07_130000 >/dev/null 2>&1
ACTUAL_CONTENT="$(cat "$SANDBOX/olzhas-coach.kz/prod/current/index.html" 2>/dev/null || echo MISSING)"
assert_eq "$ACTUAL_CONTENT" "release-B" "current/index.html now serves the second release"
teardown_sandbox

# ---------- TEST: parusa.kz is also accepted by the allowlist ----------
echo "TEST: parusa.kz domain accepted"
setup_sandbox
mkdir -p "$SANDBOX/parusa.kz/preview/releases/2026-04-07_120000"
echo "parusa-release" > "$SANDBOX/parusa.kz/preview/releases/2026-04-07_120000/index.html"
"$SUT" parusa.kz preview 2026-04-07_120000 >/dev/null 2>&1
ACTUAL_EXIT="$?"
assert_eq "$ACTUAL_EXIT" "0" "exit code is 0 for parusa.kz preview deploy"
ACTUAL_CONTENT="$(cat "$SANDBOX/parusa.kz/preview/current/index.html" 2>/dev/null || echo MISSING)"
assert_eq "$ACTUAL_CONTENT" "parusa-release" "parusa.kz current/index.html serves the new release"
teardown_sandbox

# ---------- TEST: pruning keeps newest 5 releases ----------
echo "TEST: pruning keeps newest 5 releases"
setup_sandbox
# Create 7 releases with sortable timestamps
for i in 01 02 03 04 05 06 07; do
    TS="2026-04-${i}_120000"
    mkdir -p "$SANDBOX/olzhas-coach.kz/prod/releases/$TS"
    echo "release-$i" > "$SANDBOX/olzhas-coach.kz/prod/releases/$TS/index.html"
done
# Deploy the newest one — that should trigger pruning of the 2 oldest
"$SUT" olzhas-coach.kz prod 2026-04-07_120000 >/dev/null 2>&1
COUNT="$(find "$SANDBOX/olzhas-coach.kz/prod/releases" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
assert_eq "$COUNT" "5" "exactly 5 release directories remain"
# The two oldest (01, 02) should be gone
assert_absent "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-01_120000" "release 01 was pruned"
assert_absent "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-02_120000" "release 02 was pruned"
# The newest (07, the one we just deployed) should still exist
assert_present "$SANDBOX/olzhas-coach.kz/prod/releases/2026-04-07_120000" "newest release 07 still exists"
teardown_sandbox

echo ""
echo "Results: $PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]] || exit 1
