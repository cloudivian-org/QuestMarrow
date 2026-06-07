/* ===========================================================
   QuestMarrow — game engine
   =========================================================== */
(function () {
  "use strict";

  // ---- Direction helpers (0=up, 1=right, 2=down, 3=left) ----
  const DX = [0, 1, 0, -1];
  const DY = [-1, 0, 1, 0];
  const DIR_DEG = [0, 90, 180, 270];
  const ROBOT = "🤖";

  // ---- Persistent progress ----
  const SAVE_KEY = "questmarrow_progress_v1";
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(p)); } catch (e) {}
  }
  let progress = loadProgress();

  // ---- Element refs ----
  const $ = (id) => document.getElementById(id);
  const screenHome = $("screen-home");
  const screenGame = $("screen-game");
  const stageEl = $("stage");
  const editorEl = $("editor");
  const messageEl = $("message");
  const paletteEl = $("palette");
  const instructionsEl = $("instructions");
  const levelTitleEl = $("levelTitle");
  const gemInfoEl = $("gemInfo");

  let current = null;       // current level object
  let robotEl = null;       // robot DOM element
  let cellSize = 56;
  const GAP = 3;
  let running = false;

  /* ========== SOUND ========== */
  let actx = null;
  function tone(freq, dur, type, vol) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.value = vol || 0.08;
      o.connect(g); g.connect(actx.destination);
      const t = actx.currentTime;
      o.start(t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.stop(t + dur);
    } catch (e) {}
  }
  const sMove = () => tone(330, 0.08, "square", 0.05);
  const sTurn = () => tone(440, 0.06, "triangle", 0.05);
  const sGem = () => { tone(880, 0.1, "sine", 0.1); setTimeout(() => tone(1180, 0.12, "sine", 0.1), 70); };
  const sCrash = () => tone(120, 0.3, "sawtooth", 0.12);
  function sWin() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, "triangle", 0.1), i * 120));
  }

  /* ========== HOME / LEVEL SELECT ========== */
  function totalMaxStars() { return LEVELS.length * 3; }
  function totalStars() {
    return Object.values(progress).reduce((a, b) => a + b, 0);
  }
  function isUnlocked(index) {
    if (index === 0) return true;
    const prev = LEVELS[index - 1];
    return (progress[prev.id] || 0) >= 1;
  }

  function renderHome() {
    $("totalStars").textContent = totalStars();
    $("maxStars").textContent = totalMaxStars();
    const wrap = $("worlds");
    wrap.innerHTML = "";

    WORLDS.forEach((world) => {
      const card = document.createElement("div");
      card.className = "world";
      const head = document.createElement("div");
      head.className = "world-head";
      head.innerHTML =
        `<div class="world-emoji">${world.emoji}</div>` +
        `<div><div class="world-title">${world.title}</div>` +
        `<div class="world-desc">${world.desc}</div></div>`;
      card.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "level-grid";

      LEVELS.forEach((lvl, i) => {
        if (lvl.world !== world.id) return;
        const unlocked = isUnlocked(i);
        const stars = progress[lvl.id] || 0;
        const c = document.createElement("div");
        c.className = "level-card" + (unlocked ? "" : " locked");
        const n = i + 1;
        c.innerHTML =
          (unlocked ? "" : `<div class="lock">🔒</div>`) +
          `<div class="num">${n}</div>` +
          `<div class="lname">${lvl.name}</div>` +
          `<div class="lstars">${starString(stars)}</div>`;
        if (unlocked) c.addEventListener("click", () => openIndex(i));
        grid.appendChild(c);
      });
      card.appendChild(grid);
      wrap.appendChild(card);
    });

    renderCustomLevels(wrap);
  }

  /* ----- Custom levels made in the Level Editor ----- */
  const CUSTOM_KEY = "questmarrow_custom_v1";
  function loadCustom() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCustom(list) {
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function renderCustomLevels(wrap) {
    const list = loadCustom();
    if (!list.length) return;
    const card = document.createElement("div");
    card.className = "world";
    const head = document.createElement("div");
    head.className = "world-head";
    head.innerHTML =
      `<div class="world-emoji">🛠</div>` +
      `<div><div class="world-title">My Levels</div>` +
      `<div class="world-desc">Levels you built in the editor. Click ▶ to play, ✕ to delete.</div></div>`;
    card.appendChild(head);

    const grid = document.createElement("div");
    grid.className = "level-grid";
    list.forEach((lvl, idx) => {
      const c = document.createElement("div");
      c.className = "level-card";
      c.innerHTML =
        `<div class="del-x" title="Delete">✕</div>` +
        `<div class="num">🧩</div>` +
        `<div class="lname">${escapeHtml(lvl.name || "Level")}</div>` +
        `<div class="lstars">▶ Play</div>`;
      c.addEventListener("click", (e) => {
        if (e.target.classList.contains("del-x")) {
          const fresh = loadCustom();
          fresh.splice(idx, 1);
          saveCustom(fresh);
          renderHome();
          return;
        }
        openLevelObject(lvl, { returnTo: "screen-home" });
      });
      grid.appendChild(c);
    });
    card.appendChild(grid);
    wrap.appendChild(card);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  function starString(n) {
    let s = "";
    for (let i = 0; i < 3; i++) s += i < n ? "⭐" : "☆";
    return s;
  }

  /* ========== OPEN A LEVEL ========== */
  let currentIndex = -1;
  let returnTo = "screen-home";

  function startLevel(titleText) {
    levelTitleEl.textContent = titleText;
    instructionsEl.innerHTML = current.instructions || "Collect all 💎 and reach the flag 🚩!";
    editorEl.value = current.starter || "";
    setMessage("", "");
    buildPalette(current.palette);
    buildStage();
    placeRobotAtStart();
    updateGemInfo(0);
    CQ.showScreen("screen-game");
  }

  function openIndex(index) {
    currentIndex = index;
    returnTo = "screen-home";
    current = LEVELS[index];
    current._custom = false;
    startLevel(`Level ${index + 1}: ${current.name}`);
  }

  function normalizeLevel(obj) {
    return Object.assign({
      w: 5, h: 5, start: { x: 0, y: 0, dir: 1 }, goal: { x: 1, y: 0 },
      walls: [], gems: [],
      palette: ["move", "left", "right", "collect", "repeat", "while", "sense", "func"],
      par: 999, starter: "", instructions: "Collect all 💎 and reach the flag 🚩!",
      hint: "", name: "Custom Level",
    }, obj);
  }

  function openLevelObject(obj, opts) {
    opts = opts || {};
    currentIndex = -1;
    returnTo = opts.returnTo || "screen-home";
    current = normalizeLevel(obj);
    current._custom = true;
    startLevel("🧩 " + (current.name || "Custom Level"));
  }

  function leaveLevel() {
    if (returnTo === "screen-editor") CQ.showScreen("screen-editor");
    else goHome();
  }

  /* ========== PALETTE (command buttons) ========== */
  const PALETTE_DEFS = {
    move:    { label: "moveForward()", cls: "", snippet: "moveForward()\n" },
    right:   { label: "turnRight()", cls: "c-turn", snippet: "turnRight()\n" },
    left:    { label: "turnLeft()", cls: "c-turn", snippet: "turnLeft()\n" },
    collect: { label: "collect()", cls: "c-collect", snippet: "collect()\n" },
    repeat:  { label: "repeat()", cls: "c-loop", snippet: "repeat(3, () => {\n  \n})\n" },
    while:   { label: "while()", cls: "c-loop", snippet: "while (isPathAhead()) {\n  moveForward()\n}\n" },
    sense:   { label: "if (onGem())", cls: "c-sense", snippet: "if (onGem()) {\n  collect()\n}\n" },
    func:    { label: "function", cls: "c-loop", snippet: "function myMove() {\n  \n}\n" },
  };

  function buildPalette(list) {
    paletteEl.innerHTML = "";
    (list || []).forEach((key) => {
      const def = PALETTE_DEFS[key];
      if (!def) return;
      const b = document.createElement("button");
      b.className = "chip " + def.cls;
      b.textContent = def.label;
      b.addEventListener("click", () => insertSnippet(def.snippet));
      paletteEl.appendChild(b);
    });
  }

  function insertSnippet(text) {
    const el = editorEl;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    const pos = start + text.length;
    el.selectionStart = el.selectionEnd = pos;
    el.focus();
  }

  /* ========== BUILD GRID ========== */
  function buildStage() {
    const w = current.w, h = current.h;
    // Fit the grid into the available panel width.
    const maxWidth = Math.min(480, (screenGame.clientWidth || 480) - 80);
    cellSize = Math.max(34, Math.min(60, Math.floor((maxWidth - GAP * (w - 1)) / w)));

    stageEl.style.gridTemplateColumns = `repeat(${w}, ${cellSize}px)`;
    stageEl.style.gridTemplateRows = `repeat(${h}, ${cellSize}px)`;
    stageEl.innerHTML = "";

    const wallSet = new Set(current.walls.map((p) => `${p.x},${p.y}`));
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        const key = `${x},${y}`;
        if (wallSet.has(key)) cell.classList.add("wall");
        if (current.goal.x === x && current.goal.y === y) {
          cell.classList.add("goal");
          cell.textContent = "🚩";
        }
        cell.dataset.key = key;
        stageEl.appendChild(cell);
      }
    }
    renderGems(new Set());

    // Robot element
    robotEl = document.createElement("div");
    robotEl.className = "robot";
    robotEl.style.width = cellSize + "px";
    robotEl.style.height = cellSize + "px";
    robotEl.textContent = (window.CQ && CQ.getCharacter()) || ROBOT;
    stageEl.appendChild(robotEl);
  }

  function renderGems(collectedSet) {
    // Clear existing gem glyphs, then redraw the uncollected ones.
    stageEl.querySelectorAll(".cell").forEach((cell) => {
      if (cell.classList.contains("goal")) return;
      cell.textContent = "";
    });
    current.gems.forEach((g) => {
      const key = `${g.x},${g.y}`;
      if (collectedSet.has(key)) return;
      const cell = stageEl.querySelector(`.cell[data-key="${key}"]`);
      if (cell && !cell.classList.contains("goal")) {
        cell.innerHTML = `<span class="gem">💎</span>`;
      }
    });
  }

  function cellPixel(x, y) {
    return { left: x * (cellSize + GAP), top: y * (cellSize + GAP) };
  }

  function placeRobot(x, y, dir, animate) {
    const p = cellPixel(x, y);
    if (!animate) robotEl.style.transition = "none";
    robotEl.style.left = p.left + "px";
    robotEl.style.top = p.top + "px";
    robotEl.style.setProperty("--rot", DIR_DEG[dir] + "deg");
    robotEl.style.transform = `rotate(${DIR_DEG[dir]}deg)`;
    if (!animate) {
      // Force reflow so the next move animates.
      void robotEl.offsetWidth;
      robotEl.style.transition = "";
    }
  }

  function placeRobotAtStart() {
    const s = current.start;
    placeRobot(s.x, s.y, s.dir, false);
    robotEl.classList.remove("crash");
  }

  function updateGemInfo(collected) {
    gemInfoEl.textContent = `💎 ${collected} / ${current.gems.length}`;
  }

  /* ========== RUN USER CODE (live simulation) ========== */
  const STOP = { stop: true };       // sentinel thrown to halt on crash
  const OP_LIMIT = 20000;

  function simulate(code) {
    const s = current.start;
    const state = { x: s.x, y: s.y, dir: s.dir };
    const collected = new Set();
    const wallSet = new Set(current.walls.map((p) => `${p.x},${p.y}`));
    const frames = [];
    let ops = 0;

    function bump() {
      if (++ops > OP_LIMIT)
        throw new Error("Your code ran too long — maybe a loop that never stops? 🌀");
    }
    function open(x, y) {
      return x >= 0 && y >= 0 && x < current.w && y < current.h && !wallSet.has(`${x},${y}`);
    }
    function frame(extra) {
      frames.push(Object.assign(
        { x: state.x, y: state.y, dir: state.dir, collected: new Set(collected) },
        extra || {}
      ));
    }

    // --- Actions (advance time → push a frame) ---
    function moveForward() {
      bump();
      const nx = state.x + DX[state.dir];
      const ny = state.y + DY[state.dir];
      if (!open(nx, ny)) {
        frame({ crashed: true });
        throw STOP;
      }
      state.x = nx; state.y = ny;
      frame({ sound: "move" });
    }
    function turnRight() { bump(); state.dir = (state.dir + 1) % 4; frame({ sound: "turn" }); }
    function turnLeft()  { bump(); state.dir = (state.dir + 3) % 4; frame({ sound: "turn" }); }
    function collect() {
      bump();
      const key = `${state.x},${state.y}`;
      const here = current.gems.some((g) => g.x === state.x && g.y === state.y);
      if (here && !collected.has(key)) {
        collected.add(key);
        frame({ sound: "gem" });
      } else {
        frame({});
      }
    }
    function repeat(n, fn) {
      n = Math.floor(n);
      for (let i = 0; i < n; i++) { bump(); fn(); }
    }

    // --- Sensors (read state, no frame) ---
    const dirRight = () => (state.dir + 1) % 4;
    const dirLeft = () => (state.dir + 3) % 4;
    const ahead = (d) => open(state.x + DX[d], state.y + DY[d]);
    const isPathAhead = () => { bump(); return ahead(state.dir); };
    const isPathRight = () => { bump(); return ahead(dirRight()); };
    const isPathLeft  = () => { bump(); return ahead(dirLeft()); };
    const isWallAhead = () => !isPathAhead();
    const isWallRight = () => !isPathRight();
    const isWallLeft  = () => !isPathLeft();
    const onGem = () => {
      bump();
      const key = `${state.x},${state.y}`;
      return current.gems.some((g) => g.x === state.x && g.y === state.y) && !collected.has(key);
    };
    const atGoal = () => { bump(); return state.x === current.goal.x && state.y === current.goal.y; };

    const api = {
      moveForward, turnRight, turnLeft, collect, repeat,
      isPathAhead, isPathRight, isPathLeft,
      isWallAhead, isWallRight, isWallLeft,
      onGem, atGoal,
    };

    // Initial frame = starting position.
    frame({});

    try {
      const fn = new Function(...Object.keys(api), '"use strict";\n' + code);
      fn(...Object.values(api));
    } catch (e) {
      if (e !== STOP) {
        // Real syntax/runtime error — report it to the kid kindly.
        return { frames, error: friendlyError(e) };
      }
    }

    const lastCollected = frames.length ? frames[frames.length - 1].collected : collected;
    const won = state.x === current.goal.x && state.y === current.goal.y &&
                lastCollected.size === current.gems.length &&
                !frames.some((f) => f.crashed);
    return { frames, won, crashed: frames.some((f) => f.crashed), collectedCount: lastCollected.size };
  }

  function friendlyError(e) {
    let msg = e.message || String(e);
    if (/is not defined/.test(msg)) {
      const name = msg.split(" ")[0];
      return `I don't know the command "${name}". Check your spelling! 🤔`;
    }
    if (/Unexpected/.test(msg) || e instanceof SyntaxError) {
      return "Hmm, there's a typo in your code. Check your brackets ( ) and { }. 🔧";
    }
    return "Something went wrong: " + msg;
  }

  /* ========== ANIMATE FRAMES ========== */
  function runCode() {
    if (running) return;
    setMessage("", "");
    placeRobotAtStart();
    robotEl.classList.remove("crash");

    const result = simulate(editorEl.value);

    if (result.error) {
      setMessage(result.error, "err");
      sCrash();
      return;
    }

    running = true;
    setButtonsEnabled(false);
    renderGems(new Set());
    updateGemInfo(0);

    let i = 0;
    const STEP = 300;
    function tick() {
      if (i >= result.frames.length) {
        finishRun(result);
        return;
      }
      const f = result.frames[i];
      placeRobot(f.x, f.y, f.dir, true);
      renderGems(f.collected);
      updateGemInfo(f.collected.size);
      if (f.sound === "move") sMove();
      else if (f.sound === "turn") sTurn();
      else if (f.sound === "gem") sGem();
      if (f.crashed) {
        robotEl.classList.add("crash");
        sCrash();
      }
      i++;
      setTimeout(tick, STEP);
    }
    tick();
  }

  function finishRun(result) {
    running = false;
    setButtonsEnabled(true);
    if (result.crashed) {
      setMessage("💥 Crash! Robo hit a wall or the edge. Try a different path!", "err");
    } else if (result.won) {
      onWin();
    } else if (result.collectedCount < current.gems.length) {
      setMessage("Almost! You still need to collect every 💎 before reaching the flag.", "info");
    } else {
      setMessage("So close! Robo didn't reach the flag 🚩. Adjust your steps!", "info");
    }
  }

  /* ========== WIN ========== */
  function countCodeLines(code) {
    return code.split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("//"))
      .length;
  }

  function ratingFor(code) {
    const lines = countCodeLines(code);
    const par = current.par || 99;
    if (lines <= par) return 3;
    if (lines <= par + 3) return 2;
    return 1;
  }

  function onWin() {
    const stars = ratingFor(editorEl.value);
    if (!current._custom && current.id) {
      const prev = progress[current.id] || 0;
      if (stars > prev) { progress[current.id] = stars; saveProgress(progress); }
    }
    sWin();
    showWinModal(stars);
  }

  function showWinModal(stars) {
    const modal = $("winModal");
    let starHtml = "";
    for (let i = 0; i < 3; i++)
      starHtml += i < stars ? "⭐" : `<span class="dim">⭐</span>`;
    $("modalStars").innerHTML = starHtml;
    const msgs = [
      "Brilliant coding! 🌟", "You're a natural! 🚀", "Robo is proud of you! 🤖",
      "Super solved! 💪", "Genius move! 🧠",
    ];
    $("modalMsg").textContent =
      stars === 3 ? "Perfect — shortest solution! " + pick(msgs) : pick(msgs);
    launchConfetti();
    modal.classList.remove("hidden");
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function launchConfetti() {
    const box = $("confetti");
    box.innerHTML = "";
    const colors = ["#ff7a59", "#34c98a", "#4c8dff", "#ffcb45", "#ef5da8", "#8a6bff"];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement("span");
      s.style.left = Math.random() * 100 + "%";
      s.style.background = colors[i % colors.length];
      s.style.animationDuration = 1 + Math.random() * 1.5 + "s";
      s.style.animationDelay = Math.random() * 0.4 + "s";
      box.appendChild(s);
    }
  }

  /* ========== UI HELPERS ========== */
  function setMessage(text, cls) {
    messageEl.textContent = text;
    messageEl.className = "message " + (cls || "");
  }
  function setButtonsEnabled(on) {
    $("runBtn").disabled = !on;
    $("hintBtn").disabled = !on;
  }

  function goHome() {
    CQ.showScreen("screen-home");
    renderHome();
  }

  /* ========== EVENTS ========== */
  $("runBtn").addEventListener("click", runCode);
  $("resetBtn").addEventListener("click", () => {
    editorEl.value = current.starter || "";
    placeRobotAtStart();
    renderGems(new Set());
    updateGemInfo(0);
    setMessage("", "");
  });
  $("hintBtn").addEventListener("click", () => {
    setMessage("💡 " + (current.hint || "Try breaking the problem into small steps."), "info");
  });
  $("backBtn").addEventListener("click", leaveLevel);
  $("homeBtn").addEventListener("click", goHome);

  $("replayBtn").addEventListener("click", () => {
    $("winModal").classList.add("hidden");
    placeRobotAtStart();
    renderGems(new Set());
    updateGemInfo(0);
  });
  $("nextBtn").addEventListener("click", () => {
    $("winModal").classList.add("hidden");
    if (!current._custom && currentIndex >= 0 && currentIndex + 1 < LEVELS.length) {
      openIndex(currentIndex + 1);
    } else {
      leaveLevel();
    }
  });

  // Tab key inserts spaces in the editor instead of leaving the field.
  editorEl.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      insertSnippet("  ");
    }
  });

  /* ========== HOME CONTROLS (built once) ========== */
  function buildHomeControls() {
    const cp = $("charPicker");
    CQ.CHARACTERS.forEach((c) => {
      const b = document.createElement("button");
      b.className = "pick-btn char-btn";
      b.textContent = c;
      if (c === CQ.getCharacter()) b.classList.add("sel");
      b.addEventListener("click", () => {
        CQ.setCharacter(c);
        cp.querySelectorAll(".pick-btn").forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
      });
      cp.appendChild(b);
    });

    const tp = $("themePicker");
    Object.keys(CQ.THEMES).forEach((key) => {
      const b = document.createElement("button");
      b.className = "pick-btn theme-btn";
      b.textContent = CQ.THEMES[key].label;
      if (key === CQ.getTheme()) b.classList.add("sel");
      b.addEventListener("click", () => {
        CQ.setTheme(key);
        tp.querySelectorAll(".pick-btn").forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
      });
      tp.appendChild(b);
    });

    $("tilePlay").addEventListener("click", () =>
      document.getElementById("worlds").scrollIntoView({ behavior: "smooth" }));
    $("tileCreate").addEventListener("click", () => { if (window.Editor) window.Editor.open(); });
    $("tileDraw").addEventListener("click", () => { if (window.Turtle) window.Turtle.open(); });
  }

  // Let other modules launch a level (used by the level editor's Test Play).
  window.Game = { openLevel: openLevelObject, home: goHome };

  // ---- Boot ----
  buildHomeControls();
  CQ.registerHome(renderHome);
  renderHome();
})();
