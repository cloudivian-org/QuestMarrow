# 🤖 QuestMarrow — Coding Adventures for Kids

A colorful, browser-based platform that teaches kids to code by playing. Kids
guide a hero through puzzles writing **real JavaScript**, build their own levels,
and draw with code — growing from beginner to advanced. No installation, no
accounts, no internet required.

## ▶ How to start

**Just double-click `index.html`** — it opens in any web browser (Chrome, Safari,
Edge, Firefox). That's it.

## 🕹 Three ways to play

### 🎮 Play Levels — 18 puzzles across 3 worlds
Guide your hero to collect every 💎 and reach the flag 🚩.

| World | Levels | Concepts |
|-------|:------:|----------|
| 🌱 **Beginner** | 6 | Sequencing, precise commands, turning, collecting |
| 🚀 **Intermediate** | 6 | Loops (`repeat`), nested loops, reusing patterns |
| 🧙 **Advanced** | 6 | Sensors, `while` loops, `if/else`, `function`s, a maze |

Commands kids use: `moveForward()`, `turnLeft()`, `turnRight()`, `collect()`,
`repeat(n, () => {...})`, `while (...) {...}`, sensors (`isPathAhead()`,
`isPathRight()`, `onGem()`, `atGoal()`), and their own `function`s.

### ✏️ Create a Level — built-in level editor
Click squares to place walls 🟫, gems 💎, the start 🤖 and the flag 🚩. Then
**Test Play**, **Save** (it appears under "My Levels" on the home screen), or
**Export** the level as JSON to share. Saved levels and drafts persist in the browser.

### 🎨 Free Draw — turtle graphics for older kids
A creative sandbox: write code to move a pen and draw. Commands include
`forward(n)`, `back(n)`, `right(deg)`, `left(deg)`, `penUp()`, `penDown()`,
`color("red")`, `width(n)`, and `repeat(...)`. One-click examples draw a square,
star, spiral, flower and rainbow to remix.

## 🎨 Make it yours
- **Pick your hero**: 🤖 🐱 🐶 🦊 🐢 🚀 🐰 🦉 🐝 🦄
- **Pick a theme**: 🌌 Space · 🌊 Ocean · 🍭 Candy · 🌲 Forest · 🌅 Sunset

Stars, unlocked levels, your hero and theme all save automatically in the browser.

## 🧒 Kid-friendly by design
- Click colored buttons **or** type — the buttons insert real code, so "blocks" *become* code.
- Friendly error messages ("I don't know that command — check your spelling! 🤔").
- ⭐ star ratings reward shorter solutions, hints when stuck, sounds + confetti.
- Safe: code runs locally in the browser with an infinite-loop guard.

## 🛠 For parents — adding hand-written levels

Open `levels.js` and copy a level object (each level is just data):

```js
{
  id: "b7", world: "beginner", name: "My Level",
  w: 5, h: 5,                       // grid size (columns, rows)
  start: { x: 0, y: 4, dir: 1 },    // dir: 0=up 1=right 2=down 3=left
  goal:  { x: 4, y: 0 },
  walls: [{ x: 2, y: 2 }],          // squares the hero can't enter
  gems:  [{ x: 1, y: 1 }],          // must collect them all
  palette: ["move", "left", "right", "collect"], // which buttons show
  par: 6,                           // lines of code for 3 stars
  starter: "",                      // pre-filled editor text
  instructions: "Reach the flag!",
  hint: "Move up, then across.",
}
```

After editing, confirm every level is still solvable:

```bash
node test.js
```

(Add a known-good solution for your new level to the `SOLUTIONS` map in `test.js`.)

## 📁 Files
- `index.html` — page layout & screens
- `styles.css` — looks & animations
- `app.js` — shared layer (screens, themes, character)
- `levels.js` — all 18 puzzles (edit to add more)
- `game.js` — the puzzle engine
- `editor.js` — the level editor
- `turtle.js` — the Free Draw turtle-graphics mode
- `test.js` — headless check that every level can be solved

## 🔗 Project
<https://github.com/cloudivian-org/QuestMarrow>

Have fun coding! 🚀
