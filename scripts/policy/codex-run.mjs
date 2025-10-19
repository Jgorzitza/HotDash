#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function arg(flag, def){ const i=process.argv.indexOf(flag); return i>-1 ? process.argv[i+1] : def }
const resume = arg('--resume', 'reports/manager/run_state.json');
const mode = arg('--mode', 'checklist');
const json = process.argv.includes('--json');

const now = new Date().toISOString();
const out = (o)=> json ? console.log(JSON.stringify(o)) : console.log(o);

let state = {};
try { state = JSON.parse(fs.readFileSync(resume,'utf8')); } catch {}
out({event:'runner_start', ts: now, resume});

if(mode==='checklist'){
  // look for a tasks.todo.json to validate completion
  const agent = state.agent || 'product';
  const date = state.date || new Date().toISOString().slice(0,10);
  const todoPath = path.join('artifacts', agent, date, 'tasks.todo.json');
  let completed=true, pending=[];
  try{
    const j = JSON.parse(fs.readFileSync(todoPath,'utf8'));
    for(const t of j.tasks){ if(t.status!=='completed'){ completed=false; pending.push(t.title) } }
  }catch{ completed=false; pending.push('tasks.todo.json missing'); }
  out({event:'checklist', completed, pending});
  out({event:'runner_end', ts:new Date().toISOString(), exit: completed?0:0});
  process.exit(0);
}

out({event:'runner_end', ts:new Date().toISOString(), exit:0});
