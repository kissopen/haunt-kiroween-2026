# Design and implementation

Buildless ES modules, HTML and CSS. No runtime dependencies. dist/ contains the entire runnable app. Node built-in test runner for model invariants. Domain state module is separate from DOM rendering.

Visual direction: an illustrated cutaway mansion on a deep ink-blue night, dusty lavender plaster, apricot lamplight, icy mint ghosts and pale paper labels. Display type Georgia; body Segoe UI; metadata monospace. Signature: the four room cutaway itself acts as a room filter and visual progress map. Task list is a quiet companion panel. Avoid generic dashboard cards and neon effects. Mobile stacks the mansion and list.

Model public API in dist/model.mjs:
- ROOMS = ['study','workshop','greenhouse','attic']
- freshState() returns {version:1,tasks:[],focusMinutes:0,language:'en'}.
- normalizeState(input) validates import/persisted data, throws on incompatible schema. Task fields: id, title, room, priority ('low','normal','high'), due (YYYY-MM-DD or empty), done, createdAt (epoch ms), steps [{id,text,done}].
- makeTask({title,room,priority,due,steps}, now=Date.now()) returns validated task with generated id. steps may be strings.
- roomStats(tasks,room) -> {total,done,open,ratio}, ratio=0 for empty room.
- visibleTasks(tasks,{room:'all',filter:'open'|'all'|'done',query:'',sort:'priority'|'newest'|'due'}) -> new array, never mutates input.
- toggleTask(state,id) -> new state; completion/reopening affects task.done, does not alter checklist.
- formatRemaining(seconds) -> MM:SS (clamped at zero).

App imports these exact APIs. UI owns persistence errors and notices, timer wall-clock bookkeeping, dialogs and undo. Export schema is version 1. Limits: 500 tasks, title 160 chars, 20 checklist entries, 200 chars per step. Validate allowed room and priority, finite dates, booleans and duplicate IDs; prevent prototype injection. Render all user-controlled strings with textContent.
