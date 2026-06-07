/* ===========================================================
   QuestMarrow — shared app layer (loaded first)
   Provides window.CQ: screen switching, theme + character state.
   Other modules (game.js, editor.js, turtle.js) build on this.
   =========================================================== */
window.CQ = (function () {
  "use strict";

  const CHAR_KEY = "questmarrow_char_v1";
  const THEME_KEY = "questmarrow_theme_v1";

  const CHARACTERS = ["🤖", "🐱", "🐶", "🦊", "🐢", "🚀", "🐰", "🦉", "🐝", "🦄"];

  const THEMES = {
    space:  { label: "🌌 Space",  bg1: "#1b2a6b", bg2: "#4a2b8a", accent: "#ff7a59", blue: "#4c8dff" },
    ocean:  { label: "🌊 Ocean",  bg1: "#073b5e", bg2: "#0f7a8a", accent: "#ff9f45", blue: "#2bb3c0" },
    candy:  { label: "🍭 Candy",  bg1: "#9c2d72", bg2: "#6a2db0", accent: "#ff5da8", blue: "#7b6bff" },
    forest: { label: "🌲 Forest", bg1: "#1d5b2a", bg2: "#2a6b54", accent: "#ff8a3d", blue: "#3a9d6b" },
    sunset: { label: "🌅 Sunset", bg1: "#b5371f", bg2: "#7a2b6b", accent: "#ffb142", blue: "#ff6b6b" },
  };

  let character = "🤖";
  let theme = "space";
  try {
    character = localStorage.getItem(CHAR_KEY) || character;
    theme = localStorage.getItem(THEME_KEY) || theme;
  } catch (e) {}
  if (!THEMES[theme]) theme = "space";

  let onHome = null; // game.js registers a callback to re-render the home screen

  function applyTheme(name) {
    const t = THEMES[name] || THEMES.space;
    const r = document.documentElement.style;
    r.setProperty("--bg1", t.bg1);
    r.setProperty("--bg2", t.bg2);
    r.setProperty("--accent", t.accent);
    r.setProperty("--blue", t.blue);
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
    const el = document.getElementById(id);
    if (el) el.classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  // Apply the saved theme immediately so there's no flash of default colors.
  applyTheme(theme);

  return {
    CHARACTERS, THEMES,
    getCharacter: () => character,
    setCharacter(c) {
      character = c;
      try { localStorage.setItem(CHAR_KEY, c); } catch (e) {}
    },
    getTheme: () => theme,
    setTheme(name) {
      if (!THEMES[name]) return;
      theme = name;
      applyTheme(name);
      try { localStorage.setItem(THEME_KEY, name); } catch (e) {}
    },
    showScreen,
    registerHome(fn) { onHome = fn; },
    goHome() {
      showScreen("screen-home");
      if (onHome) onHome();
    },
  };
})();
