import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// ==============================================================================
// Custom Performance Metrics
// ==============================================================================
const sessionCreationDuration = new Trend('session_creation_duration_ms', true);
const attemptSubmissionDuration = new Trend('attempt_submission_duration_ms', true);
const leaderboardQueryDuration = new Trend('leaderboard_query_duration_ms', true);
const gamificationEventsCount = new Counter('gamification_events_ingested_count');
const serverErrors5xx = new Counter('server_errors_5xx_count');

// ==============================================================================
// Configuration & Scenarios
// ==============================================================================
const BASE_URL = __ENV.BASE_URL || 'http://localhost';
const IS_CI_FAST = __ENV.CI_FAST === 'true';

export const options = {
  scenarios: {
    gamification_concurrency: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: IS_CI_FAST
        ? [
            { duration: '5s', target: 25 },
            { duration: '15s', target: 50 },
            { duration: '5s', target: 0 },
          ]
        : [
            { duration: '20s', target: 25 },
            { duration: '40s', target: 50 },
            { duration: '1m', target: 50 },
            { duration: '20s', target: 0 },
          ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<180', 'p(99)<250'],
    http_req_failed: ['rate<0.01'],
    leaderboard_query_duration_ms: ['p(95)<100'], // Redis ZSET target: sub-100ms P95
    server_errors_5xx_count: ['count==0'],
  },
};

const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'k6-stress-runner/2.0 (AprovaENEM-GamificationStress)',
};

const SAMPLE_QUESTION_ID = '44444444-0000-0000-0000-000000000001';

export function setup() {
  const tokens = [];
  const userCount = 5;

  for (let i = 0; i < userCount; i++) {
    const email = `gamification.k6.${Date.now()}.${i}@aprovaenem.com.br`;
    const regPayload = JSON.stringify({
      email: email,
      password: 'Password123!',
      fullName: `Gamification Stress Worker ${i}`,
      schoolType: 'PUBLIC_SCHOOL',
    });

    const regRes = http.post(`${BASE_URL}/api/v1/auth/register`, regPayload, { headers: HEADERS });
    if (regRes.status === 201) {
      try {
        const data = regRes.json();
        tokens.push(data.token);
      } catch (e) {
        console.error('Failed to parse register response');
      }
    }
  }

  return { tokens: tokens };
}

export default function (data) {
  const vuId = __VU;
  const iterId = __ITER;
  const anonymousSessionId = `stress-session-${vuId}-${iterId}-${Date.now()}`;
  const sessionHeaders = Object.assign({}, HEADERS, { 'X-Session-Id': anonymousSessionId });

  // 1. Start Practice Session
  const sessionPayload = JSON.stringify({
    anonymousSessionId: anonymousSessionId,
    sessionType: 'DIAGNOSTIC_QUICK',
    totalQuestions: 5,
  });

  const sessionRes = http.post(`${BASE_URL}/api/v1/sessions`, sessionPayload, {
    headers: sessionHeaders,
  });
  sessionCreationDuration.add(sessionRes.timings.duration);

  if (sessionRes.status >= 500) {
    serverErrors5xx.add(1);
  }

  let sessionId = null;
  const sessionSuccess = check(sessionRes, {
    'session start status is 201': (r) => r.status === 201,
    'session id is returned': (r) => {
      try {
        const body = r.json();
        sessionId = body.id;
        return sessionId !== undefined && sessionId !== null;
      } catch (e) {
        return false;
      }
    },
  });

  // 2. Submit Question Attempt (Triggers outbox publishing & scoring)
  if (sessionId) {
    const attemptPayload = JSON.stringify({
      questionId: SAMPLE_QUESTION_ID,
      selectedOption: 'C',
      timeSpentSeconds: Math.floor(Math.random() * 60) + 15,
    });

    const attemptRes = http.post(`${BASE_URL}/api/v1/sessions/${sessionId}/attempts`, attemptPayload, {
      headers: sessionHeaders,
    });
    attemptSubmissionDuration.add(attemptRes.timings.duration);

    if (attemptRes.status >= 500) {
      serverErrors5xx.add(1);
    } else if (attemptRes.status === 201) {
      gamificationEventsCount.add(1);
    }

    check(attemptRes, {
      'attempt submission status is 201': (r) => r.status === 201,
      'attempt result contains explanation': (r) => {
        try {
          const body = r.json();
          return body && body.baseExplanation !== undefined;
        } catch (e) {
          return false;
        }
      },
    });
  }

  // 3. Query Weekly Leaderboard (Redis Sorted Set under load)
  if (data.tokens && data.tokens.length > 0 && iterId % 2 === 0) {
    const userToken = data.tokens[vuId % data.tokens.length];
    const leaderboardHeaders = Object.assign({}, HEADERS, {
      'Authorization': `Bearer ${userToken}`,
    });

    const lbRes = http.get(`${BASE_URL}/api/v1/gamification/leaderboard/weekly?limit=10`, {
      headers: leaderboardHeaders,
    });
    leaderboardQueryDuration.add(lbRes.timings.duration);

    if (lbRes.status >= 500) {
      serverErrors5xx.add(1);
    }

    check(lbRes, {
      'leaderboard status is 200': (r) => r.status === 200,
      'leaderboard contains ranking array': (r) => {
        try {
          const body = r.json();
          return body && Array.isArray(body.leaderboard);
        } catch (e) {
          return false;
        }
      },
    });
  }

  sleep(Math.random() * 0.3 + 0.1);
}
