// Aggregates the raw audit harness output (docs/audit/runs/<project>/*.json) into a compact
// markdown summary and a JSON snapshot that can be committed and compared between runs.
// Usage: node scripts/audit-report.mjs [label]   (label defaults to "latest")
import fs from "node:fs";
import path from "node:path";

const label = process.argv[2] ?? "latest";
const RUNS = path.resolve("docs/audit/runs", label);
const OUT_MD = path.resolve(`docs/audit/summary-${label}.md`);
const OUT_JSON = path.resolve(`docs/audit/results-${label}.json`);

if (!fs.existsSync(RUNS)) {
  console.error(`❌ No audit output found — ${RUNS} is missing — run "npm run audit" first.`);
  process.exit(1);
}

const projects = fs.readdirSync(RUNS).filter((name) => fs.statSync(path.join(RUNS, name)).isDirectory() && !name.startsWith("test-output"));
const read = (project, file) => {
  const full = path.join(RUNS, project, file);
  return fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, "utf8")) : null;
};
const filesOf = (project, prefix) =>
  fs.readdirSync(path.join(RUNS, project)).filter((f) => f.startsWith(prefix) && f.endsWith(".json")).sort();

const lines = [];
const out = (text = "") => lines.push(text);
const snapshot = { label, projects, journeys: {}, exits: {}, monkey: {}, memory: {}, layout: {}, perf: {} };

out(`# Audit summary (${label})`);
out("");
out(`Projects: ${projects.join(", ")}`);
out("");

// Journeys: tap counts.
out("## Journeys (taps)");
out("");
out("Taps include text entries (each typed name or answer counts as one tap). Setup size is the setup screen height in viewport heights after adding players.");
out("");
for (const project of projects) {
  const rows = filesOf(project, "journey-").map((f) => read(project, f));
  if (!rows.length) continue;
  snapshot.journeys[project] = rows.map((r) => ({ game: r.game, ...r.firstPlay, playAgainTaps: r.playAgainTaps, repeat: r.repeat }));
  out(`### ${project}`);
  out("");
  out("| Game | First play: taps to first card (typed) | Round taps | Play again | Repeat play: taps to first card (via game tile) | Repeat via home card | Setup controls | Setup size | Result reached |");
  out("|---|---|---|---|---|---|---|---|---|");
  for (const r of rows) {
    const f = r.firstPlay;
    out(`| ${r.game} | ${f.tapsToPlayable} (${f.textsToPlayable}) | ${f.roundTaps} | ${r.playAgainTaps ?? "-"} | ${r.repeat.tapsToPlayable} | ${r.repeat.quickTaps ?? "-"} | ${r.repeat.setupControls} | ${r.repeat.setupScreens} | ${f.reachedResult ? "yes" : "NO"} |`);
  }
  out("");
}

// Layout issues, deduplicated per project.
out("## Layout issues");
out("");
for (const project of projects) {
  const byType = {};
  for (const f of [...filesOf(project, "journey-"), ...filesOf(project, "exits-"), ...filesOf(project, "screens")]) {
    const data = read(project, f);
    const issues = [...(data.screens ?? []).flatMap((s) => (s.issues ?? []).map((i) => ({ ...i, where: s.id.split(" :: ")[0] }))), ...(data.landscape ?? []).map((i) => ({ ...i, where: `${data.game} landscape` }))];
    for (const issue of issues) {
      byType[issue.type] ??= new Map();
      const key = issue.detail.replace(/\d+x\d+|\d+px|ratio [\d.]+/g, "#");
      if (!byType[issue.type].has(key)) byType[issue.type].set(key, `${issue.detail} @ ${issue.where}`);
    }
  }
  snapshot.layout[project] = Object.fromEntries(Object.entries(byType).map(([type, map]) => [type, [...map.values()]]));
  out(`### ${project}`);
  out("");
  if (!Object.keys(byType).length) out("No issues.");
  for (const [type, map] of Object.entries(byType)) {
    out(`- **${type}** (${map.size}): ${[...map.values()].slice(0, 8).join("; ")}${map.size > 8 ? " …" : ""}`);
  }
  out("");
}

