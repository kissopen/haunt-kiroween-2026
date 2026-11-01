import { test } from 'node:test';
import assert from 'node:assert/strict';
import {freshState, makeTask, normalizeState, toggleTask, roomStats, visibleTasks, validDate, formatRemaining, timerRemaining} from '../dist/model.mjs';
test('task roundtrip retains Unicode, markup as text and checklist state', () => {
  const state = freshState(); state.tasks.push(makeTask({title:'写作 <script>alert(1)</script>',steps:['开始五分钟']}));
  state.tasks[0].steps[0].done = true;
  assert.deepEqual(normalizeState(JSON.parse(JSON.stringify(state))), state);
});
test('completion is reversible, immutable, and does not silently complete steps', () => {
  const state = freshState(); state.tasks = [makeTask({title:'One',steps:['Subtask']})];
  const updated = toggleTask(state, state.tasks[0].id);
  assert.equal(state.tasks[0].done,false); assert.equal(updated.tasks[0].done,true);
  assert.equal(updated.tasks[0].steps[0].done,false);
  assert.deepEqual(toggleTask(updated,state.tasks[0].id),state);
});
test('room progress handles empty and partial rooms', () => {
  assert.deepEqual(roomStats([], 'study'),{total:0,done:0,open:0,ratio:0});
  const tasks = [makeTask({title:'A'}), {...makeTask({title:'B'}),done:true}, makeTask({title:'C',room:'attic'})];
  assert.equal(roomStats(tasks,'study').ratio,0.5); assert.equal(roomStats(tasks,'all').open,2);
});
test('strict backup validation blocks malformed data and duplicate identifiers', () => {
  const state = {...freshState(),tasks:[makeTask({title:'A'})]};
  for (const bad of [null, {}, {...state,version:2}, {...state,focusMinutes:-1}, {...state,tasks:[state.tasks[0],state.tasks[0]]}, {...state,tasks:[{...state.tasks[0],done:'false'}]}, {...state,tasks:[{...state.tasks[0],room:'__proto__'}]}]) assert.throws(()=>normalizeState(bad));
});
test('calendar dates must exist, including leap days', () => {
  assert.equal(validDate('2028-02-29'),true); assert.equal(validDate('2026-02-29'),false);
  assert.equal(validDate('2026-04-31'),false); assert.equal(validDate('2026-12-01'),true);
  assert.equal(validDate(''),true); assert.equal(validDate('2026-1-1'),false);
});
test('query, room, completion and priority filters compose without mutation', () => {
  const a=makeTask({title:'Sketch',room:'study',priority:'low'},1), b=makeTask({title:'Ship',steps:['Sketch UI'],priority:'high'},2);
  const tasks=[a,b]; assert.deepEqual(visibleTasks(tasks,{query:'sketch'}).map(t=>t.id),[b.id,a.id]);
  assert.deepEqual(tasks,[a,b]); assert.equal(visibleTasks(tasks,{room:'attic'}).length,0);
  assert.equal(visibleTasks([{...a,done:true}],{filter:'done'}).length,1);
});
test('due sort puts undated tasks last',()=>{
  const a=makeTask({title:'A'}), b=makeTask({title:'B',due:'2026-12-01'}), c=makeTask({title:'C',due:'2026-11-01'});
  assert.deepEqual(visibleTasks([a,b,c],{sort:'due'}).map(t=>t.title),['C','B','A']);
});
test('bounds prevent accidental oversized imports',()=>{
  assert.throws(()=>makeTask({title:' '})); assert.throws(()=>makeTask({title:'x'.repeat(161)}));
  assert.throws(()=>makeTask({title:'A',steps:Array(21).fill('x')}));
  assert.throws(()=>normalizeState({...freshState(),tasks:Array(501).fill({})}));
});
test('normalization strips unknown fields and never pollutes prototypes',()=>{
  const input=JSON.parse(JSON.stringify({...freshState(),tasks:[makeTask({title:'A'})]}));
  input.tasks[0].unexpected='value'; input.__proto__={polluted:true};
  assert.equal(normalizeState(input).tasks[0].unexpected,undefined); assert.equal({}.polluted,undefined);
});
test('timer uses timestamps across background delays and freezes on pause',()=>{
  assert.equal(timerRemaining({running:true,endsAt:100000,remaining:90},55000),45);
  assert.equal(timerRemaining({running:true,endsAt:100000,remaining:90},200000),0);
  assert.equal(timerRemaining({running:false,endsAt:100000,remaining:45},200000),45);
  assert.equal(formatRemaining(-10),'00:00'); assert.equal(formatRemaining(61.2),'01:02');
});
