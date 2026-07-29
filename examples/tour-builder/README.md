# Visual Tour Builder

Interactive builder for GuideLoop step configs — pick DOM elements on a demo
canvas, edit and reorder steps, multi-spotlight extras, live preview, and export
**JSON** / **TypeScript**.

This is the Phase **4.1 Visual Tour Builder** (web MVP+). A Chrome extension or
Storybook addon can reuse the same pick → edit → export pipeline later.

## Features

| Feature | Details |
| --- | --- |
| **Pick mode** | Hover + click on the demo canvas only (`elementsFromPoint`) |
| **Selector labels** | Live CSS selector chip while hovering |
| **Stable selectors** | `#id`, `[data-tour-id]`, named inputs, short paths |
| **Validation** | Found / missing / invalid / ambiguous badges |
| **Step list** | Select, ↑↓, drag-and-drop reorder, duplicate, delete |
| **Editor** | Title, content, placement, shape, padding, trigger |
| **Multi-spotlight** | Pick additional targets per step |
| **Preview** | Runs real `<GuideLoop>` against the canvas |
| **Export** | JSON or TypeScript `Step[]` — copy / download |
| **Import** | Paste JSON or load a `.json` file |
| **Draft auto-save** | `localStorage` restore on reload |
| **Undo / redo** | ⌘/Ctrl+Z · ⌘/Ctrl+Shift+Z |
| **Shortcuts** | `P` pick · `Esc` cancel · ⌘/Ctrl+Enter preview |

## Run

```bash
# from repo root
npm run build

cd examples/tour-builder
npm install
npm run dev
```

Open [http://localhost:3104](http://localhost:3104).

```bash
npm test    # selector + import/export unit checks
npm run build
```

## Workflow

1. Press **Pick element** (or `P`).
2. Click a control in the white dashboard (only the canvas is pickable).
3. Edit the step in the right panel; optionally **Pick additional target**.
4. Reorder with drag or ↑ / ↓; duplicate as needed.
5. **Preview tour** (⌘/Ctrl+Enter).
6. **Copy** / **Download** export, or **Import JSON** to continue editing.

## Keyboard

| Key | Action |
| --- | --- |
| `P` | Toggle pick mode |
| `Esc` | Cancel pick / close preview |
| `⌘/Ctrl+Enter` | Preview tour |
| `⌘/Ctrl+Z` | Undo |
| `⌘/Ctrl+Shift+Z` / `⌘/Ctrl+Y` | Redo |

## Out of scope (later)

- Chrome extension injection into arbitrary sites
- Storybook addon packaging
- Polygon point editor UI
