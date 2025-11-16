import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { extractTextFromPDF, extractTextFromTxt } from '@/lib/extract';
import { extractTextWithDeepSeekOCR, extractTextFromPDFWithOCR, isImageFile } from '@/lib/ocr-deepseek';
import { generateJsonLd, generateHtml } from '@/lib/render';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BUCKET_NAME = 'majed-claude-business-files';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const website = formData.get('website') as string | null;
    const phone = formData.get('phone') as string | null;
    const description = formData.get('description') as string | null;
    const file = formData.get('file') as File;

    // Validation
    if (!name || !file) {
      return NextResponse.json(
        { error: 'Business name and file are required' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Supported formats: PDF, TXT, PNG, JPG, GIF, WEBP' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const slug = generateSlug(name);

    // Create business record
    const { data: business, error: bizError } = await supabase
      .from('majed_claude_businesses')
      .insert({
        slug,
        name,
        description,
        website,
        phone,
      })
      .select()
      .single();

    if (bizError || !business) {
      console.error('Business creation error:', bizError);
      return NextResponse.json(
        { error: 'Failed to create business record' },
        { status: 500 }
      );
    }

    // Upload file to storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `businesses/${business.id}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      // Clean up business record
      await supabase.from('majed_claude_businesses').delete().eq('id', business.id);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const sourceFileUrl = urlData.publicUrl;

    // Extract text from file
    let extractedText = '';
    let ocrError = '';
    
    console.log(`📄 Processing file: ${file.name} (${file.type})`);
    
    if (file.type === 'application/pdf') {
      // Try advanced PDF extraction with OCR fallback
      extractedText = await extractTextFromPDFWithOCR(buffer, file.name);
      if (!extractedText.trim()) {
        // Fallback to basic extraction
        extractedText = await extractTextFromPDF(buffer);
      }
    } else if (file.type === 'text/plain') {
      extractedText = extractTextFromTxt(buffer);
    } else if (isImageFile(file.type)) {
      // Use DeepSeek OCR for images via Novita AI
      console.log(`🖼️ Image detected, using DeepSeek OCR...`);
      const ocrResult = await extractTextWithDeepSeekOCR(buffer, file.name);
      extractedText = ocrResult.text;
      ocrError = ocrResult.error || '';
      
      if (ocrError) {
        console.error(`❌ OCR Error: ${ocrError}`);
      }
    }

    // If extraction completely failed, provide helpful message
    if (!extractedText.trim()) {
      if (ocrError) {
        extractedText = `Text extraction failed: ${ocrError}. Please view the original document or try a different file format.`;
      } else {
        extractedText = 'Text extraction was not successful. The document may be empty or use an unsupported format. Please view the original document.';
      }
    } else {
      console.log(`✅ Text extracted successfully: ${extractedText.length} characters`);
    }

    // Generate JSON-LD and HTML
    const jsonld = generateJsonLd(business, BASE_URL);
    const html = generateHtml(business, extractedText, sourceFileUrl);

    // Create page record
    const { error: pageError } = await supabase.from('majed_claude_pages').insert({
      business_id: business.id,
      url: `${BASE_URL}/b/${slug}`,
      html,
      jsonld,
    });

    if (pageError) {
      console.error('Page creation error:', pageError);
      return NextResponse.json(
        { error: 'Failed to create page' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        slug,
        url: `${BASE_URL}/b/${slug}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

