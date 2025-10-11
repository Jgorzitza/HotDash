#!/usr/bin/env node

import { spawn } from 'node:child_process'

const env = { ...process.env }
if (!env.HOST) env.HOST = '0.0.0.0'
if (!env.PORT) env.PORT = '3000'

if (!env.DATABASE_URL) {
  env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  console.warn('[dbsetup] DATABASE_URL not set, defaulting to local Supabase Postgres.');
}

// prepare database
await exec('npx prisma migrate deploy')

// launch application
await exec(process.argv.slice(2).join(' '))

function exec(command) {
  const child = spawn(command, { shell: true, stdio: 'inherit', env })
  return new Promise((resolve, reject) => {
    child.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} failed rc=${code}`))
      }
    })
  })
}
