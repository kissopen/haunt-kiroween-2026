import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {copy} from '../dist/copy.mjs';
test('both languages supply the same nonempty interface messages',()=>{
  assert.deepEqual(Object.keys(copy.en).sort(),Object.keys(copy.zh).sort());
  for(const language of Object.values(copy))for(const value of Object.values(language))assert.ok(typeof value==='string'&&value.trim());
});
test('every HTML translation binding resolves in both languages',()=>{
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const bindings=[...html.matchAll(/data-i18n="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(bindings.length>20);
  for(const key of bindings)for(const language of ['en','zh'])assert.ok(copy[language][key],`${language}: missing ${key}`);
});
