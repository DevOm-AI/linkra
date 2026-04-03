import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 50, // 50 Virtual Users
  duration: '30s',
};

// Replace 'jxHdjqOH7O' with a code you actually created!
const SHORT_CODE = 'jxHdjqOH7O'; 

export default function () {
    const res = http.get(`http://localhost:8000/${SHORT_CODE}`, {
        redirects: 0, 
    });

  check(res, {
    'status is 307': (r) => r.status === 307,
  });

  sleep(0.1); // Small pause between requests
}