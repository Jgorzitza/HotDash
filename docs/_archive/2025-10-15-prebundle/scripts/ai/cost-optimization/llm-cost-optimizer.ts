/**
 * Task W: Cost Optimization for LLM Calls
 */

export class LLMCostOptimizer {
  // Model selection based on query complexity
  selectModel(query: string, context: any): string {
    const complexity = this.assessComplexity(query, context);

    if (complexity === "simple") return "gpt-4o-mini"; // $0.15/1M tokens
    if (complexity === "medium") return "gpt-4o"; // $2.50/1M tokens
    if (complexity === "complex") return "gpt-4"; // $30/1M tokens

    return "gpt-4o"; // Default balanced option
  }

  private assessComplexity(
    query: string,
    context: any,
  ): "simple" | "medium" | "complex" {
    const wordCount = query.split(" ").length;
    const hasHistory = context.messages?.length > 5;
    const multiIntent = context.intents?.length > 1;

    if (wordCount < 10 && !hasHistory && !multiIntent) return "simple";
    if (wordCount < 30 && !multiIntent) return "medium";
    return "complex";
  }

  // Token optimization
  optimizePrompt(prompt: string, context: any): string {
    // Compress context if too large
    if (context.messages?.length > 10) {
      context.summary = summarizeOldMessages(context.messages);
      context.messages = context.messages.slice(-3);
    }

    // Remove unnecessary instructions for simple queries
    if (context.complexity === "simple") {
      prompt = prompt.split("\n").slice(0, 10).join("\n"); // Keep core only
    }

    return prompt;
  }

  // Caching to reduce redundant calls
  async generateWithCache(query: string, model: string) {
    const cacheKey = hash(query + model);
    const cached = await cache.get(cacheKey);

    if (cached) {
      console.log("[Cost] Saved $0.01 via cache hit");
      return cached;
    }

    const response = await model.generate(query);
    await cache.set(cacheKey, response, 3600); // 1-hour TTL

    return response;
  }

  // Budget management
  private budget = { daily: 100, remaining: 100 };

  async checkBudget(estimatedCost: number): Promise<boolean> {
    if (this.budget.remaining < estimatedCost) {
      // Switch to cheaper model or fallback
      console.warn("[Cost] Budget limit reached, using fallback");
      return false;
    }

    this.budget.remaining -= estimatedCost;
    return true;
  }
}

export const costOptimizer = new LLMCostOptimizer();
