# ISO TESTIT! — Technical Specification (Week 3 Prototype)

**Companion to:** `design.md`
**Target deliverable:** Playable 10-minute prototype that another student group can pick up, read the on-screen rules, and play through to completion in one sitting.
**Build window:** ~7 days (Week 3 of the SENG 436 schedule).

---

## 1. Stack decision

Vanilla **HTML + CSS + JavaScript**. No framework, no build step, no package manager.

Reasons:
- One-week window. Adding React/Vite buys nothing for a state machine of this size and costs setup time.
- The deliverable is "open the file and play". A zero-install prototype removes friction for the testing groups.
- Full grade-relevant logic lives in plain JS we can read, defend in the demo, and modify mid-feedback-session.
- No backend, no auth, no networking — single-player vs AI, all client-side.

Browser target: latest Chrome / Firefox / Edge on desktop. No mobile layout work in Week 3.

---

## 2. File layout

```
Seng-436/
├── design.md                  # game design (companion to this file)
├── technical-spec.md          # this file
└── prototype/
    ├── index.html             # single-page entry, includes rules panel
    ├── styles.css             # 4-family palette, layout, animations
    ├── data/
    │   ├── scenarios.json     # 15 scenario cards w/ rationale chips, tags, clause refs
    │   ├── cards.json         # concept cards (Anomaly, Activity, Approach, Quality)
    │   └── actions.json       # 4 action cards w/ trigger quizzes
    └── js/
        ├── main.js            # bootstraps app, owns top-level routing (lobby → round → end)
        ├── state.js           # single source of truth, pure reducers, no DOM
        ├── engine.js          # round loop, scoring, AI bot, timer
        ├── ui.js              # all DOM rendering, listens to state changes
        └── rules.js           # rules-panel content, end-screen review builder
```

Six JS files, one HTML, one CSS, three data files. Each file under 300 lines. Reviewable in a single sitting before the demo.

---

## 3. Data shapes

All data is static JSON. The team can add scenarios without touching code.

### 3.1 Scenario

```json
{
  "id": "S03",
  "text": "In production, the export button hangs forever for files larger than 20 MB.",
  "clause_ref": "Clause ref: 5.x.x",
  "match": {
    "family": "anomaly",
    "card_id": "failure"
  },
  "rationale": {
    "correct_id": "r1",
    "options": [
      { "id": "r1", "text": "Observable malfunction during execution." },
      { "id": "r2", "text": "Static flaw discovered in code." },
      { "id": "r3", "text": "Human action that introduced a flaw." }
    ]
  },
  "quality_tag": "performance_efficiency",
  "lo": ["LO-1", "LO-4", "LO-5"],
  "round_type": "standard"
}
```

`round_type` is `"standard" | "lightning" | "audit"`. The audit scenario carries an `extra_match` array for the multi-card play in round 9.

### 3.2 Concept card

```json
{
  "id": "failure",
  "name": "Failure",
  "family": "anomaly",
  "short": "Observable malfunction at runtime."
}
```

### 3.3 Action card

```json
{
  "id": "peer_review",
  "name": "Peer Review",
  "effect": "opponent_draw_2",
  "trigger_quiz": {
    "prompt": "Which review type uses a documented, formal procedure with defined roles?",
    "correct_id": "q3",
    "options": [
      { "id": "q1", "text": "Informal review" },
      { "id": "q2", "text": "Walkthrough" },
      { "id": "q3", "text": "Inspection" },
      { "id": "q4", "text": "Technical review" }
    ]
  }
}
```

---

## 4. State model

Single plain object, mutated only through reducers in `state.js`.

```js
const state = {
  phase: "lobby",                  // lobby | reveal | match | defend | resolve | end
  roundIndex: 0,                   // 0..8
  totalRounds: 9,
  scenarioPool: [...],             // shuffled at game start
  currentScenario: null,
  player:   { hand: [...], score: 0, picks: [] },
  opponent: { hand: [...], score: 0, picks: [] },
  match:    { card: null, locked: false, deadline: 0 },
  defend:   { rationaleId: null, qualityTagId: null, deadline: 0 },
  history:  [],                    // for end-of-game review
  ui:       { showRules: false, correctionPopup: null }
};
```

Two AI behaviours wrapped behind a single function `aiPlay(scenario, hand, difficulty)`:
- 70% chance: pick the correct card (simulates a player who knows the material).
- 30% chance: pick a plausible-but-wrong card from a hand-tuned distractor map per scenario.
- For the Defend Phase the AI picks the correct rationale 60% of the time and the correct quality tag 50% of the time.

These ratios make the AI a credible but beatable opponent. They are tunable from one constant block at the top of `engine.js` — testing groups can be told "we tuned for ~50% AI win rate".

---

## 5. Round loop

`engine.js` runs an explicit state machine, not a setTimeout chain. Each phase has an entry function, an exit function, and a deadline timestamp the UI reads to render the timer ring.

