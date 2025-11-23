#!/usr/bin/env node

// Simple health check script for EMR/HMS services and portals.
// Uses Node 18+ global fetch. Exits with code 1 only if a target
// is completely unreachable (e.g., connection refused).

const targets = [
  // Frontend portals
  { name: "Common Portal", url: "http://localhost:5172/" },
  { name: "Patient Portal", url: "http://localhost:5173/" },
  { name: "Provider Portal", url: "http://localhost:5174/login" },
  { name: "Admin Portal", url: "http://localhost:5175/" },
  { name: "Lab Portal", url: "http://localhost:5176/" },
  { name: "Pharmacy Portal", url: "http://localhost:5177/" },
  { name: "Billing Portal", url: "http://localhost:5178/" },
  { name: "Radiology Portal", url: "http://localhost:5179/" },

  // Backend services (auth, patient, lab, encounter)
  { name: "Auth Service", url: "http://localhost:3001/api/auth/csrf-token" },
  { name: "Patient Service", url: "http://localhost:3011/api" },
  { name: "Lab Service", url: "http://localhost:3013/api/lab" },
  { name: "Encounter Service", url: "http://localhost:3005/api/health" },
];

async function checkTarget(target) {
  const start = Date.now();
  try {
    const res = await fetch(target.url, { method: "GET", redirect: "manual" });
    const ms = Date.now() - start;
    const level = res.ok ? "OK" : "WARN";
    console.log(
      `${level.padEnd(4)} | ${target.name.padEnd(18)} | ${res.status.toString().padEnd(3)} | ${ms}ms | ${target.url}`
    );
    return { reachable: true };
  } catch (err) {
    const ms = Date.now() - start;
    console.log(
      `FAIL | ${target.name.padEnd(18)} | ERR | ${ms}ms | ${target.url} | ${err.message}`
    );
    return { reachable: false };
  }
}

(async () => {
  console.log("Health-check: probing portals and services...\n");
  const results = await Promise.all(targets.map(checkTarget));
  const failures = results.filter((r) => !r.reachable).length;

  console.log("\nSummary:");
  console.log(`  Total targets:    ${targets.length}`);
  console.log(`  Unreachable:      ${failures}`);

  // Exit non-zero only if something is completely unreachable
  process.exit(failures > 0 ? 1 : 0);
})();
