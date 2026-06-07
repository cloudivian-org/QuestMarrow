/* ===========================================================
   QuestMarrow — Free Draw (turtle graphics)
   A creative sandbox: kids write code to move a pen and draw.
   Great for older kids exploring angles, loops and patterns.
   =========================================================== */
window.Turtle = (function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const MAX_OPS = 200000;
  const MAX_SEGS = 30000;

  let canvas, ctx, built = false;

  const HELP =
    "Move the turtle 🐢 to draw! Commands:<br>" +
    "<code>forward(n)</code> / <code>back(n)</code> — move and draw<br>" +
    "<code>right(deg)</code> / <code>left(deg)</code> — turn<br>" +
    "<code>penUp()</code> / <code>penDown()</code> — lift or drop the pen<br>" +
    "<code>color(\"red\")</code> · <code>width(n)</code> · " +
    "<code>repeat(n, () =&gt; { ... })</code>";

  const EXAMPLES = [
    { name: "⬛ Square", code: "repeat(4, () => {\n  forward(110)\n  right(90)\n})\n" },
    { name: "⭐ Star", code: "color(\"gold\")\nwidth(3)\nrepeat(5, () => {\n  forward(160)\n  right(144)\n})\n" },
    { name: "🌀 Spiral", code: "let step = 2\nrepeat(80, () => {\n  forward(step)\n  right(24)\n  step = step + 3\n})\n" },
    { name: "🌸 Flower", code: "color(\"deeppink\")\nrepeat(36, () => {\n  repeat(4, () => { forward(90); right(90) })\n  right(10)\n})\n" },
    {
      name: "🌈 Rainbow", code:
        "const colors = [\"red\",\"orange\",\"gold\",\"green\",\"blue\",\"purple\"]\n" +
        "let i = 0\nrepeat(60, () => {\n  color(colors[i % 6])\n  i = i + 1\n  forward(140)\n  right(61)\n})\n",
    },
  ];

  function buildExamples() {
    const box = $("ttExamples");
    box.innerHTML = "";
    EXAMPLES.forEach((ex) => {
      const b = document.createElement("button");
      b.className = "chip c-loop";
      b.textContent = ex.name;
      b.addEventListener("click", () => {
        $("ttEditor").value = ex.code;
        run();
      });
      box.appendChild(b);
    });
  }

  function clearCanvas() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function msg(text, cls) {
    const el = $("ttMsg");
    el.textContent = text;
    el.className = "message " + (cls || "");
  }

  function friendlyError(e) {
    const m = e.message || String(e);
    if (/is not defined/.test(m)) {
      return `I don't know the command "${m.split(" ")[0]}". Check your spelling! 🤔`;
    }
    if (/Unexpected/.test(m) || e instanceof SyntaxError) {
      return "There's a typo somewhere — check your ( ) and { }. 🔧";
    }
    return "Oops: " + m;
  }

  /* ---------- Execute user code → list of line segments ---------- */
  function compute(code) {
    const segs = [];
    const st = {
      x: canvas.width / 2, y: canvas.height / 2,
      angle: 0, pen: true, color: "#2b6bff", width: 3,
    };
    let ops = 0;
    const bump = () => {
      if (++ops > MAX_OPS || segs.length > MAX_SEGS)
        throw new Error("That makes a LOT of lines — try smaller numbers or fewer repeats! 🌀");
    };
    const rad = () => (st.angle * Math.PI) / 180;
    function forward(n) {
      bump();
      n = Number(n) || 0;
      const nx = st.x + n * Math.sin(rad());
      const ny = st.y - n * Math.cos(rad());
      if (st.pen) segs.push({ x1: st.x, y1: st.y, x2: nx, y2: ny, color: st.color, width: st.width });
      st.x = nx; st.y = ny;
    }
    const api = {
      forward, fd: forward,
      back: (n) => forward(-n), bk: (n) => forward(-n),
      right: (d) => { bump(); st.angle += Number(d) || 0; },
      left: (d) => { bump(); st.angle -= Number(d) || 0; },
      rt: (d) => { bump(); st.angle += Number(d) || 0; },
      lt: (d) => { bump(); st.angle -= Number(d) || 0; },
      penUp: () => { st.pen = false; }, penDown: () => { st.pen = true; },
      color: (c) => { st.color = String(c); },
      width: (n) => { st.width = Math.max(1, Math.min(40, Number(n) || 1)); },
      repeat: (n, fn) => { n = Math.floor(n); for (let i = 0; i < n; i++) { bump(); fn(); } },
    };

    const fn = new Function(...Object.keys(api), '"use strict";\n' + code);
    fn(...Object.values(api));
    return { segs, end: st };
  }

  /* ---------- Animate drawing ---------- */
  let rafId = null;
  function run() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    msg("", "");
    let result;
    try {
      result = compute($("ttEditor").value);
    } catch (e) {
      msg(friendlyError(e), "err");
      return;
    }
    clearCanvas();
    const segs = result.segs;
    ctx.lineCap = "round";
    let i = 0;
    const perFrame = Math.max(1, Math.ceil(segs.length / 90));

    function step() {
      for (let k = 0; k < perFrame && i < segs.length; k++, i++) {
        const s = segs[i];
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
      }
      if (i < segs.length) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = null;
        drawTurtle(result.end);
        msg(segs.length ? "🎨 Beautiful! Try changing the numbers." : "Add some forward() lines to draw!", "ok");
      }
    }
    step();
  }

  function drawTurtle(st) {
    ctx.save();
    ctx.translate(st.x, st.y);
    ctx.rotate((st.angle * Math.PI) / 180);
    ctx.font = "22px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐢", 0, 0);
    ctx.restore();
  }

  function wire() {
    $("ttBack").addEventListener("click", () => CQ.goHome());
    $("ttRun").addEventListener("click", run);
    $("ttClear").addEventListener("click", () => { if (rafId) cancelAnimationFrame(rafId); clearCanvas(); msg("", ""); });
    // Tab inserts spaces instead of leaving the editor.
    $("ttEditor").addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const el = e.target, s = el.selectionStart, en = el.selectionEnd;
        el.value = el.value.slice(0, s) + "  " + el.value.slice(en);
        el.selectionStart = el.selectionEnd = s + 2;
      }
    });
  }

  function open() {
    if (!built) {
      canvas = $("ttCanvas");
      ctx = canvas.getContext("2d");
      $("ttHelp").innerHTML = HELP;
      if (!$("ttEditor").value) $("ttEditor").value = EXAMPLES[0].code;
      buildExamples();
      wire();
      clearCanvas();
      built = true;
    }
    CQ.showScreen("screen-turtle");
  }

  return { open };
})();
