/**
 * Image Description Service
 * 
 * Uses GPT-4 Vision to generate detailed descriptions of images
 * for text-based similarity search
 * 
 * Task: BLOCKER-003
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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
export async function generateImageDescription(
  imageUrl: string,
  context?: string
): Promise<ImageDescriptionResult> {
  try {
    const systemPrompt = `You are an expert image analyst for customer support. Analyze the image and provide:
1. A detailed, searchable description (2-3 sentences)
2. Detected labels (keywords that describe the image)
3. Detected objects with confidence scores
4. Issue category if this appears to be a product issue

Be specific and descriptive. Focus on visual details that would help match similar images.`;

    const userPrompt = context
      ? `Analyze this image in the context of: ${context}\n\nProvide a detailed description, labels, objects, and issue category if applicable.`
      : `Analyze this image and provide a detailed description, labels, objects, and issue category if applicable.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective vision model
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "auto", // Let OpenAI decide detail level
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Low temperature for consistency
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from GPT-4 Vision");
    }

    const result = JSON.parse(content);

    return {
      description: result.description || "",
      detectedLabels: result.labels || [],
      detectedObjects: result.objects || [],
      issueCategory: result.issue_category || undefined,
      confidence: result.confidence || 0.9,
      modelVersion: "gpt-4o-mini",
    };
  } catch (error: any) {
    console.error("[Image Description] Error:", error);
    throw new Error(`Failed to generate image description: ${error.message}`);
  }
}

/**
 * Batch generate descriptions for multiple images
 * 
 * @param imageUrls - Array of image URLs to analyze
 * @param context - Optional context for all images
 * @returns Array of description results
 */
export async function batchGenerateDescriptions(
  imageUrls: string[],
  context?: string
): Promise<ImageDescriptionResult[]> {
  const results: ImageDescriptionResult[] = [];

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((url) => generateImageDescription(url, context))
    );
    results.push(...batchResults);

    // Small delay between batches to avoid rate limits
    if (i + batchSize < imageUrls.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Generate a concise summary description for search
 * 
 * @param fullDescription - Full description from GPT-4 Vision
 * @param labels - Detected labels
 * @returns Concise searchable description
 */
export function generateSearchableDescription(
  fullDescription: string,
  labels: string[]
): string {
  // Combine description with labels for better search
  const labelText = labels.length > 0 ? ` Keywords: ${labels.join(", ")}` : "";
  return `${fullDescription}${labelText}`;
}

