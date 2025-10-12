/**
 * Task Y: Active Learning System for Hard Examples
 */

interface AgentResponse {
  confidence: number;
  approval_rate: number;
  edit_rate: number;
  human_review?: { overall_rating: string };
  isEdgeCase?: boolean;
  hasReferenceAnswer?: boolean;
}

interface TrainingSample extends AgentResponse {
  query: string;
  response: string;
}

// Stub labeling queue
const labelingQueue = {
  async enqueue(item: any): Promise<void> {
    console.log('Enqueued for labeling:', item);
  }
};

export class ActiveLearningSystem {
  
  async identifyHardExamples(responses: AgentResponse[]) {
    const hardExamples = responses.filter(r =>
      r.confidence < 0.70 ||
      r.approval_rate < 0.75 ||
      r.edit_rate > 0.30 ||
      r.human_review?.overall_rating === 'poor'
    );
    
    // Prioritize for human labeling
    return hardExamples.sort((a, b) => 
      this.calculateLearningValue(b) - this.calculateLearningValue(a)
    );
  }
  
  private calculateLearningValue(response: AgentResponse): number {
    // Higher value = more important to label
    let value = 0;
    
    if (response.confidence < 0.60) value += 5;  // Very uncertain
    if (response.edit_rate > 0.50) value += 3;   // Heavily edited
    if (response.isEdgeCase) value += 4;         // Rare scenario
    if (!response.hasReferenceAnswer) value += 2; // No ground truth
    
    return value;
  }
  
  async requestHumanLabel(sample: TrainingSample) {
    // Send to labeling queue
    await labelingQueue.enqueue({
      sample,
      priority: this.calculateLearningValue(sample),
      estimated_time: 120,  // seconds
    });
  }
}
