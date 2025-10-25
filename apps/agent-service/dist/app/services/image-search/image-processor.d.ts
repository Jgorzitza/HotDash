/**
 * Image Processor Service
 *
 * Processes uploaded images to generate descriptions and embeddings
 * for similarity search
 *
 * Task: BLOCKER-003
 */
export interface ProcessImageResult {
    photoId: string;
    embeddingId: string;
    description: string;
    embedding: number[];
    processingTime: number;
}
/**
 * Process a single image: generate description and embedding
 *
 * @param photoId - UUID of the customer_photos record
 * @returns Processing result
 */
export declare function processImage(photoId: string): Promise<ProcessImageResult>;
/**
 * Process all pending images
 *
 * @param limit - Maximum number of images to process
 * @returns Array of processing results
 */
export declare function processPendingImages(limit?: number): Promise<ProcessImageResult[]>;
/**
 * Reprocess a failed image
 *
 * @param photoId - UUID of the customer_photos record
 * @returns Processing result
 */
export declare function reprocessImage(photoId: string): Promise<ProcessImageResult>;
//# sourceMappingURL=image-processor.d.ts.map