/**
 * Image Description Service
 *
 * Uses GPT-4 Vision to generate detailed descriptions of images
 * for text-based similarity search
 *
 * Task: BLOCKER-003
 */
export interface ImageDescriptionResult {
    description: string;
    detectedLabels: string[];
    detectedObjects: Array<{
        label: string;
        confidence: number;
        boundingBox?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
    issueCategory?: 'damage' | 'wrong_item' | 'quality_issue' | 'packaging' | 'other';
    confidence: number;
    modelVersion: string;
}
/**
 * Generate detailed description of an image using GPT-4 Vision
 *
 * @param imageUrl - Public URL of the image to analyze
 * @param context - Optional context about the image (e.g., customer complaint)
 * @returns Detailed description and analysis
 */
export declare function generateImageDescription(imageUrl: string, context?: string): Promise<ImageDescriptionResult>;
/**
 * Batch generate descriptions for multiple images
 *
 * @param imageUrls - Array of image URLs to analyze
 * @param context - Optional context for all images
 * @returns Array of description results
 */
export declare function batchGenerateDescriptions(imageUrls: string[], context?: string): Promise<ImageDescriptionResult[]>;
/**
 * Generate a concise summary description for search
 *
 * @param fullDescription - Full description from GPT-4 Vision
 * @param labels - Detected labels
 * @returns Concise searchable description
 */
export declare function generateSearchableDescription(fullDescription: string, labels: string[]): string;
//# sourceMappingURL=image-description.d.ts.map