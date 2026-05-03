# ISO TESTIT! — Game Design Document (v2)

**Course:** SENG 436 — Software Quality Assurance
**Team:** Import Math (Zeynep Nur Karabay, Mert Bursalıoğlu, Yusuf Ali Mertyürek)
**Assigned standard:** ISO/IEC 29119-1 — General Concepts
**Document version:** 2.0 — revised after Week 2 instructor feedback (80/100)
**Target deliverable:** Week 3 — Playable 10-minute prototype

---

## 1. What changed and why

The Week 2 proposal scored 80. Instructor feedback flagged four substantive issues plus a visual one. This v2 design addresses each before any code is written. The mapping is explicit so the link between feedback and mechanic is auditable.

| # | Feedback (Sevgi hoca) | v1 problem | v2 mechanic that fixes it |
|---|---|---|---|
| 1 | "Theme lacks contrast of colours." | Cards in similar warm tones over dark purple; card families not visually distinct. | 4-family colour system (red / blue / green / purple) with WCAG AA contrast on dark background. Action cards get a gold accent. |
| 2 | "Players don't explain their thinking. A student who memorises patterns can win." | Round = read → click → done. No reasoning step. | **Defend Phase** added to every standard round. After playing a card, the player must select the correct *justification* from 3 options. Card-correct + Reason-wrong yields partial credit and a hint, not a discard. |
| 3 | "LO-4 (ISO 25010) never appears in the game." | LO listed but no mechanic. | **Quality Characteristic tag** added to Defend Phase. Player tags which 25010 characteristic the scenario impacts (e.g., Failure → Reliability). Bonus point for correct tag. |
| 4 | "Action cards don't teach — Customer Complaint vs Validation is luck, not knowledge." | Action cards counter each other by name only. | Action cards become **Knowledge Triggers**: playing one fires a 4-option mini-quiz on an ISO concept. The card only takes effect if the trigger question is answered correctly. |
| 5 | "15 seconds is very short. Speed ≠ understanding." | Single fixed timer pressuring guesses. | **Mixed round modes**: Match Phase 25s + Defend Phase 25s on standard rounds; Lightning Rounds (every 3rd) at 20s for warm-up; one Audit Round at the end with 75s for a multi-concept scenario. |

The visual contrast and the missing-LO problems are the cheapest to fix. The justification step and the knowledge-triggered action cards are where most of the educational value comes from — these are the two changes that make the game pass the "memoriser cannot win" test.

---

## 2. Game overview

**Title:** ISO TESTIT! (Kahoot meets Uno, ISO/IEC 29119-1 edition)

**Format:** Web-based, single-player vs one AI opponent. Runs entirely in the browser, no install, no backend.

**Session length:** Designed for a 10-minute playthrough — 8 rounds standard + 1 Audit Round. Other groups can pick it up, read the on-screen rules card, and play through to completion in one sitting (Week 3 deliverable requirement).

**Core fantasy:** You are a junior QA engineer running through a workday of incoming software events. For each event you have to (a) classify it correctly using ISO terminology and (b) defend your reasoning against an audit.

---

## 3. Target audience

Undergraduate Software Engineering / Computer Science students enrolled in a Software Quality Assurance or Software Testing course. Players have basic coding background and have been exposed to QA concepts at a textbook level but cannot yet apply them to scenarios. Cross-tested by other Week 3 student groups, who will not have read our concept analysis.

---

## 4. Measurable learning objectives

Five LOs, each tied to a concrete mechanic. Drawn from ISO/IEC 29119-1 Part 1 (General Concepts) and the brief's sample LOs.

| LO | After playing, the participant will be able to… | Mechanic that exercises it |
|---|---|---|
| LO-1 | Classify a software anomaly into the **Error → Defect → Failure** causal chain given a scenario. | Anomaly cards in the Match Phase. Wrong choice fires the corrective explanation pop-up. |
| LO-2 | Distinguish **Verification** ("are we building the product right?") from **Validation** ("are we building the right product?") in context. | Activity cards in the Match Phase + V/V-themed scenarios. |
| LO-3 | Distinguish **Static testing** (no code execution: reviews, inspections, walkthroughs) from **Dynamic testing** (code execution). | Approach cards in the Match Phase. |
| LO-4 | Map a 29119-1 testing event to the affected **ISO/IEC 25010** quality characteristic (Reliability, Maintainability, Usability, Security, Performance Efficiency, Functional Suitability, Compatibility, Portability). | Quality Characteristic tag in the Defend Phase. Required for full points. |
| LO-5 | **Justify** a classification decision with a correct conceptual reason, not just a label. | Defend Phase rationale chips. The single most important LO; without it the game is a memorisation drill. |

