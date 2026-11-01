# Devpost draft — do not submit until prerequisites are complete

**Project:** Haunt — A little less haunted

**Tagline:** Turn unfinished tasks into a haunted house, then bring the light back one small step at a time.

**Suggested category:** Costume Contest, subject to the current official rules.

## Inspiration

Unfinished tasks can feel like little ghosts following us around. Haunt gives that feeling a playful shape: a house with four rooms, each holding a different kind of unfinished business. Its tone is gentle rather than punitive. Progress means making a little more room for light.

## What it does

Users give a task a room, break it into small steps, and optionally start a focus session. Finishing tasks brightens the rooms and releases their ghosts. Tasks can be reopened without losing their checklist, and completion or deletion can be undone immediately. Search, priorities and deadlines keep it useful beyond the Halloween theme. The app works in English and Chinese and includes local storage and portable JSON backups.

## How it is built

Buildless HTML, CSS, JavaScript modules and original inline SVG artwork. The data model is separate from rendering and tested with Node's built-in test runner. Native dialogs and semantic controls support keyboard interaction. Animation respects reduced-motion preferences. No application server, external image CDN or AI API key is needed to run the project.

## Challenges

Keeping the playful visual layer tied to real task state; validating imported data without losing the original unreadable save; preserving checklist state during edits; and preventing duplicate focus-time awards across browser tabs.

## Kiro usage

The initial app was built with Codex. A real Kiro IDE session read the project specs and source, identified ambiguous checkbox focus restoration, and produced stable step-ID matching. We reviewed its changes, corrected an encoding issue introduced by its PowerShell rewrite, and verified the final behavior in the browser. See docs/kiro-usage.md for the exact scope and limitations.

## Before submitting

- Review the recorded Kiro contribution and confirm the entrant account matches the registration.
- Publish the source on GitHub with the root `.kiro/` directory and MIT license included.
- Make the working demo accessible to judges and check it from a signed-out browser.
- Record and upload a public YouTube demo under three minutes.
- Fill in the real repository, demo and video URLs; recheck the official rules and deadline.

Reference: https://kiroween.devpost.com/rules
