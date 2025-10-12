/**
 * Task X: Automated Training Data Curation Pipeline
 */

interface TrainingSample {
  query: { text: string; intent: string };
  response?: string;
  human_feedback?: {
    approved?: boolean;
    quality_scores?: { factuality?: number };
    human_edited_text?: string;
  };
  training_flags?: {
    quality_reviewed?: boolean;
  };
  [key: string]: any;
}

function hash(input: string): string {
  return Buffer.from(input).toString('base64').substring(0, 16);
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  items.forEach(item => {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  });
  return result;
}

export class TrainingDataCurator {
  
  async curateDataset(rawSamples: TrainingSample[]) {
    // Filter high-quality samples
    const filtered = rawSamples.filter(s =>
      s.human_feedback?.approved &&
      s.training_flags?.quality_reviewed &&
      (s.human_feedback?.quality_scores?.factuality || 0) >= 4
    );
    
    // De-duplicate similar samples
    const deduplicated = this.deduplicateSamples(filtered);
    
    // Balance dataset across categories
    const balanced = this.balanceCategories(deduplicated);
    
    // Augment with synthetic variants
    const augmented = await this.augmentDataset(balanced);
    
    return {
      samples: augmented,
      stats: {
        original: rawSamples.length,
        filtered: filtered.length,
        deduplicated: deduplicated.length,
        balanced: balanced.length,
        final: augmented.length,
      },
    };
  }
  
  private deduplicateSamples(samples: TrainingSample[]): TrainingSample[] {
    const seen = new Set<string>();
    return samples.filter(s => {
      const key = hash(s.query?.text || '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  private balanceCategories(samples: TrainingSample[]): TrainingSample[] {
    const byCategory = groupBy(samples, (s: TrainingSample) => s.query?.intent || 'unknown');
    const maxPerCategory = 100;
    
    const balanced: TrainingSample[] = [];
    for (const [category, categorySamples] of Object.entries(byCategory)) {
      balanced.push(...(categorySamples as TrainingSample[]).slice(0, maxPerCategory));
    }
    
    return balanced;
  }
  
  private async augmentDataset(samples: TrainingSample[]): Promise<TrainingSample[]> {
    // Add paraphrased versions for data augmentation
    const augmented = [...samples];
    
    for (const sample of samples.slice(0, 50)) {  // Augment top 50
      const paraphrase = await this.paraphraseQuery(sample.query?.text || '');
      augmented.push({ ...sample, query: { ...sample.query, text: paraphrase } });
    }
    
    return augmented;
  }
  
  private async paraphraseQuery(query: string): Promise<string> {
    // Use LLM to create variations
    return query;  // Placeholder
  }
}