The brief's grading rubric weights *Educational Effectiveness* at 20 points with the criteria "Game requires reasoning. Misconceptions become visible." LO-5 is the explicit response to that criterion.

---

## 5. Components

### 5.1 Card families

Four colour-coded families, plus one accent family for actions. Each card has: name, family, family colour, short text, and (internal) tag(s) used by the matching engine.

**Anomaly family — red gradient (#E63946 → #B5172A)**
- Error — a human action that produces an incorrect result (misunderstanding a requirement, mistyping a function name in design).
- Defect — a static flaw that exists in code or another work product as a result of an error.
- Failure — the dynamic, observable manifestation of a defect when the system runs.

**Activity family — blue gradient (#2A9DF4 → #1565C0)**
- Verification — checking that the artefact conforms to its specification.
- Validation — checking that the artefact meets the user's actual needs.

**Approach family — green gradient (#2BB673 → #1B7A45)**
- Static Testing — examining work products without executing code (reviews, walkthroughs, inspections, static analysis).
- Dynamic Testing — examining behaviour by executing the code or system.

**Quality family — purple gradient (#8E44AD → #5B2C82)** *(used as Defend Phase tags, not in hand)*
- Reliability, Maintainability, Usability, Security, Performance Efficiency, Functional Suitability, Compatibility, Portability — the eight ISO/IEC 25010 quality characteristics.

**Action family — gold accent (#F4B400)**
- 4 cards in v1 of the prototype. See § 5.3.

### 5.2 Scenario cards

A scenario card is a short paragraph (1–3 sentences) describing a concrete software development event, plus a hidden tag set. Tags are: which Anomaly applies (if any), which Activity applies (if any), which Approach applies (if any), which Quality Characteristic is most directly affected, and which justification is correct (one of 3 candidate rationales). All five LOs are exercised across the scenario pool. Each scenario carries a clause reference like `Clause ref: 5.x.x` for the team to fill in from the standard.

Ten worked examples appear in § 9 below; the Week 3 build will ship 15 scenarios so a 10-minute playthrough never repeats.

### 5.3 Action cards (knowledge-triggered)

Each action card requires the player to *demonstrate* understanding before the card resolves. If the trigger quiz is failed, the card is wasted (discarded with no effect). This converts action cards from RNG into teaching moments.

| Action card | Effect | Trigger quiz |
|---|---|---|
| **Peer Review** | Forces opponent to draw 2 penalty cards next round. | 4-option MCQ: identify which review type matches a short description (informal review / walkthrough / technical review / inspection). |
| **Code Inspection** | Shows you the family colour of the next scenario's correct Approach card before Match Phase begins. | 4-option MCQ: identify whether a given activity is static or dynamic. |
| **Quality Audit** | Lets you swap your Quality Characteristic tag during your own Defend Phase. | 4-option MCQ on a given 25010 characteristic. |
| **Test Strategy** | Skips your next Match Phase (you cannot lose points that round). | 4-option MCQ: distinguish test strategy vs test plan vs test case vs test procedure. |

Each player draws exactly one action card per game (turn 4) so action cards are scarce, deliberate, and never the dominant scoring path.

---

## 6. Round structure

A game is **8 standard rounds + 1 Audit round**, with a Lightning variant every third round.

### 6.1 Standard round (default)

| Phase | Time | What happens |
|---|---|---|
| Reveal | 3 s | Scenario card flips into the centre. Both players see it simultaneously. |
| **Match** | 25 s | Player picks one card from hand. Card is locked in but not yet revealed to opponent. |
| **Defend** | 25 s | Player picks one of 3 rationale chips ("I chose this because…") and tags one of 8 Quality Characteristics. |
| Resolve | up to 8 s | Both plays revealed. Scoring applied. Corrective pop-up if any answer was wrong. |

### 6.2 Lightning round (rounds 3, 6)

Match Phase only, 20 s. No Defend Phase. Worth 1 pt max. Acts as a palate cleanser and rewards quick recognition without becoming the only path to win. Ratio of slow-to-fast rounds is 6:2 — instructor explicitly asked for this mix.

### 6.3 Audit round (round 9, finale)

Multi-concept scenario like *"During acceptance testing, the customer reports the export button never finishes loading. The team finds the loop in code that was missed during the design walkthrough."* Player must play three cards in sequence (one Anomaly, one Activity, one Approach) and tag two Quality Characteristics. 75 seconds. Worth 5 pts.

---

## 7. Scoring

Per standard round:

- Match correct + Defend reason correct + Quality tag correct → **3 pts**, card discarded.
- Match correct + Defend reason correct, Quality tag wrong → **2 pts**, card discarded.
- Match correct, Defend reason wrong → **1 pt**, card *not* discarded, hint shown.
- Match wrong → **0 pts**, draw 1 penalty card, full corrective explanation shown.

Lightning round: 1 pt for correct match, 0 otherwise.
Audit round: up to 5 pts (1 per correct sub-answer).

Maximum theoretical score for one game: 6 × 3 + 2 × 1 + 5 = **25 pts**.

The "Match correct, Defend wrong = card not discarded" rule is the anti-memorisation lever. Memorising "Failure" goes to "system crash" wins the Match, but if the player cannot pick the correct *because* they keep the card and have to defend it again — the misconception stays visible.

---

## 8. Winning condition

End of round 9, highest score wins. (We deliberately move away from "first to empty hand" because that mechanic let weak players limp to a win on action-card luck. Score-based wins make reasoning the dominant variable.)

If both players tie, whoever had the most "3-pt rounds" (i.e., full Match + Defend + Tag triples) wins. This rewards depth over breadth.

---

## 9. Sample scenarios (10 worked, 5 more to ship)

Format: scenario text → expected card → 3 rationale chips (correct one starred) → expected 25010 tag → clause ref placeholder.

**S1.** *"A developer misreads the spec and codes the discount threshold as 100 TL instead of 1000 TL."* → **Error** → "human action that introduces a flaw" ★ / "static flaw in the artefact" / "observable wrong behaviour at runtime" → Functional Suitability → `Clause ref: 5.x.x`

**S2.** *"Code review on the checkout module finds an off-by-one loop. The bug has not yet shipped."* → **Defect** (and Static Testing) → "static flaw discovered in a work product" ★ / "user-facing wrong output" / "human misunderstanding" → Maintainability → `Clause ref: 5.x.x`

**S3.** *"In production, the export button hangs forever for files larger than 20 MB."* → **Failure** → "observable malfunction during execution" ★ / "static flaw in code" / "developer misunderstanding" → Performance Efficiency → `Clause ref: 5.x.x`

**S4.** *"The team checks each user story in the SRS against the acceptance criteria the customer signed off on."* → **Validation** → "are we building the right product" ★ / "are we building the product right" / "checking compliance with internal standard" → Functional Suitability → `Clause ref: 5.x.x`

**S5.** *"QA reviews the architecture document against the requirements specification before any code is written."* → **Verification** (and Static Testing) → "checking artefact against its spec" ★ / "checking artefact against user need" / "executing the system to find bugs" → Maintainability → `Clause ref: 5.x.x`

**S6.** *"The test team runs the full regression suite on the build and finds two new failed cases."* → **Dynamic Testing** → "code is being executed" ★ / "no execution, only inspection" / "human action only" → Reliability → `Clause ref: 5.x.x`

**S7.** *"Three engineers walk through the design document line-by-line in a scheduled meeting."* → **Static Testing** → "no execution, only inspection" ★ / "code is being executed" / "happens only in production" → Maintainability → `Clause ref: 5.x.x`

**S8.** *"After login, sensitive user emails appear in the URL query string."* → **Failure** → "observable malfunction at runtime" ★ / "human misreading of spec" / "static flaw not yet shipped" → Security → `Clause ref: 5.x.x`

**S9.** *"A code reviewer flags a method that catches every exception silently — the reviewer says this will make later debugging painful."* → **Defect** (and Static Testing) → "static flaw in the artefact" ★ / "observable runtime malfunction" / "user-facing usability issue" → Maintainability → `Clause ref: 5.x.x`

**S10. (Audit-round candidate)** *"During acceptance testing the customer says the export PDF is unreadable on their iPad. The team traces it back to a CSS rule the design walkthrough missed."* → **Failure + Validation + Static Testing missed-step** → tag: Compatibility, Usability → `Clause ref: 5.x.x`

Five more scenarios (S11–S15) to be added during the build week, drawing more on Verification phrasing and on Performance/Security/Portability tags so the 25010 tag space is exercised broadly.

---

## 10. How misconceptions become visible

The brief grades "misconceptions become visible" as part of Educational Effectiveness (20 pts). Three mechanics surface them:

1. **Match-wrong correction pop-up.** Whenever a card is rejected, the system shows the canonical short explanation (e.g., "A misunderstanding is a human action — that's an *Error*. The Defect appears only once that misunderstanding is encoded in an artefact."). The player cannot dismiss it without reading.
2. **Defend-wrong hint.** Card is correct but reasoning is wrong: the player keeps the card and sees the correct rationale alongside their wrong choice. This catches the "right answer for the wrong reason" failure mode.
3. **End-of-game review screen.** Lists every round, the player's choice, the correct answer, and a one-line concept reminder. Designed for the post-game reflection (Week 5 deliverable also needs this).

---

## 11. Theme & visual language

- **Background:** dark navy (#0E1626) — calmer than the v1 purple, gives card families more saturation room.
- **Foreground text:** off-white (#F1F4F8). Body text 16 px minimum for the testing groups.
- **Card families:** four saturated gradients listed in § 5.1, all WCAG AA against the dark navy.
- **Card type indicator:** family icon top-left, family name top-right (so colour is not the *only* channel — colour-blind safety).
- **Action cards:** gold border (#F4B400), so they pop in the hand without competing with concept cards.
- **Scenario card:** centred white-on-navy block with a left-edge highlight matching the *correct* family — only revealed at the Resolve phase to avoid leaking the answer.
- **Typography:** Inter or Plus Jakarta Sans (free, system-loadable). Monospace for clause refs.

---

## 12. Scope split — Week 3 vs later

**Ships in Week 3 prototype (this build):**
- Single-player vs 1 easy AI opponent.
- 9 rounds total: 6 standard + 2 Lightning (rounds 3 and 6) + 1 Audit (round 9).
- 15 scenarios. Anomaly / Activity / Approach card families fully in play.
- Match Phase + Defend Phase + Resolve Phase fully wired.
- ISO/IEC 25010 Quality Characteristic tag chosen during Defend.
- Scoring, end-of-game round-by-round review, "Play again" button.
- Persistent rules panel reachable from lobby and mid-game.
- Each of Sevgi hoca's five feedback items is bound to a concrete mechanic the testers will see within the first three rounds.

**Held for Week 4–5:**
- **Action cards** (Peer Review / Code Inspection / Quality Audit / Test Strategy) with knowledge-trigger mini-quizzes. Designed in § 5.3 but not implemented in the Week 3 prototype — would need a second modal flow we did not have time for in the one-week build window.
- Larger scenario pool (target 30+).
- Difficulty levels for the AI opponent.
- Hot-seat 2-player mode.
- Sound effects, micro-animations, win-screen confetti.
- Final visual polish, brand identity, splash art.
- Telemetry collected during testing-group sessions, surfaced as a "what tripped most players" panel for the Week 5 reflection.

**Explicitly out of scope for the whole project:**
- Network multiplayer, accounts, persistence beyond `localStorage`.
- Mobile-first layout (desktop browser is the test surface).
- LLM-graded free-text justification (tested in design — adds variance and dependency for no pedagogical gain over the 3-chip rationale).

---

## 13. Open items the team owns

Three things this design defers to the team:

- **Clause references.** Every `Clause ref: 5.x.x` in § 9 needs to be filled in from the actual ISO/IEC 29119-1:2022 PDF. This is required for Concept Accuracy (20 pts).
- **Wording sanity check.** Read each scenario aloud and confirm the rationale chips do not give the answer away by phrasing. The "correct" chip should read as a peer to the distractors, not visibly heavier.
- **Scenarios S11–S15.** Five more scenarios needed to balance the Quality Characteristic tag space (currently weighted to Maintainability and Functional Suitability).
