/**
 * Task Z: Human-in-the-Loop Labeling Workflow
 */

interface TrainingSample {
  query: { text: string; intent: string };
  response?: string;
  human_feedback?: any;
  training_flags?: any;
  [key: string]: any;
}

interface QualityScores {
  overall: number;
  factuality?: number;
  helpfulness?: number;
  safety?: number;
}

// Stub training collector
const trainingCollector = {
  async saveSample(sample: TrainingSample): Promise<void> {
    console.log('Saving training sample:', sample);
  }
};

export interface LabelingTask {
  task_id: string;
  sample: TrainingSample;
  priority: number;
  assigned_to?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

export class HumanLabelingWorkflow {
  private queue: LabelingTask[] = [];
  
  async createTask(sample: TrainingSample, priority: number): Promise<string> {
    const task: LabelingTask = {
      task_id: crypto.randomUUID(),
      sample,
      priority,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    
    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);  // Highest priority first
    
    return task.task_id;
  }
  
  async getNextTask(labelerId: string): Promise<LabelingTask | null> {
    const task = this.queue.find(t => t.status === 'pending');
    if (!task) return null;
    
    task.status = 'in_progress';
    task.assigned_to = labelerId;
    
    return task;
  }
  
  async submitLabels(taskId: string, labels: {
    quality_scores: QualityScores;
    corrected_response?: string;
    notes?: string;
  }) {
    const task = this.queue.find(t => t.task_id === taskId);
    if (!task) throw new Error('Task not found');
    
    // Update training sample with human labels
    task.sample.human_feedback = {
      approved: labels.quality_scores.overall >= 4,
      quality_scores: labels.quality_scores,
      human_edited_text: labels.corrected_response,
      notes: labels.notes,
      approved_by: task.assigned_to!,
      approved_at: new Date().toISOString(),
    };
    
    task.status = 'completed';
    
    // Add to training corpus
    await trainingCollector.saveSample(task.sample);
  }
}

