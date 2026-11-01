import {ROOMS,freshState,normalizeState,makeTask,roomStats,visibleTasks,toggleTask,formatRemaining,timerRemaining} from './model.mjs';
const $ = s => document.querySelector(s);
const KEY = 'haunt.house.v1';
import {copy} from './copy.mjs';
let state, timer=null, sample=false, unreadable=null, room='all', filter='open', editing=null, toastTimeout, undoAction=null, confirmAction=null;
const expanded=new Set();
const t=k=>copy[state.language][k] || k;
const elem=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
function ghost(){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 64 72');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href','#ghost');svg.append(use);return svg;}
function demoState(language='en'){
  const s={...freshState(),language};
  const rows=language==='zh'?[['读完那一章','study','normal',['拿出书','先读两页']],['让那个小点子跑起来','workshop','high',['画出一个界面','做出最小版本']],['给自己一次真正的休息','greenhouse','normal',['放下手机','散步十分钟']],['整理那些搁置的照片','attic','low',['打开照片文件夹','选出五张喜欢的']],['为今天腾出一小块桌面','study','normal',[]]]:[['Finish that chapter','study','normal',['Find the book','Read just two pages']],['Bring that little idea to life','workshop','high',['Sketch one screen','Build the smallest version']],['Take a proper, unhurried break','greenhouse','normal',['Put the phone away','Walk for ten minutes']],['Sort the photos you keep meaning to','attic','low',['Open the photo folder','Pick five favourites']],['Make a little space on your desk','study','normal',[]]];
  s.tasks=rows.map((r,i)=>makeTask({title:r[0],room:r[1],priority:r[2],steps:r[3]},Date.now()-i*1000));s.tasks[4].done=true;return s;
}
try {const raw=localStorage.getItem(KEY);if(raw){try{const saved=JSON.parse(raw);state=normalizeState(saved.state);sample=saved.sample===true;const tm=saved.timer;if(tm&&typeof tm.running==='boolean'&&Number.isFinite(tm.duration)&&tm.duration>0&&tm.duration<=3600&&Number.isFinite(tm.remaining)&&tm.remaining>=0&&tm.remaining<=tm.duration&&Number.isFinite(tm.endsAt)&&typeof tm.taskId==='string')timer={running:tm.running,duration:tm.duration,remaining:tm.remaining,endsAt:tm.endsAt,taskId:tm.taskId};}catch{unreadable=raw;state=freshState();}}else{state=demoState();sample=true;}}catch{state=freshState();}
function persist(){try{if(unreadable!==null)throw new Error('Recovery pending');localStorage.setItem(KEY,JSON.stringify({state,timer,sample}));$('#storage-error').hidden=true;}catch{$('#storage-error').textContent=t(unreadable!==null?'recover':'storagenotice');$('#storage-error').hidden=false;}}
function notify(message,undo){clearTimeout(toastTimeout);$('#toast-text').textContent=message;$('#toast').hidden=false;undoAction=undo||null;$('#undo').hidden=!undo;toastTimeout=setTimeout(()=>{$('#toast').hidden=true;undoAction=null;},7000);}
$('#undo').onclick=()=>{if(undoAction)undoAction();$('#toast').hidden=true;undoAction=null;};
function modal(id){$(id).showModal();}
document.querySelectorAll('.close-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());
function confirm(title,body,action){$('#confirm-title').textContent=title;$('#confirm-body').textContent=body;confirmAction=action;modal('#confirm-dialog');}
$('#confirm-no').onclick=()=>{$('#confirm-dialog').close();confirmAction=null;};
$('#confirm-yes').onclick=()=>{$('#confirm-dialog').close();const action=confirmAction;confirmAction=null;action?.();};
function render(){
  document.documentElement.lang=state.language==='zh'?'zh-CN':'en';
  document.querySelectorAll('[data-i18n]').forEach(n=>n.textContent=t(n.dataset.i18n));
  $('#language').textContent=state.language==='en'?'中文':'EN';$('#settings').setAttribute('aria-label',t('backupsettings'));
  document.querySelectorAll('.close-dialog').forEach(n=>{if(n.classList.contains('icon-button'))n.setAttribute('aria-label',t('close'));});
  $('#sort').setAttribute('aria-label',t('sortLabel'));$('#search').setAttribute('aria-label',t('searchLabel'));
  $('#search').placeholder=t('search');$('#task-title').placeholder=t('placeholder');$('#task-steps').placeholder=t('stepsplaceholder');
  $('#sample-banner').hidden=!sample;const stats=roomStats(state.tasks,'all');
  $('#house-status').textContent=`${stats.open} ${t(stats.open===1?'haunting':'hauntings')}`;
  $('#progress-label').textContent=`${Math.round(stats.ratio*100)}%`;$('#progress-fill').style.width=`${stats.ratio*100}%`;
  $('#focus-total').textContent=`${Math.round(state.focusMinutes*10)/10} ${t('focused')}`;
  $('#rooms').replaceChildren();
  for(const name of ROOMS){const rs=roomStats(state.tasks,name);const b=elem('button',`room ${rs.total&&rs.open===0?'restored':''} ${rs.total===0?'empty':''}`);b.style.setProperty('--warm',rs.ratio);b.setAttribute('aria-pressed',String(room===name));b.setAttribute('aria-label',`${t(name)}: ${rs.open} ${t('hauntings')}, ${rs.done}/${rs.total}`);const title=elem('span','room-name',t(name));const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('room-art');svg.setAttribute('viewBox','0 0 300 180');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href',`#${name}-art`);svg.append(use);const g=ghost();g.classList.add('room-ghost');const label=elem('span','room-label');const status=elem('span');status.append(elem('i','tiny-dot'),document.createTextNode(rs.total===0?t('quiet'):rs.open===0?t('restored'):`${rs.open} ${t('hauntings')}`));label.append(status,elem('span','',`${rs.done}/${rs.total}`));b.append(title,svg,g,label);b.onclick=()=>{room=room===name?'all':name;render();};$('#rooms').append(b);}
  $('#list-title').textContent=room==='all'?t('alltitle'):t(room);$('#room-subtitle').textContent=t('onesmall');
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
  renderTasks();renderTimer();
}
function renderTasks(){
  const active=document.activeElement;const focused=active?.closest('.task-row');const restore=focused?{id:focused.dataset.taskId,kind:active.className,text:active.getAttribute('aria-label')||active.textContent,stepId:active.dataset.stepId||''}:null;
  const list=visibleTasks(state.tasks,{room,filter,query:$('#search').value,sort:$('#sort').value});$('#task-count').textContent=list.length;$('#task-list').replaceChildren();
  if(!list.length){const empty=elem('div','empty-state');empty.append(ghost(),elem('h3','',t('nobody')),elem('p','',t('emptyhint')));$('#task-list').append(empty);}
  for(const task of list){const row=elem('article',`task-row ${task.done?'completed':''}`);row.dataset.taskId=task.id;const check=elem('button','task-check',task.done?'✓':'');check.setAttribute('aria-label',`${t(task.done?'reopenLabel':'completeLabel')}: ${task.title}`);check.setAttribute('aria-pressed',String(task.done));check.onclick=()=>{state=toggleTask(state,task.id);persist();render();notify(t(task.done?'reopened':'released'),()=>{if(state.tasks.some(x=>x.id===task.id)){state=toggleTask(state,task.id);persist();render();}});};
    const main=elem('div','task-main'),name=elem('button','task-name',task.title);name.setAttribute('aria-label',`${t('editLabel')}: ${task.title}`);name.onclick=()=>openTask(task.id);const meta=elem('div','task-meta');meta.append(elem('span',`priority-tag ${task.priority}`,t(task.priority)),elem('span','',t(task.room)));
    if(task.due){const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;meta.append(elem('span',!task.done&&task.due<today?'overdue':'',`${!task.done&&task.due<today?t('overdue')+' · ':''}${task.due}`));}
    if(task.steps.length){const stepsBtn=elem('button','steps-toggle',`${task.steps.filter(s=>s.done).length}/${task.steps.length} ${t('stepsword')} ${expanded.has(task.id)?'▴':'▾'}`);stepsBtn.setAttribute('aria-expanded',String(expanded.has(task.id)));stepsBtn.onclick=()=>{expanded.has(task.id)?expanded.delete(task.id):expanded.add(task.id);renderTasks();};meta.append(stepsBtn);}
    main.append(name,meta);if(expanded.has(task.id)){const ul=elem('ul','steps-list');for(const step of task.steps){const li=elem('li'),label=elem('label'),input=document.createElement('input');input.type='checkbox';input.checked=step.done;input.dataset.stepId=step.id;input.onchange=()=>{state={...state,tasks:state.tasks.map(x=>x.id===task.id?{...x,steps:x.steps.map(s=>s.id===step.id?{...s,done:input.checked}:s)}:x)};persist();renderTasks();};label.append(input,elem('span','',step.text));li.append(label);ul.append(li);}main.append(ul);}
    const focus=elem('button','task-focus','◴');focus.setAttribute('aria-label',`${t('focusLabel')}: ${task.title}`);focus.hidden=task.done;focus.onclick=()=>{if(timer){notify(t('stopconfirm'));$('#focus-toggle').focus();}else openFocus(task.id);};row.append(check,main,focus);$('#task-list').append(row);
  }
  if(restore){const row=Array.from($('#task-list').children).find(n=>n.dataset.taskId===restore.id);const candidates=row?Array.from(row.querySelectorAll('button,input')):[];const byStepId=restore.stepId?candidates.find(n=>n.dataset.stepId===restore.stepId):null;const byText=candidates.find(n=>n.className===restore.kind&&(n.getAttribute('aria-label')||n.textContent)===restore.text);const byKind=candidates.find(n=>n.className===restore.kind);const next=byStepId||byText||byKind||$('#task-list .task-check')||$('#add-inline');next?.focus({preventScroll:true});}
}
function openTask(taskId=null){if(!taskId&&state.tasks.length>=500)return notify(t('limit'));editing=taskId;const task=state.tasks.find(x=>x.id===taskId);$('#task-dialog-title').textContent=t(task?'edittitle':'newtitle');$('#task-title').value=task?.title||'';$('#task-room').replaceChildren(...ROOMS.map(r=>{const o=elem('option','',t(r));o.value=r;return o;}));$('#task-room').value=task?.room||(room==='all'?'study':room);$('#task-priority').value=task?.priority||'normal';$('#task-due').value=task?.due||'';$('#task-steps').value=task?.steps.map(s=>s.text).join('\n')||'';$('#form-error').textContent='';$('#delete-task').hidden=!task;modal('#task-dialog');$('#task-title').focus();}
$('#new-task').onclick=$('#add-inline').onclick=()=>openTask();
$('#task-form').onsubmit=e=>{e.preventDefault();try{const prior=state.tasks.find(x=>x.id===editing);const lines=$('#task-steps').value.split('\n').map(s=>s.trim()).filter(Boolean);const used=new Set();const steps=lines.map(text=>{const existing=prior?.steps.find(s=>s.text===text&&!used.has(s.id));if(existing){used.add(existing.id);return {...existing};}return text;});let task=makeTask({title:$('#task-title').value,room:$('#task-room').value,priority:$('#task-priority').value,due:$('#task-due').value,steps});if(prior)task={...task,id:prior.id,done:prior.done,createdAt:prior.createdAt};state={...state,tasks:prior?state.tasks.map(x=>x.id===editing?task:x):[task,...state.tasks]};persist();$('#task-dialog').close();render();notify(t('saved'));}catch{$('#form-error').textContent=t('fieldbad');}};
$('#delete-task').onclick=()=>{const task=state.tasks.find(x=>x.id===editing);if(!task)return;confirm(t('delete'),t('deletebody'),()=>{state={...state,tasks:state.tasks.filter(x=>x.id!==task.id)};persist();$('#task-dialog').close();render();notify(t('deleted'),()=>{if(state.tasks.length<500&&!state.tasks.some(x=>x.id===task.id)){state={...state,tasks:[task,...state.tasks]};persist();render();}});});};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render();});
$('#all-rooms').onclick=()=>{room='all';render();};$('#sort').onchange=renderTasks;$('#search').oninput=renderTasks;
$('#language').onclick=()=>{state={...state,language:state.language==='en'?'zh':'en'};persist();render();};
$('#help').onclick=()=>modal('#help-dialog');$('#settings').onclick=()=>modal('#settings-dialog');
function openFocus(taskId=''){const options=[{id:'',title:t('freefocus')},...state.tasks.filter(x=>!x.done)];$('#focus-select').replaceChildren(...options.map(x=>{const o=elem('option','',x.title);o.value=x.id;return o;}));$('#focus-select').value=taskId;modal('#focus-dialog');}
$('#focus-form').onsubmit=e=>{e.preventDefault();const duration=Number($('#duration').value);timer={duration,remaining:duration,endsAt:Date.now()+duration*1000,running:true,taskId:$('#focus-select').value};persist();$('#focus-dialog').close();renderTimer();};
function renderTimer(){const remaining=timer?timerRemaining(timer):1500;$('#timer-display').textContent=formatRemaining(remaining);$('.focus-bar').classList.toggle('running',!!timer?.running);$('#focus-toggle').textContent=t(timer?timer.running?'pause':'resume':'begin');$('#focus-end').hidden=!timer;$('#focus-task').textContent=timer?(state.tasks.find(x=>x.id===timer.taskId)?.title||t('freefocus')):t('focushint');}
let finishing=false;
function tick(){
  renderTimer();
  if(!timer?.running||timerRemaining(timer)>0||finishing)return;
  finishing=true;
  const finish=()=>{
    // Read inside the shared lock so a second tab cannot award this session twice.
    try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&unreadable===null){state=normalizeState(saved.state);sample=saved.sample===true;timer=readTimer(saved.timer);}}catch{}
    if(timer?.running&&timerRemaining(timer)<=0){state={...state,focusMinutes:Math.min(1e7,state.focusMinutes+timer.duration/60)};timer=null;persist();render();notify(t('sessiondone'));}
    else renderTimer();
  };
  if(navigator.locks)navigator.locks.request(`${KEY}.finish`,finish).finally(()=>{finishing=false;});
  else{try{finish();}finally{finishing=false;}}
}
$('#focus-toggle').onclick=()=>{if(!timer)return openFocus();tick();if(!timer)return;if(timer.running){timer.remaining=timerRemaining(timer);timer.running=false;}else{timer.endsAt=Date.now()+timer.remaining*1000;timer.running=true;}persist();renderTimer();};
$('#focus-end').onclick=()=>confirm(t('stopconfirm'),t('stopbody'),()=>{timer=null;persist();renderTimer();notify(t('ended'));});setInterval(tick,250);document.addEventListener('visibilitychange',tick);
function download(data,name,type='application/json'){const url=URL.createObjectURL(new Blob([data],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#export').onclick=()=>{download(JSON.stringify(state,null,2),`haunt-backup-${new Date().toISOString().slice(0,10)}.json`);notify(t('exported'));};
function replace(next,asSample=false){state=next;sample=asSample;timer=null;room='all';filter='open';$('#search').value='';expanded.clear();persist();render();}
$('#import').onchange=async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{if(file.size>2e6)throw Error();const next=normalizeState(JSON.parse(await file.text()));confirm(t('replace'),t('replacebody'),()=>{unreadable=null;replace(next);$('#settings-dialog').close();notify(t('imported'));});}catch{notify(t('backupbad'));}};
$('#load-sample').onclick=()=>confirm(t('replace'),t('replacebody'),()=>{unreadable=null;replace(demoState(state.language),true);$('#settings-dialog').close();notify(t('sampleloaded'));});
function clearHouse(){confirm(t('cleartitle'),t('clearbody'),()=>{unreadable=null;replace({...freshState(),language:state.language});$('#settings-dialog').close();notify(t('cleared'));});}
$('#clear').onclick=$('#start-own').onclick=clearHouse;
if(unreadable!==null){const rawBtn=elem('button','secondary',t('raw'));rawBtn.onclick=()=>download(unreadable,'haunt-unreadable-data.txt','text/plain');$('.settings-actions').append(rawBtn);}
function readTimer(tm){return tm&&typeof tm.running==='boolean'&&Number.isFinite(tm.duration)&&tm.duration>0&&tm.duration<=3600&&Number.isFinite(tm.remaining)&&tm.remaining>=0&&tm.remaining<=tm.duration&&Number.isFinite(tm.endsAt)&&typeof tm.taskId==='string'?{running:tm.running,duration:tm.duration,remaining:tm.remaining,endsAt:tm.endsAt,taskId:tm.taskId}:null;}
// Share timer changes as well as tasks between tabs. Simultaneous edits use last-write-wins.
window.addEventListener('storage',e=>{if(e.storageArea!==localStorage||e.key!==KEY||!e.newValue)return;try{const saved=JSON.parse(e.newValue);state=normalizeState(saved.state);sample=!!saved.sample;timer=readTimer(saved.timer);document.querySelectorAll('dialog[open]').forEach(d=>d.close());render();notify(state.language==='zh'?'已载入另一个标签页的更改。':'Loaded changes from another tab.');}catch{}});
render();tick();persist();
