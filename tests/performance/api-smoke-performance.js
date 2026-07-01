import http from "k6/http";
import { check, group, sleep } from "k6";
import { Trend } from "k6/metrics";

const tournamentsDuration = new Trend("tournaments_duration", true);
const rankingsDuration = new Trend("rankings_duration", true);
const statisticsDuration = new Trend("statistics_duration", true);

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    tournaments_duration: ["p(95)<800"],
    rankings_duration: ["p(95)<800"],
    statistics_duration: ["p(95)<800"],
  },
};

const API_BASE_URL = (__ENV.API_BASE_URL || "http://backend:8000/api").replace(/\/+$/, "");
const PERF_EMAIL = __ENV.PERF_EMAIL || "admin@example.com";
const PERF_PASSWORD = __ENV.PERF_PASSWORD || "password";

// /rankings without tournament_id returns a validation JSON response. This is expected for this smoke check.
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 422));

function isJson(response) {
  const contentType = response.headers["Content-Type"] || response.headers["content-type"] || "";
  return contentType.toLowerCase().includes("application/json");
}

function hasToken(response) {
  try {
    return Boolean(response.json("token"));
  } catch {
    return false;
  }
}

export function setup() {
  const login = http.post(
    `${API_BASE_URL}/login`,
    JSON.stringify({
      email: PERF_EMAIL,
      password: PERF_PASSWORD,
    }),
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      tags: { name: "POST /login setup" },
    },
  );

  check(login, {
    "setup POST /login status is 200": (response) => response.status === 200,
    "setup POST /login returns JSON": isJson,
    "setup POST /login returns token": hasToken,
  });
}

export default function () {
  group("public GET endpoints", () => {
    const tournaments = http.get(`${API_BASE_URL}/tournaments`, {
      tags: { name: "GET /tournaments" },
    });
    tournamentsDuration.add(tournaments.timings.duration);

    const rankings = http.get(`${API_BASE_URL}/rankings`, {
      tags: { name: "GET /rankings" },
    });
    rankingsDuration.add(rankings.timings.duration);

    const statistics = http.get(`${API_BASE_URL}/statistics`, {
      tags: { name: "GET /statistics" },
    });
    statisticsDuration.add(statistics.timings.duration);

    check(tournaments, {
      "GET /tournaments status is 200": (response) => response.status === 200,
      "GET /tournaments returns JSON": isJson,
    });

    check(rankings, {
      "GET /rankings status is expected": (response) => response.status === 200 || response.status === 422,
      "GET /rankings returns JSON": isJson,
    });

    check(statistics, {
      "GET /statistics status is 200": (response) => response.status === 200,
      "GET /statistics returns JSON": isJson,
    });
  });

  sleep(1);
}
