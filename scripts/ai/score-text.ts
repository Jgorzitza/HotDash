import { parseArgs } from "node:util";
import { promises as fs } from "fs";
import { bleu1, rougeL, tokenize } from "../../packages/ai/metrics";

type CliOptions = {
  reference?: string;
  candidate?: string;
  referencePath?: string;
  candidatePath?: string;
};

async function readInput(path?: string): Promise<string | undefined> {
  if (!path) {
    return undefined;
  }
  const contents = await fs.readFile(path, "utf8");
  return contents.trim();
}

async function main() {
  const { values } = parseArgs({
    options: {
      reference: { type: "string" },
      candidate: { type: "string" },
      "reference-file": { type: "string" },
      "candidate-file": { type: "string" },
    },
  });

  const options: CliOptions = {
    reference: values.reference,
    candidate: values.candidate,
    referencePath: values["reference-file"],
    candidatePath: values["candidate-file"],
  };

  const referenceText = options.reference ?? (await readInput(options.referencePath));
  const candidateText = options.candidate ?? (await readInput(options.candidatePath));

  if (!referenceText || !candidateText) {
    throw new Error("Provide reference and candidate text via flags (`--reference` / `--candidate`) or file paths.");
  }

  const referenceTokens = tokenize(referenceText);
  const candidateTokens = tokenize(candidateText);

  const scores = {
    bleu1: bleu1(referenceTokens, candidateTokens),
    rougeL: rougeL(referenceTokens, candidateTokens),
    referenceLength: referenceTokens.length,
    candidateLength: candidateTokens.length,
  };

  console.log(JSON.stringify(scores, null, 2));
}

main().catch((error) => {
  console.error("[ai:score-text] failed", error);
  process.exitCode = 1;
});
