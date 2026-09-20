import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// ==============================================================================
// Custom Performance & Saturation Metrics
// ==============================================================================
const socraticDuration = new Trend('socratic_request_duration_ms', true);
const successfulAiConsultations = new Counter('socratic_successful_200_count');
const rateLimited429Count = new Counter('socratic_rate_limited_429_count');
const unhandled5xxErrors = new Counter('unhandled_5xx_errors_count');
const fallbackResponses = new Counter('resilience_fallback_responses_count');
const compliantResponsesRate = new Rate('compliant_status_rate');

// ==============================================================================
// Configuration & Scenarios
// ==============================================================================
const BASE_URL = __ENV.BASE_URL || 'http://localhost';
const IS_CI_FAST = __ENV.CI_FAST === 'true';

export const options = {
  scenarios: {
    socratic_ai_burst: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: IS_CI_FAST ? 100 : 500,
      stages: IS_CI_FAST
        ? [
            { duration: '5s', target: 30 },
            { duration: '15s', target: 100 },
            { duration: '5s', target: 10 },
          ]
        : [
            { duration: '10s', target: 100 },
            { duration: '30s', target: 500 },
            { duration: '20s', target: 500 },
            { duration: '10s', target: 50 },
          ],
    },
  },
  thresholds: {
    unhandled_5xx_errors_count: ['count==0'], // Zero unhandled 500 errors allowed
    compliant_status_rate: ['rate>0.99'],     // 99%+ of responses must be 200, 429, or 401
    socratic_rate_limited_429_count: ['count>0'], // Token Bucket & Quota must actively throttle
  },
};

const QUESTION_ID = '44444444-0000-0000-0000-000000000001';

export function setup() {
  const email = `burst.test.${Date.now()}@aprovaenem.com.br`;
  const regPayload = JSON.stringify({
    email: email,
    password: 'Password123!',
    fullName: 'Socratic Burst Tester',
    schoolType: 'PUBLIC_SCHOOL',
  });

  const regRes = http.post(`${BASE_URL}/api/v1/auth/register`, regPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  let token = null;
  if (regRes.status === 201) {
    try {
      token = regRes.json().token;
    } catch (e) {
      console.error('Failed to parse register response token');
    }
  }

  return { token: token };
}

export default function (data) {
  const vuId = __VU;
  const isAnonymousVU = (vuId % 5 === 0) || !data.token;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'k6-stress-runner/2.0 (AprovaENEM-SocraticBurst)',
  };

  if (!isAnonymousVU && data.token) {
    headers['Authorization'] = `Bearer ${data.token}`;
  }

  const payload = JSON.stringify({
    message: 'Como o disjuntor termomagnético protege o circuito contra sobrecargas térmicas?',
  });

  const res = http.post(`${BASE_URL}/api/v1/questions/${QUESTION_ID}/ask`, payload, {
    headers: headers,
    tags: { name: 'SocraticConsultation' },
  });

  socraticDuration.add(res.timings.duration);

  // Evaluate Server Errors
  if (res.status >= 500) {
    unhandled5xxErrors.add(1);
    compliantResponsesRate.add(false);
  } else {
    // 200 (Success / Fallback), 429 (Token Bucket / Daily Quota), 401 (Anonymous Registration Required)
    const isCompliant = res.status === 200 || res.status === 429 || res.status === 401;
    compliantResponsesRate.add(isCompliant);
  }

  // Evaluate Specific Statuses
  if (res.status === 200) {
    successfulAiConsultations.add(1);
    try {
      const body = res.json();
      if (body && body.isFallback === true) {
        fallbackResponses.add(1);
      }
    } catch (e) {
      // Ignored
    }
  } else if (res.status === 429) {
    rateLimited429Count.add(1);
  }

  check(res, {
    'status is compliant (200, 429, or 401)': (r) =>
      r.status === 200 || r.status === 429 || r.status === 401,
    'zero 500 internal server errors': (r) => r.status < 500,
  });

  sleep(0.05); // Rapid burst pacing (50ms)
}
