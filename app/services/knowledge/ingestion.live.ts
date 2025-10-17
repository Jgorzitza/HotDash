import { generateEmbedding } from "./embeddings/openai";
export interface IngestionLiveOptions { sources?: string[]; dryRun?: boolean }
export interface IngestionLiveResult { status:"disabled"|"dryRun"|"ok"; docsProcessed:number; tokensIndexed:number; notes:string[]; generatedAt:string }
function isLiveEnabled(){ return process.env.KB_INGEST_MODE === "live" && !!process.env.OPENAI_API_KEY }
export async function ingestKnowledgeLive(opts:IngestionLiveOptions = {}):Promise<IngestionLiveResult>{ const enabled=isLiveEnabled(); const { dryRun=true }=opts; if(!enabled){ return { status:"disabled", docsProcessed:0, tokensIndexed:0, notes:["Set KB_INGEST_MODE=live and provide OPENAI_API_KEY via vault"], generatedAt:new Date().toISOString() } } if(dryRun){ return { status:"dryRun", docsProcessed:0, tokensIndexed:0, notes:["Dry run: validated config; no side effects"], generatedAt:new Date().toISOString() } } await generateEmbedding("health check", { devFallback:true }); return { status:"ok", docsProcessed:0, tokensIndexed:0, notes:["Live ingestion executed (skeleton)"], generatedAt:new Date().toISOString() } }

