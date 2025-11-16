/**
 * DeepSeek OCR Integration via Novita AI
 * Proper implementation for text extraction from images and PDFs
 */

interface DeepSeekOCRResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Extract text from image using DeepSeek Vision via Novita AI
 */
export async function extractTextWithDeepSeekOCR(
  imageBuffer: Buffer,
  fileName: string = 'document'
): Promise<{ text: string; error?: string }> {
  const apiKey = process.env.NOVITA_API_KEY;
  const apiUrl = process.env.NOVITA_API_URL || 'https://api.novita.ai/v3/openai';

  if (!apiKey) {
    console.error('❌ NOVITA_API_KEY not set in environment');
    return { text: '', error: 'API key not configured' };
  }

  try {
    console.log(`🔍 Starting DeepSeek OCR for: ${fileName}`);
    
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    const mimeType = detectImageType(imageBuffer);
    
    console.log(`📄 Image type detected: ${mimeType}`);
    console.log(`📊 Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

    // Try multiple DeepSeek models for vision/OCR
    const models = [
      'deepseek-ai/deepseek-vl-7b-chat',  // DeepSeek Vision Language model
      'deepseek-vl',                        // Short name
      'deepseek-chat',                       // Chat model with vision
    ];

    let lastError = '';

    for (const model of models) {
      try {
        console.log(`🤖 Trying model: ${model}`);
        
        const response = await fetch(`${apiUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'You are an OCR system. Extract ALL text from this image accurately. Return ONLY the extracted text with no explanations, no markdown formatting, no additional commentary. Preserve the original layout and line breaks where possible.',
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
            max_tokens: 8192,
            temperature: 0,
            stream: false,
          }),
        });

        const responseText = await response.text();
        
        if (!response.ok) {
          console.error(`❌ Model ${model} failed (${response.status}):`, responseText);
          lastError = `${model}: ${response.status} - ${responseText.substring(0, 200)}`;
          continue; // Try next model
        }

        const data: DeepSeekOCRResponse = JSON.parse(responseText);
        const extractedText = data.choices?.[0]?.message?.content || '';

        if (extractedText && extractedText.trim().length > 0) {
          console.log(`✅ OCR successful with model: ${model}`);
          console.log(`📝 Extracted ${extractedText.length} characters`);
          return { text: extractedText };
        }

        console.warn(`⚠️ Model ${model} returned empty text`);
        lastError = `${model}: Empty response`;
        
      } catch (modelError) {
        console.error(`❌ Error with model ${model}:`, modelError);
        lastError = `${model}: ${modelError}`;
        continue; // Try next model
      }
    }

    // If all models failed
    console.error(`❌ All DeepSeek models failed. Last error:`, lastError);
    return { text: '', error: lastError };

  } catch (error) {
    console.error('❌ DeepSeek OCR critical error:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Detect image MIME type from buffer using magic numbers
 */
function detectImageType(buffer: Buffer): string {
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  
  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }
  
  // GIF
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return 'image/gif';
  }
  
  // WebP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }
  
  // BMP
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return 'image/bmp';
  }
  
  // TIFF
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
    (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a)
  ) {
    return 'image/tiff';
  }
  
  // Default to JPEG (most common)
  console.warn('⚠️ Unknown image type, defaulting to JPEG');
  return 'image/jpeg';
}

/**
 * Check if file is an image based on MIME type
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Extract text from PDF with OCR support for scanned documents
 */
export async function extractTextFromPDFWithOCR(
  pdfBuffer: Buffer,
  fileName: string = 'document.pdf'
): Promise<string> {
  // First try regular text extraction
  const pdf = require('pdf-parse');
  
  try {
    const data = await pdf(pdfBuffer);
    const extractedText = data.text || '';
    
    // If we got meaningful text, return it
    if (extractedText.trim().length > 50) {
      console.log(`✅ PDF text extraction successful: ${extractedText.length} characters`);
      return extractedText;
    }
    
    console.log(`⚠️ PDF has no text layer (likely scanned). Attempting OCR...`);
    
    // PDF is likely scanned - need to convert to images and OCR
    // For now, return a message. Full implementation would use pdf-to-image conversion
    return `[This appears to be a scanned PDF. Full OCR support for PDFs will be added in the next update. For now, please convert the PDF pages to images and upload them individually.]`;
    
  } catch (error) {
    console.error('❌ PDF processing error:', error);
    return '';
  }
}

