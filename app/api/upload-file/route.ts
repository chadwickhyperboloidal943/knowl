import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';

import { MAX_FILE_SIZE } from '@/lib/constants';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return NextResponse.json(
                { error: 'Missing BLOB_READ_WRITE_TOKEN in environment variables' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const pathname = formData.get('pathname');
        const contentType = formData.get('contentType');
        const requestedAccess = formData.get('access');

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        if (typeof pathname !== 'string' || pathname.trim().length === 0) {
            return NextResponse.json({ error: 'Pathname is required' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File is too large' }, { status: 400 });
        }

        const defaultAccess = process.env.BLOB_ACCESS === 'private' ? 'private' : 'public';
        const access = requestedAccess === 'private' || requestedAccess === 'public'
            ? requestedAccess
            : defaultAccess;

        const blob = await put(pathname, file, {
            access,
            token: process.env.BLOB_READ_WRITE_TOKEN,
            addRandomSuffix: true,
            contentType: typeof contentType === 'string' && contentType ? contentType : file.type,
        });

        return NextResponse.json({
            url: blob.url,
            pathname: blob.pathname,
            contentType: blob.contentType,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}