/* ==========================================================================
   ISO TESTIT! — Game logic + UI
   Single IIFE. State machine: lobby -> reveal -> match -> defend -> resolve
   -> (loop) -> end.  No framework.  file:// safe.
   ========================================================================== */

(function () {
  "use strict";

  const D = window.GAME_DATA;
  if (!D) { console.error("GAME_DATA missing — data.js failed to load"); return; }

  // ---------- DOM refs ----------
  const $ = (id) => document.getElementById(id);
  const dom = {
    screens: {
      lobby:  $("screen-lobby"),
      round:  $("screen-round"),
      end:    $("screen-end")
    },
    rules: {
      toggle: $("rules-toggle"),
      panel:  $("rules-panel"),
      close:  $("rules-close"),
      body:   $("rules-body"),
      lobbyOpen: $("open-rules-from-lobby")
    },
    lobby: {
      name: $("player-name"),
      start: $("start-game")
    },
    round: {
      counter:   $("round-counter"),
      typeLabel: $("round-type-label"),
      playerNameDisplay: $("player-name-display"),
      playerScore:   $("player-score"),
      opponentScore: $("opponent-score"),
      scenarioText:   $("scenario-text"),
      scenarioClause: $("scenario-clause"),
      timerText: $("timer-text"),
      timerFill: $("timer-fill"),
      hand:      $("hand"),
      defendPanel:    $("defend-panel"),
      rationaleChips: $("rationale-chips"),
      qualityChips:   $("quality-chips"),
      defendSubmit:   $("defend-submit"),
      resolveOverlay:   $("resolve-overlay"),
      resolveCard:      $("resolve-card"),
      lightningNotice:  $("lightning-notice"),
      phaseDots: {
        match:   $("phase-dot-match"),
        defend:  $("phase-dot-defend"),
        resolve: $("phase-dot-resolve")
      }
    },
    end: {
      banner:   $("end-banner"),
      subline:  $("end-subline"),
      scoreSelf: $("end-score-player"),
      scoreOpp:  $("end-score-opponent"),
      review:   $("end-review"),
      playAgain: $("play-again")
    }
  };

  // Timer ring constant (circumference for r=52)
  const RING_CIRCUMFERENCE = 326.7;

  // ---------- State ----------
  const state = {
    phase: "lobby",
    roundIndex: 0,
    scenarioPool: [],
    auditScenario: null,
    currentScenario: null,
    currentRoundPlan: null,
    player: { name: "You", score: 0 },
    opponent: { name: "AI Auditor", score: 0 },
    match: { card: null, locked: false, deadline: 0, opponentCard: null },
    defend: { rationaleId: null, qualityTagId: null, deadline: 0, opponentRationale: null, opponentQuality: null },
    history: [],
    timerHandle: null,
    revealHandle: null,
    resolveHandle: null
  };

  // ---------- Utilities ----------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showScreen(name) {
    Object.entries(dom.screens).forEach(([k, el]) => {
      el.setAttribute("aria-hidden", k === name ? "false" : "true");
    });
  }

  function clearTimers() {
    if (state.timerHandle)   { cancelAnimationFrame(state.timerHandle); state.timerHandle = null; }
    if (state.revealHandle)  { clearTimeout(state.revealHandle);        state.revealHandle = null; }
    if (state.resolveHandle) { clearTimeout(state.resolveHandle);       state.resolveHandle = null; }
  }

  function setPhaseDot(active) {
    Object.entries(dom.round.phaseDots).forEach(([k, el]) => {
      el.classList.toggle("phase-dot-active", k === active);
    });
  }

  function findCard(id)    { return D.CONCEPT_CARDS.find(c => c.id === id); }
  function findQuality(id) { return D.QUALITIES.find(q => q.id === id); }

  // ---------- Rules panel content ----------
  function renderRules() {
    dom.rules.body.innerHTML = `
      <p>You're a junior QA engineer running through a workday of incoming software events. For each event you (a) classify it correctly using ISO terminology, and (b) defend your reasoning against an audit.</p>

      <h3>Card families</h3>
      <div class="legend">
        <div class="legend-pill lp-anomaly">Anomaly</div>
        <div class="legend-pill lp-activity">Activity</div>
        <div class="legend-pill lp-approach">Approach</div>
        <div class="legend-pill lp-quality">Quality (ISO 25010)</div>
      </div>
      <ul>
        <li><strong>Anomaly</strong> — Error, Defect, Failure (the causal chain).</li>
        <li><strong>Activity</strong> — Verification, Validation.</li>
        <li><strong>Approach</strong> — Static testing, Dynamic testing.</li>
        <li><strong>Quality</strong> — the eight ISO/IEC 25010 quality characteristics, used as defence tags.</li>
      </ul>

      <h3>How a round works</h3>
      <p>Every round flows through up to three phases:</p>
      <ul>
        <li><strong>1 · Match (25 s)</strong> — read the scenario, pick the correct concept card from your hand.</li>
        <li><strong>2 · Defend (25 s)</strong> — pick the correct reason ("because…") and tag the affected ISO 25010 quality characteristic.</li>
        <li><strong>3 · Resolve</strong> — both plays are revealed. If anything was wrong, the corrective explanation is shown.</li>
      </ul>

      <h3>Round mix</h3>
      <ul>
        <li>6 standard rounds, 2 Lightning rounds (Match only, faster), 1 Audit round (multi-concept finale).</li>
      </ul>

      <h3>Scoring (standard rounds)</h3>
      <ul>
        <li>Match ✓ + Reason ✓ + Quality ✓ → <strong>3 pts</strong></li>
        <li>Match ✓ + Reason ✓, Quality ✗ → <strong>2 pts</strong></li>
        <li>Match ✓, Reason ✗ → <strong>1 pt</strong> (memorising the answer is not enough)</li>
        <li>Match ✗ → <strong>0 pts</strong> + corrective explanation</li>
      </ul>
      <p>Lightning rounds are 1 pt each. The Audit round is up to 5 pts.</p>

      <h3>Winning</h3>
      <p>End of round 9, highest total score wins. Reasoning depth wins ties.</p>

      <h3>Why this matters</h3>
      <p>The Defend phase is what separates understanding from memorisation. If you pick the right card for the wrong reason, you keep the card and the misconception stays visible — that is by design.</p>
    `;
  }

  function setRulesOpen(open) {
    dom.rules.panel.setAttribute("aria-hidden", open ? "false" : "true");
  }

  // ---------- Lobby ----------
  function bindLobby() {
    dom.lobby.start.addEventListener("click", startGame);
    dom.lobby.name.addEventListener("keydown", (e) => {
      if (e.key === "Enter") startGame();
    });
    dom.rules.toggle.addEventListener("click", () => setRulesOpen(dom.rules.panel.getAttribute("aria-hidden") !== "false"));
    dom.rules.close.addEventListener("click", () => setRulesOpen(false));
    dom.rules.lobbyOpen.addEventListener("click", () => setRulesOpen(true));
    dom.end.playAgain.addEventListener("click", () => {
      showScreen("lobby");
      state.phase = "lobby";
    });
  }

  function startGame() {
    const raw = dom.lobby.name.value.trim();
    state.player.name = raw || "You";
    state.player.score = 0;
    state.opponent.score = 0;
    state.history = [];
    state.roundIndex = 0;

    // Shuffle 14 standard scenarios; reserve audit (S15) for round 9
    const standardPool = D.SCENARIOS.filter(s => s.round_type === "standard");
    state.scenarioPool = shuffle(standardPool);
    state.auditScenario = D.SCENARIOS.find(s => s.round_type === "audit");

    dom.round.playerNameDisplay.textContent = state.player.name;
    showScreen("round");
    enterReveal();
  }

  // ---------- Round flow ----------
  function pickScenarioForRound(idx) {
    state.currentRoundPlan = D.ROUND_PLAN[idx];
    if (state.currentRoundPlan.type === "audit") {
      return state.auditScenario;
    }
    // Pop the next scenario from the shuffled pool. Lightning rounds reuse
    // the same pool but tagged via round plan, so we don't need separate ids.
    return state.scenarioPool[idx % state.scenarioPool.length];
  }

  function enterReveal() {
    clearTimers();
    state.phase = "reveal";

    state.match  = { card: null, locked: false, deadline: 0, opponentCard: null };
    state.defend = { rationaleId: null, qualityTagId: null, deadline: 0, opponentRationale: null, opponentQuality: null };

    state.currentScenario = pickScenarioForRound(state.roundIndex);

    // Header
    dom.round.counter.textContent = String(state.roundIndex + 1);
    const t = state.currentRoundPlan.type;
    const labelMap = { standard: "Standard", lightning: "Lightning ⚡", audit: "Audit (Boss)" };
    dom.round.typeLabel.textContent = labelMap[t];
    dom.round.typeLabel.className = "round-type" + (t === "lightning" ? " is-lightning" : t === "audit" ? " is-audit" : "");

    // Scenario
    dom.round.scenarioText.textContent = state.currentScenario.text;
    dom.round.scenarioClause.textContent = state.currentScenario.clause_ref || "";

    // Reset UI
    dom.round.defendPanel.hidden = true;
    dom.round.resolveOverlay.hidden = true;
    dom.round.resolveCard.innerHTML = "";
    dom.round.timerText.textContent = "—";
    dom.round.timerFill.style.strokeDashoffset = "0";
    dom.round.timerFill.classList.remove("is-warning");
    setPhaseDot("match");

    dom.round.lightningNotice.hidden = (t !== "lightning");

    renderHand({ disabled: true });
    updateScores();

    // brief pause so player can read the scenario before timer starts
    state.revealHandle = setTimeout(enterMatch, 1400);
  }

  function enterMatch() {
    state.phase = "match";
    setPhaseDot("match");
    dom.round.lightningNotice.hidden = true;
    renderHand({ disabled: false });

    const ms = state.currentRoundPlan.matchSec * 1000;
    state.match.deadline = Date.now() + ms;
    runTimer(state.match.deadline, ms, onMatchTimeout);

    // AI picks immediately but doesn't reveal yet
    state.match.opponentCard = aiPickCard(state.currentScenario);
  }

  function onMatchTimeout() {
    // If player didn't pick, treat as wrong (no card)
    if (!state.match.locked) state.match.card = null;
    advanceFromMatch();
  }

  function advanceFromMatch() {
    if (state.phase !== "match") return;
    clearTimers();
    if (state.currentRoundPlan.type === "lightning") {
      enterResolve();
    } else {
      enterDefend();
    }
  }

  function enterDefend() {
    state.phase = "defend";
    setPhaseDot("defend");
    renderHand({ disabled: true, lockedId: state.match.card ? state.match.card.id : null });

    dom.round.defendPanel.hidden = false;
    renderRationaleChips();
    renderQualityChips();
    dom.round.defendSubmit.disabled = true;
    dom.round.defendSubmit.onclick = onDefendSubmit;

    const ms = state.currentRoundPlan.defendSec * 1000;
    state.defend.deadline = Date.now() + ms;
    runTimer(state.defend.deadline, ms, onDefendTimeout);

    // AI fills its defence
    state.defend.opponentRationale = aiPickRationale(state.currentScenario);
    state.defend.opponentQuality   = aiPickQuality(state.currentScenario);
  }

  function onDefendTimeout() {
    advanceFromDefend();
  }

  function onDefendSubmit() {
    if (!state.defend.rationaleId || !state.defend.qualityTagId) return;
    advanceFromDefend();
  }

  function advanceFromDefend() {
    clearTimers();
    enterResolve();
  }

  function enterResolve() {
    state.phase = "resolve";
    setPhaseDot("resolve");
    dom.round.defendPanel.hidden = true;

    // Hide hand timer ring during resolve (set to full)
    dom.round.timerFill.style.strokeDashoffset = "0";
    dom.round.timerText.textContent = "✓";

    const result = scoreRound();
    state.player.score   += result.playerPoints;
    state.opponent.score += result.opponentPoints;

    state.history.push({
      round: state.roundIndex + 1,
      type:  state.currentRoundPlan.type,
      scenario: state.currentScenario,
      playerPick:    state.match.card ? state.match.card.id : null,
      opponentPick:  state.match.opponentCard ? state.match.opponentCard.id : null,
      playerRationale: state.defend.rationaleId,
      playerQuality:   state.defend.qualityTagId,
      points: result.playerPoints
    });

    renderResolve(result);
    updateScores();

    dom.round.resolveOverlay.hidden = false;

    const continueBtn = document.getElementById("resolve-continue");
    if (continueBtn) {
      continueBtn.onclick = () => {
        clearTimers();
        advanceFromResolve();
      };
    }
  }

  function advanceFromResolve() {
    state.roundIndex += 1;
    if (state.roundIndex >= D.ROUND_PLAN.length) {
      enterEnd();
    } else {
      enterReveal();
    }
  }

  function enterEnd() {
    clearTimers();
    state.phase = "end";

    const p = state.player.score;
    const o = state.opponent.score;
    let banner, subline, klass;
    if (p > o) {
      banner = `${state.player.name} wins!`;
      subline = "You out-reasoned the AI Auditor. Nice work.";
      klass = "is-win";
    } else if (p < o) {
      banner = "AI Auditor wins";
      subline = "Close one — defend more reasons next time.";
      klass = "is-lose";
    } else {
      banner = "It's a tie";
      subline = "Even score. Replay for the tiebreaker.";
      klass = "is-tie";
    }
    dom.end.banner.textContent = banner;
    dom.end.banner.className = "end-banner " + klass;
    dom.end.subline.textContent = subline;
    dom.end.scoreSelf.textContent = p + " pts";
    dom.end.scoreOpp.textContent  = o + " pts";

    renderEndReview();
    showScreen("end");
  }

  // ---------- Rendering ----------
  function updateScores() {
    dom.round.playerScore.textContent   = String(state.player.score);
    dom.round.opponentScore.textContent = String(state.opponent.score);
  }

  function renderHand({ disabled, lockedId }) {
    const lock = lockedId || (state.match.card && state.match.locked ? state.match.card.id : null);
    const html = D.CONCEPT_CARDS.map(card => {
      const isLocked = lock === card.id;
      return `
        <button class="card card-${card.family}${isLocked ? " is-locked" : ""}"
                data-card-id="${card.id}" ${disabled ? "disabled" : ""}>
          <span class="card-family">${card.family.toUpperCase()}</span>
          <span class="card-name">${card.name}</span>
          <span class="card-short">${card.short}</span>
        </button>`;
    }).join("");
    dom.round.hand.innerHTML = html;

    if (!disabled) {
      Array.from(dom.round.hand.querySelectorAll(".card")).forEach(btn => {
        btn.addEventListener("click", onCardClick);
      });
    }
  }

  function onCardClick(e) {
    if (state.phase !== "match" || state.match.locked) return;
    const id = e.currentTarget.dataset.cardId;
    state.match.card = findCard(id);
    state.match.locked = true;
    // Brief visual lock then auto-advance
    renderHand({ disabled: true, lockedId: id });
    setTimeout(advanceFromMatch, 350);
  }

  function renderRationaleChips() {
    const opts = state.currentScenario.rationale.options;
    dom.round.rationaleChips.innerHTML = opts.map(opt =>
      `<button class="chip" data-rationale-id="${opt.id}">${opt.text}</button>`
    ).join("");
    Array.from(dom.round.rationaleChips.querySelectorAll(".chip")).forEach(b => {
      b.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.rationaleId;
        state.defend.rationaleId = id;
        Array.from(dom.round.rationaleChips.querySelectorAll(".chip")).forEach(x => {
          x.classList.toggle("is-selected", x.dataset.rationaleId === id);
        });
        maybeEnableSubmit();
      });
    });
  }

  function renderQualityChips() {
    dom.round.qualityChips.innerHTML = D.QUALITIES.map(q =>
      `<button class="chip" data-quality-id="${q.id}">${q.name}</button>`
    ).join("");
    Array.from(dom.round.qualityChips.querySelectorAll(".chip")).forEach(b => {
      b.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.qualityId;
        state.defend.qualityTagId = id;
        Array.from(dom.round.qualityChips.querySelectorAll(".chip")).forEach(x => {
          x.classList.toggle("is-selected", x.dataset.qualityId === id);
        });
        maybeEnableSubmit();
      });
    });
  }

  function maybeEnableSubmit() {
    dom.round.defendSubmit.disabled = !(state.defend.rationaleId && state.defend.qualityTagId);
  }

  // ---------- Timer ----------
  function runTimer(deadline, totalMs, onExpire) {
    function frame() {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        dom.round.timerText.textContent = "0";
        dom.round.timerFill.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
        state.timerHandle = null;
        onExpire();
        return;
      }
      const frac = remaining / totalMs;
      const offset = RING_CIRCUMFERENCE * (1 - frac);
      dom.round.timerFill.style.strokeDashoffset = String(offset);
      dom.round.timerText.textContent = String(Math.ceil(remaining / 1000));
      dom.round.timerFill.classList.toggle("is-warning", remaining < 5000);
      state.timerHandle = requestAnimationFrame(frame);
    }
    state.timerHandle = requestAnimationFrame(frame);
  }

  // ---------- Scoring ----------
  function scoreRound() {
    const sc = state.currentScenario;
    const plan = state.currentRoundPlan;

    const playerMatchOk = state.match.card && state.match.card.id === sc.expected.match;
    const opponentMatchOk = state.match.opponentCard && state.match.opponentCard.id === sc.expected.match;

    let playerPoints = 0, opponentPoints = 0;
    let playerReasonOk = false, playerQualityOk = false;
    let opponentReasonOk = false, opponentQualityOk = false;

    if (plan.type === "lightning") {
      playerPoints   = playerMatchOk   ? D.SCORING.lightning.correct : 0;
      opponentPoints = opponentMatchOk ? D.SCORING.lightning.correct : 0;
    } else if (plan.type === "audit") {
      // Audit: 2 (match) + 2 (reason) + 1 (primary quality) + 1 (bonus quality)
      playerReasonOk  = state.defend.rationaleId === sc.rationale.correct_id;
      const primaryQ  = sc.expected.quality;
      const bonusQs   = sc.expected.also_qualities || [];
      playerQualityOk = state.defend.qualityTagId === primaryQ;
      const playerBonusOk = bonusQs.includes(state.defend.qualityTagId);

      playerPoints += playerMatchOk ? D.SCORING.audit.match : 0;
      playerPoints += playerReasonOk ? D.SCORING.audit.reason : 0;
      playerPoints += playerQualityOk ? D.SCORING.audit.quality_primary : 0;
      // Bonus quality: only counted if primary already correct via primary slot
      // (we keep it simple: if player picked a "also" quality, give bonus too)
      if (playerBonusOk && !playerQualityOk) playerPoints += D.SCORING.audit.quality_bonus;

      // Opponent (AI) — simulate similar correctness
      opponentReasonOk  = state.defend.opponentRationale === sc.rationale.correct_id;
      opponentQualityOk = state.defend.opponentQuality === primaryQ;
      const opponentBonusOk = bonusQs.includes(state.defend.opponentQuality);

      opponentPoints += opponentMatchOk ? D.SCORING.audit.match : 0;
      opponentPoints += opponentReasonOk ? D.SCORING.audit.reason : 0;
      opponentPoints += opponentQualityOk ? D.SCORING.audit.quality_primary : 0;
      if (opponentBonusOk && !opponentQualityOk) opponentPoints += D.SCORING.audit.quality_bonus;
    } else {
      // Standard
      playerReasonOk  = state.defend.rationaleId === sc.rationale.correct_id;
      playerQualityOk = state.defend.qualityTagId === sc.expected.quality;
      opponentReasonOk  = state.defend.opponentRationale === sc.rationale.correct_id;
      opponentQualityOk = state.defend.opponentQuality === sc.expected.quality;

      const s = D.SCORING.standard;
      if (playerMatchOk && playerReasonOk && playerQualityOk)        playerPoints = s.perfect;
      else if (playerMatchOk && playerReasonOk)                       playerPoints = s.reason_correct;
      else if (playerMatchOk)                                         playerPoints = s.match_only;
      else                                                            playerPoints = s.wrong;

      if (opponentMatchOk && opponentReasonOk && opponentQualityOk)   opponentPoints = s.perfect;
      else if (opponentMatchOk && opponentReasonOk)                    opponentPoints = s.reason_correct;
      else if (opponentMatchOk)                                        opponentPoints = s.match_only;
      else                                                             opponentPoints = s.wrong;
    }

    return {
      playerPoints, opponentPoints,
      playerMatchOk, playerReasonOk, playerQualityOk,
      opponentMatchOk, opponentReasonOk, opponentQualityOk
    };
  }

  // ---------- Resolve render ----------
  function renderResolve(result) {
    const sc = state.currentScenario;
    const isLightning = state.currentRoundPlan.type === "lightning";

    const correctMatchCard = findCard(sc.expected.match);
    const correctReason = sc.rationale.options.find(o => o.id === sc.rationale.correct_id);
    const correctQuality = findQuality(sc.expected.quality);

    const playerCardName    = state.match.card ? state.match.card.name : "— (no pick)";
    const opponentCardName  = state.match.opponentCard ? state.match.opponentCard.name : "— (no pick)";

    const playerReasonText  = state.defend.rationaleId
      ? sc.rationale.options.find(o => o.id === state.defend.rationaleId).text
      : "— (no pick)";
    const playerQualityName = state.defend.qualityTagId
      ? findQuality(state.defend.qualityTagId).name
      : "— (no pick)";

    let headlineClass, headlineText;
    if (!result.playerMatchOk) {
      headlineClass = "is-lose";
      headlineText  = "Wrong card — penalty + correction.";
    } else if (isLightning) {
      headlineClass = "is-win";
      headlineText  = "Correct! +1 pt.";
    } else if (result.playerReasonOk && result.playerQualityOk) {
      headlineClass = "is-win";
      headlineText  = "Perfect — card, reason and quality tag all correct.";
    } else if (result.playerReasonOk) {
      headlineClass = "is-mixed";
      headlineText  = "Right card and reason — quality tag was off.";
    } else {
      headlineClass = "is-mixed";
      headlineText  = "Right card, wrong reason — misconception caught.";
    }

    const reminderText = D.REMINDERS[sc.expected.match] || "";
    const explanation  = sc.explanation || reminderText;

    const reasonRow = isLightning ? "" : `
      <div class="resolve-row">
        <div class="label">REASON</div>
        <div class="value-mark ${result.playerReasonOk ? "is-correct" : "is-wrong"}">
          ${result.playerReasonOk ? "✓" : "✗"} you: ${escapeHtml(playerReasonText)}
        </div>
        <div>correct: ${escapeHtml(correctReason.text)}</div>
      </div>
      <div class="resolve-row">
        <div class="label">25010 TAG</div>
        <div class="value-mark ${result.playerQualityOk ? "is-correct" : "is-wrong"}">
          ${result.playerQualityOk ? "✓" : "✗"} you: ${escapeHtml(playerQualityName)}
        </div>
        <div>correct: ${escapeHtml(correctQuality.name)}</div>
      </div>
    `;

    dom.round.resolveCard.innerHTML = `
      <div class="resolve-headline ${headlineClass}">${headlineText}</div>
      <div class="resolve-rows">
        <div class="resolve-row">
          <div class="label">CARD</div>
          <div class="value-mark ${result.playerMatchOk ? "is-correct" : "is-wrong"}">
            ${result.playerMatchOk ? "✓" : "✗"} you: ${escapeHtml(playerCardName)}
          </div>
          <div>correct: ${escapeHtml(correctMatchCard.name)}</div>
        </div>
        ${reasonRow}
      </div>
      <div class="resolve-explanation">${escapeHtml(explanation)}</div>
      <div class="resolve-points">
        <span class="pts-self">+${result.playerPoints} pts</span>
        <span class="pts-opponent">AI: +${result.opponentPoints} (played ${escapeHtml(opponentCardName)})</span>
      </div>
      <button id="resolve-continue" class="btn btn-primary resolve-continue-btn" type="button">
        ${state.roundIndex + 1 >= D.ROUND_PLAN.length ? "See Results" : "Next Round →"}
      </button>
    `;
  }

  function renderEndReview() {
    const rows = state.history.map(h => {
      const sc = h.scenario;
      const correctCard = findCard(sc.expected.match).name;
      const youCard = h.playerPick ? findCard(h.playerPick).name : "— (skip)";
      const matchOk = h.playerPick === sc.expected.match;
      const reason = h.playerRationale
        ? (h.playerRationale === sc.rationale.correct_id ? "<span class='ok'>✓ correct reason</span>" : "<span class='bad'>✗ wrong reason</span>")
        : "<span class='bad'>— no reason given</span>";
      const qty = h.playerQuality
        ? (h.playerQuality === sc.expected.quality ? "<span class='ok'>✓ correct 25010 tag</span>" : "<span class='bad'>✗ wrong 25010 tag</span>")
        : "<span class='bad'>— no tag</span>";
      const skipReasonForLightning = h.type === "lightning";
      return `
        <div class="review-row">
          <div class="review-head">
            <span>Round ${h.round} · ${labelOfType(h.type)}</span>
            <span>+${h.points} pts</span>
          </div>
          <div class="review-line"><strong>Scenario:</strong> ${escapeHtml(sc.text)}</div>
          <div class="review-line">
            <strong>You played:</strong> ${escapeHtml(youCard)} —
            ${matchOk ? "<span class='ok'>✓ match</span>" : "<span class='bad'>✗ correct was " + escapeHtml(correctCard) + "</span>"}
          </div>
          ${skipReasonForLightning ? "" : `<div class="review-line">${reason} · ${qty}</div>`}
          <div class="review-line"><em>${escapeHtml(D.REMINDERS[sc.expected.match] || "")}</em></div>
        </div>
      `;
    }).join("");
    dom.end.review.innerHTML = rows || "<div class='review-row'>No rounds played.</div>";
  }

  function labelOfType(t) {
    return t === "lightning" ? "Lightning ⚡" : t === "audit" ? "Audit (Boss)" : "Standard";
  }

  // ---------- AI ----------
  function aiPickCard(scenario) {
    const correctId = scenario.expected.match;
    const correct = findCard(correctId);
    const distractors = D.CONCEPT_CARDS.filter(c => c.id !== correctId);
    // 70% chance correct
    if (Math.random() < 0.7) return correct;
    // Pick a plausible distractor: same family if possible
    const sameFamily = distractors.filter(c => c.family === correct.family);
    const pool = sameFamily.length ? sameFamily : distractors;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function aiPickRationale(scenario) {
    const correctId = scenario.rationale.correct_id;
    if (Math.random() < 0.6) return correctId;
    const wrong = scenario.rationale.options.filter(o => o.id !== correctId);
    return wrong[Math.floor(Math.random() * wrong.length)].id;
  }

  function aiPickQuality(scenario) {
    const correctId = scenario.expected.quality;
    if (Math.random() < 0.5) return correctId;
    const wrong = D.QUALITIES.filter(q => q.id !== correctId);
    return wrong[Math.floor(Math.random() * wrong.length)].id;
  }

  // ---------- Misc ----------
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ---------- Boot ----------
  function boot() {
    renderRules();
    bindLobby();
    showScreen("lobby");
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
