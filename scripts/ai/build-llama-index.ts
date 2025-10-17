#!/usr/bin/env tsx
import { generateEmbedding } from "../../app/services/knowledge/embeddings/openai";
async function main(){ const mode=process.env.KB_EMBEDDINGS_MODE||"stub"; const vec=await generateEmbedding("HotDash Knowledge Index Build",{devFallback:mode!=="live"}); console.log(JSON.stringify({ status:"stub", embeddingsMode:mode, sampleVectorLen:vec.length, notes:["No external I/O performed","Swap to live after approvals"], timestamp:new Date().toISOString() }, null, 2)); }
main().catch(e=>{ console.error(e?.message||e); process.exit(1) })