```
lobby
  → on "Start Game" → reveal
reveal (3s auto)
  → match
match (25s deadline OR player commits early)
  → if lightning: resolve
  → else: defend
defend (25s deadline)
  → resolve
resolve (8s auto)
  → if roundIndex < totalRounds-1: reveal
  → else: end
end
  → "Play again" returns to lobby
```

Timers use `requestAnimationFrame` driving off `Date.now()`. We do **not** use `setInterval` — switching tabs pauses it and corrupts the deadline.

---

## 6. UI flow

Three screens.

**Lobby.** Title, "How to play" rules card (full ruleset, scrollable, can stay open during the game via a side panel toggle), name input, "Start Game" button. The rules card is the contract with the testing groups — the brief says they should be able to play *without coaching*.

**Round screen.** Top: opponent avatar, hand size, score. Centre: scenario card with timer ring; below it the played-card slot, the "Defend" panel (3 rationale chips + 8 quality chips), and the resolution pop-up. Bottom: player's hand. A small "Rules" button on the corner re-opens the panel without leaving the round.

**End screen.** Final score, winner banner, scrollable round-by-round review (your card vs correct card, your reason vs correct reason, your tag vs correct tag, one-line concept reminder per row). "Play again" button returns to lobby. This screen also doubles as the artefact a tester can screenshot for their feedback form.

---

## 7. AI opponent

Implemented as a stateless function in `engine.js`:

```js
function aiPlay(scenario, hand, difficulty = "easy") {
  const correct = hand.find(c => c.id === scenario.match.card_id);
  const wrongPool = hand.filter(c => c.id !== scenario.match.card_id);
  const roll = Math.random();
  if (correct && roll < 0.7) return correct;
  return pickPlausibleDistractor(scenario, wrongPool);
}
```

`pickPlausibleDistractor` is hand-tuned — for an Error scenario it prefers Defect over Failure (the realistic confusion), not Static or Validation (which would be implausible and break immersion).

Difficulty levels are out of scope for Week 3; the AI ships at "easy". The constants are surfaced at the top of the file so anyone evaluating the prototype can see the calibration in one glance.

---

## 8. Persistence

`localStorage` is used for one thing: a per-browser stats blob (games played, average score, most-confused concept) that the team will read off during the Week 5 reflection. No login. No cross-device anything. Cleared with a "Reset stats" link on the lobby.

This is the only side-effect outside the in-memory state.

---

## 9. Testing & QA before Week 3 demo

Three rounds of internal validation before we hand the prototype to another group:

1. **Concept-accuracy pass.** All three teammates independently play one game and flag any wording that misuses ISO terminology. This is the cheapest defence for the 20-point Concept Accuracy criterion.
2. **Rules-without-coaching pass.** One teammate hands the URL to a non-team friend with no verbal explanation. They should be able to start, finish, and report what the game taught. If they cannot, the rules panel rewrite is the highest-priority fix.
3. **10-minute timing pass.** Time three full playthroughs. If the median is <8 min, scenarios are too easy or timers are too tight; if >12 min, trim the Audit round or shrink Resolve from 8s to 5s.

These passes are also the script for the in-class testing session (Week 3 deliverable says other groups will test and give structured feedback).

---

## 10. Risk register (kept short)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scenario wording subtly wrong → loses Concept Accuracy points | Medium | High | Clause refs filled in from real PDF; team review pass before demo. |
| 10-minute target slips to 6 minutes (game too thin) | Medium | Medium | 15 scenarios queued; if play is short we add Lightning rounds to pad without bloat. |
| AI bot is too easy, removes any sense of competition | Low | Low | Constants tunable from one block; can ship two difficulties if first playtest demands it. |
| Defend Phase chips read like the answer is obvious | Medium | High | "Wording sanity check" pass listed in design.md § 13. The fix is a wording iteration, not a code one. |
| Browser tab switch pauses timers | Low | Medium | rAF + `Date.now()` deadline approach (already noted in § 5). |

---

## 11. What we are *not* building this week

Listed in design.md § 12 from the design side; on the technical side specifically:

- No bundler, no transpiler, no TypeScript.
- No service worker, no PWA install, no offline mode.
- No analytics, no telemetry, no remote logging.
- No accessibility audit beyond colour contrast and 16 px text — full ARIA pass deferred to Week 4.
- No automated tests. Manual QA passes (§ 9) are the bar for Week 3. A small unit test file for `engine.js` reducers may land in Week 4 if the team has time.

---

## 12. Definition of done — Week 3

The prototype is "done for Week 3" when *all* of these are true:

1. Open `prototype/index.html` in Chrome → can complete a 9-round game without console errors.
2. Another person (non-team) plays through to the end without verbal coaching.
3. End-of-game review screen lists every round with the correct answer and a concept reminder.
4. All five LOs are exercised by at least two scenarios each.
5. The rules panel is reachable from both the lobby and mid-game.
6. Each of the four feedback fixes (justification, 25010 tag, knowledge-triggered actions, contrast) is observable to the testing group within the first 3 rounds.
