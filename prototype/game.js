/* ==========================================================================
   ISO TESTIT! — Game logic + UI (Multiplayer via PeerJS)
   ========================================================================== */

(function () {
  "use strict";

  const D = window.GAME_DATA;
  if (!D) { console.error("GAME_DATA missing"); return; }

  const PEER_PREFIX = "isotestit-";
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
      mainControls: $("lobby-main-controls"),
      multiSetup: $("lobby-multi-setup"),
      waitingRoom: $("lobby-waiting-room"),
      name: $("player-name"),
      single: $("btn-singleplayer"),
      multi: $("btn-multiplayer"),
      createRoom: $("btn-create-room"),
      joinRoom: $("btn-join-room"),
      roomCodeInput: $("room-code-input"),
      btnStartMulti: $("btn-start-multi-game"),
      btnLeaveRoom: $("btn-leave-room"),
      displayRoomCode: $("display-room-code"),
      waitingPlayersList: $("waiting-players-list"),
      waitingStatus: $("waiting-status"),
      btnBackMain: $("btn-back-to-main")
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
      stripOpponent: $("strip-opponent"),
      phaseDots: {
        match:   $("phase-dot-match"),
        defend:  $("phase-dot-defend"),
        resolve: $("phase-dot-resolve")
      }
    },
    end: {
      banner:   $("end-banner"),
      subline:  $("end-subline"),
      leaderboard: $("end-leaderboard"),
      review:   $("end-review"),
      playAgain: $("play-again")
    }
  };

  const RING_CIRCUMFERENCE = 326.7;

  // ---------- State ----------
  const state = {
    mode: "single", // "single" or "multi"
    network: { peer: null, conn: null, conns: [], isHost: false, roomId: null, players: {} },
    myId: "p1",
    phase: "lobby",
    roundIndex: 0,
    scenarioPool: [],
    auditScenario: null,
    currentScenario: null,
    currentRoundPlan: null,
    history: [],
    timerHandle: null,
    revealHandle: null,
    resolveHandle: null,
    match: { locked: false, deadline: 0 },
    defend: { locked: false, deadline: 0 }
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
    if (state.timerHandle)   { clearInterval(state.timerHandle); state.timerHandle = null; }
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
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // ---------- Rules ----------
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
  function setRulesOpen(open) { dom.rules.panel.setAttribute("aria-hidden", open ? "false" : "true"); }

  // ---------- Lobby & Networking ----------
  function bindLobby() {
    dom.rules.toggle.addEventListener("click", () => setRulesOpen(dom.rules.panel.getAttribute("aria-hidden") !== "false"));
    dom.rules.close.addEventListener("click", () => setRulesOpen(false));
    dom.rules.lobbyOpen.addEventListener("click", () => setRulesOpen(true));
    dom.end.playAgain.addEventListener("click", () => {
      resetLobby();
      showScreen("lobby");
    });

    dom.lobby.single.onclick = () => {
      state.mode = "single";
      startGame();
    };
    dom.lobby.multi.onclick = () => {
      state.mode = "multi";
      dom.lobby.mainControls.hidden = true;
      dom.lobby.multiSetup.hidden = false;
    };
    dom.lobby.btnBackMain.onclick = resetLobby;
    dom.lobby.createRoom.onclick = createRoom;
    dom.lobby.joinRoom.onclick = joinRoom;
    dom.lobby.btnLeaveRoom.onclick = resetLobby;
    dom.lobby.btnStartMulti.onclick = hostStartGame;
  }

  function resetLobby() {
    if (state.network.peer) { state.network.peer.destroy(); state.network.peer = null; }
    state.network = { peer: null, conn: null, conns: [], isHost: false, roomId: null, players: {} };
    dom.lobby.mainControls.hidden = false;
    dom.lobby.multiSetup.hidden = true;
    dom.lobby.waitingRoom.hidden = true;
  }

  function getPlayerName() {
    return dom.lobby.name.value.trim() || "You";
  }

  // Generate 4-letter room code
  function genRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let r = '';
    for(let i=0; i<4; i++) r += chars[Math.floor(Math.random() * chars.length)];
    return r;
  }

  function initMultiplayerPlayer(id, name, isHost) {
    state.network.players[id] = { id, name, score: 0, isHost, matchPick: null, rationale: null, quality: null, ready: false };
  }

  function createRoom() {
    const roomId = genRoomId();
    state.network.isHost = true;
    state.network.roomId = roomId;
    state.myId = "host";
    
    dom.lobby.multiSetup.hidden = true;
    dom.lobby.waitingRoom.hidden = false;
    dom.lobby.displayRoomCode.textContent = roomId;
    dom.lobby.waitingStatus.textContent = "Creating room...";
    dom.lobby.btnStartMulti.hidden = true;

    state.network.peer = new Peer(PEER_PREFIX + roomId);
    state.network.peer.on('open', (id) => {
      dom.lobby.waitingStatus.textContent = "Waiting for players...";
      dom.lobby.btnStartMulti.hidden = false;
      state.network.players = {};
      initMultiplayerPlayer(state.myId, getPlayerName(), true);
      renderWaitingRoom();
    });

    state.network.peer.on('connection', (conn) => {
      state.network.conns.push(conn);
      conn.on('data', (data) => handleHostData(conn, data));
      conn.on('close', () => {
        state.network.conns = state.network.conns.filter(c => c !== conn);
        delete state.network.players[conn.peer];
        broadcastLobby();
        renderWaitingRoom();
      });
    });
  }

  function joinRoom() {
    const code = dom.lobby.roomCodeInput.value.trim().toUpperCase();
    if (!code) return;

    dom.lobby.multiSetup.hidden = true;
    dom.lobby.waitingRoom.hidden = false;
    dom.lobby.displayRoomCode.textContent = code;
    dom.lobby.waitingStatus.textContent = "Connecting...";
    dom.lobby.btnStartMulti.hidden = true;

    state.network.isHost = false;
    state.network.roomId = code;
    
    state.network.peer = new Peer();
    state.network.peer.on('open', (id) => {
      state.myId = id;
      const conn = state.network.peer.connect(PEER_PREFIX + code);
      state.network.conn = conn;
      
      conn.on('open', () => {
        dom.lobby.waitingStatus.textContent = "Connected. Waiting for host to start...";
        conn.send({ type: 'JOIN', name: getPlayerName() });
      });
      conn.on('data', handleClientData);
      conn.on('close', () => {
        alert("Disconnected from host.");
        resetLobby();
      });
    });
  }

  function broadcast(data) {
    if (!state.network.isHost) return;
    state.network.conns.forEach(c => c.send(data));
  }
  function sendToHost(data) {
    if (state.network.isHost) {
       handleHostData({peer: state.myId}, data);
    } else {
       if (state.network.conn) state.network.conn.send(data);
    }
  }

  // Host logic
  function handleHostData(conn, data) {
    const peerId = conn.peer;
    if (data.type === 'JOIN') {
      initMultiplayerPlayer(peerId, data.name, false);
      broadcastLobby();
      renderWaitingRoom();
    } else if (data.type === 'ACTION') {
      const p = state.network.players[peerId];
      if (!p) return;
      if (state.phase === 'match' && data.action === 'match') {
        p.matchPick = data.cardId;
        p.ready = true;
        checkPhaseAdvance();
      } else if (state.phase === 'defend' && data.action === 'defend') {
        p.rationale = data.rationaleId;
        p.quality = data.qualityId;
        p.ready = true;
        checkPhaseAdvance();
      }
    }
  }

  function broadcastLobby() {
    broadcast({ type: 'LOBBY', players: state.network.players });
  }

  // Client logic
  function handleClientData(data) {
    if (data.type === 'LOBBY') {
      state.network.players = data.players;
      renderWaitingRoom();
    } else if (data.type === 'START') {
      state.scenarioPool = data.pool;
      state.auditScenario = data.audit;
      state.roundIndex = 0;
      state.history = [];
      dom.round.playerNameDisplay.textContent = getPlayerName();
      dom.round.stripOpponent.hidden = true; // hide AI in multi
      showScreen("round");
      enterReveal();
    } else if (data.type === 'ADVANCE') {
      clearTimers();
      if (data.phase === 'defend') enterDefend();
      else if (data.phase === 'resolve') {
        state.network.players = data.players; // receive updated scores
        enterResolve();
      } else if (data.phase === 'end') {
        enterEnd();
      } else if (data.phase === 'reveal') {
        state.roundIndex = data.roundIndex;
        enterReveal();
      }
    } else if (data.type === 'TIMER') {
      // Sync timer display roughly
      updateTimerUI(data.remaining, data.total);
    }
  }

  function renderWaitingRoom() {
    const html = Object.values(state.network.players).map(p => `
      <div class="waiting-player-row">
        <span>${p.isHost ? '👑' : '👤'}</span>
        <span>${escapeHtml(p.name)}</span>
        ${p.id === state.myId ? '(You)' : ''}
      </div>
    `).join("");
    dom.lobby.waitingPlayersList.innerHTML = html;
  }

  function hostStartGame() {
    // Standard setup
    const standardPool = D.SCENARIOS.filter(s => s.round_type === "standard");
    state.scenarioPool = shuffle(standardPool);
    state.auditScenario = D.SCENARIOS.find(s => s.round_type === "audit");
    state.roundIndex = 0;
    state.history = [];
    
    // reset scores
    Object.values(state.network.players).forEach(p => p.score = 0);

    broadcast({ type: 'START', pool: state.scenarioPool, audit: state.auditScenario });
    
    dom.round.playerNameDisplay.textContent = getPlayerName();
    dom.round.stripOpponent.hidden = true; // hide AI
    showScreen("round");
    enterReveal();
  }

  function startGame() {
    // Single player setup
    state.mode = "single";
    state.myId = "p1";
    state.network.isHost = true;
    state.network.players = {
      "p1": { id: "p1", name: getPlayerName(), score: 0, ready: false },
      "ai": { id: "ai", name: "AI Auditor", score: 0, ready: false }
    };
    const standardPool = D.SCENARIOS.filter(s => s.round_type === "standard");
    state.scenarioPool = shuffle(standardPool);
    state.auditScenario = D.SCENARIOS.find(s => s.round_type === "audit");
    state.roundIndex = 0;
    state.history = [];
    
    dom.round.playerNameDisplay.textContent = getPlayerName();
    dom.round.stripOpponent.hidden = false;
    showScreen("round");
    enterReveal();
  }

  // ---------- Round Flow ----------
  function pickScenarioForRound(idx) {
    state.currentRoundPlan = D.ROUND_PLAN[idx];
    if (state.currentRoundPlan.type === "audit") return state.auditScenario;
    return state.scenarioPool[idx % state.scenarioPool.length];
  }

  function enterReveal() {
    clearTimers();
    state.phase = "reveal";
    state.match.locked = false;
    state.defend.locked = false;
    
    Object.values(state.network.players).forEach(p => {
      p.ready = false;
      p.matchPick = null;
      p.rationale = null;
      p.quality = null;
    });

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
    updateTimerUI(0, 1); // reset to full
    dom.round.timerText.textContent = "—";
    setPhaseDot("match");
    dom.round.lightningNotice.hidden = (t !== "lightning");

    renderHand({ disabled: true });
    updateScores();

    if (state.mode === 'single' || state.mode === 'multi') {
      state.revealHandle = setTimeout(enterMatch, 1400);
    }
  }

  function enterMatch() {
    state.phase = "match";
    setPhaseDot("match");
    dom.round.lightningNotice.hidden = true;
    renderHand({ disabled: false });

    if (state.mode === 'single' || state.network.isHost) {
      const ms = state.currentRoundPlan.matchSec * 1000;
      state.match.deadline = Date.now() + ms;
      runHostTimer(state.match.deadline, ms, () => forceAdvance('match'));
      
      if (state.mode === 'single') {
        // AI logic
        state.network.players['ai'].matchPick = aiPickCard(state.currentScenario).id;
        state.network.players['ai'].ready = true;
      }
    }
  }

  let advanceTimeout = null;
  function checkPhaseAdvance() {
    if (!state.network.isHost && state.mode !== 'single') return;
    const allReady = Object.values(state.network.players).every(p => p.ready);
    if (allReady && !advanceTimeout) {
       clearTimers();
       // slight delay for visual UX
       advanceTimeout = setTimeout(() => {
           advanceTimeout = null;
           forceAdvance(state.phase);
       }, 400);
    }
  }

  function forceAdvance(fromPhase) {
    if (advanceTimeout) { clearTimeout(advanceTimeout); advanceTimeout = null; }
    clearTimers();
    if (fromPhase === 'match') {
      const isLightning = state.currentRoundPlan.type === "lightning";
      Object.values(state.network.players).forEach(p => p.ready = false);
      if (isLightning) {
        scoreRound();
        broadcast({ type: 'ADVANCE', phase: 'resolve', players: state.network.players });
        enterResolve();
      } else {
        broadcast({ type: 'ADVANCE', phase: 'defend' });
        enterDefend();
      }
    } else if (fromPhase === 'defend') {
      Object.values(state.network.players).forEach(p => p.ready = false);
      // Calc scores before broadcasting
      scoreRound();
      broadcast({ type: 'ADVANCE', phase: 'resolve', players: state.network.players });
      enterResolve();
    }
  }

  function enterDefend() {
    state.phase = "defend";
    setPhaseDot("defend");
    
    const myP = state.network.players[state.myId];
    renderHand({ disabled: true, lockedId: myP.matchPick });

    dom.round.defendPanel.hidden = false;
    renderRationaleChips();
    renderQualityChips();
    dom.round.defendSubmit.disabled = true;
    dom.round.defendSubmit.onclick = onDefendSubmit;

    if (state.mode === 'single' || state.network.isHost) {
      const ms = state.currentRoundPlan.defendSec * 1000;
      state.defend.deadline = Date.now() + ms;
      runHostTimer(state.defend.deadline, ms, () => forceAdvance('defend'));

      if (state.mode === 'single') {
        state.network.players['ai'].rationale = aiPickRationale(state.currentScenario);
        state.network.players['ai'].quality = aiPickQuality(state.currentScenario);
        state.network.players['ai'].ready = true;
      }
    }
  }

  function onDefendSubmit() {
    if (state.defend.locked) return;
    const rat = document.querySelector("#rationale-chips .is-selected");
    const qual = document.querySelector("#quality-chips .is-selected");
    if (!rat || !qual) return;
    
    state.defend.locked = true;
    state.network.players[state.myId].rationale = rat.dataset.id;
    state.network.players[state.myId].quality = qual.dataset.id;
    dom.round.defendSubmit.disabled = true;
    dom.round.defendSubmit.textContent = state.mode === 'multi' ? "Waiting for others..." : "Locked";
    
    sendToHost({ type: 'ACTION', action: 'defend', rationaleId: rat.dataset.id, qualityId: qual.dataset.id });
  }

  function enterResolve() {
    state.phase = "resolve";
    setPhaseDot("resolve");
    dom.round.defendPanel.hidden = true;
    
    updateTimerUI(0, 1);
    dom.round.timerText.textContent = "✓";

    // In singleplayer, calc scores here if not done
    if (state.mode === 'single') {
      scoreRound();
    }

    renderResolve();
    updateScores();
    dom.round.resolveOverlay.hidden = false;

    // Only host/single can advance
    const continueBtn = document.getElementById("resolve-continue");
    if (continueBtn) {
      if (state.mode === 'single' || state.network.isHost) {
        continueBtn.hidden = false;
        continueBtn.onclick = () => {
          clearTimers();
          state.roundIndex += 1;
          if (state.roundIndex >= D.ROUND_PLAN.length) {
            broadcast({ type: 'ADVANCE', phase: 'end' });
            enterEnd();
          } else {
            broadcast({ type: 'ADVANCE', phase: 'reveal', roundIndex: state.roundIndex });
            enterReveal();
          }
        };
      } else {
        continueBtn.hidden = true; // wait for host
      }
    }
  }

  function enterEnd() {
    clearTimers();
    state.phase = "end";
    
    const myScore = state.network.players[state.myId].score;
    const allScores = Object.values(state.network.players).sort((a,b) => b.score - a.score);
    const topScore = allScores[0].score;
    
    let banner, klass;
    if (myScore === topScore) {
      banner = "You Win!"; klass = "is-win";
    } else {
      banner = "Game Over"; klass = "is-lose";
    }
    
    dom.end.banner.textContent = banner;
    dom.end.banner.className = "end-banner " + klass;
    dom.end.subline.textContent = state.mode === 'single' ? "Review your results." : "Multiplayer results";
    
    // Render leaderboard
    let html = "";
    allScores.forEach((p, i) => {
       html += `
         <div class="end-score-row" style="${p.id === state.myId ? 'border-color:var(--accent-gold);' : ''}">
           <span>${i+1}. ${escapeHtml(p.name)}</span>
           <strong>${p.score} pts</strong>
         </div>
       `;
    });
    dom.end.leaderboard.innerHTML = html;

    renderEndReview(); // For simplicity, we just show scenario text, we can skip full history rendering or adapt it.
    showScreen("end");
  }

  // ---------- Rendering & Helpers ----------
  function updateScores() {
    dom.round.playerScore.textContent = String(state.network.players[state.myId]?.score || 0);
    if (state.mode === 'single') {
       dom.round.opponentScore.textContent = String(state.network.players['ai']?.score || 0);
    }
  }

  function updateTimerUI(remaining, totalMs) {
    if ((state.phase === 'match' && state.match.locked) || 
        (state.phase === 'defend' && state.defend.locked)) {
       dom.round.timerText.textContent = "⌛";
       dom.round.timerFill.style.strokeDashoffset = "0";
       dom.round.timerFill.classList.remove("is-warning");
       return;
    }

    if (remaining <= 0) {
      dom.round.timerText.textContent = "0";
      dom.round.timerFill.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
      return;
    }
    const frac = remaining / totalMs;
    const offset = RING_CIRCUMFERENCE * (1 - frac);
    dom.round.timerFill.style.strokeDashoffset = String(offset);
    dom.round.timerText.textContent = String(Math.ceil(remaining / 1000));
    dom.round.timerFill.classList.toggle("is-warning", remaining < 5000);
  }

  function runHostTimer(deadline, totalMs, onExpire) {
    if (state.timerHandle) clearInterval(state.timerHandle);
    let lastBroadcast = 0;
    
    state.timerHandle = setInterval(() => {
      const remaining = deadline - Date.now();
      updateTimerUI(remaining, totalMs);
      
      // Broadcast timer to clients every 1s
      if (state.mode === 'multi' && state.network.isHost && Date.now() - lastBroadcast > 1000) {
         broadcast({ type: 'TIMER', remaining, total: totalMs });
         lastBroadcast = Date.now();
      }

      if (remaining <= 0) {
        clearInterval(state.timerHandle);
        state.timerHandle = null;
        onExpire();
      }
    }, 200);
  }

  function renderHand({ disabled, lockedId }) {
    const html = D.CONCEPT_CARDS.map(card => {
      const isLocked = lockedId === card.id;
      return `
        <button class="card card-${card.family}${isLocked ? " is-locked" : ""}"
                data-id="${card.id}" ${disabled ? "disabled" : ""}>
          <span class="card-family">${card.family.toUpperCase()}</span>
          <span class="card-name">${card.name}</span>
          <span class="card-short">${card.short}</span>
        </button>`;
    }).join("");
    dom.round.hand.innerHTML = html;

    if (!disabled) {
      Array.from(dom.round.hand.querySelectorAll(".card")).forEach(btn => {
        btn.onclick = (e) => {
          if (state.phase !== "match" || state.match.locked) return;
          const id = e.currentTarget.dataset.id;
          state.match.locked = true;
          state.network.players[state.myId].matchPick = id;
          renderHand({ disabled: true, lockedId: id });
          if (state.mode === 'multi' && !state.network.isHost) {
              dom.round.timerText.textContent = "⌛";
          }
          sendToHost({ type: 'ACTION', action: 'match', cardId: id });
        };
      });
    }
  }

  function renderRationaleChips() {
    const opts = state.currentScenario.rationale.options;
    dom.round.rationaleChips.innerHTML = opts.map(opt =>
      `<button class="chip" data-id="${opt.id}">${opt.text}</button>`
    ).join("");
    setupChips(dom.round.rationaleChips);
  }

  function renderQualityChips() {
    dom.round.qualityChips.innerHTML = D.QUALITIES.map(q =>
      `<button class="chip" data-id="${q.id}">${q.name}</button>`
    ).join("");
    setupChips(dom.round.qualityChips);
  }

  function setupChips(container) {
    Array.from(container.querySelectorAll(".chip")).forEach(b => {
      b.onclick = (e) => {
        if (state.defend.locked) return;
        Array.from(container.querySelectorAll(".chip")).forEach(x => x.classList.remove("is-selected"));
        e.currentTarget.classList.add("is-selected");
        
        const rat = document.querySelector("#rationale-chips .is-selected");
        const qual = document.querySelector("#quality-chips .is-selected");
        dom.round.defendSubmit.disabled = !(rat && qual);
      };
    });
  }

  function scoreRound() {
    const sc = state.currentScenario;
    const plan = state.currentRoundPlan;
    const s = D.SCORING;

    Object.values(state.network.players).forEach(p => {
      let pts = 0;
      const mOk = p.matchPick === sc.expected.match;
      const rOk = p.rationale === sc.rationale.correct_id;
      const qOk = p.quality === sc.expected.quality;

      p.lastResult = { matchOk: mOk, reasonOk: rOk, qualityOk: qOk, points: 0 };

      if (plan.type === "lightning") {
        if (mOk) pts = s.lightning.correct;
      } else if (plan.type === "audit") {
        if (mOk) pts += s.audit.match;
        if (rOk) pts += s.audit.reason;
        if (qOk) pts += s.audit.quality_primary;
        if (sc.expected.also_qualities && sc.expected.also_qualities.includes(p.quality) && !qOk) {
            pts += s.audit.quality_bonus;
        }
      } else {
        if (mOk && rOk && qOk) pts = s.standard.perfect;
        else if (mOk && rOk) pts = s.standard.reason_correct;
        else if (mOk) pts = s.standard.match_only;
      }
      p.score += pts;
      p.lastResult.points = pts;
    });
    
    // Save to history for my player
    const myP = state.network.players[state.myId];
    state.history.push({
      round: state.roundIndex + 1,
      scenario: sc,
      pick: myP.matchPick,
      pts: myP.lastResult.points
    });
  }

  function renderResolve() {
    const sc = state.currentScenario;
    const correctCard = findCard(sc.expected.match);
    const correctReason = sc.rationale.options.find(o => o.id === sc.rationale.correct_id);
    const correctQuality = findQuality(sc.expected.quality);

    const myP = state.network.players[state.myId];
    const res = myP.lastResult || {};
    const isLightning = state.currentRoundPlan.type === "lightning";

    let headlineClass = "is-mixed", headlineText = "Round Over";
    if (!res.matchOk) { headlineClass = "is-lose"; headlineText = "Wrong card."; }
    else if (isLightning) { headlineClass = "is-win"; headlineText = "Correct!"; }
    else if (res.reasonOk && res.qualityOk) { headlineClass = "is-win"; headlineText = "Perfect defence!"; }

    const playerCardName = myP.matchPick ? findCard(myP.matchPick).name : "—";
    const explanation  = sc.explanation || D.REMINDERS[sc.expected.match] || "";

    const reasonRow = isLightning ? "" : `
      <div class="resolve-row">
        <div class="label">REASON</div>
        <div class="value-mark ${res.reasonOk ? "is-correct" : "is-wrong"}">
          ${res.reasonOk ? "✓" : "✗"}
        </div>
        <div>correct: ${escapeHtml(correctReason.text)}</div>
      </div>
      <div class="resolve-row">
        <div class="label">25010 TAG</div>
        <div class="value-mark ${res.qualityOk ? "is-correct" : "is-wrong"}">
          ${res.qualityOk ? "✓" : "✗"}
        </div>
        <div>correct: ${escapeHtml(correctQuality.name)}</div>
      </div>
    `;

    // Multi results string
    let multiStr = "";
    if (state.mode === 'multi') {
       const sorted = Object.values(state.network.players).sort((a,b) => b.score - a.score);
       multiStr = `<div style="margin-top: 15px;"><strong>Live Leaderboard</strong></div>` + 
         sorted.map((p, i) => `
         <div style="display:flex; justify-content:space-between; margin-top:4px; padding:6px 10px; background:var(--bg-mid); border: 1px solid var(--border-soft); border-radius:4px; ${p.id === state.myId ? 'border-color:var(--accent-gold);' : ''}">
           <span>${i+1}. ${escapeHtml(p.name)}</span>
           <span><strong>${p.score} pts</strong> <span style="color:var(--success)">(+${p.lastResult.points})</span></span>
         </div>
       `).join("");
    } else {
       const ai = state.network.players['ai'];
       multiStr = `AI Auditor: +${ai.lastResult.points} (played ${ai.matchPick ? findCard(ai.matchPick).name : '-'})`;
    }

    dom.round.resolveCard.innerHTML = `
      <div class="resolve-headline ${headlineClass}">${headlineText}</div>
      <div class="resolve-rows">
        <div class="resolve-row">
          <div class="label">CARD</div>
          <div class="value-mark ${res.matchOk ? "is-correct" : "is-wrong"}">
            ${res.matchOk ? "✓" : "✗"} you: ${escapeHtml(playerCardName)}
          </div>
          <div>correct: ${escapeHtml(correctCard.name)}</div>
        </div>
        ${reasonRow}
      </div>
      <div class="resolve-explanation">${escapeHtml(explanation)}</div>
      <div class="resolve-points" style="font-size:14px; color:var(--text-secondary); margin-top:10px;">
        <strong style="color:var(--success)">You: +${res.points} pts</strong><br>
        ${multiStr}
      </div>
      <button id="resolve-continue" class="btn btn-primary resolve-continue-btn" type="button">
        ${state.roundIndex + 1 >= D.ROUND_PLAN.length ? "See Results" : "Next Round →"}
      </button>
    `;
  }

  function renderEndReview() {
    dom.end.review.innerHTML = state.history.map(h => `
      <div class="review-row" style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid var(--border-soft);">
        <div style="font-size:12px; color:var(--text-secondary)">Round ${h.round} • +${h.pts} pts</div>
        <div><strong>Scenario:</strong> ${escapeHtml(h.scenario.text)}</div>
        <div><strong>Correct Card:</strong> ${findCard(h.scenario.expected.match).name}</div>
      </div>
    `).join("");
  }

  // ---------- AI ----------
  function aiPickCard(scenario) {
    const correct = findCard(scenario.expected.match);
    if (Math.random() < 0.7) return correct;
    const pool = D.CONCEPT_CARDS.filter(c => c.id !== correct.id);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function aiPickRationale(scenario) {
    if (Math.random() < 0.6) return scenario.rationale.correct_id;
    return scenario.rationale.options[0].id;
  }
  function aiPickQuality(scenario) {
    if (Math.random() < 0.5) return scenario.expected.quality;
    return D.QUALITIES[0].id;
  }

  function boot() {
    renderRules();
    bindLobby();
    showScreen("lobby");
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
