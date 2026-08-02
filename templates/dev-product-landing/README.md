# Dev Product Landing Template

Portable **developer-product landing shell** extracted from the GuideLoop demo.

Use it for OSS / SDK / library marketing pages that need:

- Vertical **tour rail** layout (left-shifted content column)
- **Theme switcher** (`data-theme` presets)
- Nested **install stack dropdown** (pick stack → copy install)
- Compact **stack explorer** (rail tabs + detail panel + code window)
- Dense mono UI chrome, responsive chips on narrow screens

No GuideLoop runtime dependency — plain **Vite + React + TypeScript**.

## Quick start

```bash
cd templates/dev-product-landing
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

```bash
npm run build    # production build → dist/
npm run preview  # preview dist/
```

## Customize for another project

### 1. Content — `src/config.ts`

Edit the `product` object:

| Field | Purpose |
|--------|---------|
| `name`, `version` | Header brand mark + badge |
| `tagline` | Two-line H1 (`[plain, gradient]`) |
| `description` | Hero subtitle |
| `githubUrl` | Header GitHub button |
| `stats` | Hero stat pills |
| `themes` | Theme menu entries (`id` must match CSS) |
| `stacks` | Install options + explorer tabs/panels |
| `footerLinks` | Footer nav |

Stack cards need: `label`, `shortLabel`, `packageName`, `install`, `code`, `blurb`, `apiHint`, `peers`, `tags`, etc.

### 2. Brand colors — `src/styles/tokens.css`

Override `--brand`, `--color-canvas`, `--color-accent`, … per `html[data-theme="…"]`.

Default presets: `slate` · `editorial` · `terminal` · `nordic`.

### 3. Layout chrome — `src/styles/shell.css`

Spacing rail (`--rail-left`), page max width (`--page-max`), radii, install-pill / stack-explorer rules live here.

Dropdown overflow is scoped: hero stays `overflow: hidden` for ambient effects; only while the install pill is hovered / focused / open does overflow become `visible` (via `:has(...)`).

### 4. Logo

Replace `.brand-mark` text with an SVG or image in `App.tsx` / `shell.css`.

## Copy into a new repo

```bash
cp -R templates/dev-product-landing ~/Projects/my-lib-landing
cd ~/Projects/my-lib-landing
# optional: rename package in package.json
npm install
npm run dev
```

Or scaffold from this folder as a GitHub template by copying the tree into a new repository root.

## File map

```
templates/dev-product-landing/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
└── src/
    ├── main.tsx
    ├── App.tsx              # shell UI (header, hero, explorer, footer)
    ├── config.ts            # ★ product content — edit first
    ├── components/Icons.tsx
    └── styles/
        ├── tokens.css       # ★ themes / brand
        └── shell.css        # ★ layout chrome
```

## Notes

- **a11y:** skip link, tablist/tab/tabpanel, listbox menus, Escape + outside click to close.
- **Keyboard:** stack tabs support Arrow / Home / End.
- **No Next.js** — drop `App.tsx` into Next App Router with minor import path tweaks if you prefer.
- GuideLoop-specific demo extras (WebGL footer shader, live spotlight tour) are **not** included; this template keeps the reusable chrome only.

## License

Same as the parent monorepo (MIT), unless you relicense a copied project.
