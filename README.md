# ISO TESTIT! — Week 3 Prototype

**Live Demo:** [https://prototype-livid-ten.vercel.app/prototype/index.html](https://prototype-livid-ten.vercel.app/prototype/index.html)

**Course:** SENG 436 — Software Quality Assurance
**Team:** Import Math (Zeynep Nur Karabay, Mert Bursalıoğlu, Yusuf Ali Mertyürek)
**Standard taught:** ISO/IEC 29119-1 — General Concepts (with ISO/IEC 25010 quality characteristics tagging)

A web-based educational card game that teaches the core conceptual chain of ISO/IEC 29119-1: Error → Defect → Failure, Verification vs Validation, Static vs Dynamic testing — with each play also tagged against an ISO/IEC 25010 quality characteristic.

## How to play

1. Open `prototype/index.html` in any modern desktop browser (Chrome / Firefox / Edge).
2. No installation, no server, no internet connection needed.
3. Type a name, click **Start Game**.
4. Open the **Rules** panel (top-right) any time during the game.
5. Play through 15 rounds (~15 minutes).

## What the prototype demonstrates

This v2 design responds directly to the Week 2 instructor feedback:

- **"Players don't explain their thinking"** → every standard round has a **Defend Phase** where the player picks the correct *reason* (3 options) before the round resolves. Picking the right card for the wrong reason yields only partial credit and the card stays in play.
- **"LO-4 (ISO 25010) never appears in the game"** → the Defend Phase also requires tagging the affected ISO/IEC 25010 quality characteristic (Reliability, Maintainability, Usability, Security, Performance Efficiency, Functional Suitability, Compatibility, Portability).
- **"15 seconds is too short"** → 25 s Match + 25 s Defend on standard rounds, with two faster Lightning rounds (20 s match-only) and one Audit (boss) round at the end (30 s + 35 s).
- **"Theme lacks contrast of colours"** → four colour-coded card families (red anomaly / blue activity / green approach / purple quality) on a dark navy base, each WCAG AA against the background.

(Action cards from the design proposal are deferred to Week 4 — see `design.md` § 12.)

## Repository layout

```
Seng-436/
├── README.md                  # this file
├── design.md                  # full game design (companion to instructor feedback)
├── technical-spec.md          # technical decisions, file layout, scope
└── prototype/
    ├── index.html             # entry point — open this to play
    ├── styles.css
    ├── data.js                # scenarios, concept cards, qualities, scoring
    └── game.js                # state machine, AI opponent, rendering, scoring
```

## Round scoring (cheat sheet)

| Round type | Max points | What you must do |
|---|---:|---|
| Standard (×10) | 3 | Match correct + Defend reason correct + Quality tag correct |
| Lightning (×4) | 1 | Match the correct concept card |
| Audit (×1) | 5 | Match + reason + primary quality (with bonus for an additional related quality) |

Game total max: **39 points** across 15 rounds.

## Learning objectives

After playing the game, participants will be able to:

1. Classify a software anomaly into the **Error → Defect → Failure** chain given a scenario.
2. Distinguish **Verification** from **Validation** in context.
3. Distinguish **Static testing** from **Dynamic testing**.
4. Map a 29119-1 testing event to the affected **ISO/IEC 25010** quality characteristic.
5. **Justify** a classification decision with a correct conceptual reason — not just a label.


