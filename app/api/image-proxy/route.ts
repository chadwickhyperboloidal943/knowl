import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return new NextResponse('Missing url parameter', { status: 400 });
        }

        const isVercelBlob = url.includes('vercel-storage.com');

        const fetchOptions: RequestInit = {};

        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ImageProxy] Fetch failed for ${url}:`, response.status, errorText);
            return new NextResponse(null, { status: response.status });
        }

        const contentType = response.headers.get('content-type');
        const arrayBuffer = await response.arrayBuffer();
        
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
            console.error(`[ImageProxy] Empty buffer received for ${url}`);
            return new NextResponse(null, { status: 404 });
        }

        return new NextResponse(Buffer.from(arrayBuffer), {
            headers: {
                'Content-Type': contentType || 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Image proxy error', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
