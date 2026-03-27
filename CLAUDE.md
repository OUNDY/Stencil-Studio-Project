# Yiğit Roadmap

Personal 8-week progress tracker for three parallel UX case study tracks.
Deployed at yigit-roadmap.netlify.app.

**Stack:** Single HTML file — vanilla JS + Supabase JS SDK (CDN) + CSS custom properties. No build step, no framework.

---

## Architecture Map

Everything lives in `Index.html`:

```
Index.html
├── <head>          # Supabase CDN import, CSS variables, all styles
├── <body>          # .app > .sidebar + .main (rendered by JS)
└── <script>
    ├── Config      # SUPABASE_URL, SUPABASE_KEY, USER_ID, WEEKS data, TAG_LABELS
    ├── State       # completed{}, notes{}, currentWeek
    ├── DB layer    # loadFromDB(), saveTask(), saveNote()
    ├── Render      # render(), renderSidebar(), renderMain()
    └── Init        # (async IIFE) — loads DB, renders, wires events
```

**Data model (Supabase):**
- `tasks` table: `user_id`, `task_id`, `completed` (bool)
- `notes` table: `user_id`, `week_id`, `content` (text)

**All week/task content is hardcoded** in the `WEEKS` array — not fetched from DB.

---

## Common Commands

```bash
# No build step — open directly in browser
open Index.html          # macOS
start Index.html         # Windows

# Deploy: drag & drop to Netlify, or push to connected repo
# Netlify auto-deploys on file change if repo is connected
```

---

## Code Conventions

- **All styles** use CSS custom properties defined in `:root` — never hardcode hex colors.
- **Colors by track:** `--purple` = Prompt/MCP, `--coral` = Trendyol, `--teal` = Stencil Studio, `--blue` = general.
- **Tag keys** must match `TAG_LABELS` and `CS_TAGS` objects — adding a new track requires updating both.
- **Task IDs** must be unique strings — used as DB keys. Format: `w1-t1`, `w1-t2`, etc.
- **Re-render pattern:** mutate state → call `render()`. Never manipulate DOM directly outside render functions.
- Notes auto-save with 800ms debounce (`window._noteT` timeout) — don't add a second save trigger.

---

## Gotchas & Warnings

- **SUPABASE_KEY is a publishable (anon) key** — safe to expose, but Supabase RLS should be enabled. Don't replace with service role key.
- **WEEKS array is the source of truth** for all task content — DB only stores completion state and notes. Adding/renaming tasks requires updating the array AND handling orphaned DB rows.
- **No auth** — USER_ID is hardcoded as `'yigit'`. Multi-user support would require a full auth rewrite.
- **Single file = no hot reload** — after edits, hard refresh the browser (`Ctrl+Shift+R`).
- **Netlify deploy = manual** — there's no CI. Drag & drop the file or push if repo is connected.
- **`csPct()` calculates case study progress** by filtering tasks by tag — if you change tag names, progress bars break.

---

## Pointers

- Week/task content → `WEEKS` array (~line 158)
- Track color mapping → `CS_TAGS` and `TAG_LABELS` (~line 227)
- Supabase config → lines 152–155 (do not commit real keys to public repos)
- Render logic → `renderMain()` (~line 310)
- DB sync → `loadFromDB()`, `saveTask()`, `saveNote()` (~line 237)
