# Haunt — 驱鬼任务板

A little less haunted, one task at a time. A cozy haunted-house task board that turns unfinished tasks into small, approachable next steps.

## Run locally

Requires Node.js 20 or newer. No packages, API keys, account or build step are required.

```sh
npm start
```

Open http://127.0.0.1:4173. Run the model tests with `npm test`. The contents of `dist/` can also be served by any static HTTPS host. Opening index.html directly with a file URL is not supported.

## What works

- Four illustrated rooms: Study, Workshop, Greenhouse and Attic. Completing tasks restores their light and dispels their ghosts.
- Create, edit, complete, reopen and delete tasks, with immediate undo for completion and deletion.
- Priorities, optional deadlines, checklists, room/status filters, search and sorting.
- 5/15/25-minute focus sessions, pause/resume, and an explicitly labelled 10-second demonstration mode. Completed sessions add focus time but never automatically finish a task.
- Local saving, validated JSON import/export, and original-data recovery when saved data cannot be parsed.
- English/Chinese interface, responsive layout, native keyboard-operable dialogs and reduced-motion support.

First launch contains labelled example tasks. Use **Start fresh** to replace them with your own house. In Chinese, use **开始我的任务**. Export a backup from Settings before clearing browser data.

## Storage and limitations

Task data is stored only in this browser's localStorage, under `haunt.house.v1`. There is no application backend, analytics, account system or cloud sync. Hosting providers may handle normal access logs. Exported backups contain task titles and checklist text; keep them somewhere appropriate.

State is separate for each origin/browser. Backups transfer tasks, language and completed focus minutes, but not an in-progress timer. A running timer uses an end timestamp and is reconciled when the app next runs; no background notification service runs while the browser is closed. The demo session also adds its 10 seconds to the focus total.

Same-origin tabs synchronize changes. Current browsers use Web Locks to serialize timer completion; browsers without Web Locks have best-effort completion only. Concurrent edits are last-write-wins, not collaborative editing. Up to 500 tasks and 20 steps per task are supported. If browser storage is blocked/full, a visible warning asks the user to export before leaving.

## Source map

- `dist/index.html`, `dist/styles.css`: UI, original SVG room artwork and motion.
- `dist/app.mjs`: DOM rendering, local persistence, dialogs, backup and timer controls.
- `dist/model.mjs`: validation and immutable task operations.
- `tests/model.test.mjs`: data integrity and timer arithmetic tests.
- `.kiro/`: tracked requirements, design and steering, prepared for the Kiro development step.
- `docs/`: submission draft, demonstration outline and honest development status.

## Competition status

Submitted to Kiroween 2026 (Costume Contest) on November 1, 2026. Devpost confirmed: Project submitted! The initial implementation was produced with Codex. Kiro IDE contributed a reviewed checklist-focus fix; its PowerShell encoding issue was corrected before final validation. Merely including `.kiro/` is not a Kiro contribution. See `docs/kiro-usage.md` before making any usage claim. The public repository, judge-accessible demo and YouTube demonstration are available below. Final Devpost entry status must be checked on Devpost.

Public demo: https://haunt-focus-james.team-3-6317.chatgpt.site

Public source: https://github.com/kissopen/haunt-kiroween-2026

English-captioned video (1:28): https://youtu.be/Bw28pPL8QKY

Devpost project: https://devpost.com/software/haunt-a-little-less-haunted

MIT licensed. All in-app SVG illustrations are included in the source; no third-party image or font downloads are required.
