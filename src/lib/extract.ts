import pdf from 'pdf-parse';

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF extraction error:', error);
    return '';
  }
}

/**
 * Extract text from plain text file
 */
export function extractTextFromTxt(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

