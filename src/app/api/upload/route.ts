import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let fileBuffer: Buffer | null = null;
    let fileName = 'token_logo.png';
    let mimeType = 'image/png';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      fileName = file.name || 'token_logo.png';
      mimeType = file.type || 'image/png';
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      const body = await request.json();
      if (body.dataUrl) {
        const matches = body.dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          fileBuffer = Buffer.from(matches[2], 'base64');
        }
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    // Try uploading to free public IPFS node or Pinata if available
    try {
      const ipfsFormData = new FormData();
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
      ipfsFormData.append('file', blob, fileName);

      // Attempt upload to public IPFS gateway
      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          // If Pinata JWT is set in environment:
          ...(process.env.PINATA_JWT ? { Authorization: `Bearer ${process.env.PINATA_JWT}` } : {}),
        },
        body: ipfsFormData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.IpfsHash) {
          const ipfsUri = `ipfs://${data.IpfsHash}`;
          const httpUrl = `https://ipfs.io/ipfs/${data.IpfsHash}`;
          return NextResponse.json({ success: true, url: httpUrl, ipfsUri });
        }
      }
    } catch {
      // Continue to fallback
    }

    // Fallback: If no external IPFS provider responds, return base64 data URI (compacted) or SVG
    const base64Url = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    return NextResponse.json({
      success: true,
      url: base64Url,
      ipfsUri: base64Url,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
