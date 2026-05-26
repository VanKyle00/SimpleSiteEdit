# SimpleSiteEdit

An auto-detecting local editor for simple personal sites. Point it at a directory; it figures out what kind of site is there, finds the posts/projects/etc., and opens a browser editor over them — no config file required.

## What it covers

| Site type | Detection signal | Editable collections |
|---|---|---|
| Jekyll | `_config.yml` | `_posts/` |
| Hugo | `hugo.{toml,yaml,json}` | `content/posts/`, `content/blog/` |
| Eleventy | `.eleventy.js`, `eleventy.config.{js,cjs}` | `posts/`, `_posts/` |
| Astro | `astro.config.{mjs,ts,js}` | `src/content/blog/`, `src/content/posts/` |
| Next.js + MDX | `next.config.*` plus `@next/mdx` in deps | `posts/`, `content/posts/` |
| Vanilla HTML + JS object literals | `*.html` plus top-level `const ARR = [{...}]` in a JS file | every uniform-shape top-level array |
| Plain markdown folder (no SSG) | None of the above, plus a folder of `*.md` files with frontmatter | the first matching folder (`content/posts`, `posts`, `_posts`, `src/content/blog`, …) |

The editor backend is **[Lume CMS](https://github.com/lumeland/cms)**, which runs natively under Deno. SimpleSiteEdit generates a config from what it inferred, serves the admin page, and writes back to your files.

## What it is NOT

- A production CMS. No auth, no multi-user, no approval workflows.
- A site generator. SimpleSiteEdit doesn't build or deploy anything. It only edits files.
- A migration tool. It edits files in place.

## Get started

### 1. Install prerequisites

You need two things installed system-wide:

- **Node.js 22 or newer** — https://nodejs.org/ (LTS is fine)
- **Deno** — https://deno.com/ (one-line installer on every platform)

To check both are available, open a terminal and run:

```
node --version    # should print v22.x.x or newer
deno --version    # should print something starting with "deno 2."
```

### 2. Get SimpleSiteEdit

Either clone:

```
git clone https://github.com/VanKyle00/SimpleSiteEdit.git
cd SimpleSiteEdit
npm install
```

…or download the repo as a ZIP from GitHub, extract it, open a terminal in the extracted folder, and run `npm install`.

`npm install` only needs to run once.

### 3. Run it

**Windows (easy mode):** double-click `Start SimpleSiteEdit.bat` at the repo root. A native folder picker opens — pick your site's folder and click OK. The browser auto-opens to the editor. Close the console window or press Ctrl+C to stop. The launcher checks for Node 22+, Deno, and `node_modules` first and gives a friendly message if anything is missing. The last folder you picked is remembered next time.

**Any platform (CLI):**

```
node --experimental-strip-types src/bin.ts <path-to-your-site>
```

The browser opens at `http://localhost:8000/`. Press `Ctrl+C` to stop.

## Usage

To inspect a site without launching anything (prints the detected SSG, collections, fields, and notes as JSON):

```
node --experimental-strip-types src/bin.ts <path-to-site> --dry-run
```

When you do launch the editor (`Start SimpleSiteEdit.bat` on Windows, or the CLI above without `--dry-run`), `deno serve` listens on `localhost:8000` and the browser opens to the admin UI. Edits made there write back to the files in your site.

### Flags

- `--dry-run` — print the inferred `SiteIR` and exit; do not launch any servers.
- `--no-open` — skip the auto-open of the browser (useful for headless / scripting).
- `--backend lume` — explicit backend selection. Currently `lume` is the only option; the flag exists for forward compatibility.
- `--persist` — write Lume's `lume/_cms.ts` config to the site root instead of `.simplesiteedit/`. Useful if you want to commit the config and run Lume CMS directly (without `SimpleSiteEdit`). Refused on js-literals sites — the shadow dir is intrinsic to the round-trip and can't be persisted meaningfully. Refused if a target file already exists; pass `--force` to overwrite.
- `--force` — allow `--persist` to overwrite existing config files.
- `--images <path>` — override the auto-detected image upload folder. `<path>` is absolute or relative to the site root. The URL prefix inserted by the markdown widget is derived from `<path>`: `static/<x>` and `public/<x>` become `/<x>/`; anything else becomes `/<path>/`.

### Inserting images into markdown bodies

The markdown editor in Lume CMS has an image-insert button. SimpleSiteEdit auto-detects where uploaded images should land by checking, in order:

| Folder            | Public URL prefix    | Convention           |
|-------------------|----------------------|----------------------|
| `assets/images/`  | `/assets/images/`    | Jekyll               |
| `static/images/`  | `/images/`           | Hugo                 |
| `public/images/`  | `/images/`           | Next.js / Astro      |
| `images/`         | `/images/`           | generic / JS-literal |

If none exist, SimpleSiteEdit falls back to `<siteRoot>/images/` and creates it on launch. Override with `--images <path>` for non-standard layouts (e.g. Astro's `src/assets/`, Hugo page bundles, Eleventy with custom passthrough config).

## How vanilla-JS sites work (the round-trip)

If your site stores content as top-level `const ARR = [{...}, {...}]` in a JS file, SimpleSiteEdit:

1. Parses the JS file with Babel/recast.
2. Explodes each array into `<site>/.simplesiteedit/data/<ARR>/0001.json`, `0002.json`, … (one entry per file, filename = position).
3. Points Lume CMS at those JSON folders (so the editor sees standard JSON collections).
4. Watches `.simplesiteedit/data/` with chokidar; on any change, re-assembles the files and rewrites just the matching `const`'s initializer in the original JS file. Formatting and comments outside the modified node are preserved verbatim.

### Known limitations on JS-literal sites

- **The whole modified array reformats.** Recast preserves formatting for unchanged nodes; the modified array's interior is re-printed in canonical style.
- **2D arrays and arrays of primitives are skipped** with a note (not editable).
- **Cross-collection references are not tracked.** If your JS has `link: { id: '0-0' }` pointers between arrays, reordering or deleting entries can break them; we don't rewrite refs.
- **External edits to the source JS file abort the next write.** If you hand-edit `app.js` while SimpleSiteEdit is running, the watcher detects the mtime change and refuses to inject (so your edits aren't clobbered). Stop and restart SimpleSiteEdit to re-sync.

## Architecture

```
src/
├── ir/types.ts            Canonical SiteIR type
├── detect/                Per-SSG detectors (one file each); first match wins
│                            jekyll · hugo · eleventy · astro · next-mdx · js-literals · generic
├── infer/
│   ├── collections.ts     Locate content folders per SSG; produce stubs
│   └── schema.ts          Sample entries; union fields; infer types
├── pipeline.ts            Wire detect → infer → SiteIR
├── backends/
│   ├── types.ts           BackendAdapter interface
│   ├── choose.ts          Pick a backend (preferred or first available)
│   ├── lume.ts            Emit Lume _cms.ts; spawn `deno serve`
│   └── util.ts            cross-spawn wrapper, openInBrowser, hasCommand
├── js-roundtrip/
│   ├── explode.ts         Parse JS const arrays → shadow JSON files
│   ├── inject.ts          Reassemble shadow files → rewrite JS file (recast)
│   └── watch.ts           chokidar watcher with debounce + mtime conflict detection
├── cli.ts                 Argument parsing + orchestration
└── bin.ts                 Entry point
```

## Development

```
npm test          # run vitest once
npm run test:watch
```

Coverage hits each detector against every fixture (positive + cross-negative; 7×7 matrix), the pipeline end-to-end per SSG, the JS round-trip identity, the watcher debounce + mtime conflict detection, and the Lume backend's config emission + overwrite protection.

## Status

Prototype. What's verified live so far:

- **All 7 detectors** + their fixtures pass cross-matrix tests.
- **JS-literal round-trip** is byte-identical for no-op on the author's 61KB `app.js`; modifications preserve everything outside the changed array.
- **Lume CMS** has been verified visually (HTTP-curled): renders the admin UI, lists collections, populates edit forms with real values, and saves round-trip back to the JS source via the watcher. Tested against both a Jekyll fixture and a vanilla-JS portfolio.
- **mtime conflict detection** caught a simulated external edit and refused to clobber it.
- **`--persist`** writes configs to the site root and refuses to overwrite without `--force`.

## Quirks worth knowing

- **Lume's body field is named `content`, not `body`.** SimpleSiteEdit renames its internal `body` markdown field to `content` when emitting a Lume config; this is the convention Lume CMS uses to bind to the markdown file body. Tests assert the rename happens.
- **The `.simplesiteedit/` directory** in your site is regenerated on every run. Add it to `.gitignore`.
- **PROJECTS-style 2D arrays** in vanilla-JS sites are flagged as "not editable" and listed in the summary; the CMS only sees flat object-array collections.
- **Position-based cross-collection references** (e.g., a `link: { id: '0-0' }` pointer between arrays) are not rewritten on reorder/delete — you'd need to fix them by hand.
- **The markdown widget's image button** uploads to the detected (or `--images`-overridden) folder, and the URL inserted into the markdown body is built from the matching public path. For JS-literal devblog bodies, an image-only line becomes its own paragraph entry; an inline image stays inside its paragraph string. Both round-trip byte-identical with no edits.
