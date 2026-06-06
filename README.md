# ISO TESTIT! — The Ultimate Quality Assurance Card Game

**Play Now (Live Demos):**
- 🎮 [GitHub Pages Live Demo](https://yusuf06p.github.io/Seng-436_CardGame/prototype/index.html)

**Course:** SENG 436 — Software Quality Assurance  
**Team:** Import Math (Zeynep Nur Karabay, Mert Bursalıoğlu, Yusuf Ali Mertyürek)  
**Target Standards:** ISO/IEC 29119-1 (Software Testing — General Concepts) & ISO/IEC 25010 (System and Software Quality Models)

---

## 🎮 Game Overview

**ISO TESTIT!** is a web-based educational card game designed to teach the core conceptual chain of software quality assurance. Instead of memorizing static textbook definitions, players act as Junior QA Engineers. They read real-world software scenarios and must classify them correctly using ISO terminology while defending their reasoning against an **AI Auditor** or competing with friends.

---

## ✨ Latest Features (V3+)

This version of **ISO TESTIT!** introduces major gameplay enhancements, flexible single-player options, and real-time multiplayer support:

*   👥 **Real-Time Multiplayer:** Compete against peer players using WebRTC. Create rooms with 4-letter codes (`PeerJS` powered, no central database required).
*   👓 **Spectator / Game Master Mode:** Choose to host and watch games live without playing, acting as an overseer.
*   ⚙️ **Customizable Game Length:** Adjust single-player or multiplayer games to **5, 10, 15, 20, 25, or 30 rounds**.
*   🔄 **Dynamic Round Generation:** The game dynamically creates a balanced mix of Standard rounds, Lightning rounds, and a final Audit (boss) round based on the chosen length.
*   📚 **Expanded Scenarios:** 30 high-quality, real-world software scenarios covering testing challenges, continuous integration, static analysis tools, risk prioritization, and environment configuration.
*   🎨 **Premium Neon UI:** A modern dark-navy aesthetic featuring high-contrast, color-coded card families with WCAG AA compliance.

---

## 🧠 Educational Loop (Anti-Memorization Design)

Every standard round flows through a strict 3-phase loop to prioritize *reasoning* and *understanding* over blind memorization:

1.  **Phase 1: MATCH (25s):** A software scenario is revealed. The player reads it and matches it with the correct concept card from their hand:
    *   🔴 **Anomaly Family:** Error, Defect, Failure (the causal chain).
    *   🔵 **Activity Family:** Verification vs. Validation.
    *   🟢 **Approach Family:** Static testing vs. Dynamic testing.
2.  **Phase 2: DEFEND (25s):** The player justifies their match. They must select the correct logical rationale (*"because..."*) from 3 options and tag the affected **ISO/IEC 25010 Quality Characteristic** (Reliability, Maintainability, Usability, Security, Performance Efficiency, Functional Suitability, Compatibility, Portability).
3.  **Phase 3: RESOLVE:** Plays are revealed. If the player matched correctly but chose the wrong rationale, they receive only partial credit and keep the card in hand—ensuring that conceptual misconceptions stay visible. Detailed explanations are provided immediately to correct understanding.

---

## ⚙️ Round Types & Scoring

| Round Type | Description | Scoring Mechanics |
| :--- | :--- | :--- |
| **Standard** | Match Phase + Defend Phase (Justification & Quality Tag) | **Max 3 pts:** Match ✓ + Reason ✓ + Quality ✓ |
| **Lightning** | Match-only, fast-paced (20-second timer) | **1 pt** for correct match |
| **Audit (Boss)** | Finale round. Match + reason + primary quality + secondary qualities | **Max 5 pts** (bonus point for additional related quality tag) |

*If players tie, the player with the most perfect "3-point rounds" wins, rewarding depth of QA understanding.*

---

## 📁 Repository Layout

```
Seng-436/
├── README.md                  # Project overview (this file)
├── design.md                  # Detailed game mechanics & feedback mappings
├── technical-spec.md          # Architectural decisions, data shapes & state models
├── Week3_Report.md            # Week 3 milestone prototype report
├── patch_game.py              # Helper python script for patching lobby configurations
└── prototype/
    ├── index.html             # Main game interface
    ├── styles.css             # Neon UI styling & responsive layouts
    ├── data.js                # Scenario database (S01-S30), concept cards & score weights
    └── game.js                # Game state machine, AI logic, and PeerJS connection layers
```

---

## 🚀 How to Play

### 💻 Local Run
1. Clone the repository.
2. Open `prototype/index.html` in any modern desktop web browser (Chrome, Firefox, Safari, or Edge).
3. No local server, configuration, or installation is needed for Single Player.

### 👥 Playing Multiplayer
1. Open the [Live Demo](https://yusuf06p.github.io/Seng-436_CardGame/prototype/index.html) (or run the HTML file locally with an internet connection).
2. Type in your name and select **Multiplayer**.
3. **Host:** Click **Create Room** to receive a 4-letter room code. Choose the number of rounds, set your role (Player or Spectator), and click **Start Game** once players have joined.
4. **Client:** Enter the 4-letter room code and click **Join Room**.

---

## 🎓 Learning Objectives

By playing **ISO TESTIT!**, participants learn how to:
1. Classify a software anomaly into the **Error → Defect → Failure** chain.
2. Distinguish **Verification** (building the product right) from **Validation** (building the right product) in practice.
3. Contrast **Static testing** (inspections, walkthroughs) with **Dynamic testing** (code execution).
4. Map quality incidents to their corresponding **ISO/IEC 25010 Quality Characteristics**.
5. Logically **justify** SQA decisions, ensuring textbook terms map correctly to real-world engineering issues.

