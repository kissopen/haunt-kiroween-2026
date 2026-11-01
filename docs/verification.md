# Verification record

Date: 2026-11-01. Environment: Windows, Node.js, Chromium-based in-app browser.

## Interactive checks performed

- Created a Chinese title containing literal `<b>` markup; rendered as text, not HTML.
- Added two checklist steps, checked one, reloaded, edited the title and observed the completed step remained checked.
- Completed a task: ghost count and light percentage changed. Immediate Undo restored the task.
- Deleted a task through confirmation, then restored it with Undo.
- Searched by checklist text and observed only the matching task.
- Started, paused and resumed a 10-second focus demonstration. Two completed demo sessions produced approximately 0.3 minutes total, without completing tasks.
- Opened another tab and observed the same saved paused timer. Cross-tab editing uses last-write-wins.
- Downloaded JSON via the Export control, imported that file via the browser file chooser, confirmed replacement and observed the restored tasks and focus total.
- Switched interface language and loaded the labelled Chinese sample house.
- Checked a 390 × 844 mobile viewport: document width equalled content width (375 CSS pixels after the browser scrollbar), with no horizontal overflow. Reset the temporary viewport override afterwards.
- Inspected the full desktop layout and console: no app warnings/errors observed during these checks.

## Automated checks

Run `npm test` for data validation, immutable operations, search/sort and timestamp timer calculations. Run `node --check dist/app.mjs` for syntax. After the Kiro change and encoding repair, a browser check confirmed focus remained on the checked second step.

## Limits

This is a focused functional check, not an exhaustive accessibility audit or coverage of every browser. Same-origin browser storage is not a collaborative database. JSON backup validation has unit coverage; storage quota failures are handled in code but were not induced interactively.
