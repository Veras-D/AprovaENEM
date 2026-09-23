import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// ==============================================================================
// Custom Performance Metrics
// ==============================================================================
const catalogQueryDuration = new Trend('catalog_query_duration_ms', true);
const singleQuestionDuration = new Trend('single_question_duration_ms', true);
const filteredQueryDuration = new Trend('filtered_query_duration_ms', true);
const serverErrors5xx = new Counter('server_errors_5xx_count');
const traceHeaderRate = new Rate('trace_header_present_rate');

// ==============================================================================
// Configuration & Scenarios
// ==============================================================================
const BASE_URL = __ENV.BASE_URL || 'http://localhost';
const IS_CI_FAST = __ENV.CI_FAST === 'true';

export const options = {
  scenarios: {
    exam_rush_catalog_load: {
      executor: 'ramping-vus',
      startVUs: IS_CI_FAST ? 2 : 10,
      stages: IS_CI_FAST
        ? [
            { duration: '5s', target: 5 },
            { duration: '15s', target: 15 },
            { duration: '5s', target: 0 },
          ]
        : [
            { duration: '30s', target: 200 },
            { duration: '1m', target: 600 },
            { duration: '2m', target: 1000 },
            { duration: '2m', target: 1000 },
            { duration: '30s', target: 0 },
          ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: IS_CI_FAST
    ? {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.01'],
        catalog_query_duration_ms: ['p(95)<500'],
        single_question_duration_ms: ['p(95)<300'],
        server_errors_5xx_count: ['count==0'],
        trace_header_present_rate: ['rate>0.99'],
      }
    : {
        http_req_duration: ['p(95)<300', 'p(99)<450'],
        http_req_failed: ['rate<0.01'],
        catalog_query_duration_ms: ['p(95)<300'],
        single_question_duration_ms: ['p(95)<250'], // Redis L2 cache target under 150+ concurrent VUs
        server_errors_5xx_count: ['count==0'],
        trace_header_present_rate: ['rate>0.99'],
      },
};

function getHeaders(vuId) {
  return {
    'Accept': 'application/json',
    'User-Agent': `k6-stress-runner/2.0 (AprovaENEM-ExamRush-VU${vuId})`,
    'X-Session-Id': `student-session-vu-${vuId}`,
  };
}

const SAMPLE_QUESTION_IDS = [
  '44444444-0000-0000-0000-000000000001',
  '44444444-0000-0000-0000-000000000002',
];

export default function () {
  const vuId = __VU;
  const iterId = __ITER;
  const headers = getHeaders(vuId);

  // 1. Paginated Question Catalog Retrieval (Simulates exam list browsing)
  const catalogRes = http.get(`${BASE_URL}/api/v1/questions?page=0&size=10`, { headers: headers });
  catalogQueryDuration.add(catalogRes.timings.duration);

  if (catalogRes.status >= 500) {
    serverErrors5xx.add(1);
  }

  const catalogSuccess = check(catalogRes, {
    'catalog status is 200': (r) => r.status === 200,
    'catalog has items': (r) => {
      try {
        const body = r.json();
        return body && Array.isArray(body.items) && body.items.length > 0;
      } catch (e) {
        return false;
      }
    },
    'catalog trace header present': (r) => {
      const hasTrace = r.headers['X-Trace-Id'] !== undefined || r.headers['x-trace-id'] !== undefined;
      traceHeaderRate.add(hasTrace);
      return hasTrace;
    },
  });

  // 2. Single Question Lookup by ID (Simulates opening question detail — Redis L2 cache hot path)
  const questionId = SAMPLE_QUESTION_IDS[(vuId + iterId) % SAMPLE_QUESTION_IDS.length];
  const singleRes = http.get(`${BASE_URL}/api/v1/questions/${questionId}`, { headers: headers });
  singleQuestionDuration.add(singleRes.timings.duration);

  if (singleRes.status >= 500) {
    serverErrors5xx.add(1);
  }

  check(singleRes, {
    'single question status is 200': (r) => r.status === 200,
    'single question id matches': (r) => {
      try {
        const body = r.json();
        return body && body.id === questionId;
      } catch (e) {
        return false;
      }
    },
    'single question options present': (r) => {
      try {
        const body = r.json();
        return body && Array.isArray(body.options) && body.options.length >= 4;
      } catch (e) {
        return false;
      }
    },
  });

  // 3. Filtered Catalog Query (Simulates searching by difficulty)
  if (iterId % 3 === 0) {
    const filterRes = http.get(`${BASE_URL}/api/v1/questions?difficultyLevel=MEDIUM&size=5`, { headers: headers });
    filteredQueryDuration.add(filterRes.timings.duration);

    if (filterRes.status >= 500) {
      serverErrors5xx.add(1);
    }

    check(filterRes, {
      'filtered catalog status is 200': (r) => r.status === 200,
      'filtered catalog items returned': (r) => {
        try {
          const body = r.json();
          return body && Array.isArray(body.items);
        } catch (e) {
          return false;
        }
      },
    });
  }

  // Realistic user pacing between questions (100ms - 500ms)
  sleep(Math.random() * 0.4 + 0.1);
}
