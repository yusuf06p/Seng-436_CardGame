/* ==========================================================================
   ISO TESTIT! — Game data
   Sets window.GAME_DATA so game.js can consume it.
   File:// safe — no fetch, no modules.
   ========================================================================== */

(function () {
  "use strict";

  // ---------- Concept cards ----------
  // Family: "anomaly" | "activity" | "approach"
  // (Quality cards are not in hand — they live in QUALITIES below)
  const CONCEPT_CARDS = [
    { id: "error",        family: "anomaly",  name: "Error",        short: "Human action that introduces a flaw." },
    { id: "defect",       family: "anomaly",  name: "Defect",       short: "Static flaw inside a work product." },
    { id: "failure",      family: "anomaly",  name: "Failure",      short: "Observable malfunction at runtime." },
    { id: "verification", family: "activity", name: "Verification", short: "Are we building the product right?" },
    { id: "validation",   family: "activity", name: "Validation",   short: "Are we building the right product?" },
    { id: "static",       family: "approach", name: "Static Test",  short: "No execution: reviews, inspections." },
    { id: "dynamic",      family: "approach", name: "Dynamic Test", short: "Code/system is executed." }
  ];

  // ---------- ISO/IEC 25010 quality characteristics ----------
  const QUALITIES = [
    { id: "functional_suitability", name: "Functional Suitability" },
    { id: "performance_efficiency", name: "Performance Efficiency" },
    { id: "compatibility",          name: "Compatibility" },
    { id: "usability",              name: "Usability" },
    { id: "reliability",            name: "Reliability" },
    { id: "security",               name: "Security" },
    { id: "maintainability",        name: "Maintainability" },
    { id: "portability",            name: "Portability" }
  ];

  // ---------- Concept reminders shown on the Resolve screen ----------
  const REMINDERS = {
    error:        "An Error is a human action that produces an incorrect result. It happens in the person, before any artefact is touched.",
    defect:       "A Defect is a static flaw that already lives inside an artefact (code, design, requirements). It exists whether the system is running or not.",
    failure:      "A Failure is an observable, dynamic malfunction — the system is running and producing the wrong behaviour.",
    verification: "Verification asks 'are we building the product right?' — checking conformance to a specification.",
    validation:   "Validation asks 'are we building the right product?' — checking conformance to user needs.",
    static:       "Static testing examines work products without executing code (reviews, walkthroughs, inspections, static analysis).",
    dynamic:      "Dynamic testing observes behaviour by actually executing the code or system."
  };

  // ---------- Scenarios ----------
  // round_type: "standard" | "lightning" | "audit"
  // For audit, expected.match holds the primary card; expected.also lists
  // additional concepts the scenario also exercises (used in Defend reasoning).
  const SCENARIOS = [
    {
      id: "S01",
      text: "A developer misreads the spec and codes the discount threshold as 100 TL instead of 1000 TL. The mistake is not yet committed.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Error / Defect / Failure)",
      expected: { match: "error", quality: "functional_suitability" },
      rationale: {
        correct_id: "r1",
        options: [
          { id: "r1", text: "It is a human action that introduces a flaw — nothing is in the artefact yet." },
          { id: "r2", text: "It is a static flaw already living inside the codebase." },
          { id: "r3", text: "It is an observable malfunction during system execution." }
        ]
      },
      explanation:
        "A misunderstanding while writing code is a human action — that is an Error. It only becomes a Defect once the misunderstanding is actually written into a work product."
    },
    {
      id: "S02",
      text: "During a code review on the checkout module, an off-by-one loop is discovered. The bug has not yet shipped to production.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Defect) and § 6 (Static testing)",
      expected: { match: "defect", quality: "maintainability" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "It is observable runtime behaviour seen by the end user." },
          { id: "r2", text: "It is a static flaw discovered inside an artefact, before execution." },
          { id: "r3", text: "It is purely a human misunderstanding with no artefact yet." }
        ]
      },
      explanation:
        "A flaw found inside an artefact (here, source code) before any user observes a malfunction is a Defect. Code reviews are static testing — no execution needed."
    },
    {
      id: "S03",
      text: "In production, the export button hangs forever for files larger than 20 MB.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Failure)",
      expected: { match: "failure", quality: "performance_efficiency" },
      rationale: {
        correct_id: "r1",
        options: [
          { id: "r1", text: "The system is running and exhibiting wrong behaviour — that is a Failure." },
          { id: "r2", text: "It is a static flaw discovered before execution." },
          { id: "r3", text: "It is a human mistake before any artefact existed." }
        ]
      },
      explanation:
        "If users observe wrong behaviour while the system is running, you are looking at a Failure. The underlying Defect (e.g. unbounded loop) is the cause; the Failure is what you see."
    },
    {
      id: "S04",
      text: "The team checks each delivered user story against the acceptance criteria the customer signed off on.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Validation)",
      expected: { match: "validation", quality: "functional_suitability" },
      rationale: {
        correct_id: "r3",
        options: [
          { id: "r1", text: "It is checking conformance to an internal architecture document." },
          { id: "r2", text: "It is executing tests to find runtime defects." },
          { id: "r3", text: "It is checking that the product meets the user's actual needs." }
        ]
      },
      explanation:
        "Validation answers 'are we building the right product?' — comparing the product to user needs and acceptance criteria, not to an internal spec."
    },
    {
      id: "S05",
      text: "QA reviews the architecture document against the requirements specification before any code is written.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Verification, Static testing)",
      expected: { match: "verification", quality: "maintainability" },
      rationale: {
        correct_id: "r1",
        options: [
          { id: "r1", text: "It is checking that an artefact conforms to its specification." },
          { id: "r2", text: "It is checking that the product meets user needs." },
          { id: "r3", text: "It is observing the system running in production." }
        ]
      },
      explanation:
        "Verification asks whether each artefact conforms to its specification. Reviewing one artefact against another, with no execution, is classic verification + static testing."
    },
    {
      id: "S06",
      text: "The test team runs the full regression suite on the new build and finds two cases failing.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Dynamic testing)",
      expected: { match: "dynamic", quality: "reliability" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "Nothing is being executed — only documents are inspected." },
          { id: "r2", text: "The code is being executed against expected results." },
          { id: "r3", text: "It is purely a human mistake before any artefact exists." }
        ]
      },
      explanation:
        "Running tests means executing the code. Anything that involves running the system and comparing results is dynamic testing."
    },
    {
      id: "S07",
      text: "Three engineers walk through the design document line-by-line in a scheduled meeting, looking for inconsistencies.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Static testing — walkthrough)",
      expected: { match: "static", quality: "maintainability" },
      rationale: {
        correct_id: "r1",
        options: [
          { id: "r1", text: "No execution — work products are inspected by people." },
          { id: "r2", text: "The system is being executed and observed." },
          { id: "r3", text: "It is checking the product against user acceptance criteria." }
        ]
      },
      explanation:
        "A walkthrough is a form of static testing: nothing executes, people inspect a work product. Reviews, walkthroughs, inspections and static analysis all live here."
    },
    {
      id: "S08",
      text: "After login, a user notices that sensitive email addresses appear inside the URL query string.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Failure) — quality: ISO 25010 Security",
      expected: { match: "failure", quality: "security" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "Nothing has executed yet; the flaw is only in the spec." },
          { id: "r2", text: "The system is running and behaving in a way it should not." },
          { id: "r3", text: "It is a human action — a developer misread something." }
        ]
      },
      explanation:
        "If the system is up and producing the wrong behaviour, that is a Failure. The underlying Defect (e.g. wrong HTTP method) is the cause, but what you observed is the Failure."
    },
    {
      id: "S09",
      text: "A code reviewer flags a method that swallows every exception silently. The reviewer says this will make later debugging painful.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Defect) and § 6 (Static testing)",
      expected: { match: "defect", quality: "maintainability" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "It is a runtime behaviour observed by the user." },
          { id: "r2", text: "It is a static flaw in code that will hurt future quality." },
          { id: "r3", text: "It is a human mistake that has not yet reached any artefact." }
        ]
      },
      explanation:
        "The flaw is already in the code (the artefact). It hasn't manifested as a failure yet, but it's clearly a Defect — and it was found by static testing (a code review)."
    },
    {
      id: "S10",
      text: "A UX writer types 'Sumbit' on the primary checkout button. The label is committed to the codebase but never noticed during review.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Defect)",
      expected: { match: "defect", quality: "usability" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "It is a human action that has not reached any artefact yet." },
          { id: "r2", text: "It is now a static flaw inside the artefact (the code)." },
          { id: "r3", text: "It is a runtime malfunction observed during execution." }
        ]
      },
      explanation:
        "The original typo was the Error. Once the wrong label is committed to the codebase it becomes a Defect — present in the artefact, regardless of whether the page is rendered yet."
    },
    {
      id: "S11",
      text: "On the day of the demo the customer says 'this is not what we asked for' — the team built a working product, but for the wrong workflow.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Validation)",
      expected: { match: "validation", quality: "functional_suitability" },
      rationale: {
        correct_id: "r3",
        options: [
          { id: "r1", text: "The team failed at conformance to an internal specification." },
          { id: "r2", text: "It is purely a runtime defect of one specific feature." },
          { id: "r3", text: "Validation against actual user needs failed — the wrong product was built." }
        ]
      },
      explanation:
        "When the product is internally consistent but does not match what the user actually needs, the failing activity is Validation, not Verification."
    },
    {
      id: "S12",
      text: "An engineer runs a load test that ramps up to 5,000 simulated users, watching response times and error rates.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Dynamic testing) — quality: Performance Efficiency",
      expected: { match: "dynamic", quality: "performance_efficiency" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "The team is reviewing a document, not running anything." },
          { id: "r2", text: "The system is being executed under controlled load." },
          { id: "r3", text: "It is a human action prior to any artefact existing." }
        ]
      },
      explanation:
        "Load testing executes the system, observes its dynamic behaviour, and is therefore a form of dynamic testing — typically used to assess Performance Efficiency."
    },
    {
      id: "S13",
      text: "A team member opens the requirements document and silently spots a contradictory clause about user roles. They mark it for the author.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Static testing — informal review)",
      expected: { match: "static", quality: "functional_suitability" },
      rationale: {
        correct_id: "r1",
        options: [
          { id: "r1", text: "Reading and inspecting a document with no execution involved." },
          { id: "r2", text: "Executing the system to observe its behaviour." },
          { id: "r3", text: "Acting on user feedback during acceptance testing." }
        ]
      },
      explanation:
        "Inspecting a work product (requirements doc) without executing anything is static testing. Reviews, walkthroughs and inspections all qualify."
    },
    {
      id: "S14",
      text: "A new mobile build crashes on launch on Android 9 devices, while it works on Android 12+.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Failure) — quality: Compatibility",
      expected: { match: "failure", quality: "compatibility" },
      rationale: {
        correct_id: "r1",
        options: [
          { id: "r1", text: "The system is running and behaving incorrectly on a target environment." },
          { id: "r2", text: "It is a static flaw that has never been executed." },
          { id: "r3", text: "It is a human misunderstanding during requirements writing." }
        ]
      },
      explanation:
        "Crashing on launch on a supported environment is observable runtime behaviour — a Failure. The 25010 characteristic that maps to 'works across target environments' is Compatibility."
    },

    // ----- Audit / boss round -----
    {
      id: "S15",
      text: "During acceptance testing, the customer reports that the export PDF is unreadable on their iPad. The team traces it back to a CSS rule the design walkthrough did not flag.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5–6 (multi-concept)",
      expected: {
        match: "failure",
        quality: "compatibility",
        also_qualities: ["usability"],
        also_concepts: ["validation", "static"]
      },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "Pure verification problem — internal spec was wrong." },
          { id: "r2", text: "A Failure observed during Validation, traceable to a Defect that Static testing missed." },
          { id: "r3", text: "An Error in dynamic testing — a tester made a mistake." }
        ]
      },
      explanation:
        "Three concepts collide: a runtime malfunction (Failure) was observed during Validation (acceptance testing), and the underlying Defect was missed by Static testing (the walkthrough). Quality-wise it is mainly a Compatibility issue, with a strong Usability flavour.",
      round_type: "audit"
    }
  ];

  // Tag scenarios with default round_type if not set
  SCENARIOS.forEach(s => { if (!s.round_type) s.round_type = "standard"; });

  // Fixed for the prototype: 10 standard, 4 lightning, 1 audit. Index = round 0..14.
  const ROUND_PLAN = [
    { type: "standard",  matchSec: 25, defendSec: 25, resolveSec: 6 },
    { type: "standard",  matchSec: 25, defendSec: 25, resolveSec: 6 },
    { type: "lightning", matchSec: 20, defendSec: 0,  resolveSec: 5 },
    { type: "standard",  matchSec: 25, defendSec: 25, resolveSec: 6 },
    { type: "standard",  matchSec: 25, defendSec: 25, resolveSec: 6 },
    { type: "lightning", matchSec: 20, defendSec: 0,  resolveSec: 5 },
    { type: "standard",  matchSec: 25, defendSec: 25, resolveSec: 6 },
    { type: "standard",  matchSec: 25, defendSec: 25, resolveSec: 6 },
    { type: "lightning", matchSec: 20, defendSec: 0,  resolveSec: 5 },
    { type: "standard",  matchSec: 25, defendSec: 25, resolveSec: 6 },
    { type: "standard",  matchSec: 25, defendSec: 25, resolveSec: 6 },
    { type: "lightning", matchSec: 20, defendSec: 0,  resolveSec: 5 },
    { type: "standard",  matchSec: 25, defendSec: 25, resolveSec: 6 },
    { type: "standard",  matchSec: 25, defendSec: 25, resolveSec: 6 },
    { type: "audit",     matchSec: 30, defendSec: 35, resolveSec: 8 }
  ];

  // ---------- Scoring ----------
  const SCORING = {
    standard: {
      perfect:        3,   // match + reason + quality all correct
      reason_correct: 2,   // match + reason correct, quality wrong
      match_only:     1,   // match correct, reason wrong
      wrong:          0
    },
    lightning: { correct: 1, wrong: 0 },
    audit:     {
      match: 2,
      reason: 2,
      quality_primary: 1,
      quality_bonus: 1
    }
  };

  // ---------- Expose ----------
  window.GAME_DATA = {
    CONCEPT_CARDS,
    QUALITIES,
    SCENARIOS,
    ROUND_PLAN,
    SCORING,
    REMINDERS
  };
})();
