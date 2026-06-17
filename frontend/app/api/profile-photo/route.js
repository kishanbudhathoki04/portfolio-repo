import { NextResponse } from 'next/server';

export async function GET(request) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    const res = await fetch(`${backendUrl}/api/profile?include_details=true`, { next: { revalidate: 86400 } });
    const data = await res.json();
    
    if (data?.photo) {
      // Convert base64 to buffer
      const base64Data = data.photo.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Figure out mime type
      const mimeMatch = data.photo.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
    
    return NextResponse.json({ error: "No photo found" }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
