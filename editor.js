/* ===========================================================
   QuestMarrow — Level Editor
   Build a level by clicking squares, then save / test-play it.
   Saved levels live in localStorage and appear under "My Levels".
   =========================================================== */
window.Editor = (function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const CUSTOM_KEY = "questmarrow_custom_v1";
  const DRAFT_KEY = "questmarrow_draft_v1";
  const GAP = 3;

  const TOOLS = [
    { key: "wall",  label: "🟫 Wall" },
    { key: "gem",   label: "💎 Gem" },
    { key: "start", label: "🤖 Start" },
    { key: "goal",  label: "🚩 Flag" },
    { key: "erase", label: "🧽 Erase" },
  ];

  let state = null;
  let built = false;

  function defaultState() {
    return {
      name: "My Level",
      w: 5, h: 5,
      tool: "wall",
      start: { x: 0, y: 4 },
      goal: { x: 4, y: 0 },
      walls: [],   // ["x,y", ...]
      gems: [],    // ["x,y", ...]
    };
  }

  function loadCustom() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCustom(list) {
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch (e) { return null; }
  }

  /* ---------- Tool buttons ---------- */
  function buildTools() {
    const box = $("edTools");
    box.innerHTML = "";
    TOOLS.forEach((t) => {
      const b = document.createElement("button");
      b.className = "chip ed-tool";
      b.textContent = t.label;
      b.dataset.tool = t.key;
      if (t.key === state.tool) b.classList.add("sel");
      b.addEventListener("click", () => {
        state.tool = t.key;
        box.querySelectorAll(".ed-tool").forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
      });
      box.appendChild(b);
    });
  }

  /* ---------- Grid ---------- */
  function key(x, y) { return x + "," + y; }

  function clampPlacements() {
    // Drop anything that now falls outside the grid after a resize.
    const inB = (k) => {
      const [x, y] = k.split(",").map(Number);
      return x < state.w && y < state.h;
    };
    state.walls = state.walls.filter(inB);
    state.gems = state.gems.filter(inB);
    if (state.start.x >= state.w) state.start.x = state.w - 1;
    if (state.start.y >= state.h) state.start.y = state.h - 1;
    if (state.goal.x >= state.w) state.goal.x = state.w - 1;
    if (state.goal.y >= state.h) state.goal.y = state.h - 1;
  }

  function buildGrid() {
    const stage = $("edStage");
    const w = state.w, h = state.h;
    const maxWidth = Math.min(440, (document.getElementById("screen-editor").clientWidth || 440) - 80);
    const cell = Math.max(34, Math.min(58, Math.floor((maxWidth - GAP * (w - 1)) / w)));

    stage.style.gridTemplateColumns = `repeat(${w}, ${cell}px)`;
    stage.style.gridTemplateRows = `repeat(${h}, ${cell}px)`;
    stage.innerHTML = "";

    const wallSet = new Set(state.walls);
    const gemSet = new Set(state.gems);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = document.createElement("div");
        c.className = "cell";
        const k = key(x, y);
        if (wallSet.has(k)) c.classList.add("wall");
        if (state.start.x === x && state.start.y === y) {
          c.textContent = (window.CQ && CQ.getCharacter()) || "🤖";
        } else if (state.goal.x === x && state.goal.y === y) {
          c.classList.add("goal");
          c.textContent = "🚩";
        } else if (gemSet.has(k)) {
          c.innerHTML = `<span class="gem">💎</span>`;
        }
        c.addEventListener("click", () => paintCell(x, y));
        stage.appendChild(c);
      }
    }
  }

  function paintCell(x, y) {
    const k = key(x, y);
    const isStart = state.start.x === x && state.start.y === y;
    const isGoal = state.goal.x === x && state.goal.y === y;

    switch (state.tool) {
      case "start":
        if (isGoal) { msg("Start and Flag can't share a square!", "err"); return; }
        state.start = { x, y };
        remove(state.walls, k); remove(state.gems, k);
        break;
      case "goal":
        if (isStart) { msg("Start and Flag can't share a square!", "err"); return; }
        state.goal = { x, y };
        remove(state.walls, k); remove(state.gems, k);
        break;
      case "wall":
        if (isStart || isGoal) { msg("Can't put a wall on Start or Flag.", "err"); return; }
        toggle(state.walls, k); remove(state.gems, k);
        break;
      case "gem":
        if (isStart || isGoal) { msg("Can't put a gem on Start or Flag.", "err"); return; }
        toggle(state.gems, k); remove(state.walls, k);
        break;
      case "erase":
        remove(state.walls, k); remove(state.gems, k);
        break;
    }
    msg("", "");
    saveDraft();
    buildGrid();
  }

  function toggle(arr, k) { arr.includes(k) ? remove(arr, k) : arr.push(k); }
  function remove(arr, k) { const i = arr.indexOf(k); if (i >= 0) arr.splice(i, 1); }

  function msg(text, cls) {
    const el = $("edMsg");
    el.textContent = text;
    el.className = "message " + (cls || "");
  }

  /* ---------- Build a playable level object ---------- */
  function toLevel() {
    const parse = (k) => { const [x, y] = k.split(",").map(Number); return { x, y }; };
    return {
      id: "custom_" + Date.now(),
      world: "custom",
      name: (state.name || "My Level").trim() || "My Level",
      w: state.w, h: state.h,
      start: { x: state.start.x, y: state.start.y, dir: 1 },
      goal: { x: state.goal.x, y: state.goal.y },
      walls: state.walls.map(parse),
      gems: state.gems.map(parse),
      palette: ["move", "left", "right", "collect", "repeat", "while", "sense", "func"],
      par: 999,
      starter: "",
      instructions: "Your level! Collect all 💎 and reach the flag 🚩. Robo starts facing right ▶.",
      hint: "You designed this one — you can do it! 💪",
    };
  }

  function validate() {
    if (state.start.x === state.goal.x && state.start.y === state.goal.y) {
      msg("Start and Flag must be on different squares.", "err");
      return false;
    }
    return true;
  }

  /* ---------- Saved-level list ---------- */
  function renderSaved() {
    const box = $("edSavedList");
    const list = loadCustom();
    if (!list.length) { box.innerHTML = ""; return; }
    box.innerHTML = `<div class="saved-title">💾 Saved Levels</div>`;
    list.forEach((lvl, i) => {
      const row = document.createElement("div");
      row.className = "saved-row";
      row.innerHTML =
        `<span class="saved-name">${escapeHtml(lvl.name || "Level")}</span>` +
        `<span class="saved-actions">` +
        `<button class="mini play" data-i="${i}">▶</button>` +
        `<button class="mini load" data-i="${i}">✎</button>` +
        `<button class="mini del" data-i="${i}">✕</button></span>`;
      box.appendChild(row);
    });
    box.querySelectorAll(".play").forEach((b) =>
      b.addEventListener("click", () => {
        const lvl = loadCustom()[+b.dataset.i];
        if (lvl) window.Game.openLevel(lvl, { returnTo: "screen-editor" });
      }));
    box.querySelectorAll(".load").forEach((b) =>
      b.addEventListener("click", () => loadIntoEditor(loadCustom()[+b.dataset.i])));
    box.querySelectorAll(".del").forEach((b) =>
      b.addEventListener("click", () => {
        const list2 = loadCustom();
        list2.splice(+b.dataset.i, 1);
        saveCustom(list2);
        renderSaved();
      }));
  }

  function loadIntoEditor(lvl) {
    if (!lvl) return;
    state = {
      name: lvl.name || "My Level",
      w: lvl.w, h: lvl.h,
      tool: "wall",
      start: { x: lvl.start.x, y: lvl.start.y },
      goal: { x: lvl.goal.x, y: lvl.goal.y },
      walls: (lvl.walls || []).map((p) => key(p.x, p.y)),
      gems: (lvl.gems || []).map((p) => key(p.x, p.y)),
    };
    $("edName").value = state.name;
    $("edW").value = state.w;
    $("edH").value = state.h;
    saveDraft();
    buildTools();
    buildGrid();
    msg("Loaded into editor. Edit and Save again to make a copy.", "info");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  /* ---------- Wire controls (once) ---------- */
  function wire() {
    $("edBack").addEventListener("click", () => CQ.goHome());

    $("edName").addEventListener("input", (e) => { state.name = e.target.value; saveDraft(); });

    function onSize() {
      let w = parseInt($("edW").value, 10);
      let h = parseInt($("edH").value, 10);
      w = Math.max(3, Math.min(9, isNaN(w) ? 5 : w));
      h = Math.max(3, Math.min(9, isNaN(h) ? 5 : h));
      $("edW").value = w; $("edH").value = h;
      state.w = w; state.h = h;
      clampPlacements();
      saveDraft();
      buildGrid();
    }
    $("edW").addEventListener("change", onSize);
    $("edH").addEventListener("change", onSize);

    $("edPlay").addEventListener("click", () => {
      if (!validate()) return;
      window.Game.openLevel(toLevel(), { returnTo: "screen-editor" });
    });

    $("edSave").addEventListener("click", () => {
      if (!validate()) return;
      const list = loadCustom();
      list.push(toLevel());
      saveCustom(list);
      renderSaved();
      msg(`Saved "${state.name}"! Find it on the Home screen under "My Levels". 🎉`, "ok");
    });

    $("edExport").addEventListener("click", () => {
      if (!validate()) return;
      const json = JSON.stringify(toLevel(), null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json)
          .then(() => msg("Level JSON copied to clipboard! Paste it to share.", "ok"))
          .catch(() => window.prompt("Copy your level JSON:", json));
      } else {
        window.prompt("Copy your level JSON:", json);
      }
    });
  }

  /* ---------- Public open() ---------- */
  function open() {
    if (!built) { state = loadDraft() || defaultState(); wire(); built = true; }
    if (!state) state = defaultState();
    $("edName").value = state.name;
    $("edW").value = state.w;
    $("edH").value = state.h;
    msg("", "");
    buildTools();
    buildGrid();
    renderSaved();
    CQ.showScreen("screen-editor");
  }

  return { open };
})();
