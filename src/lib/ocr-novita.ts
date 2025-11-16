/**
 * Novita AI DeepSeek OCR Integration
 * Uses Novita AI's vision API with DeepSeek model for OCR
 */

interface NovitaOCRResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Extract text from image using Novita AI's DeepSeek OCR
 */
export async function extractTextWithNovitaOCR(
  imageBuffer: Buffer
): Promise<string> {
  const apiKey = process.env.NOVITA_API_KEY;
  const apiUrl = process.env.NOVITA_API_URL || 'https://api.novita.ai/v3/openai';

  if (!apiKey) {
    console.warn('NOVITA_API_KEY not set, skipping OCR');
    return '';
  }

  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    const mimeType = detectImageType(imageBuffer);

    // Call Novita AI Vision API (OpenAI-compatible)
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // or deepseek-vl for vision
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this image. Return only the extracted text, no explanations.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Novita AI OCR error:', response.status, errorText);
      return '';
    }

    const data: NovitaOCRResponse = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Novita AI OCR error:', error);
    return '';
  }
}

/**
 * Detect image MIME type from buffer
 */
function detectImageType(buffer: Buffer): string {
  // Check magic numbers
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return 'image/jpeg';
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif';
  }
  // Default to PNG
  return 'image/png';
}

/**
 * Check if file is an image based on MIME type
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

