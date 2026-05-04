# SENG 436 - Week 3 Prototype Report

**Project Name:** ISO TESTIT! - The Ultimate Quality Assurance Card Game  
**Team:** Import Math (Zeynep Nur Karabay, Mert Bursalıoğlu, Yusuf Ali Mertyürek)  
**Target Standards:** ISO/IEC 29119-1 (General Concepts) & ISO/IEC 25010 (Quality Characteristics)  

---

## 1. Live Prototype Access
The playable web prototype is fully deployed. It runs entirely in the browser with no installation or backend required.

🎮 **Play Now (Live Demo):**  
[https://yusuf06p.github.io/Seng-436_CardGame/prototype/index.html](https://yusuf06p.github.io/Seng-436_CardGame/prototype/index.html)

---

## 2. Project Overview
Our objective for Week 3 was to deliver a fully playable 15-minute web-based prototype that teaches software testing concepts. Instead of memorizing static definitions, players act as Junior QA Engineers. They read real-world software scenarios and must classify them correctly (Error, Defect, Failure, Verification, Validation, etc.) while defending their reasoning against an **AI Auditor**.

---

## 3. Implemented Feedback (From Week 2)
Based on the instructor's feedback from Week 2, we heavily improved the game's mechanics to prioritize *understanding* over *memorization*:

1. **Anti-Memorization (Defend Phase):** 
   *Feedback: "Players don't explain their thinking."* 
   **Fix:** We added a "Defend" phase. After playing a card, the player must select the correct logical rationale (the "Because...") from 3 options.
2. **Integration of ISO 25010:** 
   *Feedback: "ISO 25010 is missing."* 
   **Fix:** Players are now required to tag which specific Quality Characteristic (e.g., Security, Usability, Performance Efficiency) is affected by the scenario.
3. **Visual Contrast & UI Polish:** 
   *Feedback: "Theme lacks contrast."* 
   **Fix:** Designed a brand new futuristic UI with glowing neon cards, distinct color families (Red/Blue/Orange), and high-contrast text.
4. **Game Length & Depth:** 
   *Feedback: "15 seconds is too short."* 
   **Fix:** Increased game duration to **15 unique rounds** (Standard, Lightning, and an Audit boss round) with 25-second timers per phase.

---

## 4. Core Game Loop
Every standard round flows through a strict 3-phase state machine:

- **Phase 1: MATCH (25s)**  
  A scenario appears on the screen. The player reads it and selects the matching ISO concept card from their hand.
- **Phase 2: DEFEND (25s)**  
  The player must justify their choice by selecting the correct rationale and the appropriate ISO 25010 Quality tag.
- **Phase 3: RESOLVE**  
  The AI Auditor reveals its play. Points are calculated based on reasoning depth (getting the right card for the wrong reason only gives partial credit). A corrective explanation is displayed to fix misconceptions immediately.
