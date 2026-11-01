# Kiro development record

On 2026-11-01, a real Kiro IDE session (Auto model, free plan) reviewed the Haunt source, .kiro/specs/haunt and product steering. The initial product implementation was created with Codex; Kiro was used for a focused accessibility improvement and timer review.

## Prompt and contribution

The prompt asked Kiro to preserve keyboard focus when toggling the second or later checklist checkbox, review cross-tab timer completion only for demonstrated bugs, keep the design unchanged, avoid dependencies/deployment changes, and run relevant checks.

Kiro identified the exact cause: checkbox inputs shared an empty className and textContent, so restoration selected the first checkbox. It proposed and wrote data-step-id, captured the focused step ID, and matched that ID before generic fallback matching in dist/app.mjs. That logic is retained in the final project.

Kiro also reviewed the timer lock and latest-storage reread and found those paths already guarded against duplicate completion. A storage-area guard was integrated as defensive filtering; this is not evidence of a newly reproduced timer race.

## Review and correction

Kiro's PowerShell file rewrite omitted an explicit UTF-8 read encoding. The resulting file contained mojibake and failed node --check. The session was stopped. Its checkpoint restore did not repair the shell-written file. Codex restored the affected text, separated interface copy into UTF-8 dist/copy.mjs, retained the valid step-ID changes, and preserved the existing fallback when a task disappears.

Codex then ran final automated tests and browser verification. Checking the second step left that same checkbox focused and checked. No test run by Kiro itself is claimed; the session stopped before its requested test execution. A local transcript was saved alongside the project deliverables as kiro-session-observed.txt.

This is an accurate contribution record, not a claim that Kiro created the entire app or that competition eligibility has been approved. Ensure the entrant's registered Kiro identity matches the account used before final submission.
