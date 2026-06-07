/* ===========================================================
   QuestMarrow level data
   -----------------------------------------------------------
   Grid coordinates: x = column (0 = left), y = row (0 = top)
   Directions:       0 = up(north), 1 = right, 2 = down, 3 = left
   palette: which command buttons appear above the editor
   starter: text pre-filled in the code editor
   par:     fewest LINES of code for a 3-star solution
   =========================================================== */

const WORLDS = [
  {
    id: "beginner",
    emoji: "🌱",
    title: "Beginner — Give Commands",
    desc: "Tell Robo exactly what to do, one step at a time.",
  },
  {
    id: "intermediate",
    emoji: "🚀",
    title: "Intermediate — Loops",
    desc: "Stop repeating yourself! Use loops to do more with less.",
  },
  {
    id: "advanced",
    emoji: "🧙",
    title: "Advanced — Think & Decide",
    desc: "Use sensors, if-statements and functions like a real coder.",
  },
];

const LEVELS = [
  /* ---------- BEGINNER ---------- */
  {
    id: "b1", world: "beginner", name: "First Steps",
    w: 5, h: 3, start: { x: 0, y: 1, dir: 1 }, goal: { x: 4, y: 1 },
    walls: [], gems: [],
    palette: ["move", "left", "right", "collect"],
    par: 4,
    starter: "moveForward()\n",
    instructions:
      "Drive Robo 🤖 to the flag 🚩.<br>Each <code>moveForward()</code> moves one square. " +
      "Click the blue button or type it 4 times!",
    hint: "You need to move forward 4 times to reach the flag.",
  },
  {
    id: "b2", world: "beginner", name: "Turn Right",
    w: 4, h: 4, start: { x: 0, y: 0, dir: 1 }, goal: { x: 3, y: 3 },
    walls: [], gems: [],
    palette: ["move", "left", "right", "collect"],
    par: 6,
    starter: "",
    instructions:
      "The flag is in the bottom-right corner.<br>Use <code>turnRight()</code> to turn, " +
      "then keep moving. Robo starts facing right ▶.",
    hint: "Move right 3 times, turnRight(), then move down 3 times.",
  },
  {
    id: "b3", world: "beginner", name: "Collect a Gem",
    w: 5, h: 3, start: { x: 0, y: 1, dir: 1 }, goal: { x: 4, y: 1 },
    walls: [], gems: [{ x: 2, y: 1 }],
    palette: ["move", "left", "right", "collect"],
    par: 6,
    starter: "",
    instructions:
      "Grab the gem 💎 on the way to the flag!<br>Stand on the gem, then use " +
      "<code>collect()</code>. You must collect every gem to win.",
    hint: "Move twice, collect(), then move two more times to the flag.",
  },
  {
    id: "b4", world: "beginner", name: "Around the Wall",
    w: 5, h: 5, start: { x: 0, y: 4, dir: 0 }, goal: { x: 4, y: 4 },
    walls: [{ x: 2, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 2 }],
    gems: [{ x: 2, y: 0 }],
    palette: ["move", "left", "right", "collect"],
    par: 10,
    starter: "",
    instructions:
      "Walls 🟫 block the way — crashing into one ends the run!<br>Go up and " +
      "<b>around</b> the wall to grab the gem 💎, then reach the flag 🚩.",
    hint: "Go up to the top, across the top row (collect the gem), then back down.",
  },

  {
    id: "b5", world: "beginner", name: "The Corner",
    w: 5, h: 5, start: { x: 0, y: 4, dir: 1 }, goal: { x: 4, y: 0 },
    walls: [], gems: [{ x: 4, y: 4 }, { x: 4, y: 2 }],
    palette: ["move", "left", "right", "collect"],
    par: 8,
    starter: "",
    instructions:
      "Time to turn the other way! Drive to the bottom-right gem 💎, then use " +
      "<code>turnLeft()</code> to head up the right side, grabbing the second gem on the way " +
      "to the flag 🚩.",
    hint: "Move right 4 (collect), turnLeft(), then move up 4 — collect the gem at the halfway point.",
  },
  {
    id: "b6", world: "beginner", name: "Zig Then Zag",
    w: 5, h: 5, start: { x: 0, y: 4, dir: 0 }, goal: { x: 4, y: 0 },
    walls: [], gems: [{ x: 0, y: 2 }, { x: 2, y: 2 }, { x: 4, y: 2 }],
    palette: ["move", "left", "right", "collect"],
    par: 13,
    starter: "",
    instructions:
      "Three gems 💎 sit in the middle row. Climb up to them, slide across to grab all three, " +
      "then climb to the flag 🚩. Mix <code>turnLeft()</code> and <code>turnRight()</code>!",
    hint: "Up 2 (collect), turnRight, move-collect across the row, turnLeft, up 2 to the flag.",
  },

  /* ---------- INTERMEDIATE ---------- */
  {
    id: "i1", world: "intermediate", name: "The Long Hall",
    w: 8, h: 3, start: { x: 0, y: 1, dir: 1 }, goal: { x: 7, y: 1 },
    walls: [], gems: [],
    palette: ["move", "left", "right", "collect", "repeat"],
    par: 3,
    starter: "repeat(7, () => {\n  moveForward()\n})\n",
    instructions:
      "That's a long way! Instead of typing <code>moveForward()</code> 7 times, " +
      "use a loop:<br><code>repeat(7, () => { ... })</code> runs the code inside 7 times.",
    hint: "repeat(7, () => { moveForward() }) walks all the way across.",
  },
  {
    id: "i2", world: "intermediate", name: "Gem Lane",
    w: 7, h: 3, start: { x: 0, y: 1, dir: 1 }, goal: { x: 6, y: 1 },
    walls: [], gems: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }],
    palette: ["move", "left", "right", "collect", "repeat"],
    par: 4,
    starter: "repeat(6, () => {\n  moveForward()\n  collect()\n})\n",
    instructions:
      "A whole row of gems 💎! Loop a <b>move then collect</b> to scoop them all up. " +
      "Empty squares are fine to <code>collect()</code> on — it just grabs nothing.",
    hint: "repeat 6 times: moveForward() then collect().",
  },
  {
    id: "i3", world: "intermediate", name: "Square Dance",
    w: 5, h: 5, start: { x: 0, y: 4, dir: 0 }, goal: { x: 0, y: 4 },
    walls: [], gems: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }],
    palette: ["move", "left", "right", "collect", "repeat"],
    par: 5,
    starter: "repeat(4, () => {\n  // move along one side, then turn\n})\n",
    instructions:
      "Walk the edges of the room in a big square to collect all 3 gems and return home. " +
      "A square is the <b>same steps + a turn</b>, repeated 4 times!",
    hint: "repeat(4): moveForward 4 times, collect(), then turnRight().",
  },
  {
    id: "i4", world: "intermediate", name: "Staircase",
    w: 6, h: 6, start: { x: 0, y: 5, dir: 0 }, goal: { x: 5, y: 0 },
    walls: [],
    gems: [{ x: 1, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 4, y: 1 }],
    palette: ["move", "left", "right", "collect", "repeat"],
    par: 6,
    starter: "repeat(5, () => {\n\n})\n",
    instructions:
      "Climb the staircase! The pattern <b>up, turn, right, turn</b> repeats. " +
      "Collect each gem 💎 as you pass it on the way to the top-right flag.",
    hint: "repeat 5 times: moveForward(), turnRight(), moveForward(), collect(), turnLeft().",
  },

  {
    id: "i5", world: "intermediate", name: "Three Hops",
    w: 8, h: 3, start: { x: 0, y: 1, dir: 1 }, goal: { x: 7, y: 1 },
    walls: [], gems: [{ x: 2, y: 1 }, { x: 4, y: 1 }, { x: 6, y: 1 }],
    palette: ["move", "left", "right", "collect", "repeat"],
    par: 5,
    starter: "repeat(3, () => {\n  // hop two squares, then collect\n})\n",
    instructions:
      "The gems 💎 are spaced 2 apart. Put a loop <b>inside</b> a loop! The outer loop runs " +
      "3 times; each time, a small inner loop hops forward twice before you " +
      "<code>collect()</code>.",
    hint: "repeat(3, () => { repeat(2, () => moveForward()); collect() }); then one more moveForward().",
  },
  {
    id: "i6", world: "intermediate", name: "The Big Lap",
    w: 6, h: 6, start: { x: 0, y: 5, dir: 0 }, goal: { x: 0, y: 5 },
    walls: [], gems: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }],
    palette: ["move", "left", "right", "collect", "repeat"],
    par: 4,
    starter: "repeat(4, () => {\n\n})\n",
    instructions:
      "A bigger room means a bigger square! Loop 4 times: walk one full side (5 squares), " +
      "<code>collect()</code> the corner gem 💎, then <code>turnRight()</code>. End back home.",
    hint: "repeat(4, () => { repeat(5, () => moveForward()); collect(); turnRight() })",
  },

  /* ---------- ADVANCED ---------- */
  {
    id: "a1", world: "advanced", name: "Feel the Wall",
    w: 8, h: 3, start: { x: 0, y: 1, dir: 1 }, goal: { x: 7, y: 1 },
    walls: [], gems: [],
    palette: ["move", "left", "right", "collect", "while", "sense"],
    par: 5,
    starter: "while (isPathAhead()) {\n  moveForward()\n}\n",
    instructions:
      "How far is the far wall? Robo doesn't know — so don't count steps! Use the sensor " +
      "<code>isPathAhead()</code> (it's <b>true</b> when the next square is open). A " +
      "<code>while</code> loop keeps walking until the edge blocks the way.",
    hint: "while (isPathAhead()) { moveForward() } walks all the way to the far wall.",
  },
  {
    id: "a2", world: "advanced", name: "Smart Collector",
    w: 8, h: 3, start: { x: 0, y: 1, dir: 1 }, goal: { x: 7, y: 1 },
    walls: [],
    gems: [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 6, y: 1 }],
    palette: ["move", "left", "right", "collect", "repeat", "sense"],
    par: 6,
    starter: "repeat(7, () => {\n  if (onGem()) {\n    collect()\n  }\n  moveForward()\n})\n",
    instructions:
      "Only collect when there's something to grab! <code>onGem()</code> is <b>true</b> when Robo " +
      "stands on a gem. Combine it with <code>if (...) { ... }</code> to decide.",
    hint: "Loop across the row: if (onGem()) collect(), then moveForward().",
  },
  {
    id: "a3", world: "advanced", name: "Make a Function",
    w: 5, h: 5, start: { x: 0, y: 4, dir: 0 }, goal: { x: 0, y: 4 },
    walls: [],
    gems: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }],
    palette: ["move", "left", "right", "collect", "repeat", "func"],
    par: 8,
    starter:
      "function side() {\n  repeat(4, () => moveForward())\n  collect()\n  turnRight()\n}\n\n" +
      "repeat(4, () => side())\n",
    instructions:
      "Real coders give names to ideas. Write your own command with " +
      "<code>function side() { ... }</code>, then call <code>side()</code> whenever you need it. " +
      "Walk the square using your function.",
    hint: "Define side() to walk one edge + turn, then repeat(4, () => side()).",
  },
  {
    id: "a4", world: "advanced", name: "The Maze",
    w: 7, h: 7, start: { x: 0, y: 6, dir: 0 }, goal: { x: 6, y: 6 },
    walls: [
      // x=1 wall, open at the top (y=0) — connects column 0 → 2
      { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 5 }, { x: 1, y: 6 },
      // x=3 wall, open at the bottom (y=6) — connects column 2 → 4
      { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
      // x=5 wall, open at the top (y=0) — connects column 4 → 6
      { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 },
    ],
    gems: [{ x: 0, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 6, y: 3 }],
    palette: ["move", "left", "right", "collect", "while", "repeat", "sense", "func"],
    par: 12,
    starter:
      "// The classic 'right-hand rule' solves any maze!\n" +
      "// Try turning right when you can, else go straight,\n" +
      "// else turn left. Collect gems along the way.\n\n",
    instructions:
      "The big finale — a real maze! 🧩 Use everything: <code>while</code>, <code>if/else</code>, " +
      "sensors and functions. Tip: the <b>right-hand rule</b> (always hug the right wall) reaches the exit. " +
      "Sensors: <code>isPathAhead()</code>, <code>isWallRight()</code>, <code>onGem()</code>.",
    hint:
      "while (!atGoal()) { if (onGem()) collect(); if (isPathRight()) { turnRight(); moveForward() } " +
      "else if (isPathAhead()) { moveForward() } else { turnLeft() } }",
  },
  {
    id: "a5", world: "advanced", name: "Auto Sweep",
    w: 8, h: 3, start: { x: 0, y: 1, dir: 1 }, goal: { x: 7, y: 1 },
    walls: [], gems: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 5, y: 1 }],
    palette: ["move", "left", "right", "collect", "while", "sense"],
    par: 5,
    starter:
      "while (!atGoal()) {\n  if (onGem()) collect()\n  moveForward()\n}\n",
    instructions:
      "Let the robot think for itself! Use <code>while (!atGoal())</code> to keep going until " +
      "Robo reaches the flag, and <code>if (onGem())</code> to grab gems 💎 automatically — " +
      "no counting squares at all.",
    hint: "while (!atGoal()) { if (onGem()) collect(); moveForward() }",
  },
  {
    id: "a6", world: "advanced", name: "Function Stairs",
    w: 6, h: 6, start: { x: 0, y: 5, dir: 0 }, goal: { x: 5, y: 0 },
    walls: [],
    gems: [{ x: 1, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 4, y: 1 }],
    palette: ["move", "left", "right", "collect", "repeat", "func"],
    par: 6,
    starter:
      "function step() {\n  // climb one stair and grab the gem\n}\n\nrepeat(5, () => step())\n",
    instructions:
      "Climb the staircase again — but this time, teach Robo a reusable <code>function step()</code> " +
      "for a single stair, then <code>repeat</code> it. Clean code = happy coder! 🧙",
    hint:
      "function step() { moveForward(); turnRight(); moveForward(); collect(); turnLeft() } " +
      "then repeat(5, () => step()).",
  },
];
