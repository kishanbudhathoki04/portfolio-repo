import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    const res = await fetch(`${backendUrl}/api/projects`, { cache: 'no-store' });
    const data = await res.json();
    
    const project = data.find(p => String(p.id) === String(id));
    
    if (project?.photo) {
      // Convert base64 to buffer
      const base64Data = project.photo.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Figure out mime type
      const mimeMatch = project.photo.match(/^data:(image\/\w+);base64,/);
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
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
