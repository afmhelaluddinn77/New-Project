import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:5174';
  const PATH = __ENV.K6_PATH || '/';
  const res = http.get(`${BASE_URL}${PATH}`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
