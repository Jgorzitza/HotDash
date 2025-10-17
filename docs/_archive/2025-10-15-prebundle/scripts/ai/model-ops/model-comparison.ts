/**
 * Task AA: Model Comparison and Selection Framework
 */

export async function compareModels(models: string[], testSet: TestCase[]) {
  const results = {};

  for (const model of models) {
    results[model] = await evaluateModel(model, testSet);
  }

  return {
    results,
    recommendation: selectBestModel(results),
    tradeoffs: analyzeTradeoffs(results),
  };
}

function selectBestModel(results: any) {
  // Multi-criteria decision: quality, cost, latency
  const scores = Object.entries(results).map(([model, metrics]) => ({
    model,
    score:
      metrics.quality * 0.5 +
      (1 - metrics.normalized_cost) * 0.3 +
      (1 - metrics.normalized_latency) * 0.2,
  }));

  scores.sort((a, b) => b.score - a.score);
  return scores[0].model;
}