// Exits and interruptions.
out("## Exits and interruptions");
out("");
for (const project of projects) {
  const rows = filesOf(project, "exits-").map((f) => read(project, f));
  if (!rows.length) continue;
  snapshot.exits[project] = rows.map((r) => ({
    game: r.game,
    screens: r.screens.length,
    noExit: r.screens.filter((s) => !s.exit).map((s) => s.id),
    back: r.back,
    reload: r.reload,
    background: r.background,
    leak: r.leak,
    errors: r.errors,
  }));
  out(`### ${project}`);
  out("");
  out("| Game | Screens without a way out | Back mid-game lands on | Back opens pause menu | Forward restores same screen | Reload mid-game lands on | Timer before/after 60 s hidden | Sounds while hidden | Locks after exit | Sounds after exit |");
  out("|---|---|---|---|---|---|---|---|---|---|");
  for (const r of rows) {
    const noExit = r.screens.filter((s) => !s.exit).length;
    out(`| ${r.game} | ${noExit} of ${r.screens.length} | ${r.back.landedOn} | ${r.back.pauseMenu ? "yes" : "no"} | ${r.back.forwardRestoredSameScreen ? "yes" : "no"} | ${r.reload.landedOn} | ${r.background.timerBefore ?? "-"} / ${r.background.timerAfter ?? "-"} | ${r.background.soundsWhileHidden} | ${r.leak.locksAfterExit} | ${r.leak.soundsAfterExit} |`);
  }
  out("");
}

// Monkey.
out("## Monkey runs");
out("");
for (const project of projects) {
  const rows = filesOf(project, "monkey-").map((f) => read(project, f));
  if (!rows.length) continue;
  snapshot.monkey[project] = rows.map((r) => ({ game: r.game, seed: r.seed, anomalies: r.anomalies, errors: r.errors }));
  out(`### ${project}`);
  out("");
  for (const r of rows) {
    const problems = [...r.anomalies, ...r.errors.page.map((e) => `page error: ${e}`), ...r.errors.console.map((e) => `console: ${e}`)];
    out(`- ${r.game} (seed ${r.seed}): ${problems.length ? problems.slice(0, 5).join("; ") : "clean"}`);
  }
  out("");
}

// Memory.
out("## Remembered choices after relaunch");
out("");
for (const project of projects) {
  const rows = filesOf(project, "memory-").map((f) => read(project, f));
  if (!rows.length) continue;
  snapshot.memory[project] = rows.map((r) => ({ game: r.game, optionsKept: r.optionsKept, packsKept: r.packsKept, playersKept: r.playersKept }));
  out(`- ${project}: options kept in ${rows.filter((r) => r.optionsKept).length}/${rows.length} games, packs kept in ${rows.filter((r) => r.packsKept).length}/${rows.length}, players kept in ${rows.filter((r) => r.playersKept > 0).length}/${rows.length}`);
}
out("");

// Pack picker effort.
out("## Pack picker effort (Impostor)");
out("");
out("| Project | Packs listed | Taps to play with one pack | Taps back to every pack |");
out("|---|---|---|---|");
for (const project of projects) {
  const data = read(project, "picker.json");
  if (!data) continue;
  snapshot.picker ??= {};
  snapshot.picker[project] = data;
  out(`| ${project} | ${data.packsListed} | ${data.onePackTaps} | ${data.allPacksTaps} |`);
}
out("");

// Offline and performance.
out("## First load and offline");
out("");
for (const project of projects) {
  const data = read(project, "offline-perf.json");
  if (!data) continue;
  snapshot.perf[project] = data;
  const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
  out(`- ${project}: home visible ${data.homeVisibleMs} ms${data.throttledHomeVisibleMs ? ` (throttled 4x CPU + 1.6 Mbps: ${data.throttledHomeVisibleMs} ms)` : ""}, FCP ${data.timing.fcp ?? "n/a"} ms, initial JS+CSS ${kb(data.sizes.initialBytes)}, all assets ${kb(data.sizes.allAssetBytes)}, icons ${kb(data.sizes.publicBytes)}, precache entries ${data.sizes.precacheEntries}, service worker ${data.swReady}, offline: ${JSON.stringify(data.offline)}`);
}
out("");

fs.writeFileSync(OUT_MD, lines.join("\n"));
fs.writeFileSync(OUT_JSON, JSON.stringify(snapshot, null, 2));
console.log(`Wrote ${path.relative(process.cwd(), OUT_MD)} and ${path.relative(process.cwd(), OUT_JSON)}`);
