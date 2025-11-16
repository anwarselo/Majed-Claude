import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { extractTextFromPDF, extractTextFromTxt } from '@/lib/extract';
import { generateJsonLd, generateHtml } from '@/lib/render';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BUCKET_NAME = 'business-files';

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
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and text files are supported' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const slug = generateSlug(name);

    // Create business record
    const { data: business, error: bizError } = await supabase
      .from('businesses')
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
      await supabase.from('businesses').delete().eq('id', business.id);
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
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(buffer);
    } else if (file.type === 'text/plain') {
      extractedText = extractTextFromTxt(buffer);
    }

    if (!extractedText.trim()) {
      extractedText = 'Text extraction was not successful. Please view the original document.';
    }

    // Generate JSON-LD and HTML
    const jsonld = generateJsonLd(business, BASE_URL);
    const html = generateHtml(business, extractedText, sourceFileUrl);

    // Create page record
    const { error: pageError } = await supabase.from('pages').insert({
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

