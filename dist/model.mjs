export const ROOMS = Object.freeze(['study', 'workshop', 'greenhouse', 'attic']);
const priorities = ['low', 'normal', 'high'];
const id = () => crypto.randomUUID();
const fail = message => { throw new Error(message); };
const str = (v, max, name, empty = false) => {
  if (typeof v !== 'string' || v.length > max || (!empty && !v.trim())) fail(`Invalid ${name}`);
  return v.trim();
};
export function validDate(value) {
  if (value === '') return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
}
export const freshState = () => ({ version: 1, tasks: [], focusMinutes: 0, language: 'en' });
function normalizeTask(t) {
  if (!t || typeof t !== 'object') fail('Invalid task');
  const taskId = str(t.id, 100, 'task ID');
  const title = str(t.title, 160, 'title');
  if (!ROOMS.includes(t.room) || !priorities.includes(t.priority)) fail('Invalid room or priority');
  if (!validDate(t.due)) fail('Invalid due date');
  if (typeof t.done !== 'boolean' || !Number.isFinite(t.createdAt) || t.createdAt < 0) fail('Invalid task status');
  if (!Array.isArray(t.steps) || t.steps.length > 20) fail('Invalid steps');
  const seen = new Set();
  const steps = t.steps.map(s => {
    if (!s || typeof s !== 'object' || typeof s.done !== 'boolean') fail('Invalid step');
    const stepId = str(s.id, 100, 'step ID');
    if (seen.has(stepId)) fail('Duplicate step ID');
    seen.add(stepId);
    return { id: stepId, text: str(s.text, 200, 'step text'), done: s.done };
  });
  return { id: taskId, title, room: t.room, priority: t.priority, due: t.due, done: t.done, createdAt: t.createdAt, steps };
}
export function normalizeState(input) {
  if (!input || input.version !== 1 || !Array.isArray(input.tasks) || input.tasks.length > 500) fail('Unsupported or invalid backup');
  if (!Number.isFinite(input.focusMinutes) || input.focusMinutes < 0 || input.focusMinutes > 1e7) fail('Invalid focus minutes');
  if (!['en', 'zh'].includes(input.language)) fail('Invalid language');
  const tasks = input.tasks.map(normalizeTask);
  if (new Set(tasks.map(t => t.id)).size !== tasks.length) fail('Duplicate task ID');
  return { version: 1, tasks, focusMinutes: input.focusMinutes, language: input.language };
}
export function makeTask({title, room = 'study', priority = 'normal', due = '', steps = []}, now = Date.now()) {
  return normalizeTask({ id: id(), title, room, priority, due, done: false, createdAt: now,
    steps: steps.map(s => typeof s === 'string' ? { id: id(), text: s, done: false } : s) });
}
export function roomStats(tasks, room) {
  const selected = room === 'all' ? tasks : tasks.filter(t => t.room === room);
  const total = selected.length, done = selected.filter(t => t.done).length;
  return { total, done, open: total - done, ratio: total ? done / total : 0 };
}
export function visibleTasks(tasks, {room = 'all', filter = 'open', query = '', sort = 'priority'} = {}) {
  const q = query.toLocaleLowerCase();
  return tasks.filter(t => (room === 'all' || t.room === room) && (filter === 'all' || t.done === (filter === 'done')) &&
    (t.title.toLocaleLowerCase().includes(q) || t.steps.some(s => s.text.toLocaleLowerCase().includes(q))))
    .sort((a,b) => (sort === 'priority' ? priorities.indexOf(b.priority) - priorities.indexOf(a.priority) :
      sort === 'due' ? (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31') : 0) || b.createdAt - a.createdAt);
}
export function toggleTask(state, taskId) {
  return { ...state, tasks: state.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) };
}
export const formatRemaining = seconds => {
  const n = Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : 0;
  return `${Math.floor(n / 60).toString().padStart(2, '0')}:${(n % 60).toString().padStart(2, '0')}`;
};
export function timerRemaining(timer, now = Date.now()) {
  return Math.max(0, timer.running ? (timer.endsAt - now) / 1000 : timer.remaining);
}
