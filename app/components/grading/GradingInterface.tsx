/**
 * Grading Interface Component
 * 
 * Allows human reviewers to grade AI-generated responses on:
 * - Tone (1-5 scale)
 * - Accuracy (1-5 scale)
 * - Policy (1-5 scale)
 * 
 * Used in HITL approval workflow for customer support agents.
 */

import { useState } from 'react';
import { z } from 'zod';

/**
 * Grading schema
 */
export const GradingSchema = z.object({
  tone: z.number().min(1).max(5).describe('Tone quality (1=poor, 5=excellent)'),
  accuracy: z.number().min(1).max(5).describe('Factual accuracy (1=poor, 5=excellent)'),
  policy: z.number().min(1).max(5).describe('Policy compliance (1=poor, 5=excellent)'),
  feedback: z.string().optional().describe('Optional feedback text'),
});

export type Grading = z.infer<typeof GradingSchema>;

/**
 * Grading criteria descriptions
 */
const GRADING_CRITERIA = {
  tone: {
    1: 'Unacceptable - Rude, unprofessional, or inappropriate',
    2: 'Poor - Lacks empathy, too formal or too casual',
    3: 'Acceptable - Professional but could be more empathetic',
    4: 'Good - Empathetic and professional',
    5: 'Excellent - Perfect tone, highly empathetic and professional',
  },
  accuracy: {
    1: 'Unacceptable - Contains major factual errors',
    2: 'Poor - Multiple inaccuracies or missing key information',
    3: 'Acceptable - Mostly accurate with minor issues',
    4: 'Good - Accurate with all key information',
    5: 'Excellent - Completely accurate and comprehensive',
  },
  policy: {
    1: 'Unacceptable - Violates company policies',
    2: 'Poor - Questionable policy compliance',
    3: 'Acceptable - Follows policies but could be clearer',
    4: 'Good - Clear policy compliance',
    5: 'Excellent - Perfect policy adherence and communication',
  },
};

interface GradingInterfaceProps {
  draftContent: string;
  onGrade: (grading: Grading) => void;
  onCancel?: () => void;
  initialGrading?: Partial<Grading>;
}

export function GradingInterface({
  draftContent,
  onGrade,
  onCancel,
  initialGrading,
}: GradingInterfaceProps) {
  const [tone, setTone] = useState<number>(initialGrading?.tone || 0);
  const [accuracy, setAccuracy] = useState<number>(initialGrading?.accuracy || 0);
  const [policy, setPolicy] = useState<number>(initialGrading?.policy || 0);
  const [feedback, setFeedback] = useState<string>(initialGrading?.feedback || '');
  const [showCriteria, setShowCriteria] = useState<string | null>(null);

  const handleSubmit = () => {
    if (tone === 0 || accuracy === 0 || policy === 0) {
      alert('Please provide grades for all criteria');
      return;
    }

    const grading: Grading = {
      tone,
      accuracy,
      policy,
      feedback: feedback.trim() || undefined,
    };

    // Validate with Zod
    try {
      GradingSchema.parse(grading);
      onGrade(grading);
    } catch (error) {
      console.error('Grading validation error:', error);
      alert('Invalid grading values');
    }
  };

  const renderStarRating = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    criteriaKey: keyof typeof GRADING_CRITERIA
  ) => {
    return (
      <div className="grading-row">
        <div className="grading-label">
          <strong>{label}</strong>
          <button
            type="button"
            className="criteria-toggle"
            onClick={() => setShowCriteria(showCriteria === criteriaKey ? null : criteriaKey)}
          >
            {showCriteria === criteriaKey ? '▼' : '▶'} Criteria
          </button>
        </div>
        
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${value >= star ? 'filled' : ''}`}
              onClick={() => onChange(star)}
              aria-label={`Rate ${star} out of 5`}
            >
              ★
            </button>
          ))}
          <span className="rating-value">{value > 0 ? `${value}/5` : 'Not rated'}</span>
        </div>

        {showCriteria === criteriaKey && (
          <div className="criteria-details">
            {Object.entries(GRADING_CRITERIA[criteriaKey]).map(([rating, description]) => (
              <div key={rating} className="criteria-item">
                <strong>{rating}:</strong> {description}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grading-interface">
      <h3>Grade AI Response</h3>
      
      <div className="draft-preview">
        <h4>Draft Content:</h4>
        <div className="draft-content">{draftContent}</div>
      </div>

      <div className="grading-form">
        {renderStarRating('Tone', tone, setTone, 'tone')}
        {renderStarRating('Accuracy', accuracy, setAccuracy, 'accuracy')}
        {renderStarRating('Policy', policy, setPolicy, 'policy')}

        <div className="feedback-section">
          <label htmlFor="grading-feedback">
            <strong>Additional Feedback (Optional)</strong>
          </label>
          <textarea
            id="grading-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide specific feedback about what could be improved..."
            rows={4}
          />
        </div>

        <div className="grading-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={tone === 0 || accuracy === 0 || policy === 0}
          >
            Submit Grading
          </button>
          {onCancel && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .grading-interface {
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .draft-preview {
          margin-bottom: 20px;
          padding: 15px;
          background: white;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .draft-content {
          margin-top: 10px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
          white-space: pre-wrap;
        }

        .grading-form {
          background: white;
          padding: 20px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .grading-row {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .grading-row:last-of-type {
          border-bottom: none;
        }

        .grading-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .criteria-toggle {
          background: none;
          border: none;
          color: #0066cc;
          cursor: pointer;
          font-size: 14px;
        }

        .star-rating {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .star {
          background: none;
          border: none;
          font-size: 32px;
          color: #ddd;
          cursor: pointer;
          transition: color 0.2s;
        }

        .star.filled {
          color: #ffc107;
        }

        .star:hover {
          color: #ffb300;
        }

        .rating-value {
          margin-left: 10px;
          font-size: 14px;
          color: #666;
        }

        .criteria-details {
          margin-top: 10px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 14px;
        }

        .criteria-item {
          margin-bottom: 8px;
        }

        .criteria-item:last-child {
          margin-bottom: 0;
        }

        .feedback-section {
          margin-top: 20px;
        }

        .feedback-section label {
          display: block;
          margin-bottom: 8px;
        }

        .feedback-section textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          font-size: 14px;
        }

        .grading-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }

        .btn-primary {
          padding: 10px 20px;
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0052a3;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: white;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .btn-secondary:hover {
          background: #f5f5f5;
        }
      `}</style>
    </div>
  );
}

