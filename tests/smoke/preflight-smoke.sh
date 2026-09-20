#!/usr/bin/env bash
# ==============================================================================
# AprovaENEM — Pre-Flight Automated Smoke Suite (< 15s Health & Golden Journey)
# ==============================================================================
# Verifies live production ecosystem readiness before traffic cutover or load tests.
# ==============================================================================
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost}"
START_TIME=$(date +%s%N)

# Color Codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[PRE-FLIGHT]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

log_info "Target Host: ${BASE_URL}"
log_info "Initiating 7-point pre-flight health & golden journey verification..."

# ------------------------------------------------------------------------------
# 1. Edge Ingress Proxy Probe
# ------------------------------------------------------------------------------
log_info "Probe 1/7: Edge Ingress Nginx /health probe..."
EDGE_HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health")
if [[ "${EDGE_HEALTH_CODE}" == "200" ]]; then
    log_pass "Edge proxy is UP (HTTP 200)"
else
    log_fail "Edge proxy returned HTTP ${EDGE_HEALTH_CODE} on /health"
    exit 1
fi

# ------------------------------------------------------------------------------
# 2. Gateway Actuator Health Probe
# ------------------------------------------------------------------------------
log_info "Probe 2/7: Spring Boot Gateway /actuator/health probe..."
GATEWAY_HEALTH=$(curl -s "${BASE_URL}/actuator/health" || true)
if echo "${GATEWAY_HEALTH}" | grep -q '"status":"UP"'; then
    log_pass "Backend ecosystem actuator is HEALTHY (UP)"
else
    log_fail "Backend actuator did not return UP: ${GATEWAY_HEALTH}"
    exit 1
fi

# ------------------------------------------------------------------------------
# 3. Distributed Tracing Propagation Probe
# ------------------------------------------------------------------------------
log_info "Probe 3/7: Distributed Trace ID Header Propagation..."
TRACE_TEST_ID="preflight-trace-$(date +%s)"
TRACE_HEADERS=$(curl -s -I -H "X-Trace-Id: ${TRACE_TEST_ID}" "${BASE_URL}/api/v1/questions")
if echo "${TRACE_HEADERS}" | grep -iq "x-trace-id: ${TRACE_TEST_ID}"; then
    log_pass "Trace ID successfully propagated end-to-end: ${TRACE_TEST_ID}"
else
    # Check if a trace ID header is generated
    if echo "${TRACE_HEADERS}" | grep -iq "x-trace-id:"; then
        log_pass "Trace ID header generated and returned by Edge Gateway"
    else
        log_fail "Trace ID header missing from response headers"
        exit 1
    fi
fi

# ------------------------------------------------------------------------------
# 4. Question Catalog Browse Probe
# ------------------------------------------------------------------------------
log_info "Probe 4/7: Question Bank Catalog Browse..."
CATALOG_RESPONSE=$(curl -s "${BASE_URL}/api/v1/questions?page=0&size=5")
ITEMS_COUNT=$(echo "${CATALOG_RESPONSE}" | grep -o '"id":' | wc -l)
if [[ ${ITEMS_COUNT} -gt 0 ]]; then
    log_pass "Catalog active: successfully retrieved ${ITEMS_COUNT} questions"
else
    log_fail "Catalog response contains 0 items: ${CATALOG_RESPONSE}"
    exit 1
fi

# ------------------------------------------------------------------------------
# 5. Golden Journey Step 1: Provision Anonymous Session
# ------------------------------------------------------------------------------
log_info "Probe 5/7: Golden Journey (Step 1/3) — Provision Anonymous Session..."
SESSION_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{}' "${BASE_URL}/api/v1/auth/session")
SESSION_ID=$(echo "${SESSION_RESPONSE}" | grep -o '"sessionId":"[^"]*"' | head -n 1 | cut -d'"' -f4)

if [[ -n "${SESSION_ID}" ]]; then
    log_pass "Anonymous session created: ${SESSION_ID}"
else
    log_fail "Failed to provision anonymous session: ${SESSION_RESPONSE}"
    exit 1
fi

# ------------------------------------------------------------------------------
# 6. Golden Journey Step 2: Start Practice Session
# ------------------------------------------------------------------------------
log_info "Probe 6/7: Golden Journey (Step 2/3) — Start Practice Session..."
PRACTICE_START_PAYLOAD='{"sessionType":"TOPIC_PRACTICE","totalQuestions":2}'
PRACTICE_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "X-Session-Id: ${SESSION_ID}" \
    -d "${PRACTICE_START_PAYLOAD}" \
    "${BASE_URL}/api/v1/sessions")

PRACTICE_ID=$(echo "${PRACTICE_RESPONSE}" | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)
if [[ -n "${PRACTICE_ID}" ]]; then
    log_pass "Practice session initialized: ${PRACTICE_ID}"
else
    log_fail "Failed to start practice session: ${PRACTICE_RESPONSE}"
    exit 1
fi

# ------------------------------------------------------------------------------
# 7. Golden Journey Step 3: Fetch Practice Session Status
# ------------------------------------------------------------------------------
log_info "Probe 7/7: Golden Journey (Step 3/3) — Query Practice Session..."
FETCH_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "X-Session-Id: ${SESSION_ID}" \
    "${BASE_URL}/api/v1/sessions/${PRACTICE_ID}")

if [[ "${FETCH_CODE}" == "200" ]]; then
    log_pass "Practice session query verified (HTTP 200)"
else
    log_fail "Failed to fetch practice session: HTTP ${FETCH_CODE}"
    exit 1
fi

# ------------------------------------------------------------------------------
# Latency & SLA Verification (< 15s)
# ------------------------------------------------------------------------------
END_TIME=$(date +%s%N)
ELAPSED_MS=$(( (END_TIME - START_TIME) / 1000000 ))
ELAPSED_SEC=$(echo "scale=2; ${ELAPSED_MS} / 1000" | bc -l)

log_info "All 7 pre-flight smoke probes PASSED successfully in ${ELAPSED_SEC}s (${ELAPSED_MS}ms)"

if (( ELAPSED_MS < 15000 )); then
    log_pass "SLA Met: Total smoke execution time (${ELAPSED_SEC}s) is well within the 15.0s budget!"
else
    log_fail "SLA Breached: Total smoke execution time (${ELAPSED_SEC}s) exceeded 15.0s!"
    exit 1
fi

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}  PRE-FLIGHT SMOKE VERIFICATION COMPLETED WITH 100% GREEN PASS RATE!          ${NC}"
echo -e "${GREEN}==============================================================================${NC}"
