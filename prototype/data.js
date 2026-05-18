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
    },
    {
      id: "S16",
      text: "A team runs an automated static analysis tool overnight. The tool flags several SQL injection vulnerabilities in the newly committed code.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Static testing) - yenisorular (Static Analysis Tools)",
      expected: { match: "static", quality: "security" },
      rationale: {
        correct_id: "r1",
        options: [
          { id: "r1", text: "The tool inspects the code without executing it." },
          { id: "r2", text: "The code is being executed to find vulnerabilities." },
          { id: "r3", text: "It is checking if the product meets user business needs." }
        ]
      },
      explanation: "Static analysis tools examine source code for issues without running the code. Security vulnerabilities found this way are Defects caught via Static Testing.",
      round_type: "standard"
    },
    {
      id: "S17",
      text: "During User Acceptance Testing (UAT), stakeholders realize the new risk management dashboard is too cluttered and difficult to navigate, even though it meets the specification.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Validation) - yenisorular (Stakeholder Involvement)",
      expected: { match: "validation", quality: "usability" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "The system failed to meet internal architectural guidelines." },
          { id: "r2", text: "It fails to meet the actual needs and expectations of the user." },
          { id: "r3", text: "It is a static flaw in the codebase." }
        ]
      },
      explanation: "Even if the spec was followed, UAT is about Validation—ensuring the right product was built for the user. A cluttered UI is a Usability issue.",
      round_type: "standard"
    },
    {
      id: "S18",
      text: "A tester misinterprets the risk prioritization matrix and focuses all automated tests on low-priority modules instead of the payment gateway.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Error) - yenisorular (Risk Prioritization)",
      expected: { match: "error", quality: "functional_suitability" },
      rationale: {
        correct_id: "r3",
        options: [
          { id: "r1", text: "It is a runtime malfunction in the payment gateway." },
          { id: "r2", text: "It is a flaw embedded in the application code." },
          { id: "r3", text: "It is a human action (misinterpretation) that leads to an incorrect outcome." }
        ]
      },
      explanation: "The tester's misunderstanding is an Error. It hasn't caused a software crash yet, but this human mistake will lead to ineffective testing.",
      round_type: "standard"
    },
    {
      id: "S19",
      text: "An automated CI/CD pipeline executes the regression test suite after a new deployment. Several tests related to user login fail.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Dynamic testing) - yenisorular (Continuous Testing)",
      expected: { match: "dynamic", quality: "reliability" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "The pipeline is statically analyzing the code." },
          { id: "r2", text: "The system is being executed to verify its behavior." },
          { id: "r3", text: "It is a human mistake made during deployment." }
        ]
      },
      explanation: "Running automated tests means the code is being executed. This is Dynamic testing. Regression tests primarily ensure Reliability (the system continues to function).",
      round_type: "lightning"
    },
    {
      id: "S20",
      text: "A security expert reviews the architecture document and notices that data encryption in transit is missing from the design.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Defect) & § 6 (Static testing)",
      expected: { match: "defect", quality: "security" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "It is an observable malfunction during a network request." },
          { id: "r2", text: "It is a static flaw residing in a work product (design doc)." },
          { id: "r3", text: "It is checking the software against actual user needs." }
        ]
      },
      explanation: "A missing requirement in a design document is a Defect. It was found via Static testing (reviewing the document).",
      round_type: "standard"
    },
    {
      id: "S21",
      text: "During a risk assessment workshop, a stakeholder points out that the proposed backup strategy contradicts the company's disaster recovery policy.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Verification) - yenisorular (Risk Assessment Workshops)",
      expected: { match: "verification", quality: "reliability" },
      rationale: {
        correct_id: "r1",
        options: [
          { id: "r1", text: "It is checking a work product against a specified policy/rule." },
          { id: "r2", text: "It is observing the system fail to recover from a disaster." },
          { id: "r3", text: "It is dynamic testing of the backup system." }
        ]
      },
      explanation: "Checking a proposed strategy against an existing policy is Verification (are we building it right according to the rules?).",
      round_type: "standard"
    },
    {
      id: "S22",
      text: "In production, the application crashes and displays a stack trace to the end-user when they upload a corrupted image file.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Failure) - quality: Reliability/Security",
      expected: { match: "failure", quality: "reliability" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "It is a flaw in the code that hasn't been executed." },
          { id: "r2", text: "It is an observable malfunction happening while the system runs." },
          { id: "r3", text: "It is a human mistake made by the user." }
        ]
      },
      explanation: "An application crashing in production is a Failure. The system is running, and the malfunction is dynamically observed by the user.",
      round_type: "lightning"
    },
    {
      id: "S23",
      text: "A peer review of a test script reveals that it asserts the wrong expected value due to a copy-paste mistake by the developer.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Defect) - yenisorular (Peer Reviews)",
      expected: { match: "defect", quality: "maintainability" },
      rationale: {
        correct_id: "r1",
        options: [
          { id: "r1", text: "It is a static flaw inside the test script artefact." },
          { id: "r2", text: "The test script caused the system to crash." },
          { id: "r3", text: "It is evaluating the product against user needs." }
        ]
      },
      explanation: "The copy-paste mistake is embedded in the script. It's a Defect in the testware. Peer review is a Static testing approach.",
      round_type: "standard"
    },
    {
      id: "S24",
      text: "An automated script uses a headless browser to click through the checkout process and verifies that the total price updates correctly.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Dynamic testing)",
      expected: { match: "dynamic", quality: "functional_suitability" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "The script is statically analyzing the HTML structure." },
          { id: "r2", text: "The script is executing the application and observing its behavior." },
          { id: "r3", text: "It is a human error during manual testing." }
        ]
      },
      explanation: "Using a headless browser to interact with the application and check functionality is Dynamic testing.",
      round_type: "lightning"
    },
    {
      id: "S25",
      text: "A project manager allocates only one week for performance testing, failing to realize that the risk register categorized performance as 'Critical Risk'.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Error) - yenisorular (Resource Assessment Challenge)",
      expected: { match: "error", quality: "performance_efficiency" },
      rationale: {
        correct_id: "r3",
        options: [
          { id: "r1", text: "It is a static flaw in the application code." },
          { id: "r2", text: "It is an observable runtime failure of the server." },
          { id: "r3", text: "It is a human mistake in planning that will impact quality." }
        ]
      },
      explanation: "A bad planning decision is a human Error. It hasn't manifested as a Defect in the software yet, but it creates high risk.",
      round_type: "standard"
    },
    {
      id: "S26",
      text: "A mobile application works perfectly on iOS, but UI elements overlap and become unclickable on various Android tablets.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Failure) - quality: Compatibility",
      expected: { match: "failure", quality: "compatibility" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "It is a static design flaw found in the wireframes." },
          { id: "r2", text: "The system is executing and behaving incorrectly in a specific environment." },
          { id: "r3", text: "It is a failure to meet internal code standards." }
        ]
      },
      explanation: "The app is running and failing visually. This observable runtime issue is a Failure, specifically relating to Compatibility across devices.",
      round_type: "lightning"
    },
    {
      id: "S27",
      text: "An architect inspects an API integration plan to ensure it strictly follows the REST constraints defined in the company's technical guidelines.",
      clause_ref: "ISO/IEC 29119-1:2022 § 6 (Verification)",
      expected: { match: "verification", quality: "maintainability" },
      rationale: {
        correct_id: "r1",
        options: [
          { id: "r1", text: "It checks conformance to an internal specification/guideline." },
          { id: "r2", text: "It checks if the user will actually like the API." },
          { id: "r3", text: "The API is being executed and tested." }
        ]
      },
      explanation: "Checking a plan against technical guidelines without executing code is Verification and Static Testing.",
      round_type: "standard"
    },
    {
      id: "S28",
      text: "A team integrates their test automation suite into the CI/CD pipeline, but false positives occur constantly because the test database is not reset between runs.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Defect) - yenisorular (Test Environment Setup Challenge)",
      expected: { match: "defect", quality: "reliability" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "It is a human mistake that hasn't affected anything yet." },
          { id: "r2", text: "It is a static flaw in the test environment configuration." },
          { id: "r3", text: "It is validation against user needs." }
        ]
      },
      explanation: "A bad configuration in the test environment/pipeline is a Defect in the testware. It causes the dynamic tests to fail falsely.",
      round_type: "standard"
    },
    {
      id: "S29",
      text: "The lead developer writes a complex algorithm but forgets to handle null inputs. The code is merged into the main branch.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 (Defect)",
      expected: { match: "defect", quality: "reliability" },
      rationale: {
        correct_id: "r2",
        options: [
          { id: "r1", text: "It is a runtime failure happening in production." },
          { id: "r2", text: "It is a static flaw now living inside the codebase." },
          { id: "r3", text: "It is a pure human thought process with no code written yet." }
        ]
      },
      explanation: "Forgetting to handle nulls is the Error. Once merged into the code, it becomes a Defect. It will become a Failure if executed with a null input.",
      round_type: "standard"
    },
    {
      id: "S30",
      text: "A critical bug is found in production. Investigation reveals the test environment was misconfigured, causing automated dynamic tests to pass falsely. The underlying code flaw was never caught.",
      clause_ref: "ISO/IEC 29119-1:2022 § 5 & 6 (multi-concept)",
      expected: {
        match: "failure",
        quality: "reliability",
        also_qualities: ["maintainability", "functional_suitability"],
        also_concepts: ["dynamic", "defect", "error"]
      },
      rationale: {
        correct_id: "r3",
        options: [
          { id: "r1", text: "It is purely an Error made by a human." },
          { id: "r2", text: "It is a Static testing failure." },
          { id: "r3", text: "A Failure in production traceable to a Defect in the test environment that broke Dynamic testing." }
        ]
      },
      explanation: "This Audit round combines concepts: A production Failure caused by a Defect in the code, which was missed because of another Defect in the test environment, undermining the Dynamic testing.",
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
