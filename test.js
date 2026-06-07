/* Headless check: run a known-good solution for every level and
   confirm the engine reports a win. Mirrors simulate() from game.js. */
const fs = require("fs");
const vm = require("vm");

const ctx = {};
vm.createContext(ctx);
const LEVELS = vm.runInContext(
  fs.readFileSync(__dirname + "/levels.js", "utf8") + "\nLEVELS;", ctx);

const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const STOP = {};

function simulate(level, code) {
  const s = level.start;
  const state = { x: s.x, y: s.y, dir: s.dir };
  const collected = new Set();
  const walls = new Set(level.walls.map((p) => `${p.x},${p.y}`));
  let crashed = false, ops = 0;
  const bump = () => { if (++ops > 20000) throw new Error("loop"); };
  const open = (x, y) => x >= 0 && y >= 0 && x < level.w && y < level.h && !walls.has(`${x},${y}`);

  const moveForward = () => {
    bump();
    const nx = state.x + DX[state.dir], ny = state.y + DY[state.dir];
    if (!open(nx, ny)) { crashed = true; throw STOP; }
    state.x = nx; state.y = ny;
  };
  const turnRight = () => { bump(); state.dir = (state.dir + 1) % 4; };
  const turnLeft = () => { bump(); state.dir = (state.dir + 3) % 4; };
  const collect = () => {
    bump();
    const k = `${state.x},${state.y}`;
    if (level.gems.some((g) => g.x === state.x && g.y === state.y)) collected.add(k);
  };
  const repeat = (n, fn) => { n = Math.floor(n); for (let i = 0; i < n; i++) { bump(); fn(); } };
  const dr = () => (state.dir + 1) % 4, dl = () => (state.dir + 3) % 4;
  const ahead = (d) => open(state.x + DX[d], state.y + DY[d]);
  const isPathAhead = () => { bump(); return ahead(state.dir); };
  const isPathRight = () => { bump(); return ahead(dr()); };
  const isPathLeft = () => { bump(); return ahead(dl()); };
  const isWallAhead = () => !isPathAhead();
  const isWallRight = () => !isPathRight();
  const isWallLeft = () => !isPathLeft();
  const onGem = () => { bump(); return level.gems.some((g) => g.x === state.x && g.y === state.y) && !collected.has(`${state.x},${state.y}`); };
  const atGoal = () => { bump(); return state.x === level.goal.x && state.y === level.goal.y; };

  const api = { moveForward, turnRight, turnLeft, collect, repeat, isPathAhead, isPathRight, isPathLeft, isWallAhead, isWallRight, isWallLeft, onGem, atGoal };
  try {
    new Function(...Object.keys(api), '"use strict";\n' + code)(...Object.values(api));
  } catch (e) { if (e !== STOP) throw e; }
  const won = state.x === level.goal.x && state.y === level.goal.y && collected.size === level.gems.length && !crashed;
  return { won, crashed, gems: collected.size, need: level.gems.length, pos: [state.x, state.y] };
}

// Known-good solutions, keyed by level id.
const SOLUTIONS = {
  b1: "moveForward()\nmoveForward()\nmoveForward()\nmoveForward()",
  b2: "moveForward()\nmoveForward()\nmoveForward()\nturnRight()\nmoveForward()\nmoveForward()\nmoveForward()",
  b3: "moveForward()\nmoveForward()\ncollect()\nmoveForward()\nmoveForward()",
  b4: "repeat(4,()=>moveForward());turnRight();moveForward();moveForward();collect();moveForward();moveForward();turnRight();repeat(4,()=>moveForward())",
  b5: "repeat(4,()=>moveForward());collect();turnLeft();moveForward();moveForward();collect();moveForward();moveForward()",
  b6: "moveForward();moveForward();collect();turnRight();moveForward();moveForward();collect();moveForward();moveForward();collect();turnLeft();moveForward();moveForward()",
  i1: "repeat(7, () => { moveForward() })",
  i2: "repeat(6, () => { moveForward(); collect() })",
  i3: "repeat(4, () => { moveForward(); moveForward(); moveForward(); moveForward(); collect(); turnRight() })",
  i4: "repeat(5, () => { moveForward(); turnRight(); moveForward(); collect(); turnLeft() })",
  i5: "repeat(3, () => { repeat(2, () => moveForward()); collect() }); moveForward()",
  i6: "repeat(4, () => { repeat(5, () => moveForward()); collect(); turnRight() })",
  a1: "while (isPathAhead()) { moveForward() }",
  a2: "repeat(7, () => { if (onGem()) collect(); moveForward() })",
  a3: "function side(){ repeat(4, () => moveForward()); collect(); turnRight() }\nrepeat(4, () => side())",
  a4: "while(!atGoal()){ if(onGem()) collect(); if(isPathRight()){ turnRight(); moveForward() } else if(isPathAhead()){ moveForward() } else { turnLeft() } } if(onGem()) collect()",
  a5: "while(!atGoal()){ if(onGem()) collect(); moveForward() } if(onGem()) collect()",
  a6: "function step(){ moveForward(); turnRight(); moveForward(); collect(); turnLeft() } repeat(5, () => step())",
};

let pass = 0, fail = 0;
for (const lvl of LEVELS) {
  const sol = SOLUTIONS[lvl.id];
  if (!sol) { console.log(`⚠️  ${lvl.id} (${lvl.name}): no test solution`); fail++; continue; }
  let r;
  try { r = simulate(lvl, sol); }
  catch (e) { console.log(`❌ ${lvl.id} (${lvl.name}): ERROR ${e.message}`); fail++; continue; }
  if (r.won) { console.log(`✅ ${lvl.id} (${lvl.name})  gems ${r.gems}/${r.need}`); pass++; }
  else { console.log(`❌ ${lvl.id} (${lvl.name}): won=false crashed=${r.crashed} gems=${r.gems}/${r.need} pos=${r.pos}`); fail++; }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
