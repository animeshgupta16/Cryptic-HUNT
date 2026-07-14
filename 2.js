/* ============================================================
   RECORDS DIVISION — UNSEAL TERMINAL ENGINE
   No browser storage, no server calls. Everything here lives in
   memory for the length of your visit — refreshing the page is
   a real reset, not just a UI one.
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     BOOT SEQUENCE
     ============================================================ */
  const bootLines = [
    'INITIALIZING RECORDS DIVISION TERMINAL...',
    'AUTHENTICATING CLEARANCE... OK',
    'MOUNTING ARCHIVE H-98-861 / 99-CV-3304 (RCL)...',
    'LOADING CASE FILE: BARRETT / GOODWIN v. COLUMBIA-HCA / GRAMERCY...',
    'CROSS-REFERENCING SEALED DOCKET...',
    'STATUS: SEALED',
    '',
    '> press SKIP or wait to continue_'
  ];

  const bootLinesEl = document.getElementById('boot-lines');
  const bootScreen = document.getElementById('boot-screen');
  const skipBtn = document.getElementById('skip-boot');
  const app = document.getElementById('app');

  let bootTimers = [];
  let booted = false;

  function runBoot() {
    bootLines.forEach((line, i) => {
      const t = setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'line';
        div.textContent = line;
        bootLinesEl.appendChild(div);
      }, i * 320);
      bootTimers.push(t);
    });

    const finishTimer = setTimeout(finishBoot, bootLines.length * 320 + 500);
    bootTimers.push(finishTimer);
  }

  function finishBoot() {
    if (booted) return;
    booted = true;
    bootTimers.forEach(clearTimeout);
    bootScreen.hidden = true;
    app.hidden = false;
    printConsoleClue(); // Clerk's Note 2 fires once the terminal is "live"
  }

  skipBtn.addEventListener('click', finishBoot);
  runBoot();

  /* ============================================================
     PROGRESS STATE — in memory only, on purpose
     ============================================================ */
  const notes = {
    comment: false,   // Clerk's Note 1 — HTML comment (manual report)
    console: false,   // Clerk's Note 2 — console message (manual report)
    konami: false,    // Clerk's Note 3 — Konami code
    keyword: false,   // Clerk's Note 4 — typing GRAMERCY
    selection: false  // Clerk's Note 5 — selecting the redacted line
  };

  const clueCountEl = document.getElementById('clue-count');
  const ecgLine = document.getElementById('ecg-line');

  function markFound(key) {
    if (notes[key]) return;
    notes[key] = true;
    updateClueCount();
    spikeECG();
  }

  function updateClueCount() {
    const total = Object.values(notes).filter(Boolean).length;
    clueCountEl.textContent = String(total);
  }

  function spikeECG() {
    ecgLine.classList.remove('spike');
    void ecgLine.offsetWidth; // restart the CSS animation
    ecgLine.classList.add('spike');
  }

  /* ============================================================
     TOAST
     ============================================================ */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3600);
  }

  /* ============================================================
     CLERK'S NOTE 2 — CONSOLE MESSAGE
     ============================================================ */
  function printConsoleClue() {
    console.log(
      '%cRECORDS DIVISION — you found the console.',
      'color:#3fa89c; font-family:monospace; font-size:14px; font-weight:bold;'
    );
    console.log(
      "%cClerk's Note 2 of 5 \u2014 Badge format, Clerk: three letters, four numbers, three letters, four numbers. Two badges are already stamped in this file \u2014 you just haven't matched each one to its year yet.",
      'color:#b6924f; font-family:monospace; font-size:12px;'
    );
    console.log(
      '%c(If this counts as finding it for you, report it down in the Unseal Terminal.)',
      'color:#8aa19d; font-family:monospace; font-size:11px; font-style:italic;'
    );
  }

  /* ============================================================
     CLERK'S NOTE 3 — KONAMI CODE
     ============================================================ */
  const KONAMI = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  let konamiBuffer = [];
  const konamiPanel = document.getElementById('konami-panel');

  document.addEventListener('keydown', (e) => {
    konamiBuffer.push(e.code);
    konamiBuffer = konamiBuffer.slice(-KONAMI.length);
    if (konamiBuffer.length === KONAMI.length &&
        konamiBuffer.every((code, i) => code === KONAMI[i])) {
      revealKonami();
    }
  });

  function revealKonami() {
    if (notes.konami) return;
    konamiPanel.hidden = false;
    konamiPanel.innerHTML =
      "<strong>Clerk's Note 3 of 5</strong> \u2014 An old cheat code, still good for something. " +
      "The four segments march in the same order the case happened in: first ruling's badge, " +
      "then its year, then the second ruling's badge, then its year. Don't swap the order.";
    markFound('konami');
    toast("Clerk's Note 3 of 5 recovered.");
  }

  /* ============================================================
     CLERK'S NOTE 4 — TYPE "GRAMERCY"
     ============================================================ */
  const KEYWORD = 'gramercy';
  let keywordBuffer = '';
  const keywordPanel = document.getElementById('keyword-panel');

  document.addEventListener('keydown', (e) => {
    if (e.key && e.key.length === 1) {
      keywordBuffer += e.key.toLowerCase();
      keywordBuffer = keywordBuffer.slice(-KEYWORD.length);
      if (keywordBuffer === KEYWORD) {
        revealKeyword();
      }
    }
  });

  function revealKeyword() {
    if (notes.keyword) return;
    keywordPanel.hidden = false;
    keywordPanel.innerHTML =
      "<strong>Clerk's Note 4 of 5</strong> \u2014 You said the surgery center's name, and something opened. " +
      "Join every segment with a hyphen, nothing else \u2014 no spaces, and no lowercase. A judge's initials " +
      "are always capitalized in the official record, and so is the rest of this code.";
    markFound('keyword');
    toast("Clerk's Note 4 of 5 recovered.");
  }

  /* ============================================================
     CLERK'S NOTE 5 — SELECT THE REDACTED LINE
     ============================================================ */
  const redactedClue = document.getElementById('redacted-clue');

  function checkRedactedSelection() {
    if (notes.selection || !redactedClue) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString().replace(/\s+/g, ' ');
    if (text.includes("Clerk's Note 5")) {
      redactedClue.classList.add('revealed');
      markFound('selection');
      toast("Clerk's Note 5 of 5 recovered.");
    }
  }

  document.addEventListener('mouseup', checkRedactedSelection);
  document.addEventListener('selectionchange', checkRedactedSelection);

  /* ============================================================
     MANUAL REPORTS \u2014 Clerk's Notes 1 & 2 (not auto-detectable)
     ============================================================ */
  const reportComment = document.getElementById('report-comment');
  const reportConsole = document.getElementById('report-console');

  reportComment.addEventListener('click', () => {
    if (notes.comment) return;
    notes.comment = true;
    reportComment.dataset.found = 'true';
    reportComment.textContent = "Clerk's Note 1 \u2014 logged";
    updateClueCount();
    spikeECG();
    toast("Clerk's Note 1 of 5 logged.");
  });

  reportConsole.addEventListener('click', () => {
    if (notes.console) return;
    notes.console = true;
    reportConsole.dataset.found = 'true';
    reportConsole.textContent = "Clerk's Note 2 \u2014 logged";
    updateClueCount();
    spikeECG();
    toast("Clerk's Note 2 of 5 logged.");
  });

  /* ============================================================
     DECOY \u2014 "INTERCEPTED TRANSMISSION" (not one of the 5)
     ============================================================ */
  const decodeBtn = document.getElementById('decode-btn');
  const transmissionOutput = document.getElementById('transmission-output');
  let typeTimer = null;

  decodeBtn.addEventListener('click', () => {
    const encoded = decodeBtn.dataset.transmission;
    let decoded;
    try {
      decoded = atob(encoded);
    } catch (err) {
      decoded = '[CORRUPTED TRANSMISSION \u2014 UNRECOVERABLE]';
    }
    typeOut(transmissionOutput, decoded);
  });

  function typeOut(el, text) {
    clearInterval(typeTimer);
    el.textContent = '';
    let i = 0;
    typeTimer = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) clearInterval(typeTimer);
    }, 14);
  }

  /* ============================================================
     HINT SYSTEM
     ============================================================ */
  const HINTS = [
    "Every good investigator checks the paper trail before the people. There's more on this page than what's rendered on screen.",
    "Try View Source. Try the console (F12, or right-click \u2192 Inspect). Old cheat codes still open some doors, and so does saying the right name out loud.",
    'The unseal code takes the shape of a badge: three letters, four digits \u2014 twice over.',
    "Whose initials stamp each ruling, and what year did each judge decide it? Four segments, one hyphen between each, no spaces, no lowercase."
  ];
  let hintIndex = 0;
  const hintBtn = document.getElementById('hint-btn');
  const hintText = document.getElementById('hint-text');

  hintBtn.addEventListener('click', () => {
    hintText.textContent = HINTS[hintIndex];
    if (hintIndex < HINTS.length - 1) {
      hintIndex++;
    } else {
      hintBtn.textContent = 'No further nudges \u2014 you have everything';
    }
  });

  /* ============================================================
     UNSEAL TERMINAL
     The correct code is never stored in plain text \u2014 only its
     djb2 hash is. Guessing correctly still requires reading the
     Rulings section, not reading this file.
     ============================================================ */
  const TARGET_HASH = 444161439;

  function djb2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash >>> 0;
    }
    return hash >>> 0;
  }

  function normalize(input) {
    return input.trim().replace(/\s+/g, '').toUpperCase();
  }

  const unsealForm = document.getElementById('unseal-form');
  const codeInput = document.getElementById('code-input');
  const unsealBtn = document.getElementById('unseal-btn');
  const unsealResult = document.getElementById('unseal-result');
  let attempts = 0;

  unsealForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const normalized = normalize(codeInput.value);

    if (!normalized) {
      unsealResult.textContent = 'Enter a code first.';
      unsealResult.className = 'fail';
      return;
    }

    if (djb2(normalized) === TARGET_HASH) {
      unsealResult.textContent =
        'ARCHIVE UNSEALED. Case closed \u2014 formally, in 2005; informally, whenever the last curious reader stops digging. Nice work, Clerk.';
      unsealResult.className = 'ok';
      codeInput.disabled = true;
      unsealBtn.disabled = true;
      toast('Archive unsealed.');
    } else {
      attempts++;
      unsealResult.textContent = `Access denied. That code doesn't match the record. (Attempt ${attempts})`;
      unsealResult.className = 'fail';
      if (attempts === 3) {
        hintText.textContent =
          'Struggling? Every piece you need is already printed under "The Two Rulings" \u2014 you just have to know what counts as a segment.';
      }
    }
  });

  /* ============================================================
     RESET INVESTIGATION
     ============================================================ */
  const resetBtn = document.getElementById('reset-btn');

  resetBtn.addEventListener('click', () => {
    Object.keys(notes).forEach((k) => (notes[k] = false));
    updateClueCount();

    konamiPanel.hidden = true;
    konamiPanel.innerHTML = '';
    keywordPanel.hidden = true;
    keywordPanel.innerHTML = '';
    redactedClue.classList.remove('revealed');

    reportComment.dataset.found = 'false';
    reportComment.textContent = 'I found the note in the page source';
    reportConsole.dataset.found = 'false';
    reportConsole.textContent = 'I found the note in the console';

    hintIndex = 0;
    hintBtn.textContent = 'Request a nudge';
    hintText.textContent = '';

    codeInput.value = '';
    codeInput.disabled = false;
    unsealBtn.disabled = false;
    unsealResult.textContent = '';
    unsealResult.className = '';
    attempts = 0;

    transmissionOutput.textContent = '';
    konamiBuffer = [];
    keywordBuffer = '';

    toast('Investigation reset.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();