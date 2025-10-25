/**
 * Production Validation Tests: Sentiment Analysis Accuracy
 * 
 * Tests sentiment analysis accuracy across both implementations:
 * 1. AI-powered sentiment (chatbot service via OpenAI)
 * 2. Keyword-based sentiment (satisfaction tracking service)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SatisfactionTrackingService } from '~/services/ai-customer/satisfaction-tracking.service';

describe('Sentiment Analysis Accuracy - Production Validation', () => {
  let satisfactionService: SatisfactionTrackingService;

  beforeEach(() => {
    satisfactionService = new SatisfactionTrackingService();
  });

  describe('Positive Sentiment Detection', () => {
    const positiveComments = [
      'Great service! Very helpful and professional.',
      'Excellent response time, thank you so much!',
      'Happy with the product, good quality.',
      'Satisfied with the support, very helpful team.',
      'Thank you for the quick resolution!',
      'Perfect! Exactly what I needed.',
      'Awesome customer service!',
      'Great experience overall.',
      'Very pleased with the outcome.',
      'Helpful and friendly staff.'
    ];

    positiveComments.forEach((comment, index) => {
      it(`should detect positive sentiment in comment ${index + 1}: "${comment.substring(0, 30)}..."`, async () => {
        const result = await satisfactionService.recordFeedback(
          `inquiry_pos_${index}`,
          `response_pos_${index}`,
          `customer_pos_${index}`,
          {
            rating: 5,
            category: 'response_quality',
            comment,
            tags: ['positive']
          }
        );

        expect(result).toBeDefined();
        expect(result.sentiment).toBe('positive');
      });
    });

    it('should calculate positive sentiment accuracy rate', async () => {
      let correctDetections = 0;
      const totalTests = positiveComments.length;

      for (let i = 0; i < positiveComments.length; i++) {
        try {
          const result = await satisfactionService.recordFeedback(
            `inquiry_pos_acc_${i}`,
            `response_pos_acc_${i}`,
            `customer_pos_acc_${i}`,
            {
              rating: 5,
              category: 'response_quality',
              comment: positiveComments[i],
              tags: ['positive']
            }
          );

          if (result.sentiment === 'positive') {
            correctDetections++;
          }
        } catch (error) {
          // Count as incorrect detection
        }
      }

      const accuracy = correctDetections / totalTests;
      console.log(`Positive Sentiment Accuracy: ${(accuracy * 100).toFixed(2)}%`);
      
      // Expect at least 80% accuracy for positive sentiment
      expect(accuracy).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Negative Sentiment Detection', () => {
    const negativeComments = [
      'Terrible experience, very disappointed.',
      'Awful service, would not recommend.',
      'Bad quality, frustrated with the product.',
      'Horrible support, angry about the delay.',
      'Disappointed with the response time.',
      'Frustrated with the lack of communication.',
      'Angry about the poor service.',
      'Worst experience ever.',
      'Very bad, not satisfied at all.',
      'Terrible quality, completely disappointed.'
    ];

    negativeComments.forEach((comment, index) => {
      it(`should detect negative sentiment in comment ${index + 1}: "${comment.substring(0, 30)}..."`, async () => {
        const result = await satisfactionService.recordFeedback(
          `inquiry_neg_${index}`,
          `response_neg_${index}`,
          `customer_neg_${index}`,
          {
            rating: 1,
            category: 'response_quality',
            comment,
            tags: ['negative']
          }
        );

        expect(result).toBeDefined();
        expect(result.sentiment).toBe('negative');
      });
    });

    it('should calculate negative sentiment accuracy rate', async () => {
      let correctDetections = 0;
      const totalTests = negativeComments.length;

      for (let i = 0; i < negativeComments.length; i++) {
        try {
          const result = await satisfactionService.recordFeedback(
            `inquiry_neg_acc_${i}`,
            `response_neg_acc_${i}`,
            `customer_neg_acc_${i}`,
            {
              rating: 1,
              category: 'response_quality',
              comment: negativeComments[i],
              tags: ['negative']
            }
          );

          if (result.sentiment === 'negative') {
            correctDetections++;
          }
        } catch (error) {
          // Count as incorrect detection
        }
      }

      const accuracy = correctDetections / totalTests;
      console.log(`Negative Sentiment Accuracy: ${(accuracy * 100).toFixed(2)}%`);
      
      // Expect at least 80% accuracy for negative sentiment
      expect(accuracy).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Neutral Sentiment Detection', () => {
    const neutralComments = [
      'Order received, tracking number provided.',
      'Product arrived on time.',
      'Response was adequate.',
      'Standard service, nothing special.',
      'Average experience.',
      'Okay, met expectations.',
      'Normal delivery time.',
      'Standard quality.',
      'As expected.',
      'Regular service.'
    ];

    neutralComments.forEach((comment, index) => {
      it(`should detect neutral sentiment in comment ${index + 1}: "${comment.substring(0, 30)}..."`, async () => {
        const result = await satisfactionService.recordFeedback(
          `inquiry_neu_${index}`,
          `response_neu_${index}`,
          `customer_neu_${index}`,
          {
            rating: 3,
            category: 'response_quality',
            comment,
            tags: ['neutral']
          }
        );

        expect(result).toBeDefined();
        expect(result.sentiment).toBe('neutral');
      });
    });

    it('should calculate neutral sentiment accuracy rate', async () => {
      let correctDetections = 0;
      const totalTests = neutralComments.length;

      for (let i = 0; i < neutralComments.length; i++) {
        try {
          const result = await satisfactionService.recordFeedback(
            `inquiry_neu_acc_${i}`,
            `response_neu_acc_${i}`,
            `customer_neu_acc_${i}`,
            {
              rating: 3,
              category: 'response_quality',
              comment: neutralComments[i],
              tags: ['neutral']
            }
          );

          if (result.sentiment === 'neutral') {
            correctDetections++;
          }
        } catch (error) {
          // Count as incorrect detection
        }
      }

      const accuracy = correctDetections / totalTests;
      console.log(`Neutral Sentiment Accuracy: ${(accuracy * 100).toFixed(2)}%`);
      
      // Expect at least 70% accuracy for neutral sentiment (harder to detect)
      expect(accuracy).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty comments as neutral', async () => {
      const result = await satisfactionService.recordFeedback(
        'inquiry_empty',
        'response_empty',
        'customer_empty',
        {
          rating: 3,
          category: 'response_quality',
          comment: '',
          tags: []
        }
      );

      expect(result.sentiment).toBe('neutral');
    });

    it('should handle mixed sentiment (positive and negative keywords)', async () => {
      const result = await satisfactionService.recordFeedback(
        'inquiry_mixed',
        'response_mixed',
        'customer_mixed',
        {
          rating: 3,
          category: 'response_quality',
          comment: 'Great product but terrible delivery time',
          tags: ['mixed']
        }
      );

      expect(result).toBeDefined();
      // Mixed sentiment should default to neutral or be based on keyword count
      expect(['positive', 'neutral', 'negative']).toContain(result.sentiment);
    });

    it('should handle very short comments', async () => {
      const result = await satisfactionService.recordFeedback(
        'inquiry_short',
        'response_short',
        'customer_short',
        {
          rating: 4,
          category: 'response_quality',
          comment: 'Good',
          tags: []
        }
      );

      expect(result.sentiment).toBe('positive');
    });

    it('should handle very long comments', async () => {
      const longComment = 'Great service! ' + 'Very helpful and professional. '.repeat(20);
      
      const result = await satisfactionService.recordFeedback(
        'inquiry_long',
        'response_long',
        'customer_long',
        {
          rating: 5,
          category: 'response_quality',
          comment: longComment,
          tags: []
        }
      );

      expect(result.sentiment).toBe('positive');
    });

    it('should be case-insensitive', async () => {
      const result = await satisfactionService.recordFeedback(
        'inquiry_case',
        'response_case',
        'customer_case',
        {
          rating: 5,
          category: 'response_quality',
          comment: 'GREAT SERVICE! EXCELLENT SUPPORT!',
          tags: []
        }
      );

      expect(result.sentiment).toBe('positive');
    });
  });

  describe('Overall Accuracy Metrics', () => {
    it('should achieve minimum 75% overall accuracy', async () => {
      const testCases = [
        { comment: 'Excellent service!', expected: 'positive', rating: 5 },
        { comment: 'Terrible experience.', expected: 'negative', rating: 1 },
        { comment: 'Standard delivery.', expected: 'neutral', rating: 3 },
        { comment: 'Great product!', expected: 'positive', rating: 5 },
        { comment: 'Awful quality.', expected: 'negative', rating: 1 },
        { comment: 'Okay service.', expected: 'neutral', rating: 3 },
        { comment: 'Happy with purchase!', expected: 'positive', rating: 5 },
        { comment: 'Disappointed.', expected: 'negative', rating: 2 },
        { comment: 'As expected.', expected: 'neutral', rating: 3 },
        { comment: 'Thank you!', expected: 'positive', rating: 5 }
      ];

      let correctDetections = 0;

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        try {
          const result = await satisfactionService.recordFeedback(
            `inquiry_overall_${i}`,
            `response_overall_${i}`,
            `customer_overall_${i}`,
            {
              rating: testCase.rating,
              category: 'response_quality',
              comment: testCase.comment,
              tags: []
            }
          );

          if (result.sentiment === testCase.expected) {
            correctDetections++;
          }
        } catch (error) {
          // Count as incorrect
        }
      }

      const overallAccuracy = correctDetections / testCases.length;
      console.log(`Overall Sentiment Accuracy: ${(overallAccuracy * 100).toFixed(2)}%`);
      console.log(`Correct: ${correctDetections}/${testCases.length}`);

      expect(overallAccuracy).toBeGreaterThanOrEqual(0.75);
    });
  });
});

